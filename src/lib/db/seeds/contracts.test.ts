import { describe, it, expect } from 'vitest';
import { allLessons } from './index';
import { allModules } from './modules';
import {
	moduleCategories,
	moduleSections,
	moduleDevices,
	moduleSimulationPlatform,
	isIdSection,
	getBasePathLessonIds,
	buildLessonSections
} from '$lib/config/moduleOrganization';
import type { Lesson } from '$lib/db/schema';
import { lessonTypeRegistry } from '$lib/components/lessons/lessonTypeRegistry';
import { parseMobileSimConfig } from '$lib/lessons/mobileSim';
import el from '../../../../messages/el.json';

/**
 * Data-evolution contracts (codex plan review, docs/CURRICULUM_PLAN.md §6):
 * seeds, organization config, renderer registry and i18n must never drift
 * apart. These tests are the safety net for every future content wave.
 */

const moduleIds = new Set(allModules.map((m) => m.id));
const lessonIds = new Set(allLessons.map((l) => l.id));

// i18n keys are snake_case identifiers; EAPSI readings store literal Greek
// text in titleKey on purpose (rendered as-is via the raw-key fallback).
const looksLikeI18nKey = (k: string) => /^[a-z0-9_]+$/i.test(k);

describe('seed integrity', () => {
	it('has globally unique lesson ids', () => {
		expect(lessonIds.size).toBe(allLessons.length);
	});

	it('has globally unique module ids', () => {
		expect(moduleIds.size).toBe(allModules.length);
	});

	it('references an existing module from every lesson', () => {
		for (const l of allLessons) {
			expect(moduleIds, `lesson ${l.id} → module ${l.moduleId}`).toContain(l.moduleId);
		}
	});

	it('references an existing lesson from every requiredLessonId', () => {
		for (const l of allLessons) {
			if (l.requiredLessonId) {
				expect(lessonIds, `lesson ${l.id} requires ${l.requiredLessonId}`).toContain(
					l.requiredLessonId
				);
			}
		}
	});

	it('has a unique (moduleId, lessonKey) pair per lesson (DB unique constraint)', () => {
		const pairs = allLessons.map((l) => `${l.moduleId}::${l.lessonKey}`);
		expect(new Set(pairs).size).toBe(pairs.length);
	});
});

describe('renderer registry', () => {
	it('registers a component loader for every seeded lessonType', () => {
		const types = new Set(allLessons.map((l) => l.lessonType));
		for (const t of types) {
			expect(Object.keys(lessonTypeRegistry), `lessonType "${t}"`).toContain(t);
		}
	});
});

describe('mobile-sim playability', () => {
	it('every seeded mobile-sim lesson has a valid, reachable config', () => {
		const sims = allLessons.filter((l) => l.lessonType === 'mobile-sim');
		expect(sims.length).toBeGreaterThan(0);
		for (const l of sims) {
			expect(() => parseMobileSimConfig(l.config), `lesson ${l.id}`).not.toThrow();
		}
	});
});

