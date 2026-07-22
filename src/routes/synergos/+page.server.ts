import type { PageServerLoad } from './$types';
import { db, lessons, modules } from '$lib/db/client';
import { eq, asc } from 'drizzle-orm';

/**
 * «Ο συνεργάτης μου» — read-only helper view (issue B6).
 *
 * Loads the same module/lesson shape as the home page; the learner's user +
 * progress arrive from the root +layout.server.ts (normal login session — the
 * helper looks WITH the senior). This load never writes anything.
 */
export const load: PageServerLoad = async () => {
	const allModules = await db
		.select()
		.from(modules)
		.where(eq(modules.enabled, true))
		.orderBy(asc(modules.orderIndex));

	// Ordered lesson metadata per module: enough to compute completion (via
	// getModuleCompletion on the client) and to name/link the next unfinished
	// lesson («Τι να εξασκήσετε μαζί»).
	const allLessons = await db
		.select({
			id: lessons.id,
			moduleId: lessons.moduleId,
			lessonKey: lessons.lessonKey,
			titleKey: lessons.titleKey
		})
		.from(lessons)
		.where(eq(lessons.enabled, true))
		.orderBy(asc(lessons.orderIndex));

	const moduleLessonIds: Record<string, string[]> = {};
	const moduleLessonMeta: Record<string, { id: string; lessonKey: string; titleKey: string }[]> =
		{};

	for (const lesson of allLessons) {
		(moduleLessonIds[lesson.moduleId] ??= []).push(lesson.id);
		(moduleLessonMeta[lesson.moduleId] ??= []).push({
			id: lesson.id,
			lessonKey: lesson.lessonKey,
			titleKey: lesson.titleKey
		});
	}

	return {
		modules: allModules,
		moduleLessonIds,
		moduleLessonMeta
	};
};
