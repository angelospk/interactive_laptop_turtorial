import type { PageServerLoad } from './$types';
import { db, lessons } from '$lib/db/client';
import { eq, and, asc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent, params }) => {
    // Inherit data from layout (includes user and progress)
    const layoutData = await parent();
    const moduleId = params.id;

    // Fetch enabled lessons for this module
    const moduleLessons = await db
        .select()
        .from(lessons)
        .where(and(eq(lessons.moduleId, moduleId), eq(lessons.enabled, true)))
        .orderBy(asc(lessons.orderIndex));

    return {
        ...layoutData,
        moduleLessons
    };
};
