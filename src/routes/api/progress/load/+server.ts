import { json } from '@sveltejs/kit';
import { db, userProgress } from '$lib/db/client';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
    try {
        if (!locals.user) {
            return json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Load all progress for this user
        const progress = await db
            .select()
            .from(userProgress)
            .where(eq(userProgress.userId, locals.user.id));

        // Convert to a map for easier access
        const progressMap: Record<string, any> = {};
        for (const item of progress) {
            progressMap[item.lessonId] = {
                completed: item.completed,
                score: item.score,
                stars: item.stars,
                attempts: item.attempts,
                completedAt: item.completedAt,
                lastAttemptAt: item.lastAttemptAt
            };
        }

        return json({ progress: progressMap });
    } catch (error) {
        console.error('Progress load error:', error);
        return json({ error: 'Failed to load progress' }, { status: 500 });
    }
};
