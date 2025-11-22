import type { NewLesson } from '../schema';
import { module1Lessons } from './module1-lessons';
import { module2Lessons } from './module2-lessons';
import { module3Lessons } from './module3-lessons';
import { module4Lessons } from './module4-lessons';
import { module5Lessons } from './module5-lessons';

/**
 * All lesson seed data
 * Total: 46 lessons (11 Module 1, 11 Module 2, 6 Module 3, 8 Module 4, 6 Module 5, 4 Keyboard Module 2)
 */
export const allLessons: NewLesson[] = [
    ...module1Lessons,
    ...module2Lessons,
    ...module3Lessons,
    ...module4Lessons,
    ...module5Lessons
];

export { module1Lessons, module2Lessons, module3Lessons, module4Lessons, module5Lessons };
