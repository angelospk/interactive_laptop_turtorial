import type { Lesson } from '$lib/db/schema';

type ProgressMap = Record<string, { completed?: boolean } | undefined>;

export function getModuleProgress(
    moduleId: string,
    moduleLessonIds: Record<string, string[]>,
    userProgress: ProgressMap
): number {
    const lessonIds = moduleLessonIds?.[moduleId] || [];
    if (lessonIds.length === 0) return 0;

    const completedCount = lessonIds.filter((id) => {
        return userProgress?.[id]?.completed;
    }).length;

    return Math.round((completedCount / lessonIds.length) * 100);
}

// Positional signature kept for callers; every lesson is unlocked, so no argument is read.
export function isLessonLocked(
    index: number,
    lesson: Lesson,
    lessons: Lesson[],
    userProgress: Record<string, unknown>
): boolean;
export function isLessonLocked(): boolean {
    // All lessons are now unlocked - users can navigate freely
    return false;
}
