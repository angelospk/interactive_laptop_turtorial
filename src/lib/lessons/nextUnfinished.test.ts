import { describe, it, expect } from 'vitest';
import { nextUnfinished } from './nextUnfinished';

const lessons = ['a', 'b', 'c', 'd'].map((id) => ({ id }));

describe('nextUnfinished', () => {
	it('revisits an exercise declared unknown even when previously solved', () => {
		const progress = { b: { completed: true }, c: { completed: true } };
		expect(nextUnfinished(lessons, progress, 0, ['b'])).toBe(1);
		expect(progress.b.completed).toBe(true);
	});

	it('continues to the next unknown exercise after practising an earlier one', () => {
		expect(nextUnfinished(lessons, { c: { completed: true } }, 1, ['c'])).toBe(2);
	});
	it('skips what is already done', () => {
		expect(nextUnfinished(lessons, { b: { completed: true } }, 0)).toBe(2);
	});

	it('takes the very next lesson when it is open', () => {
		expect(nextUnfinished(lessons, { b: { completed: false } }, 0)).toBe(1);
	});

	it('is null when everything after is done, even if something before is not', () => {
		expect(
			nextUnfinished(lessons, { c: { completed: true }, d: { completed: true } }, 1)
		).toBeNull();
	});

	it('is null on the last lesson', () => {
		expect(nextUnfinished(lessons, {}, 3)).toBeNull();
	});
});
