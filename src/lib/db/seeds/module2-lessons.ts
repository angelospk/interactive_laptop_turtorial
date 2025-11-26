import type { NewLesson } from '../schema';

/**
 * Module 2: Keyboard Training Lessons
 * 11 lessons covering basic to advanced keyboard skills
 */
export const module2Lessons: NewLesson[] = [
    // Lesson 1: Basic Typing
    {
        id: 'module2-lesson1',
        moduleId: 'module2',
        lessonKey: 'basic-typing',
        titleKey: 'module2_lesson1_title',
        descriptionKey: 'module2_lesson1_desc',
        difficulty: 'beginner',
        orderIndex: 1,
        lessonType: 'typing',
        config: { text: 'simple', timeLimit: 60 },
        enabled: true,
        requiredLessonId: null
    },

    // Lesson 2: Capital Letters
    {
        id: 'module2-lesson2',
        moduleId: 'module2',
        lessonKey: 'capitals',
        titleKey: 'module2_lesson2_title',
        descriptionKey: 'module2_lesson2_desc',
        difficulty: 'beginner',
        orderIndex: 2,
        lessonType: 'typing',
        config: { text: 'capitals', timeLimit: 60 },
        enabled: true,
        requiredLessonId: 'module2-lesson1'
    },

    // Lesson 3: Shift Practice
    {
        id: 'module2-lesson3',
        moduleId: 'module2',
        lessonKey: 'shift-practice',
        titleKey: 'module2_lesson3_title',
        descriptionKey: 'module2_lesson3_desc',
        difficulty: 'beginner',
        orderIndex: 3,
        lessonType: 'typing',
        config: { text: 'mixed-case', timeLimit: 60 },
        enabled: true,
        requiredLessonId: 'module2-lesson2'
    },

    // Lesson 4: Greek Accents
    {
        id: 'module2-lesson4',
        moduleId: 'module2',
        lessonKey: 'accents',
        titleKey: 'module2_lesson4_title',
        descriptionKey: 'module2_lesson4_desc',
        difficulty: 'intermediate',
        orderIndex: 4,
        lessonType: 'typing',
        config: { text: 'accents', timeLimit: 60 },
        enabled: true,
        requiredLessonId: 'module2-lesson3'
    },

    // Lesson 5: Correction Practice
    {
        id: 'module2-lesson5',
        moduleId: 'module2',
        lessonKey: 'correction',
        titleKey: 'module2_lesson5_title',
        descriptionKey: 'module2_lesson5_desc',
        difficulty: 'intermediate',
        orderIndex: 5,
        lessonType: 'typing',
        config: { text: 'with-errors', timeLimit: 90 },
        enabled: true,
        requiredLessonId: 'module2-lesson4'
    },

    // Lesson 6: Language Switch
    {
        id: 'module2-lesson6',
        moduleId: 'module2',
        lessonKey: 'language-switch',
        titleKey: 'module2_lesson6_title',
        descriptionKey: 'module2_lesson6_desc',
        difficulty: 'intermediate',
        orderIndex: 6,
        lessonType: 'keyboard-action',
        config: { action: 'language-switch', repetitions: 5 },
        enabled: true,
        requiredLessonId: 'module2-lesson5'
    },

    // Lesson 7: Special Characters
    {
        id: 'module2-lesson7',
        moduleId: 'module2',
        lessonKey: 'special-chars',
        titleKey: 'module2_lesson7_title',
        descriptionKey: 'module2_lesson7_desc',
        difficulty: 'intermediate',
        orderIndex: 7,
        lessonType: 'typing',
        config: { text: 'special-chars', timeLimit: 60 },
        enabled: true,
        requiredLessonId: 'module2-lesson6'
    },

    // Lesson 8: Keyboard Shortcuts
    {
        id: 'module2-lesson8',
        moduleId: 'module2',
        lessonKey: 'shortcuts',
        titleKey: 'module2_lesson8_title',
        descriptionKey: 'module2_lesson8_desc',
        difficulty: 'advanced',
        orderIndex: 8,
        lessonType: 'keyboard-action',
        config: { shortcuts: ['copy', 'paste', 'cut', 'undo', 'redo'] },
        enabled: true,
        requiredLessonId: 'module2-lesson7'
    },

    // Lesson 9: Function Keys - REMOVED per user request
    // Lesson 9: Function Keys - Disabled
    {
        id: 'module2-lesson9',
        moduleId: 'module2',
        lessonKey: 'function-keys',
        titleKey: 'module2_lesson9_title',
        descriptionKey: 'module2_lesson9_desc',
        difficulty: 'advanced',
        orderIndex: 9,
        lessonType: 'keyboard-action',
        config: { keys: ['F1', 'F2', 'F5', 'F11', 'F12'] },
        enabled: false,
        requiredLessonId: 'module2-lesson8'
    },

    // Lesson 10: Speed Typing
    {
        id: 'module2-lesson10',
        moduleId: 'module2',
        lessonKey: 'speed-typing',
        titleKey: 'module2_lesson10_title',
        descriptionKey: 'module2_lesson10_desc',
        difficulty: 'advanced',
        orderIndex: 10,
        lessonType: 'typing',
        config: { text: 'paragraph', timeLimit: 120, minWPM: 20 },
        enabled: true,
        requiredLessonId: 'module2-lesson8'
    },

    // Lesson 11: Typing Test
    {
        id: 'module2-lesson11',
        moduleId: 'module2',
        lessonKey: 'typing-test',
        titleKey: 'module2_lesson11_title',
        descriptionKey: 'module2_lesson11_desc',
        difficulty: 'advanced',
        orderIndex: 11,
        lessonType: 'typing',
        config: { text: 'full-test', timeLimit: 180, minAccuracy: 90 },
        enabled: true,
        requiredLessonId: 'module2-lesson10'
    }
];
