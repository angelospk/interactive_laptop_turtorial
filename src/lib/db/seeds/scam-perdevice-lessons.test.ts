import { describe, expect, it } from 'vitest';
import { scamPerDeviceLessons } from './scam-perdevice-lessons';

/**
 * Contract for the per-device scam-spotter seed (issue B4).
 * Mirrors module10-scam-spotter.test.ts but scoped to the new, isolated file:
 * locks the card shape, keeps the set mixed (scoreable), validates the additive
 * `deviceVariant` field, and pins the requiredLessonId so the chain stays intact.
 */
describe('per-device scam-spotter seed', () => {
	const scamLessons = scamPerDeviceLessons.filter((l) => l.lessonType === 'scam-spotter');

	it('defines at least one scam-spotter lesson', () => {
		expect(scamLessons.length).toBeGreaterThan(0);
	});

	it('reuses the scam-spotter lessonType (no new goal/type invented)', () => {
		for (const lesson of scamPerDeviceLessons) {
			expect(lesson.lessonType).toBe('scam-spotter');
		}
	});

	it('every lesson has a valid, mixed set of cards', () => {
		for (const lesson of scamLessons) {
			const cards = (lesson.config as { cards?: unknown[] })?.cards as
				| Array<Record<string, unknown>>
				| undefined;

			expect(Array.isArray(cards), `${lesson.id}: config.cards must be an array`).toBe(true);
			expect(cards!.length, `${lesson.id}: needs at least one card`).toBeGreaterThan(0);

			expect(
				cards!.some((c) => c.isScam === true),
				`${lesson.id}: needs at least one scam card`
			).toBe(true);
			expect(
				cards!.some((c) => c.isScam === false),
				`${lesson.id}: needs at least one legitimate card`
			).toBe(true);

			for (const card of cards!) {
				expect(typeof card.id, `${lesson.id}: card.id`).toBe('string');
				expect((card.id as string).trim()).not.toBe('');
				expect(
					(card.id as string).startsWith('scam-pd-'),
					`${lesson.id}/${card.id}: namespaced`
				).toBe(true);

				expect(['email', 'sms', 'viber', 'phone'], `${lesson.id}/${card.id}: channel`).toContain(
					card.channel
				);

				// Additive per-device field: optional, but when present must be android|ios and SMS-only.
				if (card.deviceVariant !== undefined) {
					expect(['android', 'ios'], `${lesson.id}/${card.id}: deviceVariant`).toContain(
						card.deviceVariant
					);
					expect(card.channel, `${lesson.id}/${card.id}: deviceVariant is SMS-only`).toBe('sms');
				}

				expect(typeof card.body, `${lesson.id}/${card.id}: body`).toBe('string');
				expect((card.body as string).trim()).not.toBe('');

				expect(typeof card.isScam, `${lesson.id}/${card.id}: isScam`).toBe('boolean');

				const redFlags = card.redFlags as unknown[];
				expect(Array.isArray(redFlags), `${lesson.id}/${card.id}: redFlags`).toBe(true);
				expect(redFlags.length, `${lesson.id}/${card.id}: redFlags non-empty`).toBeGreaterThan(0);
				expect(redFlags.every((f) => typeof f === 'string' && (f as string).trim() !== '')).toBe(
					true
				);

				expect(typeof card.explanation, `${lesson.id}/${card.id}: explanation`).toBe('string');
				expect((card.explanation as string).trim()).not.toBe('');
			}
		}
	});

	it('shows the same phishing on both Android and iPhone (per-device pair)', () => {
		const cards = (scamLessons[0].config as { cards?: Array<Record<string, unknown>> }).cards ?? [];
		const variants = new Set(
			cards.map((c) => c.deviceVariant).filter((v): v is string => typeof v === 'string')
		);
		expect(variants).toEqual(new Set(['android', 'ios']));
	});

	it('chains after the existing module10 scam-spotter set without mutating it', () => {
		const lesson = scamPerDeviceLessons.find((l) => l.lessonKey === 'scam-spotter-perdevice');
		expect(lesson?.id).toBe('module10-lesson13');
		expect(lesson?.moduleId).toBe('module10');
		expect(lesson?.requiredLessonId).toBe('module10-lesson12');
	});
});
