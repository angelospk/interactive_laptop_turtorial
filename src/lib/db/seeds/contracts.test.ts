import { describe, it, expect } from 'vitest';
import { allLessons } from './index';
import { allModules } from './modules';
import {
	moduleCategories,
	moduleSections,
	moduleDevices,
	moduleSimulationPlatform
} from '$lib/config/moduleOrganization';
import { lessonTypeRegistry } from '$lib/components/lessons/lessonTypeRegistry';
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
			const configured = sections.reduce((n, s) => n + s.count, 0);
			expect(configured, `moduleSections[${moduleId}] sum vs ${actual} lessons`).toBe(actual);
		}
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
