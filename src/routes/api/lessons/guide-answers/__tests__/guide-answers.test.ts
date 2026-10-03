import { describe, it, expect, beforeEach, vi } from 'vitest';
import { lessons, users, userProgress, type NewLesson } from '$lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { createTestDb, type TestDb } from '$lib/db/__tests__/testDb';

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

const USER = 'user-1';
const lesson = (id: string, moduleId: string, lessonType = 'browser'): NewLesson => ({
	id,
	moduleId,
	lessonKey: id,
	titleKey: id,
	difficulty: 'beginner',
	orderIndex: 1,
	lessonType,
	config: lessonType === 'guide' ? { guideId: moduleId } : {},
	enabled: true
});

function call(body: unknown, user: { id: string } | null = { id: USER }) {
	return POST({
		request: { json: vi.fn().mockResolvedValue(body) } as unknown as Request,
		locals: { user: user && { ...user, username: 'u' } }
	} as unknown as Parameters<typeof POST>[0]);
}

async function status(p: Promise<Response>) {
	try {
		return (await p).status;
	} catch (e) {
		return (e as { status: number }).status;
	}
}

const row = (lessonId: string) =>
	currentDb
		.select()
		.from(userProgress)
		.where(and(eq(userProgress.userId, USER), eq(userProgress.lessonId, lessonId)))
		.get();

describe('POST /api/lessons/guide-answers', () => {
	beforeEach(async () => {
		currentDb = await createTestDb();
		await currentDb.insert(users).values({ id: USER, username: 'u' }).run();
		await currentDb
			.insert(lessons)
			.values([
				lesson('m5-guide', 'module5', 'guide'),
				lesson('m5-a', 'module5'),
				lesson('m5-b', 'module5'),
				lesson('m6-a', 'module6')
			])
			.run();
	});

	it('requires a signed-in learner', async () => {
		expect(await status(call({ guideLessonId: 'm5-guide', answers: {} }, null))).toBe(401);
	});

	it('rejects a body without answers, or a guideLessonId that is not a guide', async () => {
		expect(await status(call({ guideLessonId: 'm5-guide' }))).toBe(400);
		expect(await status(call({ guideLessonId: 'm5-a', answers: { 'm5-b': 'known' } }))).toBe(400);
		expect(await status(call({ guideLessonId: 'm5-guide', answers: { 'm5-a': 'maybe' } }))).toBe(400);
	});

	it('rejects an exercise from another module', async () => {
		expect(await status(call({ guideLessonId: 'm5-guide', answers: { 'm6-a': 'known' } }))).toBe(400);
		expect(await row('m6-a')).toBeUndefined();
	});

	it('«known» marks the exercise done, from the guide, without a score', async () => {
		const res = await call({ guideLessonId: 'm5-guide', answers: { 'm5-a': 'known' } });
		expect(res.status).toBe(200);
		const r = await row('m5-a');
		expect(r).toMatchObject({ completed: true, source: 'guide', score: null, stars: null });
	});

	it('«known» never touches an exercise solved for real', async () => {
		await currentDb
			.insert(userProgress)
			.values({ userId: USER, lessonId: 'm5-a', completed: true, score: 80, stars: 3, attempts: 2 })
			.run();
		await call({ guideLessonId: 'm5-guide', answers: { 'm5-a': 'known' } });
		expect(await row('m5-a')).toMatchObject({ completed: true, score: 80, stars: 3, source: null });
	});

	it('«known» completes an exercise that was started but not finished', async () => {
		await currentDb
			.insert(userProgress)
			.values({ userId: USER, lessonId: 'm5-a', completed: false, attempts: 1 })
			.run();
		await call({ guideLessonId: 'm5-guide', answers: { 'm5-a': 'known' } });
		expect(await row('m5-a')).toMatchObject({ completed: true, source: 'guide', attempts: 1 });
	});

	it('«unknown» takes back only what the guide marked', async () => {
		await call({ guideLessonId: 'm5-guide', answers: { 'm5-a': 'known' } });
		await currentDb
			.insert(userProgress)
			.values({ userId: USER, lessonId: 'm5-b', completed: true, score: 50, stars: 2, attempts: 1 })
			.run();
		await call({ guideLessonId: 'm5-guide', answers: { 'm5-a': 'unknown', 'm5-b': 'unknown' } });
		expect(await row('m5-a')).toBeUndefined();
		expect(await row('m5-b')).toMatchObject({ completed: true, score: 50 });
	});
});
