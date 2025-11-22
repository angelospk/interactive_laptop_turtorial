import type { PageServerLoad } from './$types';
import { db, lessons } from '$lib/db/client';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    // Fetch all enabled lessons
    const allLessons = await db
        .select({
            id: lessons.id,
            moduleId: lessons.moduleId
        })
        .from(lessons)
        .where(eq(lessons.enabled, true));

    // Group by moduleId to get counts
    const moduleCounts: Record<string, number> = {};
    const moduleLessonIds: Record<string, string[]> = {};

    for (const lesson of allLessons) {
        if (!moduleCounts[lesson.moduleId]) {
            moduleCounts[lesson.moduleId] = 0;
            moduleLessonIds[lesson.moduleId] = [];
        }
        moduleCounts[lesson.moduleId]++;
        moduleLessonIds[lesson.moduleId].push(lesson.id);
    }

    return {
        moduleCounts,
        moduleLessonIds
    };
};
