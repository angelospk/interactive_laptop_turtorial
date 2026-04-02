import type { NewLesson } from '../schema';

/**
 * Module 5: Web Browser & Internet Navigation
 * Refactored with History and improved Tabs
 */
export const module5Lessons: NewLesson[] = [
    // Lesson 1: Opening Browser & New Tabs
    {
        id: 'module5-lesson1',
        moduleId: 'module5',
        lessonKey: 'new-tab',
        titleKey: 'module5_lesson1_title',
        descriptionKey: 'module5_lesson1_desc',
        difficulty: 'beginner',
        orderIndex: 1,
        lessonType: 'browser',
        config: {
            goal: 'new-tab',
            initialApps: ['browser'],
            instructions: 'Ανοίξτε μια νέα καρτέλα πατώντας το κουμπί "+".'
        },
        enabled: true,
        requiredLessonId: null
    },

    // Lesson 2: Address Bar Navigation
    {
        id: 'module5-lesson2',
        moduleId: 'module5',
        lessonKey: 'address-bar',
        titleKey: 'module5_lesson2_title',
        descriptionKey: 'module5_lesson2_desc',
        difficulty: 'beginner',
        orderIndex: 2,
        lessonType: 'browser',
        config: {
            goal: 'navigate',
            targetUrl: 'news.gr',
            initialApps: ['browser'],
            instructions: 'Πληκτρολογήστε "news.gr" στη γραμμή διευθύνσεων και πατήστε Enter.'
        },
        enabled: true,
        requiredLessonId: 'module5-lesson1'
    },

    // Lesson 3: Search Using Google
    {
        id: 'module5-lesson3',
        moduleId: 'module5',
        lessonKey: 'search-google',
        titleKey: 'module5_lesson3_title',
        descriptionKey: 'module5_lesson3_desc',
        difficulty: 'beginner',
        orderIndex: 3,
        lessonType: 'browser',
        config: {
            goal: 'search',
            initialApps: ['browser'],
            instructions: 'Χρησιμοποιήστε τη μπάρα αναζήτησης του Google.'
        },
        enabled: true,
        requiredLessonId: 'module5-lesson2'
    },

    // Lesson 4: Tab Management (Switch & Close)
    {
        id: 'module5-lesson4',
        moduleId: 'module5',
        lessonKey: 'manage-tabs',
        titleKey: 'module5_lesson4_title',
        descriptionKey: 'module5_lesson4_desc',
        difficulty: 'intermediate',
        orderIndex: 4,
        lessonType: 'browser',
        config: {
            goal: 'switch-tab', // Simplified goal, simulation should track switching
            initialApps: ['browser'],
            initialTabs: ['home', 'news', 'search?q=tech'],
            instructions: 'Έχετε πολλές καρτέλες. Αλλάξτε σε μια άλλη καρτέλα.'
        },
        enabled: true,
        requiredLessonId: 'module5-lesson3'
    },

    // Lesson 5: Close Tab
    {
        id: 'module5-lesson5',
        moduleId: 'module5',
        lessonKey: 'close-tab',
        titleKey: 'module5_lesson5_title',
        descriptionKey: 'module5_lesson5_desc',
        difficulty: 'intermediate',
        orderIndex: 5,
        lessonType: 'browser',
        config: {
            goal: 'close-tab',
            initialApps: ['browser'],
            initialTabs: ['home', 'news', 'weather'],
            instructions: 'Κλείστε μια καρτέλα πατώντας το X πάνω της.'
        },
        enabled: true,
        requiredLessonId: 'module5-lesson4'
    },

    // Lesson 6: Bookmarks
    {
        id: 'module5-lesson6',
        moduleId: 'module5',
        lessonKey: 'bookmarks',
        titleKey: 'module5_lesson6_title',
        descriptionKey: 'module5_lesson6_desc',
        difficulty: 'intermediate',
        orderIndex: 6,
        lessonType: 'browser',
        config: {
            goal: 'bookmark',
            targetSite: 'gov.gr',
            initialApps: ['browser'],
            instructions: 'Πηγαίνετε στη σελίδα "gov.gr" και προσθέστε τη στα αγαπημένα πατώντας το αστέρι.'
        },
        enabled: true,
        requiredLessonId: 'module5-lesson5'
    },

    // Lesson 7: Browser History
    {
        id: 'module5-lesson7',
        moduleId: 'module5',
        lessonKey: 'browser-history',
        titleKey: 'module5_lesson7_title',
        descriptionKey: 'module5_lesson7_desc',
        difficulty: 'intermediate',
        orderIndex: 7,
        lessonType: 'browser',
        config: {
            goal: 'navigate',
            targetUrl: 'history',
            initialApps: ['browser'],
            initialTabs: ['home', 'news', 'weather'],
            instructions: 'Ανοίξτε το Ιστορικό περιήγησης πατώντας το εικονίδιο του ρολογιού.'
        },
        enabled: true,
        requiredLessonId: 'module5-lesson6'
    },

    // Lesson 8: Download a File
    {
        id: 'module5-lesson8',
        moduleId: 'module5',
        lessonKey: 'download-file',
        titleKey: 'module5_lesson8_title',
        descriptionKey: 'module5_lesson8_desc',
        difficulty: 'intermediate',
        orderIndex: 8,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'download-file',
            initialApps: ['browser'],
            instructions: 'Κατεβάστε ένα αρχείο: Βρείτε το σύνδεσμο λήψης και πατήστε "Λήψη".'
        },
        enabled: true,
        requiredLessonId: 'module5-lesson7'
    },

    // Lesson 9: Zoom In/Out
    {
        id: 'module5-lesson9',
        moduleId: 'module5',
        lessonKey: 'zoom-page',
        titleKey: 'module5_lesson9_title',
        descriptionKey: 'module5_lesson9_desc',
        difficulty: 'beginner',
        orderIndex: 9,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'zoom-page',
            initialApps: ['browser'],
            instructions: 'Μεγεθύνετε τη σελίδα: Χρησιμοποιήστε Ctrl+ για μεγέθυνση ή Ctrl- για σμίκρυνση.'
        },
        enabled: true,
        requiredLessonId: 'module5-lesson8'
    },

    // Lesson 10: Find on Page
    {
        id: 'module5-lesson10',
        moduleId: 'module5',
        lessonKey: 'find-on-page',
        titleKey: 'module5_lesson10_title',
        descriptionKey: 'module5_lesson10_desc',
        difficulty: 'intermediate',
        orderIndex: 10,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'find-on-page',
            initialApps: ['browser'],
            instructions: 'Αναζήτηση στη σελίδα: Πατήστε Ctrl+F για να ανοίξετε τη γραμμή αναζήτησης.'
        },
        enabled: true,
        requiredLessonId: 'module5-lesson9'
    }
];
