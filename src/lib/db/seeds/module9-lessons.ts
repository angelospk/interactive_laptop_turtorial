import type { NewLesson } from '../schema';

/**
 * Module 9: Advanced (Install, Settings)
 * Added Uninstall Lesson
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
            appName: 'Super Browser',
            instructions: 'Εγκατάσταση Εφαρμογής: Ακολουθήστε τα βήματα για να εγκαταστήσετε το "Super Browser".'
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
            initialApps: ['settings'],
            initialPage: 'network',
            targetSsid: 'Home_WiFi',
            requiredPassword: 'kwdikos12345',
            instructions: 'Σύνδεση στο Wi-Fi: Επιλέξτε το δίκτυο "Home_WiFi" και βάλτε τον κωδικό: kwdikos12345'
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
            initialApps: ['settings'],
            initialPage: 'devices',
            instructions: 'Προσθήκη Εκτυπωτή: Πατήστε "Προσθήκη εκτυπωτή" για να συνδέσετε τον νέο εκτυπωτή.'
        },
        enabled: true,
        requiredLessonId: 'module9-lesson2'
    },
    {
        id: 'module9-lesson4',
        moduleId: 'module9',
        lessonKey: 'uninstall-app',
        titleKey: 'module9_lesson4_title',
        descriptionKey: 'module9_lesson4_desc',
        difficulty: 'advanced',
        orderIndex: 4,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'uninstall-app',
            initialApps: ['settings'],
            initialPage: 'apps',
            instructions: 'Απεγκατάσταση: Πηγαίνετε στις Εφαρμογές και διαγράψτε το "Spotify".'
        },
        enabled: true,
        requiredLessonId: 'module9-lesson3'
    }
];
