import type { NewLesson } from '../schema';

/**
 * Module 7: Spreadsheets (Excel)
 * Enhanced with Formatting and Functions
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
            initialData: { 'A1': 'Προϊόν', 'B1': 'Τιμή' },
            instructions: 'Γράψτε δεδομένα στα κελιά.'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson1'
    },
    {
        id: 'module7-lesson3',
        moduleId: 'module7',
        lessonKey: 'format-cell',
        titleKey: 'module7_lesson3_title',
        descriptionKey: 'module7_lesson3_desc',
        difficulty: 'intermediate',
        orderIndex: 3,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'format-cell', // App needs to emit this event
            initialApps: ['excel'],
            initialData: { 'A1': 'Τίτλος', 'A2': 'Δεδομένα' },
            instructions: 'Κάντε το κελί A1 έντονο (Bold) και στοιχίστε το στο κέντρο.'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson2'
    },
    {
        id: 'module7-lesson4',
        moduleId: 'module7',
        lessonKey: 'simple-formula',
        titleKey: 'module7_lesson4_title',
        descriptionKey: 'module7_lesson4_desc',
        difficulty: 'intermediate',
        orderIndex: 4,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'enter-formula',
            targetFormula: 'SUM',
            initialApps: ['excel'],
            initialData: { 'A1': 'Ενοίκιο', 'B1': '500', 'A2': 'Ρεύμα', 'B2': '100', 'A3': 'Σύνολο' },
            instructions: 'Υπολογίστε το σύνολο στο B3 χρησιμοποιώντας =SUM'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson3'
    },
    {
        id: 'module7-lesson5',
        moduleId: 'module7',
        lessonKey: 'average-formula',
        titleKey: 'module7_lesson5_title',
        descriptionKey: 'module7_lesson5_desc',
        difficulty: 'advanced',
        orderIndex: 5,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'enter-formula',
            targetFormula: 'AVERAGE',
            initialApps: ['excel'],
            initialData: { 'A1': 'Βαθμός 1', 'B1': '18', 'A2': 'Βαθμός 2', 'B2': '19', 'A3': 'Μέσος Όρος' },
            instructions: 'Βρείτε τον μέσο όρο στο B3 χρησιμοποιώντας =AVERAGE'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson4'
    }
];
