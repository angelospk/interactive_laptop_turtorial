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
    // All lessons are now unlocked - users can navigate freely
    return false;
}
