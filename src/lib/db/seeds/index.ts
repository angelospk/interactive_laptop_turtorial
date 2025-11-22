import type { NewLesson } from '../schema';
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

/**
 * All lesson seed data
 */
export const allLessons: NewLesson[] = [
    ...module1Lessons,
    ...module2Lessons,
    ...module3Lessons,
    ...module4Lessons,
    ...module5Lessons,
    ...module6Lessons,
    ...module7Lessons,
    ...module8Lessons,
    ...module9Lessons,
    ...module10Lessons
];

export {
    module1Lessons,
    module2Lessons,
    module3Lessons,
    module4Lessons,
    module5Lessons,
    module6Lessons,
    module7Lessons,
    module8Lessons,
    module9Lessons,
    module10Lessons
};
