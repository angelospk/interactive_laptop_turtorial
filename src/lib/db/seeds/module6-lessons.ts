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
        lessonKey: 'identify-phishing',
        titleKey: 'module6_lesson3_title',
        descriptionKey: 'module6_lesson3_desc',
        difficulty: 'intermediate',
        orderIndex: 3,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'identify-phishing',
            initialApps: ['email'],
            emails: [
                {
                    id: 'phish1',
                    sender: 'Secure Bank <admin@x-bank-verify.com>',
                    subject: 'Ασυνήθιστη δραστηριότητα',
                    body: 'Παρακαλώ κάντε κλικ εδώ για να επαληθεύσετε τον λογαριασμό σας.',
                    date: '10:00',
                    isRead: false,
                    isPhishing: true
                },
                {
                    id: 'real1',
                    sender: 'Γιάννης <giannis@gmail.com>',
                    subject: 'Καλημέρα',
                    body: 'Τι κάνεις; Θα τα πούμε το απόγευμα;',
                    date: '09:00',
                    isRead: true,
                    isPhishing: false
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module6-lesson2'
    },
    {
        id: 'module6-lesson4',
        moduleId: 'module6',
        lessonKey: 'download-attachment',
        titleKey: 'module6_lesson4_title',
        descriptionKey: 'module6_lesson4_desc',
        difficulty: 'intermediate',
        orderIndex: 4,
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
                    hasAttachment: true
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module6-lesson3'
    }
];
