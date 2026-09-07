// The one thing to do together, right now.
//
// The helper page used to list every module with a percentage, a progress bar
// and its own "τι να εξασκήσετε μαζί" link. A relative who opens it once, on a
// phone, standing next to the learner, has thirty seconds and one question:
// what do I do with them now. Eleven answers is the same as none.
//
// So this picks exactly one, and the rest of the page is folded away behind it.
// Pure, so the awkward orders — everything done, nothing started, a device with
// no modules of its own — can be argued with in a test.

import { getBasePathLessonIds, isModuleForDevice, type ModuleDevice } from './config/moduleOrganization';

export type LessonMeta = { id: string; lessonKey: string; titleKey: string };
export type ProgressMap = Record<string, { completed?: boolean } | undefined>;

export type Activity = {
	moduleId: string;
	lesson: LessonMeta;
	/** True when everything is finished and this is offered as a repeat. */
	isReview: boolean;
};

/**
 * Where to send the pair next.
 *
 * The order of preference is the order somebody would actually choose in: the
 * device the learner said they wanted to learn, the basic route before the
 * extras, and only then anything else. A review is offered rather than an empty
 * page when there is nothing left, because "you have finished" is a worse
 * ending for this audience than "do this one again".
 */
export function pickTogetherActivity(
	moduleIds: readonly string[],
	lessonsByModule: Readonly<Record<string, LessonMeta[]>>,
	progress: ProgressMap,
	device: ModuleDevice | null
): Activity | null {
	const done = (id: string) => progress[id]?.completed === true;

	// Modules for the learner's own device first; the rest keep their order.
	const ordered = device
		? [
				...moduleIds.filter((m) => isModuleForDevice(m, device)),
				...moduleIds.filter((m) => !isModuleForDevice(m, device))
			]
		: [...moduleIds];

	// Pass one: the basic route, which is the part that was designed to be
	// enough on its own.
	for (const moduleId of ordered) {
		const base = getBasePathLessonIds(moduleId);
		if (!base) continue;
		const lessons = lessonsByModule[moduleId] ?? [];
		const next = lessons.find((l) => base.includes(l.id) && !done(l.id));
		if (next) return { moduleId, lesson: next, isReview: false };
	}

	// Pass two: anything unfinished at all.
	for (const moduleId of ordered) {
		const next = (lessonsByModule[moduleId] ?? []).find((l) => !done(l.id));
		if (next) return { moduleId, lesson: next, isReview: false };
	}

	// Everything is done. Offer the first lesson of the device's first module
	// back as a repeat rather than showing a page with nothing on it.
	for (const moduleId of ordered) {
		const first = (lessonsByModule[moduleId] ?? [])[0];
		if (first) return { moduleId, lesson: first, isReview: true };
	}

	return null;
}

/** How many of the enabled lessons are finished. */
export function countProgress(
	lessonsByModule: Readonly<Record<string, LessonMeta[]>>,
	progress: ProgressMap
): { total: number; completed: number } {
	let total = 0;
	let completed = 0;
	for (const lessons of Object.values(lessonsByModule)) {
		for (const l of lessons) {
			total += 1;
			if (progress[l.id]?.completed) completed += 1;
		}
	}
	return { total, completed };
}
