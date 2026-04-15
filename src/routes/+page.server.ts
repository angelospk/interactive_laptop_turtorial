import type { PageServerLoad } from './$types';
import { db, lessons, modules } from '$lib/db/client';
import { eq, asc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    // Fetch all enabled modules in order
    const allModules = await db
        .select()
        .from(modules)
        .where(eq(modules.enabled, true))
        .orderBy(asc(modules.orderIndex));

    // Fetch lesson counts and IDs per module
    const allLessons = await db
        .select({ id: lessons.id, moduleId: lessons.moduleId })
        .from(lessons)
        .where(eq(lessons.enabled, true));

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
        modules: allModules,
        moduleCounts,
        moduleLessonIds
    };
};
