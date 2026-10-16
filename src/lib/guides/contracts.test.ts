import { describe, it, expect } from 'vitest';
import { guides, clipIdsFor } from './index';
import { allClips } from './scripts';
import { allLessons } from '$lib/db/seeds';

// Every `data-guide` the simulations render: literal values, values picked in an
// expression, and the prefix of templated ones (`taskbar-${app.id}` → «taskbar-»).
const sources = import.meta.glob('/src/lib/components/**/*.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;
const literal = new Set<string>();
const prefixes: string[] = [];
for (const code of Object.values(sources)) {
	for (const [, value] of code.matchAll(/data-guide="([^"{]+)"/g)) literal.add(value);
	for (const [, prefix] of code.matchAll(/data-guide=\{`([^`$]*)\$\{/g)) prefixes.push(prefix);
	// A value picked in an expression: data-guide={active ? 'close-tab' : undefined}
	for (const [, expr] of code.matchAll(/data-guide=\{([^}`]+)\}/g)) {
		for (const [, value] of expr.matchAll(/'([^']+)'/g)) literal.add(value);
	}
}
const rendered = (target: string) =>
	literal.has(target) || prefixes.some((p) => p && target.startsWith(p));

// A guide is spread over three places (definition, script, seeds); these keep
// them from drifting apart.
describe('guide contracts', () => {
	const clips = allClips();
	const lessonById = new Map(allLessons.map((l) => [l.id, l]));

	for (const guide of Object.values(guides)) {
		it(`${guide.id}: every clip it can play is in a script`, () => {
			const missing = clipIdsFor(guide).filter((id) => !clips.has(id));
			expect(missing).toEqual([]);
		});

		it(`${guide.id}: every step's exercises exist in the guide's module`, () => {
			for (const step of guide.steps) {
				for (const id of step.lessonIds) {
					expect(lessonById.get(id)?.moduleId, `${guide.id}/${step.id} → ${id}`).toBe(
						guide.moduleId
					);
				}
			}
		});

		it(`${guide.id}: every step points at a data-guide some simulation renders`, () => {
			const missing = guide.steps.map((s) => s.target).filter((t) => !rendered(t));
			expect(missing).toEqual([]);
		});

		it(`${guide.id}: step ids are unique`, () => {
			const ids = guide.steps.map((s) => s.id);
			expect(new Set(ids).size).toBe(ids.length);
		});
	}

	it('every seeded guide lesson points at a defined guide of its own module', () => {
		const guideLessons = allLessons.filter((l) => l.lessonType === 'guide');
		expect(guideLessons.length).toBeGreaterThan(0);
		for (const l of guideLessons) {
			const guideId = (l.config as { guideId?: string } | null)?.guideId ?? '';
			expect(guides[guideId]?.moduleId, l.id).toBe(l.moduleId);
		}
	});
});
