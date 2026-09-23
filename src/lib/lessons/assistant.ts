/**
 * What the floating "Βοηθός" is allowed to say.
 *
 * One selector, deliberately: the old inline expression fell back to the lesson
 * description, so the assistant popped open on every lesson repeating a sentence
 * the learner could already see under the title and, in most lesson types, again
 * as the "Οδηγίες" line inside the lesson. Distinct means distinct *content*, not
 * merely a different config field.
 */

type LessonLike = {
	config?: unknown;
	description?: string | null;
};

const normalise = (value: string) => value.replace(/\s+/g, ' ').trim().toLocaleLowerCase('el');

const hasText = (value: unknown): value is string =>
	typeof value === 'string' && value.trim() !== '';

export function getAssistantContent(lesson: LessonLike): string[] | string | null {
	const config = (lesson?.config ?? {}) as Record<string, unknown> | null;
	const visible = hasText(lesson?.description) ? normalise(lesson.description) : '';

	const steps = Array.isArray(config?.tutorialSteps)
		? (config.tutorialSteps as unknown[])
				.filter(hasText)
				.filter((step) => normalise(step) !== visible)
		: [];

	if (steps.length > 0) return steps;

	// `config.instructions` is not assistant material: every lesson type now keeps
	// that line on screen while the learner plays, so repeating it in a floating
	// panel was the third copy of one sentence. The assistant speaks only when an
	// author wrote `tutorialSteps` — something genuinely additional.
	return null;
}
