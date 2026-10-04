import { expect, test } from 'vitest';
import { module5Guide } from './module5';
import { guidePracticeLessonIds } from './practice';
import { nextUnfinished } from '$lib/lessons/nextUnfinished';

test('knowing search does not remove close-tab, download or zoom from practice', () => {
	const practice = guidePracticeLessonIds(module5Guide, {
		search: 'known',
		'close-tab': 'unknown',
		page: 'unknown',
		zoom: 'unknown'
	});
	expect(practice).toEqual(['module5-lesson5', 'module5-lesson8', 'module5-lesson9']);
	const lessons = ['guide', ...Array.from({ length: 12 }, (_, i) => `module5-lesson${i + 1}`)].map(
		(id) => ({ id })
	);
	const progress = Object.fromEntries(lessons.map(({ id }) => [id, { completed: true }]));
	let current = 0;
	for (const id of practice) {
		current = nextUnfinished(lessons, progress, current, practice)!;
		expect(lessons[current].id).toBe(id);
	}
	expect(progress['module5-lesson5'].completed).toBe(true);
});

test('known and unanswered steps do not request extra practice', () => {
	expect(guidePracticeLessonIds(module5Guide, { search: 'known' })).toEqual([]);
});
