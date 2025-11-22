import type { NewLesson } from '../schema';

/**
 * Module 8: Internet Safety & Banking
 */
export const module8Lessons: NewLesson[] = [
    {
        id: 'module8-lesson1',
        moduleId: 'module8',
        lessonKey: 'safe-browsing',
        titleKey: 'module8_lesson1_title',
        descriptionKey: 'module8_lesson1_desc',
        difficulty: 'beginner',
        orderIndex: 1,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'navigate-site',
            targetUrl: 'news',
            initialApps: ['browser']
        },
        enabled: true,
        requiredLessonId: null
    },
    {
        id: 'module8-lesson2',
        moduleId: 'module8',
        lessonKey: 'banking-login',
        titleKey: 'module8_lesson2_title',
        descriptionKey: 'module8_lesson2_desc',
        difficulty: 'advanced',
        orderIndex: 2,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'navigate-site',
            targetUrl: 'bank',
            initialApps: ['browser']
        },
        enabled: true,
        requiredLessonId: 'module8-lesson1'
    }
];
