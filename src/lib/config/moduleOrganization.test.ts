import { describe, it, expect } from 'vitest';
import {
	groupModulesByCategory,
	buildLessonSections,
	moduleCategories,
	getModuleDevices,
	getSimulationPlatform,
	isModuleForDevice,
	modulesSpecificToDevice,
	getBasePathLessonIds,
	getModuleCompletion
} from './moduleOrganization';
import type { Lesson } from '$lib/db/schema';

const mods = (...ids: string[]) => ids.map((id) => ({ id }));

describe('groupModulesByCategory', () => {
	it('groups modules under their category in config order', () => {
		const groups = groupModulesByCategory(mods('module1', 'module5', 'module2'));
		expect(groups[0].category?.id).toBe('basics');
		expect(groups[0].modules.map((m) => m.id)).toEqual(['module1', 'module2']);
		expect(groups[1].category?.id).toBe('internet');
		expect(groups[1].modules.map((m) => m.id)).toEqual(['module5']);
	});

	it('puts uncategorised modules into a trailing "Άλλα" bucket', () => {
		const groups = groupModulesByCategory(mods('module1', 'mystery'));
		const last = groups[groups.length - 1];
		expect(last.category?.id).toBe('other');
		expect(last.modules.map((m) => m.id)).toEqual(['mystery']);
	});

	it('drops no modules and never duplicates', () => {
		const all = mods(
			'module1', 'module2', 'module3', 'module4', 'module5', 'module6',
			'word', 'module7', 'module8', 'module9', 'module10', 'module11',
			'module12', 'module13', 'android', 'iphone'
		);
		const flat = groupModulesByCategory(all).flatMap((g) => g.modules.map((m) => m.id));
		expect(flat.sort()).toEqual(all.map((m) => m.id).sort());
		// all 16 covered by real categories → no "other" bucket
		expect(groupModulesByCategory(all).some((g) => g.category?.id === 'other')).toBe(false);
	});

	it('exposes 7 categories (incl. windows + mobile device groups)', () => {
		expect(moduleCategories).toHaveLength(7);
		expect(moduleCategories.map((c) => c.id)).toContain('mobile');
		expect(moduleCategories.map((c) => c.id)).toContain('windows');
	});

	it('groups the Windows-simulated environment modules under "windows"', () => {
		const windows = moduleCategories.find((c) => c.id === 'windows')!;
		expect(windows.moduleIds).toEqual(['module3', 'module4', 'module9']);
	});
});

const lessons = (n: number) =>
	Array.from({ length: n }, (_, i) => ({ id: `l${i}`, lessonKey: `key${i}` })) as Lesson[];

describe('buildLessonSections', () => {
	it('returns null for modules without configured sections', () => {
		expect(buildLessonSections('module6', lessons(7))).toBeNull();
	});

	it('returns null for an empty lesson list', () => {
		expect(buildLessonSections('module2', [])).toBeNull();
	});

	it('splits module2 (13) into the two configured sections', () => {
		const sections = buildLessonSections('module2', lessons(13))!;
		expect(sections.map((s) => s.title)).toEqual([
			'Βασική πληκτρολόγηση',
			'Συντομεύσεις Windows & ταχύτητα'
		]);
		expect(sections[0].items).toHaveLength(9);
		expect(sections[1].items).toHaveLength(4);
	});

	it('splits module1 into theory / core practice / optional extra practice', () => {
		const sections = buildLessonSections('module1', lessons(11))!;
		expect(sections.map((s) => s.title)).toEqual([
			'Θεωρία',
			'Βασική εξάσκηση',
			'Επιπλέον εξάσκηση (προαιρετική)'
		]);
		expect(sections.map((s) => s.items.length)).toEqual([1, 7, 3]);
	});

	it('labels the module8 theory wall separately from the two practice groups', () => {
		const sections = buildLessonSections('module8', lessons(18))!;
		expect(sections.map((s) => s.items.length)).toEqual([7, 5, 6]);
		expect(sections[0].title).toBe('Θεωρία');
	});

	it('preserves original indices across sections', () => {
		const sections = buildLessonSections('module2', lessons(13))!;
		expect(sections[0].items[0].index).toBe(0);
		expect(sections[1].items[0].index).toBe(9);
		expect(sections[1].items.at(-1)!.index).toBe(12);
	});

	it('appends extra lessons to the last section (never hides any)', () => {
		const sections = buildLessonSections('module2', lessons(15))!;
		const total = sections.reduce((n, s) => n + s.items.length, 0);
		expect(total).toBe(15);
		expect(sections.at(-1)!.items.at(-1)!.index).toBe(14);
	});

	it('maps id-based sections (android) by lesson id, preserving indices', () => {
		const androidLessons = [
			'android-open-viber',
			'android-call-number',
			'android-call-contact',
			'android-send-sms',
			'android-send-viber',
			'android-font-size',
			'android-connect-wifi',
			'android-videocall-viber'
		].map((id, i) => ({ id, orderIndex: i + 1 })) as Lesson[];
		const sections = buildLessonSections('android', androidLessons)!;
		expect(sections.map((s) => s.title)).toEqual(['Βασικά — πρώτα βήματα', 'Καθημερινή χρήση']);
		expect(sections[0].items).toHaveLength(7);
		expect(sections[1].items).toHaveLength(1);
		expect(sections[1].items[0].index).toBe(7); // original index in the flat list
	});

	it('drops an unknown id-based lesson into «Επιπλέον μαθήματα» (never hidden)', () => {
		const withMystery = [
			'android-open-viber',
			'android-call-number',
			'android-call-contact',
			'android-send-sms',
			'android-send-viber',
			'android-font-size',
			'android-connect-wifi',
			'android-videocall-viber',
			'android-not-in-config'
		].map((id, i) => ({ id, orderIndex: i + 1 })) as Lesson[];
		const sections = buildLessonSections('android', withMystery)!;
		const shown = sections.flatMap((s) => s.items.map((i) => i.lesson.id));
		expect(shown).toContain('android-not-in-config');
		expect(sections.at(-1)!.title).toBe('Επιπλέον μαθήματα');
	});
});

