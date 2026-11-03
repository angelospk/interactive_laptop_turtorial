import { describe, it, expect, beforeEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { lessons, modules } from '$lib/db/schema';
import { allLessons, allModules } from '$lib/db/seeds';
import { createTestDb, type TestDb } from '$lib/db/__tests__/testDb';
import { seedLessons, seedModules } from './seedUpsert';

// bd 20l: seeding did one SELECT and one write per lesson, ~682 HTTP
// round-trips to Turso. These tests pin the result AND the round-trip budget.
describe('seedUpsert', () => {
	let db: TestDb;
	let queries: string[];

	beforeEach(async () => {
		queries = [];
		db = await createTestDb((q) => queries.push(q));
	});

	it('inserts every lesson into an empty database in a few queries', async () => {
		const result = await seedLessons(db, allLessons, 'update');

		expect(result).toEqual({ inserted: allLessons.length, existing: 0 });
		expect(await db.select().from(lessons).all()).toHaveLength(allLessons.length);
		expect(queries.length).toBeLessThanOrEqual(20);
	});

	it("'update' rewrites the lessons that already exist", async () => {
		const first = allLessons[0];
		await db
			.insert(lessons)
			.values({ ...first, config: { stale: true } })
			.run();
		queries = [];

		const result = await seedLessons(db, allLessons, 'update');

		expect(result).toEqual({ inserted: allLessons.length - 1, existing: 1 });
		const row = await db.select().from(lessons).where(eq(lessons.id, first.id)).get();
		expect(row?.config).toEqual(first.config ?? null);
		expect(await db.select().from(lessons).all()).toHaveLength(allLessons.length);
		expect(queries.length).toBeLessThanOrEqual(20);
	});

	it("'skip' leaves the lessons that already exist untouched", async () => {
		const first = allLessons[0];
		await db
			.insert(lessons)
			.values({ ...first, config: { stale: true } })
			.run();

		const result = await seedLessons(db, allLessons, 'skip');

		expect(result).toEqual({ inserted: allLessons.length - 1, existing: 1 });
		const row = await db.select().from(lessons).where(eq(lessons.id, first.id)).get();
		expect(row?.config).toEqual({ stale: true });
	});

	// Only an id conflict means "already seeded". Another lesson with the same
	// (moduleId, lessonKey) is a seed bug and must fail loudly, not vanish.
	it("'skip' throws when a new id collides on (moduleId, lessonKey)", async () => {
		const first = allLessons[0];
		await db
			.insert(lessons)
			.values({ ...first, id: 'other-id' })
			.run();

		await expect(seedLessons(db, [first], 'skip')).rejects.toThrow();
	});

	it('does nothing for an empty list', async () => {
		expect(await seedLessons(db, [], 'update')).toEqual({ inserted: 0, existing: 0 });
		expect(queries).toEqual([]);
	});

	it('upserts modules: inserts new ones, updates existing ones', async () => {
		const first = allModules[0];
		await db
			.insert(modules)
			.values({ ...first, titleKey: 'stale' })
			.run();
		queries = [];

		const result = await seedModules(db, allModules);

		expect(result).toEqual({ inserted: allModules.length - 1, existing: 1 });
		const row = await db.select().from(modules).where(eq(modules.id, first.id)).get();
		expect(row?.titleKey).toBe(first.titleKey);
		expect(await db.select().from(modules).all()).toHaveLength(allModules.length);
		expect(queries.length).toBeLessThanOrEqual(5);
	});
});
