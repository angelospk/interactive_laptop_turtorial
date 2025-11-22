import type { Lesson } from '$lib/db/schema';

export function getModuleProgress(
    moduleId: string,
    moduleLessonIds: Record<string, string[]>,
    userProgress: Record<string, any>
): number {
    const lessonIds = moduleLessonIds?.[moduleId] || [];
    if (lessonIds.length === 0) return 0;

    const completedCount = lessonIds.filter((id) => {
        return userProgress?.[id]?.completed;
    }).length;

    return Math.round((completedCount / lessonIds.length) * 100);
}

export function isLessonLocked(
    index: number,
    lesson: Lesson,
    lessons: Lesson[],
    userProgress: Record<string, any>
): boolean {
    // First lesson is always unlocked unless it has a specific requirement
    if (index === 0 && !lesson.requiredLessonId) return false;

    // Check required lesson if specified
    if (lesson.requiredLessonId) {
        const requiredProgress = userProgress[lesson.requiredLessonId];
        return !requiredProgress?.completed;
    }

    // Fallback: Check if previous lesson in the list is completed
    // Note: This assumes the lessons array is sorted by orderIndex
    if (index > 0) {
        const prevLesson = lessons[index - 1];
        const prevProgress = userProgress[prevLesson.id];
        return !prevProgress?.completed;
    }

    return false;
}
