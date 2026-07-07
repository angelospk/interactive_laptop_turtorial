import { describe, it, expect } from 'vitest';
import {
	groupModulesByCategory,
	buildLessonSections,
	moduleCategories,
	getModuleDevices,
	isModuleForDevice,
	modulesSpecificToDevice
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
			'module12', 'module13'
		);
		const flat = groupModulesByCategory(all).flatMap((g) => g.modules.map((m) => m.id));
		expect(flat.sort()).toEqual(all.map((m) => m.id).sort());
		// all 14 covered by real categories → no "other" bucket
		expect(groupModulesByCategory(all).some((g) => g.category?.id === 'other')).toBe(false);
	});

	it('exposes 5 categories', () => {
		expect(moduleCategories).toHaveLength(5);
	});
});

const lessons = (n: number) =>
	Array.from({ length: n }, (_, i) => ({ id: `l${i}`, lessonKey: `key${i}` })) as Lesson[];

describe('buildLessonSections', () => {
	it('returns null for modules without configured sections', () => {
		expect(buildLessonSections('module1', lessons(10))).toBeNull();
	});

	it('returns null for an empty lesson list', () => {
		expect(buildLessonSections('module2', [])).toBeNull();
	});

	it('splits module2 (13) into the two configured sections', () => {
		const sections = buildLessonSections('module2', lessons(13))!;
		expect(sections.map((s) => s.title)).toEqual([
			'Βασική πληκτρολόγηση',
			'Προχωρημένα & ταχύτητα'
		]);
		expect(sections[0].items).toHaveLength(9);
		expect(sections[1].items).toHaveLength(4);
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
});

describe('device tags', () => {
	it('returns tags for desktop-specific modules and null for universal ones', () => {
		expect(getModuleDevices('module1')).toEqual(['windows', 'mac']);
		expect(getModuleDevices('module3')).toEqual(['windows']); // Windows-only
		expect(getModuleDevices('module10')).toBeNull(); // phishing = universal
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