describe('module organization config', () => {
	it('places every seeded module in exactly one category', () => {
		const seen = new Map<string, number>();
		for (const c of moduleCategories) {
			for (const id of c.moduleIds) seen.set(id, (seen.get(id) ?? 0) + 1);
		}
		for (const m of allModules) {
			expect(seen.get(m.id), `module ${m.id} category coverage`).toBe(1);
		}
	});

	it('never references unknown modules from categories', () => {
		for (const c of moduleCategories) {
			for (const id of c.moduleIds) {
				expect(moduleIds, `category ${c.id} → module ${id}`).toContain(id);
			}
		}
	});

	it('keeps moduleSections counts in sync with actual seeded lesson counts', () => {
		for (const [moduleId, sections] of Object.entries(moduleSections)) {
			const actual = allLessons.filter((l) => l.moduleId === moduleId).length;
			const configured = sections.reduce(
				(n, s) => n + (isIdSection(s) ? s.lessonIds.length : s.count),
				0
			);
			expect(configured, `moduleSections[${moduleId}] sum vs ${actual} lessons`).toBe(actual);
		}
	});

	it('keeps «Θεωρία» section boundaries aligned with actual reading lessons', () => {
		// Positional counts are fragile by design — this pins them to reality:
		// where a module declares a leading «Θεωρία» section of N lessons, the
		// first N seeded lessons (by orderIndex) must actually be readings.
		for (const [moduleId, sections] of Object.entries(moduleSections)) {
			const first = sections[0];
			if (!first || isIdSection(first) || first.title !== 'Θεωρία') continue;
			const ordered = allLessons
				.filter((l) => l.moduleId === moduleId)
				.sort((a, b) => a.orderIndex - b.orderIndex);
			const theory = ordered.slice(0, first.count);
			for (const l of theory) {
				expect(l.lessonType, `module ${moduleId}: ${l.id} in «Θεωρία»`).toBe('reading');
			}
			expect(
				ordered[first.count]?.lessonType,
				`module ${moduleId}: first lesson after «Θεωρία»`
			).not.toBe('reading');
		}
	});

	// ── Id-based sections (CURRICULUM_PLAN §4β στ) — strict contract so growing
	// a track can never silently drop, duplicate or misorder a lesson.
	it('every id-based section references only lessons of its own module, exactly once', () => {
		for (const [moduleId, sections] of Object.entries(moduleSections)) {
			const idSections = sections.filter(isIdSection);
			if (idSections.length === 0) continue;

			const moduleLessonIds = new Set(
				allLessons.filter((l) => l.moduleId === moduleId).map((l) => l.id)
			);
			const seen = new Set<string>();
			for (const s of idSections) {
				for (const id of s.lessonIds) {
					expect(moduleLessonIds, `section ${moduleId}/${s.id} → lesson ${id}`).toContain(id);
					expect(seen.has(id), `lesson ${id} appears in two sections of ${moduleId}`).toBe(false);
					seen.add(id);
				}
			}
			// No seeded lesson left unassigned (would fall into «Επιπλέον μαθήματα»).
			for (const id of moduleLessonIds) {
				expect(seen.has(id), `seeded lesson ${id} is not placed in any ${moduleId} section`).toBe(
					true
				);
			}
		}
	});

	it('flattens id-based sections in the same order as (orderIndex) seeding', () => {
		for (const [moduleId, sections] of Object.entries(moduleSections)) {
			if (!sections.every(isIdSection)) continue;
			const orderedIds = allLessons
				.filter((l) => l.moduleId === moduleId)
				.sort((a, b) => a.orderIndex - b.orderIndex)
				.map((l) => l.id);
			const flattened = sections.filter(isIdSection).flatMap((s) => s.lessonIds);
			expect(flattened, `module ${moduleId} flattened section order`).toEqual(orderedIds);
		}
	});

	it('declares at most one non-empty base path per module', () => {
		for (const [moduleId, sections] of Object.entries(moduleSections)) {
			const base = sections.filter(isIdSection).filter((s) => s.completionRole === 'base');
			expect(base.length, `module ${moduleId} base sections`).toBeLessThanOrEqual(1);
			for (const s of base) {
				expect(s.lessonIds.length, `base section ${moduleId}/${s.id} is empty`).toBeGreaterThan(0);
			}
			const baseIds = getBasePathLessonIds(moduleId);
			if (base.length === 1) expect(baseIds).toEqual(base[0].lessonIds);
			else expect(baseIds).toBeNull();
		}
	});

	it('never leaves the mobile base path behind (the immutable original 7)', () => {
		for (const mod of ['android', 'iphone']) {
			const baseIds = getBasePathLessonIds(mod)!;
			expect(baseIds, `${mod} base path size`).toHaveLength(7);
			const existing = new Set(allLessons.filter((l) => l.moduleId === mod).map((l) => l.id));
			for (const id of baseIds) expect(existing, `${mod} base lesson ${id}`).toContain(id);
		}
	});

	it('buildLessonSections hides no lesson even when config omits one', () => {
		// A live-DB lesson missing from compiled config must still render.
		const fake = [
			...allLessons.filter((l) => l.moduleId === 'android'),
			{ id: 'android-mystery-future', moduleId: 'android', orderIndex: 99, lessonKey: 'mystery' }
		] as Lesson[];
		const sections = buildLessonSections('android', fake)!;
		const shown = sections.flatMap((s) => s.items.map((i) => i.lesson.id));
		expect(shown).toContain('android-mystery-future');
		expect(sections.at(-1)!.title).toBe('Επιπλέον μαθήματα');
	});

	it('only tags devices/simulation for modules that exist', () => {
		for (const id of Object.keys(moduleDevices)) {
			expect(moduleIds, `moduleDevices → ${id}`).toContain(id);
		}
		for (const id of Object.keys(moduleSimulationPlatform)) {
			expect(moduleIds, `moduleSimulationPlatform → ${id}`).toContain(id);
		}
	});
});

describe('i18n contract (el)', () => {
	it('resolves every module titleKey/descriptionKey', () => {
		for (const m of allModules) {
			for (const k of [m.titleKey, m.descriptionKey].filter((x): x is string => Boolean(x))) {
				if (looksLikeI18nKey(k)) {
					expect(el, `module ${m.id} key ${k}`).toHaveProperty(k);
				}
			}
		}
	});

	it('resolves every lesson titleKey/descriptionKey (literal-text readings excluded)', () => {
		for (const l of allLessons) {
			for (const k of [l.titleKey, l.descriptionKey].filter((x): x is string => Boolean(x))) {
				if (looksLikeI18nKey(k)) {
					expect(el, `lesson ${l.id} key ${k}`).toHaveProperty(k);
				}
			}
		}
	});
});
