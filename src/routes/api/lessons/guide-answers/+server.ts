import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db/client';
import { lessons, userProgress } from '$lib/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { requireUser } from '$lib/server/guards';

type Answer = 'known' | 'unknown';

/**
 * POST /api/lessons/guide-answers
 * Body: { guideLessonId, answers: { [lessonId]: 'known' | 'unknown' } }
 *
 * «Το ξέρω» in a guide marks the step's exercises done with source 'guide' and
 * no score. «Δεν το ξέρω» takes back only what a guide marked. An exercise the
 * learner solved for real is never touched either way.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const user = requireUser(locals);
	const body = await request.json().catch(() => null);
	const answers = parseAnswers(body?.answers);
	if (typeof body?.guideLessonId !== 'string' || !answers) {
		throw error(400, 'Expected { guideLessonId, answers: { [lessonId]: "known" | "unknown" } }');
	}

	const guide = await db.select().from(lessons).where(eq(lessons.id, body.guideLessonId)).get();
	if (!guide || guide.lessonType !== 'guide') throw error(400, 'Not a guide lesson');

	const lessonIds = Object.keys(answers);
	if (lessonIds.length === 0) return json({ success: true });

	const targets = await db.select().from(lessons).where(inArray(lessons.id, lessonIds));
	const sameModule = targets.filter((l) => l.moduleId === guide.moduleId);
	if (sameModule.length !== lessonIds.length) {
		throw error(400, "Every lesson must exist and belong to the guide's module");
	}

	const now = new Date();
	for (const lessonId of lessonIds) {
		const mine = and(eq(userProgress.userId, user.id), eq(userProgress.lessonId, lessonId));
		if (answers[lessonId] === 'unknown') {
			await db
				.delete(userProgress)
				.where(and(mine, eq(userProgress.source, 'guide')))
				.run();
			continue;
		}
		const existing = await db.select().from(userProgress).where(mine).get();
		if (existing?.completed) continue;
		if (existing) {
			await db
				.update(userProgress)
				.set({ completed: true, completedAt: now, source: 'guide' })
				.where(eq(userProgress.id, existing.id))
				.run();
		} else {
			await db
				.insert(userProgress)
				.values({ userId: user.id, lessonId, completed: true, completedAt: now, source: 'guide' })
				.run();
		}
	}
	return json({ success: true });
};

function parseAnswers(raw: unknown): Record<string, Answer> | null {
	if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
	const entries = Object.entries(raw);
	if (entries.some(([, v]) => v !== 'known' && v !== 'unknown')) return null;
	return Object.fromEntries(entries) as Record<string, Answer>;
}
