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
    const uniqueModuleIds = new Set<string>();

    for (const lesson of allLessons) {
        if (!moduleCounts[lesson.moduleId]) {
            moduleCounts[lesson.moduleId] = 0;
            moduleLessonIds[lesson.moduleId] = [];
        }
        moduleCounts[lesson.moduleId]++;
        moduleLessonIds[lesson.moduleId].push(lesson.id);
        uniqueModuleIds.add(lesson.moduleId);
    }

    // Create modules array sorted by module number
    const modules = Array.from(uniqueModuleIds)
        .sort((a, b) => {
            const numA = parseInt(a.replace('module', '')) || 0;
            const numB = parseInt(b.replace('module', '')) || 0;
            return numA - numB;
        })
        .map((moduleId) => ({
            id: moduleId,
            titleKey: `${moduleId}_title`,
            descriptionKey: `${moduleId}_description`
        }));

    return {
        modules,
        moduleCounts,
        moduleLessonIds
    };
};
