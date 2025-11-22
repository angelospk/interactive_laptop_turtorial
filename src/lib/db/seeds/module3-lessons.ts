import type { NewLesson } from '../schema';

/**
 * Module 3: Windows 11 Environment & Window Management
 * 6 comprehensive lessons covering window management and quick settings
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
        lessonType: 'window-management',
        config: { action: 'open', taskbarApp: 'Σημειωματάριο' },
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
        lessonType: 'window-management',
        config: { action: 'minimize' },
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
        lessonType: 'window-management',
        config: { action: 'restore' },
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
        lessonType: 'window-management',
        config: { action: 'maximize' },
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
        lessonType: 'window-management',
        config: { action: 'close' },
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
        lessonType: 'window-management',
        config: { action: 'quick-settings', targetVolume: 50 },
        enabled: true,
        requiredLessonId: 'module3-lesson5'
    }
];
