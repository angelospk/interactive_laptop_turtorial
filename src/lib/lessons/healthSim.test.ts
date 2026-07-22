import { describe, it, expect } from 'vitest';
import {
	parseHealthSimConfig,
	matchHealthGoal,
	isHealthGoalId,
	HEALTH_GOAL_SCREEN,
	type HealthSimConfig
} from './healthSim';
import { healthLessons } from '$lib/db/seeds/health-lessons';

const sms: HealthSimConfig = {
	goal: 'health-read-eprescription-code',
	screen: 'sms',
	prompt: 'Διαβάστε τον κωδικό.',
	code: 'A7K9'
};

const portal: HealthSimConfig = {
	goal: 'health-view-prescriptions',
	screen: 'portal',
	prompt: 'Δείτε τις συνταγές σας.',
	prescriptions: [{ title: 'Παρακεταμόλη', detail: 'Δρ. Ιωάννου' }]
};

const appt: HealthSimConfig = {
	goal: 'health-book-appointment',
	screen: 'appointments',
	prompt: 'Κλείστε ραντεβού.',
	slots: [
		{ id: 'mon-10', label: 'Δευτέρα 10:00' },
		{ id: 'tue-12', label: 'Τρίτη 12:00' }
	],
	targetSlotId: 'mon-10'
};

describe('isHealthGoalId', () => {
	it('accepts the three health goals and rejects others', () => {
		expect(isHealthGoalId('health-read-eprescription-code')).toBe(true);
		expect(isHealthGoalId('health-view-prescriptions')).toBe(true);
		expect(isHealthGoalId('health-book-appointment')).toBe(true);
		expect(isHealthGoalId('gov-service')).toBe(false);
		expect(isHealthGoalId('health-unknown')).toBe(false);
		expect(isHealthGoalId(42)).toBe(false);
	});
});

describe('parseHealthSimConfig', () => {
	it('accepts each valid screen config', () => {
		expect(() => parseHealthSimConfig(sms)).not.toThrow();
		expect(() => parseHealthSimConfig(portal)).not.toThrow();
		expect(() => parseHealthSimConfig(appt)).not.toThrow();
	});

	it('rejects a non-object', () => {
		expect(() => parseHealthSimConfig(null)).toThrow();
		expect(() => parseHealthSimConfig('x')).toThrow();
	});

	it('rejects an unknown goal', () => {
		expect(() => parseHealthSimConfig({ ...sms, goal: 'nope' })).toThrow(/health-\*/);
	});

	it('rejects an empty prompt', () => {
		expect(() => parseHealthSimConfig({ ...sms, prompt: '  ' })).toThrow(/prompt/);
	});

	it('rejects a goal/screen mismatch', () => {
		expect(() => parseHealthSimConfig({ ...sms, screen: 'portal' })).toThrow(/must run on screen/);
	});

	it('requires a code on the sms screen', () => {
		const { code, ...noCode } = sms;
		expect(() => parseHealthSimConfig(noCode)).toThrow(/code/);
	});

	it('requires prescriptions on the portal screen', () => {
		expect(() => parseHealthSimConfig({ ...portal, prescriptions: [] })).toThrow(/prescriptions/);
	});

	it('requires slots and a valid targetSlotId on the appointments screen', () => {
		expect(() => parseHealthSimConfig({ ...appt, slots: [] })).toThrow(/slots/);
		expect(() => parseHealthSimConfig({ ...appt, targetSlotId: 'ghost' })).toThrow(/targetSlotId/);
	});

	it('rejects duplicate slot ids', () => {
		expect(() =>
			parseHealthSimConfig({
				...appt,
				slots: [
					{ id: 'dup', label: 'A' },
					{ id: 'dup', label: 'B' }
				],
				targetSlotId: 'dup'
			})
		).toThrow(/duplicate slot/);
	});

	it('keeps HEALTH_GOAL_SCREEN in sync with every goal', () => {
		expect(HEALTH_GOAL_SCREEN[sms.goal]).toBe('sms');
		expect(HEALTH_GOAL_SCREEN[portal.goal]).toBe('portal');
		expect(HEALTH_GOAL_SCREEN[appt.goal]).toBe('appointments');
	});
});

describe('matchHealthGoal', () => {
	it('completes read-code only on a confirmed reveal', () => {
		expect(matchHealthGoal(sms, 'health-code-revealed', { confirmed: true })).toBe(true);
		expect(matchHealthGoal(sms, 'health-code-revealed', { confirmed: false })).toBe(false);
		expect(matchHealthGoal(sms, 'health-wrong-message', {})).toBe(false);
	});

	it('completes view-prescriptions on the viewed event', () => {
		expect(matchHealthGoal(portal, 'health-prescriptions-viewed', {})).toBe(true);
		expect(matchHealthGoal(portal, 'health-wrong-section', {})).toBe(false);
	});

	it('completes book-appointment only for the target slot', () => {
		expect(matchHealthGoal(appt, 'health-appointment-booked', { slotId: 'mon-10' })).toBe(true);
		expect(matchHealthGoal(appt, 'health-appointment-booked', { slotId: 'tue-12' })).toBe(false);
	});

	it('accepts any slot when no target is set', () => {
		const anySlot = { ...appt, targetSlotId: undefined };
		expect(matchHealthGoal(anySlot, 'health-appointment-booked', { slotId: 'tue-12' })).toBe(true);
	});
});

describe('seeded health lessons', () => {
	it('every health-simulation lesson has a valid, reachable config', () => {
		const sims = healthLessons.filter((l) => l.lessonType === 'health-simulation');
		expect(sims.length).toBeGreaterThan(0);
		for (const l of sims) {
			expect(() => parseHealthSimConfig(l.config), `lesson ${l.id}`).not.toThrow();
		}
	});

	it('chains lessons via requiredLessonId and keeps ids unique', () => {
		const ids = healthLessons.map((l) => l.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const l of healthLessons) {
			if (l.requiredLessonId) expect(ids).toContain(l.requiredLessonId);
		}
	});
});
