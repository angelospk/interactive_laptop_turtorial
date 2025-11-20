import { json } from '@sveltejs/kit';
import { db, userProgress } from '$lib/db/client';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const { lessonId, score, completed } = await request.json();

        if (!locals.user) {
            return json({ error: 'Not authenticated' }, { status: 401 });
        }

        if (!lessonId) {
            return json({ error: 'lessonId is required' }, { status: 400 });
        }

        // Check if progress already exists
        const [existing] = await db
            .select()
            .from(userProgress)
            .where(
                and(
                    eq(userProgress.userId, locals.user.id),
                    eq(userProgress.lessonId, lessonId)
                )
            )
            .limit(1);

        if (existing) {
            // Update existing progress
            await db
                .update(userProgress)
                .set({
                    score: score ?? existing.score,
                    completed: completed ?? existing.completed,
                    completedAt: completed ? new Date() : existing.completedAt,
                    attempts: existing.attempts + 1,
                    lastAttemptAt: new Date()
                })
                .where(
                    and(
                        eq(userProgress.userId, locals.user.id),
                        eq(userProgress.lessonId, lessonId)
                    )
                );
        } else {
            // Create new progress
            await db.insert(userProgress).values({
                userId: locals.user.id,
                lessonId,
                score: score ?? 0,
                completed: completed ?? false,
                completedAt: completed ? new Date() : null,
                attempts: 1,
                lastAttemptAt: new Date()
            });
        }

        return json({ success: true });
    } catch (error) {
        console.error('Progress update error:', error);
        return json({ error: 'Failed to update progress' }, { status: 500 });
    }
};
