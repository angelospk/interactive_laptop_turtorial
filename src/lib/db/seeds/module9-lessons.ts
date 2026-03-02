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
    },

    // Lesson 5: Update App
    {
        id: 'module9-lesson5',
        moduleId: 'module9',
        lessonKey: 'update-app',
        titleKey: 'module9_lesson5_title',
        descriptionKey: 'module9_lesson5_desc',
        difficulty: 'intermediate',
        orderIndex: 5,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'update-app',
            initialApps: ['settings'],
            initialPage: 'apps',
            instructions: 'Ενημέρωση Εφαρμογής: Πηγαίνετε στις Ρυθμίσεις → Εφαρμογές και ελέγξτε για ενημερώσεις.'
        },
        enabled: true,
        requiredLessonId: 'module9-lesson4'
    },

    // Lesson 6: Bluetooth Connection
    {
        id: 'module9-lesson6',
        moduleId: 'module9',
        lessonKey: 'bluetooth-connect',
        titleKey: 'module9_lesson6_title',
        descriptionKey: 'module9_lesson6_desc',
        difficulty: 'intermediate',
        orderIndex: 6,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'connect-bluetooth',
            initialApps: ['settings'],
            initialPage: 'bluetooth',
            instructions: 'Σύνδεση Bluetooth: Ανοίξτε τις Ρυθμίσεις → Bluetooth, ενεργοποιήστε το και επιλέξτε συσκευή.'
        },
        enabled: true,
        requiredLessonId: 'module9-lesson5'
    },

    // Lesson 7: Display Settings
    {
        id: 'module9-lesson7',
        moduleId: 'module9',
        lessonKey: 'display-settings',
        titleKey: 'module9_lesson7_title',
        descriptionKey: 'module9_lesson7_desc',
        difficulty: 'beginner',
        orderIndex: 7,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'open-display-settings',
            initialApps: ['settings'],
            instructions: 'Ρυθμίσεις Οθόνης: Ανοίξτε τις Ρυθμίσεις → Εμφάνιση και προσαρμόστε φωτεινότητα και μέγεθος κειμένου.'
        },
        enabled: true,
        requiredLessonId: 'module9-lesson6'
    },

    // Lesson 8: Accessibility Settings
    {
        id: 'module9-lesson8',
        moduleId: 'module9',
        lessonKey: 'accessibility-settings',
        titleKey: 'module9_lesson8_title',
        descriptionKey: 'module9_lesson8_desc',
        difficulty: 'beginner',
        orderIndex: 8,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'open-accessibility',
            initialApps: ['settings'],
            instructions: 'Ρυθμίσεις Προσβασιμότητας: Ανοίξτε τις Ρυθμίσεις → Προσβασιμότητα για μεγαλύτερο κείμενο και υψηλή αντίθεση.'
        },
        enabled: true,
        requiredLessonId: 'module9-lesson7'
    },

    // Lesson 9: Sound Settings
    {
        id: 'module9-lesson9',
        moduleId: 'module9',
        lessonKey: 'sound-settings',
        titleKey: 'module9_lesson9_title',
        descriptionKey: 'module9_lesson9_desc',
        difficulty: 'beginner',
        orderIndex: 9,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'open-sound-settings',
            initialApps: ['settings'],
            instructions: 'Ρυθμίσεις Ήχου: Ανοίξτε τις Ρυθμίσεις → Ήχος και ρυθμίστε την ένταση και τις ειδοποιήσεις.'
        },
        enabled: true,
        requiredLessonId: 'module9-lesson8'
    }
];
