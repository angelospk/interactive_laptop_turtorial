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
    },
    {
        id: 'module8-lesson3',
        moduleId: 'module8',
        lessonKey: 'secure-site',
        titleKey: 'module8_lesson3_title',
        descriptionKey: 'module8_lesson3_desc',
        difficulty: 'intermediate',
        orderIndex: 3,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'navigate-site',
            targetUrl: 'gov', // Assuming gov is secure
            initialApps: ['browser']
        },
        enabled: true,
        requiredLessonId: 'module8-lesson2'
    },
    {
        id: 'module8-lesson4',
        moduleId: 'module8',
        lessonKey: 'avoid-popups',
        titleKey: 'module8_lesson4_title',
        descriptionKey: 'module8_lesson4_desc',
        difficulty: 'intermediate',
        orderIndex: 4,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'close-tab', // Simulate closing a popup tab
            initialApps: ['browser']
        },
        enabled: true,
        requiredLessonId: 'module8-lesson3'
    },
    {
        id: 'module8-lesson5',
        moduleId: 'module8',
        lessonKey: 'email-safety',
        titleKey: 'module8_lesson5_title',
        descriptionKey: 'module8_lesson5_desc',
        difficulty: 'advanced',
        orderIndex: 5,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'identify-phishing',
            initialApps: ['email'],
            emails: [
                {
                    id: 'phish2',
                    sender: 'Lottery Winner <prize@win-big-now.com>',
                    subject: 'ΚΕΡΔΙΣΑΤΕ!!!',
                    body: 'Κάντε κλικ για να παραλάβετε το δώρο σας!',
                    date: '12:00',
                    isRead: false,
                    isPhishing: true
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module8-lesson4'
    }
];