describe('base path completion (CURRICULUM_PLAN §4β δ)', () => {
	const ANDROID_BASE = [
		'android-open-viber',
		'android-call-number',
		'android-call-contact',
		'android-send-sms',
		'android-send-viber',
		'android-font-size',
		'android-connect-wifi'
	];
	const allIds = [...ANDROID_BASE, 'android-videocall-viber'];
	const moduleLessonIds = { android: allIds };
	const done = (...ids: string[]) => Object.fromEntries(ids.map((id) => [id, { completed: true }]));

	it('exposes the base path lesson ids for a mobile module', () => {
		expect(getBasePathLessonIds('android')).toEqual(ANDROID_BASE);
	});

	it('returns null for a module without a base section', () => {
		expect(getBasePathLessonIds('module8')).toBeNull(); // positional sections
		expect(getBasePathLessonIds('module6')).toBeNull(); // no sections at all
	});

	it('marks the base path complete after 7/7 without demoting to «ημιτελές»', () => {
		const c = getModuleCompletion('android', moduleLessonIds, done(...ANDROID_BASE));
		expect(c.baseComplete).toBe(true);
		expect(c.allComplete).toBe(false); // the extension is still open
		expect(c.extensionTotal).toBe(1);
		expect(c.extensionCompleted).toBe(0);
		expect(c.overallPercent).toBe(88); // 7/8 — honest, but not the headline
	});

	it('does not treat an extension lesson as a substitute for the base path', () => {
		// Finished the extra videocall but not all base lessons → base NOT complete.
		const c = getModuleCompletion('android', moduleLessonIds, done('android-videocall-viber'));
		expect(c.baseComplete).toBe(false);
		expect(c.allComplete).toBe(false);
	});

	it('reports allComplete only when every lesson is done', () => {
		const c = getModuleCompletion('android', moduleLessonIds, done(...allIds));
		expect(c.baseComplete).toBe(true);
		expect(c.allComplete).toBe(true);
		expect(c.overallPercent).toBe(100);
	});

	it('an empty base (no base section) is never vacuously complete', () => {
		const c = getModuleCompletion('module6', { module6: ['a', 'b'] }, {});
		expect(c.hasBase).toBe(false);
		expect(c.baseComplete).toBe(false);
	});

	it('ignores base ids not present in the module (defensive)', () => {
		// If a base id is somehow absent from the live lesson list, it must not
		// block or fake completion.
		const c = getModuleCompletion(
			'android',
			{ android: ['android-open-viber'] },
			done('android-open-viber')
		);
		expect(c.hasBase).toBe(true);
		expect(c.baseComplete).toBe(true); // only the present base lesson is required
	});
});

describe('device tags', () => {
	it('returns tags for desktop-specific modules and null for universal ones', () => {
		expect(getModuleDevices('module1')).toEqual(['windows', 'mac']);
		expect(getModuleDevices('module3')).toEqual(['windows']); // Windows-only
		expect(getModuleDevices('module10')).toBeNull(); // phishing = universal
	});

	it('tags the Windows-UI exercise modules as windows-only (A1 fix)', () => {
		// File Explorer / Windows Settings exercises do not transfer to Mac.
		expect(getModuleDevices('module4')).toEqual(['windows']);
		expect(getModuleDevices('module9')).toEqual(['windows']);
	});

	it('exposes the simulation platform separately from concept applicability', () => {
		// word is useful concept-wise on windows+mac, but its exercises render
		// a Windows-like environment (applicable ≠ simulated).
		expect(getModuleDevices('word')).toEqual(['windows', 'mac']);
		expect(getSimulationPlatform('word')).toBe('windows');
		expect(getSimulationPlatform('android')).toBe('android');
		expect(getSimulationPlatform('module12')).toBeNull(); // reading/quiz only
	});

	it('treats untagged (universal) modules as matching every device', () => {
		for (const d of ['windows', 'mac', 'android', 'iphone'] as const) {
			expect(isModuleForDevice('module10', d)).toBe(true);
		}
	});

	it('matches a tagged module only for its listed devices', () => {
		expect(isModuleForDevice('module3', 'windows')).toBe(true);
		expect(isModuleForDevice('module3', 'mac')).toBe(false);
		expect(isModuleForDevice('module1', 'mac')).toBe(true);
		expect(isModuleForDevice('module1', 'android')).toBe(false);
	});

	it('shortlists device-specific modules and excludes universal ones', () => {
		const all = mods('module1', 'module3', 'module10', 'word');
		expect(modulesSpecificToDevice(all, 'windows').map((m) => m.id)).toEqual([
			'module1',
			'module3',
			'word'
		]);
		// Mac: module3 is Windows-only, so it drops out
		expect(modulesSpecificToDevice(all, 'mac').map((m) => m.id)).toEqual(['module1', 'word']);
	});

	it('returns an empty shortlist for devices without dedicated content yet', () => {
		const all = mods('module1', 'module3', 'module10', 'word');
		expect(modulesSpecificToDevice(all, 'android')).toEqual([]);
		expect(modulesSpecificToDevice(all, 'iphone')).toEqual([]);
	});
});
