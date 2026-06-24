import type { PageServerLoad } from './$types';
import { db, lessons, modules } from '$lib/db/client';
import { eq, and, asc } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import { isLessonLocked } from '$lib/utils/progress';

export const load: PageServerLoad = async ({ parent, params }) => {
	const layoutData = await parent();
	const moduleId = params.id;
	// SvelteKit already percent-decodes route params, so use it directly (decoding
	// again would be a double-decode bug). Unknown keys fall through to the grid below.
	const lessonKey = params.lesson;

	const moduleLessons = await db
		.select()
		.from(lessons)
		.where(and(eq(lessons.moduleId, moduleId), eq(lessons.enabled, true)))
		.orderBy(asc(lessons.orderIndex));

	const startIndex = moduleLessons.findIndex((l) => l.lessonKey === lessonKey);

	// Unknown lesson inside a (possibly valid) module: send the user back to the grid
	// with a gentle notice instead of a hard 404 / silent failure.
	if (startIndex === -1) {
		throw redirect(303, `/modules/${moduleId}?notice=missing`);
	}

	// Locked-lesson guard (today `isLessonLocked` always returns false, so this is a
	// no-op; kept so re-enabling locking later "just works" for deep links too).
	const progress = (layoutData as { progress?: Record<string, unknown> }).progress ?? {};
	if (isLessonLocked(startIndex, moduleLessons[startIndex], moduleLessons, progress)) {
		throw redirect(303, `/modules/${moduleId}?notice=locked`);
	}

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
		moduleId,
		moduleLessons,
		startIndex,
		nextModuleId,
		isLastModule: currentIndex === sortedModuleIds.length - 1
	};
};
