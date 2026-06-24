import { describe, expect, it } from 'vitest';
import { module10Lessons } from './module10-lessons';

/**
 * Contract for the 'scam-spotter' lesson type ("Απάτη ή Όχι;").
 * Each lesson holds a set of realistic message cards; the user decides scam/legit.
 * This test locks the config shape so non-scoreable or one-sided lessons can't ship,
 * and pins the requiredLessonId chain so existing progress isn't disrupted.
 */
describe('module10 scam-spotter lesson seeds', () => {
	const scamLessons = module10Lessons.filter((lesson) => lesson.lessonType === 'scam-spotter');

	it('defines at least one scam-spotter lesson', () => {
		expect(scamLessons.length).toBeGreaterThan(0);
	});

	it('every scam-spotter lesson has a valid, mixed set of cards', () => {
		for (const lesson of scamLessons) {
			const cards = (lesson.config as { cards?: unknown[] })?.cards as
				| Array<Record<string, unknown>>
				| undefined;

			expect(Array.isArray(cards), `${lesson.id}: config.cards must be an array`).toBe(true);
			expect(cards!.length, `${lesson.id}: needs at least one card`).toBeGreaterThan(0);

			// Mixed: teaches recognition, not blanket paranoia.
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
					['email', 'sms', 'viber', 'phone'],
					`${lesson.id}/${card.id}: channel`
				).toContain(card.channel);

				expect(typeof card.body, `${lesson.id}/${card.id}: body`).toBe('string');
				expect((card.body as string).trim()).not.toBe('');

				expect(typeof card.isScam, `${lesson.id}/${card.id}: isScam`).toBe('boolean');

				const redFlags = card.redFlags as unknown[];
				expect(Array.isArray(redFlags), `${lesson.id}/${card.id}: redFlags`).toBe(true);
				expect(redFlags.length, `${lesson.id}/${card.id}: redFlags non-empty`).toBeGreaterThan(0);
				expect(
					redFlags.every((f) => typeof f === 'string' && (f as string).trim() !== '')
				).toBe(true);

				expect(typeof card.explanation, `${lesson.id}/${card.id}: explanation`).toBe('string');
				expect((card.explanation as string).trim()).not.toBe('');
			}
		}
	});

	it('chains after the existing module10 lessons without mutating them', () => {
		const l9 = module10Lessons.find((l) => l.id === 'module10-lesson9');
		const l10 = module10Lessons.find((l) => l.id === 'module10-lesson10');

		expect(l9?.lessonType).toBe('scam-spotter');
		expect(l9?.requiredLessonId).toBe('module10-lesson8');
		expect(l10?.lessonType).toBe('scam-spotter');
		expect(l10?.requiredLessonId).toBe('module10-lesson9');

		// Existing assessment lessons stay intact.
		expect(module10Lessons.find((l) => l.id === 'module10-lesson8')?.lessonType).toBe('quiz');
	});

	it('covers all four channels across the pool', () => {
		const channels = new Set(
			scamLessons.flatMap((l) =>
				((l.config as { cards?: Array<{ channel?: string }> }).cards ?? []).map((c) => c.channel)
			)
		);
		expect(channels).toEqual(new Set(['email', 'sms', 'viber', 'phone']));
	});

	it('extends the chain: viber after sms, phone after viber', () => {
		const viber = module10Lessons.find((l) => l.lessonKey === 'scam-spotter-viber');
		const phone = module10Lessons.find((l) => l.lessonKey === 'scam-spotter-phone');
		expect(viber?.requiredLessonId).toBe('module10-lesson10');
		expect(phone?.requiredLessonId).toBe('module10-lesson11');
	});
});
