import type { GuideDefinition } from './types';
import type { Answer } from './machine';

/** This run's unknown answers request practice without changing past solved progress. */
export function guidePracticeLessonIds(
	guide: GuideDefinition,
	answers: Record<string, Answer>
): string[] {
	return [
		...new Set(
			guide.steps.flatMap((step) => (answers[step.id] === 'unknown' ? step.lessonIds : []))
		)
	];
}
