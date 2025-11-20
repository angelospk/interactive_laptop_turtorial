import type { LayoutServerLoad } from './$types';
import { db, userProgress } from '$lib/db/client';
import { eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async ({ locals }) => {
    // Load user session
    if (!locals.user) {
        return {
            user: null,
            progress: {}
        };
    }

    // Load user's progress from database
    try {
        const progressData = await db
            .select()
            .from(userProgress)
            .where(eq(userProgress.userId, locals.user.id));

        // Convert to map
        const progressMap: Record<string, any> = {};
        for (const item of progressData) {
            progressMap[item.lessonId] = {
                completed: item.completed,
                score: item.score,
                stars: item.stars,
                attempts: item.attempts,
                completedAt: item.completedAt,
                lastAttemptAt: item.lastAttemptAt
            };
        }

        return {
            user: locals.user,
            progress: progressMap
        };
    } catch (error) {
        console.error('Error loading progress:', error);
        return {
            user: locals.user,
            progress: {}
        };
    }
};
