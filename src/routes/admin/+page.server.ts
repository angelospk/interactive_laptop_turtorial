import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db, lessons } from '$lib/db/client';
import { asc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
    // Check admin authentication
    if (!locals.admin) {
        throw error(403, 'Unauthorized: Admin access required');
    }

    // Fetch all lessons ordered by module and index
    const allLessons = await db
        .select()
        .from(lessons)
        .orderBy(asc(lessons.moduleId), asc(lessons.orderIndex));

    // Group lessons by module
    const lessonsByModule = allLessons.reduce(
        (acc, lesson) => {
            if (!acc[lesson.moduleId]) {
                acc[lesson.moduleId] = [];
            }
            acc[lesson.moduleId].push(lesson);
            return acc;
        },
        {} as Record<string, typeof allLessons>
    );

    return {
        lessonsByModule,
        totalLessons: allLessons.length,
        enabledCount: allLessons.filter((l) => l.enabled).length
    };
};
