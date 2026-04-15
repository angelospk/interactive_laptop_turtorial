import type { NewLesson } from '../schema';

type LessonBase = Omit<NewLesson, 'orderIndex' | 'requiredLessonId'>;

/**
 * Auto-assigns orderIndex and requiredLessonId based on array position.
 * First lesson: orderIndex=1, requiredLessonId=null
 * Each subsequent lesson: orderIndex=n, requiredLessonId=previous.id
 */
export function autoOrder(lessons: LessonBase[]): NewLesson[] {
    return lessons.map((lesson, i) => ({
        ...lesson,
        orderIndex: i + 1,
        requiredLessonId: i === 0 ? null : lessons[i - 1].id
    }));
}
