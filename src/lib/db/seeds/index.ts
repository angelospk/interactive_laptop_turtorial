import type { NewLesson } from '../schema';
import { GOALS, isValidGoalId } from '$lib/lessons/goals';
import { module1Lessons } from './module1-lessons';
import { module2Lessons } from './module2-lessons';
import { module3Lessons } from './module3-lessons';
import { module4Lessons } from './module4-lessons';
import { module5Lessons } from './module5-lessons';
import { module6Lessons } from './module6-lessons';
import { module7Lessons } from './module7-lessons';
import { module8Lessons } from './module8-lessons';
import { module9Lessons } from './module9-lessons';
import { module10Lessons } from './module10-lessons';
import { module11Lessons } from './module11-lessons';
import { module12Lessons } from './module12-lessons';
import { module13Lessons } from './module13-lessons';
import { wordLessons } from './module-word-lessons';
import { eapsiReadingLessons } from './eapsi-reading-lessons';
import { androidLessons } from './android-lessons';
export { allModules } from './modules';

/**
 * Validate all lessons at import time.
 * A lesson with an unknown goal fails immediately instead of silently breaking at runtime.
 */
function validateLessons(lessons: NewLesson[]): void {
	for (const lesson of lessons) {
		const config = lesson.config as Record<string, unknown> | null | undefined;
		if (!config) continue;
		const goal = config.goal;
		if (typeof goal === 'string' && !isValidGoalId(goal)) {
			throw new Error(
				`Seed error in lesson "${lesson.id}": unknown goal "${goal}". ` +
				`Valid goals: ${Object.keys(GOALS).join(', ')}`
			);
		}
	}
}

const _allLessons: NewLesson[] = [
    ...module1Lessons,
    ...module2Lessons,
    ...module3Lessons,
    ...module4Lessons,
    ...module5Lessons,
    ...module6Lessons,
    ...wordLessons,
    ...module7Lessons,
    ...module8Lessons,
    ...module9Lessons,
    ...module10Lessons,
    ...module11Lessons,
    ...module12Lessons,
    ...module13Lessons,
    ...eapsiReadingLessons,
    ...androidLessons
];

// Fail fast at import time if any lesson references an unknown goal.
validateLessons(_allLessons);

/**
 * All lesson seed data — validated.
 */
export const allLessons: NewLesson[] = _allLessons;

export {
    module1Lessons,
    module2Lessons,
    module3Lessons,
    module4Lessons,
    module5Lessons,
    module6Lessons,
    wordLessons,
    module7Lessons,
    module8Lessons,
    module9Lessons,
    module10Lessons,
    module11Lessons,
    module12Lessons,
    module13Lessons,
    eapsiReadingLessons,
    androidLessons
};
