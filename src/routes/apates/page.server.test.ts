import { describe, expect, it } from 'vitest';
import { load } from './+page.server';

/**
 * The public "Απάτη ή Όχι;" page must serve the scam-spotter exercises straight
 * from seed data — no DB, no account. This locks that the load returns usable,
 * scoreable exercises so the printed QR link never lands on an empty page.
 */
describe('/apates public load', () => {
	it('returns at least one scam-spotter exercise with cards', async () => {
		// load() here takes no event-dependent input (seed-only).
		const result = await (load as () => Promise<{ exercises: unknown[] }>)();
		const exercises = result.exercises as Array<{
			id: string;
			lessonType: string;
			config?: { cards?: unknown[] };
		}>;

		expect(exercises.length).toBeGreaterThan(0);

		for (const ex of exercises) {
			expect(ex.lessonType).toBe('scam-spotter');
			expect(Array.isArray(ex.config?.cards)).toBe(true);
			expect((ex.config!.cards as unknown[]).length).toBeGreaterThan(0);
		}
	});
});
