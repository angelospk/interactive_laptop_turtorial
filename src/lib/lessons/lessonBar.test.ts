import { describe, expect, test } from 'vitest';
import { barReducer, stuckDelayMs, type BarState } from './lessonBar';

const closed: BarState = { open: false };

describe('the lesson bar', () => {
	test('a new lesson opens it, so the learner reads the title and the instruction', () => {
		expect(barReducer(closed, 'arrive')).toEqual({ open: true, reason: 'arrival' });
	});

	test('starting the exercise puts it away', () => {
		for (const reason of ['arrival', 'peek', 'pinned', 'stuck'] as const) {
			expect(barReducer({ open: true, reason }, 'stage-interact')).toEqual(closed);
		}
	});

	test('a peek opens it and leaving puts it away again', () => {
		const peeked = barReducer(closed, 'peek');
		expect(peeked).toEqual({ open: true, reason: 'peek' });
		expect(barReducer(peeked, 'leave')).toEqual(closed);
	});

	test('a peek does not downgrade a bar opened on purpose', () => {
		const pinned: BarState = { open: true, reason: 'pinned' };
		expect(barReducer(pinned, 'peek')).toBe(pinned);
		expect(barReducer(pinned, 'leave')).toBe(pinned);
		const stuck: BarState = { open: true, reason: 'stuck' };
		expect(barReducer(stuck, 'leave')).toBe(stuck);
	});

	test('the Menu button toggles it', () => {
		const opened = barReducer(closed, 'toggle');
		expect(opened).toEqual({ open: true, reason: 'pinned' });
		expect(barReducer(opened, 'toggle')).toEqual(closed);
	});

	test('being stuck opens it whatever it was doing', () => {
		expect(barReducer(closed, 'stuck')).toEqual({ open: true, reason: 'stuck' });
		expect(barReducer({ open: true, reason: 'peek' }, 'stuck')).toEqual({
			open: true,
			reason: 'stuck'
		});
	});

	test('dismiss always closes', () => {
		expect(barReducer({ open: true, reason: 'stuck' }, 'dismiss')).toEqual(closed);
		expect(barReducer(closed, 'dismiss')).toBe(closed);
	});
});

describe('how long before "Κόλλησες;"', () => {
	const lesson = (over: Record<string, unknown> = {}) => ({
		lessonType: 'desktop-simulation',
		difficulty: 'beginner',
		config: {},
		...over
	});

	test('a simple lesson asks after 40 seconds', () => {
		expect(stuckDelayMs(lesson())).toBe(40_000);
	});

	test('harder lessons wait longer', () => {
		expect(stuckDelayMs(lesson({ difficulty: 'intermediate' }))).toBe(60_000);
		expect(stuckDelayMs(lesson({ difficulty: 'advanced' }))).toBe(90_000);
	});

	test('reading, quizzes and typing never ask: taking time there is the point', () => {
		for (const lessonType of ['reading', 'quiz', 'typing', 'scam-spotter']) {
			expect(stuckDelayMs(lesson({ lessonType }))).toBeNull();
		}
	});

	test('a lesson can set its own delay, or turn the question off', () => {
		expect(stuckDelayMs(lesson({ config: { stuckAfterSeconds: 25 } }))).toBe(25_000);
		expect(stuckDelayMs(lesson({ config: { stuckAfterSeconds: 0 } }))).toBeNull();
		expect(stuckDelayMs(lesson({ lessonType: 'quiz', config: { stuckAfterSeconds: 30 } }))).toBe(
			30_000
		);
	});

	test('nonsense in the config falls back to the default', () => {
		expect(stuckDelayMs(lesson({ config: { stuckAfterSeconds: 'soon' } }))).toBe(40_000);
		expect(stuckDelayMs(lesson({ config: null }))).toBe(40_000);
	});
});
