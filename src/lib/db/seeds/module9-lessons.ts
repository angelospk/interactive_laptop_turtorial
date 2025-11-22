import type { NewLesson } from '../schema';

/**
 * Module 9: Advanced (Install, Settings)
 */
export const module9Lessons: NewLesson[] = [
    {
        id: 'module9-lesson1',
        moduleId: 'module9',
        lessonKey: 'install-app',
        titleKey: 'module9_lesson1_title',
        descriptionKey: 'module9_lesson1_desc',
        difficulty: 'intermediate',
        orderIndex: 1,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'install-app',
            initialApps: ['installer'],
            appName: 'Super Browser'
        },
        enabled: true,
        requiredLessonId: null
    },
    {
        id: 'module9-lesson2',
        moduleId: 'module9',
        lessonKey: 'connect-wifi',
        titleKey: 'module9_lesson2_title',
        descriptionKey: 'module9_lesson2_desc',
        difficulty: 'intermediate',
        orderIndex: 2,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'connect-wifi',
            initialApps: ['settings']
        },
        enabled: true,
        requiredLessonId: 'module9-lesson1'
    },
    {
        id: 'module9-lesson3',
        moduleId: 'module9',
        lessonKey: 'add-printer',
        titleKey: 'module9_lesson3_title',
        descriptionKey: 'module9_lesson3_desc',
        difficulty: 'advanced',
        orderIndex: 3,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'add-printer',
            initialApps: ['settings']
        },
        enabled: true,
        requiredLessonId: 'module9-lesson2'
    }
];
