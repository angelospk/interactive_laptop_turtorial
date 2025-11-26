import type { NewLesson } from '../schema';

/**
 * Module 3: Windows 11 Environment & Window Management
 * Refactored to use desktop-simulation
 */
export const module3Lessons: NewLesson[] = [
    // Lesson 1: Opening Applications
    {
        id: 'module3-lesson1',
        moduleId: 'module3',
        lessonKey: 'open-application',
        titleKey: 'module3_lesson1_title',
        descriptionKey: 'module3_lesson1_desc',
        difficulty: 'beginner',
        orderIndex: 1,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'open-app',
            targetAppId: 'notepad',
            initialApps: []
        },
        enabled: true,
        requiredLessonId: null
    },

    // Lesson 2: Minimizing Windows
    {
        id: 'module3-lesson2',
        moduleId: 'module3',
        lessonKey: 'minimize-window',
        titleKey: 'module3_lesson2_title',
        descriptionKey: 'module3_lesson2_desc',
        difficulty: 'beginner',
        orderIndex: 2,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'minimize-app',
            targetAppId: 'notepad',
            initialApps: ['notepad']
        },
        enabled: true,
        requiredLessonId: 'module3-lesson1'
    },

    // Lesson 3: Restoring from Taskbar
    {
        id: 'module3-lesson3',
        moduleId: 'module3',
        lessonKey: 'restore-window',
        titleKey: 'module3_lesson3_title',
        descriptionKey: 'module3_lesson3_desc',
        difficulty: 'beginner',
        orderIndex: 3,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'restore-app',
            targetAppId: 'notepad',
            initialApps: [{ appId: 'notepad', minimized: true }]
        },
        enabled: true,
        requiredLessonId: 'module3-lesson2'
    },

    // Lesson 4: Maximizing Windows
    {
        id: 'module3-lesson4',
        moduleId: 'module3',
        lessonKey: 'maximize-window',
        titleKey: 'module3_lesson4_title',
        descriptionKey: 'module3_lesson4_desc',
        difficulty: 'intermediate',
        orderIndex: 4,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'maximize-app',
            targetAppId: 'notepad',
            initialApps: ['notepad']
        },
        enabled: true,
        requiredLessonId: 'module3-lesson3'
    },

    // Lesson 5: Closing Windows
    {
        id: 'module3-lesson5',
        moduleId: 'module3',
        lessonKey: 'close-window',
        titleKey: 'module3_lesson5_title',
        descriptionKey: 'module3_lesson5_desc',
        difficulty: 'beginner',
        orderIndex: 5,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'close-app',
            targetAppId: 'notepad',
            initialApps: ['notepad']
        },
        enabled: true,
        requiredLessonId: 'module3-lesson4'
    },

    // Lesson 6: Quick Settings
    {
        id: 'module3-lesson6',
        moduleId: 'module3',
        lessonKey: 'quick-settings',
        titleKey: 'module3_lesson6_title',
        descriptionKey: 'module3_lesson6_desc',
        difficulty: 'intermediate',
        orderIndex: 6,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'open-quick-settings',
            initialApps: []
        },
        enabled: true,
        requiredLessonId: 'module3-lesson5'
    },

    // Lesson 7: Start Menu
    {
        id: 'module3-lesson7',
        moduleId: 'module3',
        lessonKey: 'start-menu',
        titleKey: 'module3_lesson7_title',
        descriptionKey: 'module3_lesson7_desc',
        difficulty: 'beginner',
        orderIndex: 7,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'open-start-menu',
            initialApps: [],
            instructions: 'Κάντε κλικ στο κουμπί "Έναρξη" (το μπλε εικονίδιο των Windows) κάτω αριστερά για να ανοίξετε το μενού.'
        },
        enabled: true,
        requiredLessonId: 'module3-lesson6'
    },

    // Lesson 8: Task View
    {
        id: 'module3-lesson8',
        moduleId: 'module3',
        lessonKey: 'task-view',
        titleKey: 'module3_lesson8_title',
        descriptionKey: 'module3_lesson8_desc',
        difficulty: 'intermediate',
        orderIndex: 8,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'open-task-view',
            initialApps: ['notepad', 'browser'],
            instructions: 'Πατήστε το κουμπί "Προβολή Εργασιών" (δίπλα στην αναζήτηση) για να δείτε όλα τα ανοιχτά παράθυρα.'
        },
        enabled: true,
        requiredLessonId: 'module3-lesson7'
    }
];
