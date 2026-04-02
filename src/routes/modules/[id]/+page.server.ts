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

    // Find the next module
    const allModules = await db
        .selectDistinct({ moduleId: lessons.moduleId })
        .from(lessons)
        .where(eq(lessons.enabled, true));
        
    const sortedModuleIds = allModules
        .map(m => m.moduleId)
        .sort((a, b) => {
            const numA = parseInt(a.replace('module', '')) || 0;
            const numB = parseInt(b.replace('module', '')) || 0;
            return numA - numB;
        });

    const currentIndex = sortedModuleIds.indexOf(moduleId);
    const nextModuleId = currentIndex !== -1 && currentIndex < sortedModuleIds.length - 1 
        ? sortedModuleIds[currentIndex + 1] 
        : null;

    return {
        ...layoutData,
        moduleLessons,
        nextModuleId,
        isLastModule: currentIndex === sortedModuleIds.length - 1
    };
}
