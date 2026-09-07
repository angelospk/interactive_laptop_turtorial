import { describe, expect, it } from 'vitest';
import { describeGap, pickResumePoint, wholeDaysBetween, type ResumeLesson } from './resume';

const NOW = new Date('2026-09-07T10:00:00Z');

function lesson(id: string, moduleId: string, orderIndex: number): ResumeLesson {
	return { id, moduleId, lessonKey: id, titleKey: `title.${id}`, orderIndex };
}

const LESSONS = [
	lesson('a', 'module1', 1),
	lesson('b', 'module1', 2),
	lesson('c', 'module2', 1)
];

describe('pickResumePoint', () => {
	it('sends a brand-new learner to the very first lesson and mentions no history', () => {
		const point = pickResumePoint(LESSONS, {}, NOW);
		expect(point.last).toBeNull();
		expect(point.lastAt).toBeNull();
		expect(point.daysAway).toBeNull();
		expect(point.next?.id).toBe('a');
		expect(point.finished).toBe(false);
	});

	it('remembers the most recent lesson, not the furthest through', () => {
		// 'a' was finished later than 'b' — going back to where they were means
		// where they were last, not where they got to.
		const point = pickResumePoint(
			LESSONS,
			{
				a: { completed: true, completedAt: '2026-09-05T09:00:00Z' },
				b: { completed: true, completedAt: '2026-09-01T09:00:00Z' }
			},
			NOW
		);
		expect(point.last?.id).toBe('a');
		expect(point.daysAway).toBe(2);
		expect(point.next?.id).toBe('c');
	});

	it('counts an unfinished attempt as "I was here"', () => {
		const point = pickResumePoint(
			LESSONS,
			{ b: { completed: false, lastAttemptAt: '2026-09-06T09:00:00Z' } },
			NOW
		);
		expect(point.last?.id).toBe('b');
		// Not completed, so it is also where they continue.
		expect(point.next?.id).toBe('a');
	});

	it('takes the later of the two timestamps on one row', () => {
		const point = pickResumePoint(
			LESSONS,
			{
				a: { completed: true, completedAt: '2026-08-01T09:00:00Z', lastAttemptAt: '2026-09-06T09:00:00Z' },
				b: { completed: true, completedAt: '2026-09-04T09:00:00Z' }
			},
			NOW
		);
		expect(point.last?.id).toBe('a');
		expect(point.daysAway).toBe(1);
	});

	it('never points at a lesson that has since been switched off', () => {
		// The caller passes enabled lessons only; a progress row for a disabled
		// lesson must not resurrect it as the thing the card is about.
		const point = pickResumePoint(
			LESSONS,
			{
				'switched-off': { completed: true, completedAt: '2026-09-06T09:00:00Z' },
				a: { completed: true, completedAt: '2026-09-02T09:00:00Z' }
			},
			NOW
		);
		expect(point.last?.id).toBe('a');
	});

	it('says so when everything enabled is done, instead of inventing a next lesson', () => {
		const done = { completed: true, completedAt: '2026-09-06T09:00:00Z' };
		const point = pickResumePoint(LESSONS, { a: done, b: done, c: done }, NOW);
		expect(point.finished).toBe(true);
		expect(point.next).toBeNull();
		expect(point.last).not.toBeNull();
	});

	it('is not fooled by a row with no usable timestamp', () => {
		const point = pickResumePoint(LESSONS, { a: { completed: true, completedAt: null } }, NOW);
		expect(point.last).toBeNull();
		expect(point.daysAway).toBeNull();
	});

	it('orders across modules, not just within one', () => {
		const point = pickResumePoint(LESSONS, { a: { completed: true }, b: { completed: true } }, NOW);
		expect(point.next?.id).toBe('c');
	});
});

describe('wholeDaysBetween', () => {
	it('floors, so 23 hours ago is still today', () => {
		expect(wholeDaysBetween(new Date('2026-09-06T11:30:00Z'), NOW)).toBe(0);
		expect(wholeDaysBetween(new Date('2026-09-06T09:00:00Z'), NOW)).toBe(1);
	});

	it('never goes negative on a clock that moved backwards', () => {
		expect(wholeDaysBetween(new Date('2026-09-09T10:00:00Z'), NOW)).toBe(0);
	});
});

describe('describeGap', () => {
	it('uses the words somebody would use', () => {
		expect(describeGap(0)).toBe('σήμερα');
		expect(describeGap(1)).toBe('χθες');
		expect(describeGap(3)).toBe('πριν από 3 μέρες');
		expect(describeGap(9)).toBe('πριν από μία εβδομάδα');
		expect(describeGap(21)).toBe('πριν από 3 εβδομάδες');
		expect(describeGap(40)).toBe('πριν από έναν μήνα');
		expect(describeGap(90)).toBe('πριν από 3 μήνες');
		expect(describeGap(500)).toBe('πριν από πολύ καιρό');
	});

	it('says nothing when there is nothing to say', () => {
		expect(describeGap(null)).toBeNull();
	});

	// The audience is people who already feel behind. Nothing here counts up to
	// a streak, and nothing here is phrased as a debt.
	it('never scolds', () => {
		for (const d of [0, 1, 3, 9, 21, 40, 90, 500]) {
			const text = describeGap(d)!;
			expect(text).not.toMatch(/χάθηκ|έχασ|πρέπει|καθυστ/);
		}
	});
});
