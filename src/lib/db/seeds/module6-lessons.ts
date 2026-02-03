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
            goal: 'read-all-unread',
            initialApps: ['email'],
            instructions: 'Κάντε κλικ σε κάθε μη αναγνωσμένο μήνυμα (με έντονη γραμματοσειρά) για να το διαβάσετε.\n\n💡 Τα μη αναγνωσμένα μηνύματα έχουν έντονο τίτλο.',
            emails: [
                { id: 'e1', sender: 'Γιάννης <giannis@gmail.com>', subject: 'Καλημέρα!', body: 'Τι κάνεις; Πάμε για καφέ;', date: '10:00', isRead: false, isPhishing: false },
                { id: 'e2', sender: 'Μαρία <maria@gmail.com>', subject: 'Συνάντηση αύριο', body: 'Θες να βρεθούμε αύριο στις 5;', date: '09:30', isRead: false, isPhishing: false }
            ]
        },
        enabled: true,
        requiredLessonId: 'module6-lesson1'
    },
    // Lesson 3: Reply to Email
    {
        id: 'module6-lesson3',
        moduleId: 'module6',
        lessonKey: 'reply-email',
        titleKey: 'module6_lesson3_title',
        descriptionKey: 'module6_lesson3_desc',
        difficulty: 'beginner',
        orderIndex: 3,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'reply-email',
            initialApps: ['email'],
            instructions: 'Ανοίξτε το email από τον "Γιάννη" και πατήστε "Απάντηση".',
            emails: [
                {
                    id: 'reply-task',
                    sender: 'Γιάννης <giannis@gmail.com>',
                    subject: 'Καφές;',
                    body: 'Πάμε για καφέ αύριο;',
                    date: '10:00',
                    isRead: false,
                    isPhishing: false
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module6-lesson2'
    },

    // Lesson 4: Forward Email
    {
        id: 'module6-lesson4',
        moduleId: 'module6',
        lessonKey: 'forward-email',
        titleKey: 'module6_lesson4_title',
        descriptionKey: 'module6_lesson4_desc',
        difficulty: 'intermediate',
        orderIndex: 4,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'forward-email',
            initialApps: ['email'],
            instructions: 'Προωθήστε το email της "Εφορίας" στον λογιστή σας.',
            emails: [
                {
                    id: 'forward-task',
                    sender: 'Εφορία <noreply@aade.gr>',
                    subject: 'Δήλωση',
                    body: 'Η δήλωσή σας.',
                    date: '09:00',
                    isRead: true,
                    isPhishing: false
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module6-lesson3'
    },

    // Lesson 5: Delete Email
    {
        id: 'module6-lesson5',
        moduleId: 'module6',
        lessonKey: 'delete-email',
        titleKey: 'module6_lesson5_title',
        descriptionKey: 'module6_lesson5_desc',
        difficulty: 'beginner',
        orderIndex: 5,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'delete-email',
            initialApps: ['email'],
            instructions: 'Διαγράψτε το διαφημιστικό email.',
            emails: [
                {
                    id: 'spam-task',
                    sender: 'Super Market <offers@market.gr>',
                    subject: 'Προσφορές',
                    body: 'Δείτε τις προσφορές μας.',
                    date: '08:00',
                    isRead: false,
                    isPhishing: false
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module6-lesson4'
    }
];
