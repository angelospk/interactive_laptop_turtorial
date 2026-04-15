import type { PageServerLoad } from './$types';
import { db, lessons, modules } from '$lib/db/client';
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

    // Find the next module using the modules table (ordered by orderIndex)
    const allModules = await db
        .select({ id: modules.id })
        .from(modules)
        .where(eq(modules.enabled, true))
        .orderBy(asc(modules.orderIndex));

    const sortedModuleIds = allModules.map((m) => m.id);
    const currentIndex = sortedModuleIds.indexOf(moduleId);
    const nextModuleId =
        currentIndex !== -1 && currentIndex < sortedModuleIds.length - 1
            ? sortedModuleIds[currentIndex + 1]
            : null;

    return {
        ...layoutData,
        moduleLessons,
        nextModuleId,
        isLastModule: currentIndex === sortedModuleIds.length - 1
    };
};
