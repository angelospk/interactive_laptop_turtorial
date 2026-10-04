import { describe, it, expect } from 'vitest';
import { nextUnfinished } from './nextUnfinished';

const lessons = ['a', 'b', 'c', 'd'].map((id) => ({ id }));

describe('nextUnfinished', () => {
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
