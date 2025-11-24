import type { NewLesson } from '../schema';

/**
 * Module 4: File Explorer & File Management
 * Refactored to use desktop-simulation
 */
export const module4Lessons: NewLesson[] = [
    // Lesson 1: Navigating Folders
    {
        id: 'module4-lesson1',
        moduleId: 'module4',
        lessonKey: 'navigate-folders',
        titleKey: 'module4_lesson1_title',
        descriptionKey: 'module4_lesson1_desc',
        difficulty: 'beginner',
        orderIndex: 1,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'open-app',
            targetAppId: 'explorer',
            initialApps: []
        },
        enabled: true,
        requiredLessonId: null
    },

    // Lesson 2: Creating a New Folder
    {
        id: 'module4-lesson2',
        moduleId: 'module4',
        lessonKey: 'create-folder',
        titleKey: 'module4_lesson2_title',
        descriptionKey: 'module4_lesson2_desc',
        difficulty: 'beginner',
        orderIndex: 2,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'create-folder',
            targetName: 'Εργασία',
            initialApps: ['explorer']
        },
        enabled: true,
        requiredLessonId: 'module4-lesson1'
    },

    // Lesson 3: Selecting Files (Just opening explorer simulates this for now in new architecture, or we can add specific select goal later)
    // Simplified to just open for now or kept as 'select' if supported
    {
        id: 'module4-lesson3',
        moduleId: 'module4',
        lessonKey: 'select-files',
        titleKey: 'module4_lesson3_title',
        descriptionKey: 'module4_lesson3_desc',
        difficulty: 'beginner',
        orderIndex: 3,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'select-file',
            initialApps: ['explorer']
        },
        enabled: true,
        requiredLessonId: 'module4-lesson2'
    },

    // Lesson 4: Copying Files
    {
        id: 'module4-lesson4',
        moduleId: 'module4',
        lessonKey: 'copy-files',
        titleKey: 'module4_lesson4_title',
        descriptionKey: 'module4_lesson4_desc',
        difficulty: 'intermediate',
        orderIndex: 4,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'copy-file',
            initialApps: ['explorer'],
            instructions: 'Επιλέξτε το αρχείο "Έγγραφο.txt", πατήστε "Αντιγραφή" (ή Ctrl+C), ανοίξτε τον φάκελο "Εργασία" και πατήστε "Επικόλληση" (ή Ctrl+V).',
            initialFiles: [
                { id: 'doc1', name: 'Έγγραφο.txt', type: 'text', parentId: 'root' },
                { id: 'work-folder', name: 'Εργασία', type: 'folder', parentId: 'root' }
            ]
        },
        enabled: true,
        requiredLessonId: 'module4-lesson3'
    },

    // Lesson 5: Cutting & Moving Files
    {
        id: 'module4-lesson5',
        moduleId: 'module4',
        lessonKey: 'cut-move-files',
        titleKey: 'module4_lesson5_title',
        descriptionKey: 'module4_lesson5_desc',
        difficulty: 'intermediate',
        orderIndex: 5,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'paste-cut-file',
            initialApps: ['explorer']
        },
        enabled: true,
        requiredLessonId: 'module4-lesson4'
    },

    // Lesson 6: Renaming Files and Folders
    {
        id: 'module4-lesson6',
        moduleId: 'module4',
        lessonKey: 'rename-items',
        titleKey: 'module4_lesson6_title',
        descriptionKey: 'module4_lesson6_desc',
        difficulty: 'intermediate',
        orderIndex: 6,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'rename-file',
            initialApps: ['explorer']
        },
        enabled: true,
        requiredLessonId: 'module4-lesson5'
    },

    // Lesson 7: Deleting Files
    {
        id: 'module4-lesson7',
        moduleId: 'module4',
        lessonKey: 'delete-files',
        titleKey: 'module4_lesson7_title',
        descriptionKey: 'module4_lesson7_desc',
        difficulty: 'intermediate',
        orderIndex: 7,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'delete-file',
            initialApps: ['explorer']
        },
        enabled: true,
        requiredLessonId: 'module4-lesson6'
    },

    // Lesson 8: Drag & Drop Files
    {
        id: 'module4-lesson8',
        moduleId: 'module4',
        lessonKey: 'drag-drop-files',
        titleKey: 'module4_lesson8_title',
        descriptionKey: 'module4_lesson8_desc',
        difficulty: 'advanced',
        orderIndex: 8,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'drag-drop-file',
            initialApps: ['explorer']
        },
        enabled: true,
        requiredLessonId: 'module4-lesson7'
    }
];
