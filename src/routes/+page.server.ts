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

    // Enabled lessons only, and with enough of each row to work out where
    // somebody left off. A lesson switched off since their last visit is not
    // somewhere to send them back to.
    const allLessons = await db
        .select({
            id: lessons.id,
            moduleId: lessons.moduleId,
            lessonKey: lessons.lessonKey,
            titleKey: lessons.titleKey,
            orderIndex: lessons.orderIndex
        })
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
        moduleLessonIds,
        // The home page turns this into the "welcome back" card. Sent whole
        // rather than resolved here, because the progress it is matched against
        // is loaded by the layout, one level up.
        lessons: allLessons
    };
};
