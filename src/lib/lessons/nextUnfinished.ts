/**
 * Index of the first lesson after `from` that is not completed, or null when
 * every later lesson is done. Used after a completion, so a learner who said
 * «Το ξέρω» in a guide goes straight to what they do not know yet.
 */
export function nextUnfinished(
	lessons: readonly { id: string }[],
	progress: Record<string, { completed?: boolean } | undefined>,
	from: number,
	practiceLessonIds: readonly string[] = []
): number | null {
	for (let i = from + 1; i < lessons.length; i++) {
		if (practiceLessonIds.includes(lessons[i].id) || !progress[lessons[i].id]?.completed) return i;
	}
	return null;
}
