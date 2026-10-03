import { describe, it, expect } from 'vitest';
import { guides, clipIdsFor } from './index';
import { allClips } from './scripts';
import { allLessons } from '$lib/db/seeds';

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
