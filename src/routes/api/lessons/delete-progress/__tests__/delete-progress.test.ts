import { describe, it, expect, beforeEach, vi } from 'vitest';
import { lessons, users, userProgress } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createTestDb, type TestDb } from '$lib/db/__tests__/testDb';

// Same shape as the sibling complete/ test: the handler uses the module-level
// `db` from $lib/db/client (not locals.db), so we point that at a fresh
// in-memory db per test.
let currentDb: TestDb;
vi.mock('$lib/db/client', async () => {
	const schema = await import('$lib/db/schema');
	return {
		get db() {
			return currentDb;
		},
		...schema
	};
});

const { POST } = await import('../+server');

const OTHER_LESSON_ID = 'module1-lesson2';

function makeEvent(body: unknown, user: { id: string; username: string } | null) {
	return {
		request: { json: vi.fn().mockResolvedValue(body) } as unknown as Request,
		locals: { user, db: currentDb }
	} as unknown as Parameters<typeof POST>[0];
}

async function insertLesson(db: TestDb, id: string, orderIndex: number, lessonKey: string) {
	await db
		.insert(lessons)
		.values({
			id,
			moduleId: 'module1',
			lessonKey,
			titleKey: `${id}_title`,
			descriptionKey: `${id}_desc`,
			difficulty: 'beginner',
			orderIndex,
			lessonType: 'hover',
			config: { targetCount: 5, timeLimit: 30 },
			enabled: true,
			requiredLessonId: null,
			createdAt: new Date()
		})
		.run();
}

async function insertProgress(db: TestDb, userId: string, lessonId: string) {
	await db
		.insert(userProgress)
		.values({
			id: crypto.randomUUID(),
			userId,
			lessonId,
			completed: true,
			score: 80,
			stars: 3,
			attempts: 2,
			completedAt: new Date(),
			lastAttemptAt: new Date()
		})
		.run();
}

describe('POST /api/lessons/delete-progress', () => {
	let db: TestDb;
	let testUserId: string;
	let otherUserId: string;
	const testLessonId = 'module1-lesson1';

	beforeEach(async () => {
		db = await createTestDb();
		currentDb = db;

		testUserId = crypto.randomUUID();
		otherUserId = crypto.randomUUID();
		await db
			.insert(users)
			.values([
				{ id: testUserId, username: 'testuser', createdAt: new Date() },
				{ id: otherUserId, username: 'otheruser', createdAt: new Date() }
			])
			.run();

		await insertLesson(db, testLessonId, 1, 'hover-basic');
		await insertLesson(db, OTHER_LESSON_ID, 2, 'hover-precision');
	});

	it('deletes the progress row for the authenticated user', async () => {
		await insertProgress(db, testUserId, testLessonId);

		const response = await POST(
			makeEvent({ lessonId: testLessonId }, { id: testUserId, username: 'testuser' })
		);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.success).toBe(true);

		const remaining = await db
			.select()
			.from(userProgress)
			.where(eq(userProgress.userId, testUserId))
			.all();
		expect(remaining).toHaveLength(0);
	});

	it('leaves progress for other lessons untouched', async () => {
		await insertProgress(db, testUserId, testLessonId);
		await insertProgress(db, testUserId, OTHER_LESSON_ID);

		await POST(makeEvent({ lessonId: testLessonId }, { id: testUserId, username: 'testuser' }));

		const remaining = await db
			.select()
			.from(userProgress)
			.where(eq(userProgress.userId, testUserId))
			.all();
		expect(remaining.map((r) => r.lessonId)).toEqual([OTHER_LESSON_ID]);
	});

	it('does not delete another user progress for the same lesson', async () => {
		await insertProgress(db, testUserId, testLessonId);
		await insertProgress(db, otherUserId, testLessonId);

		await POST(makeEvent({ lessonId: testLessonId }, { id: testUserId, username: 'testuser' }));

		const otherStillThere = await db
			.select()
			.from(userProgress)
			.where(and(eq(userProgress.userId, otherUserId), eq(userProgress.lessonId, testLessonId)))
			.get();
		expect(otherStillThere).toBeDefined();
	});

	it('succeeds when there is no progress row to delete', async () => {
		// "Try Again" can fire before any progress was ever saved.
		const response = await POST(
			makeEvent({ lessonId: testLessonId }, { id: testUserId, username: 'testuser' })
		);

		expect(response.status).toBe(200);
		expect((await response.json()).success).toBe(true);
	});

	it('returns 401 when the user is not authenticated', async () => {
		await insertProgress(db, testUserId, testLessonId);

		await expect(POST(makeEvent({ lessonId: testLessonId }, null))).rejects.toMatchObject({
			status: 401
		});

		// The 401 must short-circuit before any delete runs.
		const remaining = await db.select().from(userProgress).all();
		expect(remaining).toHaveLength(1);
	});

	it('returns 400 when lessonId is missing', async () => {
		await expect(
			POST(makeEvent({}, { id: testUserId, username: 'testuser' }))
		).rejects.toMatchObject({ status: 400 });
	});

	it('returns 400 when lessonId is an empty string', async () => {
		await expect(
			POST(makeEvent({ lessonId: '' }, { id: testUserId, username: 'testuser' }))
		).rejects.toMatchObject({ status: 400 });
	});

	it('re-throws the 400 rather than masking it as a 500', async () => {
		// The catch block discriminates SvelteKit errors by their `status` field;
		// a regression there would turn this into a 500.
		await expect(
			POST(makeEvent({ lessonId: null }, { id: testUserId, username: 'testuser' }))
		).rejects.toMatchObject({ status: 400 });
	});

	it('returns 500 when the request body is not valid JSON', async () => {
		const event = {
			request: {
				json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token'))
			} as unknown as Request,
			locals: { user: { id: testUserId, username: 'testuser' }, db }
		} as unknown as Parameters<typeof POST>[0];

		await expect(POST(event)).rejects.toMatchObject({ status: 500 });
	});
});
