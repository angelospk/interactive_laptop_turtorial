import type { NewLesson } from '../schema';

/**
 * Module 6: Email & Security
 */
export const module6Lessons: NewLesson[] = [
    {
        id: 'module6-lesson1',
        moduleId: 'module6',
        lessonKey: 'open-email',
        titleKey: 'module6_lesson1_title',
        descriptionKey: 'module6_lesson1_desc',
        difficulty: 'beginner',
        orderIndex: 1,
        lessonType: 'desktop-simulation',
        config: { goal: 'open-app', targetAppId: 'email' },
        enabled: true,
        requiredLessonId: null
    },
    {
        id: 'module6-lesson2',
        moduleId: 'module6',
        lessonKey: 'read-email',
        titleKey: 'module6_lesson2_title',
        descriptionKey: 'module6_lesson2_desc',
        difficulty: 'beginner',
        orderIndex: 2,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'read-email',
            initialApps: ['email']
        },
        enabled: true,
        requiredLessonId: 'module6-lesson1'
    },
    {
        id: 'module6-lesson3',
        moduleId: 'module6',
        lessonKey: 'compose-email',
        titleKey: 'module6_lesson3_title',
        descriptionKey: 'module6_lesson3_desc',
        difficulty: 'intermediate',
        orderIndex: 3,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'send-email',
            initialApps: ['email']
        },
        enabled: true,
        requiredLessonId: 'module6-lesson2'
    },
    {
        id: 'module6-lesson4',
        moduleId: 'module6',
        lessonKey: 'save-draft',
        titleKey: 'module6_lesson4_title',
        descriptionKey: 'module6_lesson4_desc',
        difficulty: 'intermediate',
        orderIndex: 4,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'save-draft',
            initialApps: ['email']
        },
        enabled: true,
        requiredLessonId: 'module6-lesson3'
    },
    {
        id: 'module6-lesson5',
        moduleId: 'module6',
        lessonKey: 'view-sent',
        titleKey: 'module6_lesson5_title',
        descriptionKey: 'module6_lesson5_desc',
        difficulty: 'beginner',
        orderIndex: 5,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'view-sent',
            initialApps: ['email']
        },
        enabled: true,
        requiredLessonId: 'module6-lesson4'
    },
    {
        id: 'module6-lesson6',
        moduleId: 'module6',
        lessonKey: 'delete-email',
        titleKey: 'module6_lesson6_title',
        descriptionKey: 'module6_lesson6_desc',
        difficulty: 'intermediate',
        orderIndex: 6,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'delete-email',
            initialApps: ['email'],
            emails: [
                {
                    id: 'spam1',
                    sender: 'Spam <spam@spam.com>',
                    subject: 'Κερδίσατε!',
                    body: 'Κλικ εδώ για το δώρο σας.',
                    date: '09:00',
                    isRead: false,
                    isPhishing: false,
                    folder: 'inbox'
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module6-lesson5'
    },
    {
        id: 'module6-lesson7',
        moduleId: 'module6',
        lessonKey: 'view-trash',
        titleKey: 'module6_lesson7_title',
        descriptionKey: 'module6_lesson7_desc',
        difficulty: 'beginner',
        orderIndex: 7,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'view-trash',
            initialApps: ['email']
        },
        enabled: true,
        requiredLessonId: 'module6-lesson6'
    },
    {
        id: 'module6-lesson8',
        moduleId: 'module6',
        lessonKey: 'restore-email',
        titleKey: 'module6_lesson8_title',
        descriptionKey: 'module6_lesson8_desc',
        difficulty: 'intermediate',
        orderIndex: 8,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'restore-email',
            initialApps: ['email'],
            emails: [
                {
                    id: 'deleted1',
                    sender: 'Φίλος',
                    subject: 'Σημαντικό',
                    body: 'Μην το σβήσεις.',
                    date: '08:00',
                    isRead: true,
                    folder: 'trash'
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module6-lesson7'
    },
    {
        id: 'module6-lesson9',
        moduleId: 'module6',
        lessonKey: 'download-attachment',
        titleKey: 'module6_lesson9_title',
        descriptionKey: 'module6_lesson9_desc',
        difficulty: 'intermediate',
        orderIndex: 9,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'download-attachment',
            initialApps: ['email'],
            emails: [
                {
                    id: 'attach1',
                    sender: 'Εφορία <noreply@aade.gr>',
                    subject: 'Δήλωση Εισοδήματος',
                    body: 'Σας αποστέλλουμε το εκκαθαριστικό σας.',
                    date: 'Δευτέρα',
                    isRead: true,
                    isPhishing: false,
                    hasAttachment: true,
                    folder: 'inbox'
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module6-lesson8'
    }
];
