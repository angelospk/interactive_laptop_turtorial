import type { NewLesson } from '../schema';

/**
 * Module 7: Spreadsheets (Excel)
 */
export const module7Lessons: NewLesson[] = [
    {
        id: 'module7-lesson1',
        moduleId: 'module7',
        lessonKey: 'open-excel',
        titleKey: 'module7_lesson1_title',
        descriptionKey: 'module7_lesson1_desc',
        difficulty: 'beginner',
        orderIndex: 1,
        lessonType: 'desktop-simulation',
        config: { goal: 'open-app', targetAppId: 'excel' },
        enabled: true,
        requiredLessonId: null
    },
    {
        id: 'module7-lesson2',
        moduleId: 'module7',
        lessonKey: 'enter-data',
        titleKey: 'module7_lesson2_title',
        descriptionKey: 'module7_lesson2_desc',
        difficulty: 'beginner',
        orderIndex: 2,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'update-cell',
            initialApps: ['excel'],
            initialData: { 'A1': 'Έξοδα', 'B1': 'Ποσό' }
        },
        enabled: true,
        requiredLessonId: 'module7-lesson1'
    },
    {
        id: 'module7-lesson3',
        moduleId: 'module7',
        lessonKey: 'simple-formula',
        titleKey: 'module7_lesson3_title',
        descriptionKey: 'module7_lesson3_desc',
        difficulty: 'intermediate',
        orderIndex: 3,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'enter-formula',
            targetFormula: 'SUM',
            initialApps: ['excel'],
            initialData: { 'A1': 'Ενοίκιο', 'B1': '500', 'A2': 'Ρεύμα', 'B2': '100', 'A3': 'Σύνολο' }
        },
        enabled: true,
        requiredLessonId: 'module7-lesson2'
    }
];
