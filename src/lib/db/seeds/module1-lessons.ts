import type { NewLesson } from '../schema';

/**
 * Module 1: Mouse Training Lessons
 * 11 lessons covering basic to advanced mouse skills
 */
export const module1Lessons: NewLesson[] = [
    // Lesson 1: Hover Basic
    {
        id: 'module1-lesson1',
        moduleId: 'module1',
        lessonKey: 'hover-basic',
        titleKey: 'module1_lesson1_title',
        descriptionKey: 'module1_lesson1_desc',
        difficulty: 'beginner',
        orderIndex: 1,
        lessonType: 'hover',
        config: { targetCount: 5, timeLimit: 30 },
        enabled: true,
        requiredLessonId: null
    },

    // Lesson 2: Click Basic
    {
        id: 'module1-lesson2',
        moduleId: 'module1',
        lessonKey: 'click-basic',
        titleKey: 'module1_lesson2_title',
        descriptionKey: 'module1_lesson2_desc',
        difficulty: 'beginner',
        orderIndex: 2,
        lessonType: 'click',
        config: { targetCount: 10, timeLimit: 45, theme: 'balloons' },
        enabled: true,
        requiredLessonId: 'module1-lesson1'
    },

    // Lesson 3: Double Click
    {
        id: 'module1-lesson3',
        moduleId: 'module1',
        lessonKey: 'double-click',
        titleKey: 'module1_lesson3_title',
        descriptionKey: 'module1_lesson3_desc',
        difficulty: 'beginner',
        orderIndex: 3,
        lessonType: 'double-click',
        config: { targetCount: 8, timeLimit: 40 },
        enabled: true,
        requiredLessonId: 'module1-lesson2'
    },

    // Lesson 4: Drag Basic
    {
        id: 'module1-lesson4',
        moduleId: 'module1',
        lessonKey: 'drag-basic',
        titleKey: 'module1_lesson4_title',
        descriptionKey: 'module1_lesson4_desc',
        difficulty: 'beginner',
        orderIndex: 4,
        lessonType: 'drag',
        config: { itemCount: 5, dropZones: 3 },
        enabled: true,
        requiredLessonId: 'module1-lesson3'
    },

    // Lesson 5: Right Click
    {
        id: 'module1-lesson5',
        moduleId: 'module1',
        lessonKey: 'right-click',
        titleKey: 'module1_lesson5_title',
        descriptionKey: 'module1_lesson5_desc',
        difficulty: 'intermediate',
        orderIndex: 5,
        lessonType: 'right-click',
        config: { targetCount: 8, timeLimit: 40 },
        enabled: true,
        requiredLessonId: 'module1-lesson4'
    },

    // Lesson 6: Scroll
    {
        id: 'module1-lesson6',
        moduleId: 'module1',
        lessonKey: 'scroll',
        titleKey: 'module1_lesson6_title',
        descriptionKey: 'module1_lesson6_desc',
        difficulty: 'intermediate',
        orderIndex: 6,
        lessonType: 'scroll',
        config: { scrollDistance: 1000, timeLimit: 30 },
        enabled: true,
        requiredLessonId: 'module1-lesson5'
    },

    // Lesson 7: Precision Click
    {
        id: 'module1-lesson7',
        moduleId: 'module1',
        lessonKey: 'precision-click',
        titleKey: 'module1_lesson7_title',
        descriptionKey: 'module1_lesson7_desc',
        difficulty: 'intermediate',
        orderIndex: 7,
        lessonType: 'click',
        config: { targetCount: 15, timeLimit: 60, targetSize: 'small', theme: 'bugs' },
        enabled: true,
        requiredLessonId: 'module1-lesson6'
    },

    // Lesson 8: Speed Click
    {
        id: 'module1-lesson8',
        moduleId: 'module1',
        lessonKey: 'speed-click',
        titleKey: 'module1_lesson8_title',
        descriptionKey: 'module1_lesson8_desc',
        difficulty: 'advanced',
        orderIndex: 8,
        lessonType: 'click',
        config: { targetCount: 20, timeLimit: 30 },
        enabled: true,
        requiredLessonId: 'module1-lesson7'
    },

    // Lesson 9: Shape Trace
    {
        id: 'module1-lesson9',
        moduleId: 'module1',
        lessonKey: 'shape-trace',
        titleKey: 'module1_lesson9_title',
        descriptionKey: 'module1_lesson9_desc',
        difficulty: 'advanced',
        orderIndex: 9,
        lessonType: 'hover',
        config: { shape: 'circle', timeLimit: 45 },
        enabled: true,
        requiredLessonId: 'module1-lesson8'
    },

    // Lesson 10: Pattern Click
    {
        id: 'module1-lesson10',
        moduleId: 'module1',
        lessonKey: 'pattern-click',
        titleKey: 'module1_lesson10_title',
        descriptionKey: 'module1_lesson10_desc',
        difficulty: 'advanced',
        orderIndex: 10,
        lessonType: 'click',
        config: { pattern: 'sequence', targetCount: 12, timeLimit: 50 },
        enabled: true,
        requiredLessonId: 'module1-lesson9'
    },

    // Lesson 11: Multi-Select
    {
        id: 'module1-lesson11',
        moduleId: 'module1',
        lessonKey: 'multi-select',
        titleKey: 'module1_lesson11_title',
        descriptionKey: 'module1_lesson11_desc',
        difficulty: 'advanced',
        orderIndex: 11,
        lessonType: 'drag',
        config: { itemCount: 8, dropZones: 4, multiSelect: true },
        enabled: true,
        requiredLessonId: 'module1-lesson10'
    }
];
