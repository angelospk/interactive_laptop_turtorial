import type { NewLesson } from '../schema';

/**
 * Module 7: Spreadsheets (Excel)
 * Realistic scenario: building a monthly household expenses table
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
        lessonKey: 'navigate-cell',
        titleKey: 'module7_lesson2_title',
        descriptionKey: 'module7_lesson2_desc',
        difficulty: 'beginner',
        orderIndex: 2,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'update-cell',
            initialApps: ['excel'],
            initialData: {},
            targetCell: 'A1',
            targetValue: 'Έξοδα',
            instructions: 'Κάντε κλικ στο κελί A1 και γράψτε "Έξοδα". Μετά πατήστε Enter.'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson1'
    },
    {
        id: 'module7-lesson3',
        moduleId: 'module7',
        lessonKey: 'enter-headers',
        titleKey: 'module7_lesson3_title',
        descriptionKey: 'module7_lesson3_desc',
        difficulty: 'beginner',
        orderIndex: 3,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'update-cell',
            initialApps: ['excel'],
            initialData: {},
            targetCell: 'B1',
            targetValue: 'Ποσό (€)',
            instructions: 'Κάντε κλικ στο κελί A1 και γράψτε "Κατηγορία". Πατήστε Tab, μετά γράψτε "Ποσό (€)" στο B1 και πατήστε Enter.'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson2'
    },
    {
        id: 'module7-lesson4',
        moduleId: 'module7',
        lessonKey: 'enter-row2',
        titleKey: 'module7_lesson4_title',
        descriptionKey: 'module7_lesson4_desc',
        difficulty: 'beginner',
        orderIndex: 4,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'update-cell',
            initialApps: ['excel'],
            initialData: { 'A1': 'Κατηγορία', 'B1': 'Ποσό (€)' },
            targetCell: 'B2',
            targetValue: '450',
            instructions: 'Κάντε κλικ στο κελί A2, γράψτε "Ενοίκιο" και πατήστε Tab. Μετά γράψτε "450" στο B2 και πατήστε Enter.'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson3'
    },
    {
        id: 'module7-lesson5',
        moduleId: 'module7',
        lessonKey: 'enter-more-data',
        titleKey: 'module7_lesson5_title',
        descriptionKey: 'module7_lesson5_desc',
        difficulty: 'beginner',
        orderIndex: 5,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'update-cell',
            initialApps: ['excel'],
            initialData: {
                'A1': 'Κατηγορία', 'B1': 'Ποσό (€)',
                'A2': 'Ενοίκιο', 'B2': '450'
            },
            targetCell: 'B6',
            targetValue: '200',
            instructions: 'Συμπληρώστε τα υπόλοιπα έξοδα:\nA3: Ρεύμα, B3: 120\nA4: Νερό, B4: 45\nA5: Τηλέφωνο, B5: 35\nA6: Σούπερ Μάρκετ, B6: 200'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson4'
    },
    {
        id: 'module7-lesson6',
        moduleId: 'module7',
        lessonKey: 'format-headers',
        titleKey: 'module7_lesson6_title',
        descriptionKey: 'module7_lesson6_desc',
        difficulty: 'intermediate',
        orderIndex: 6,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'format-cell',
            initialApps: ['excel'],
            initialData: {
                'A1': 'Κατηγορία', 'B1': 'Ποσό (€)',
                'A2': 'Ενοίκιο', 'B2': '450',
                'A3': 'Ρεύμα', 'B3': '120',
                'A4': 'Νερό', 'B4': '45',
                'A5': 'Τηλέφωνο', 'B5': '35',
                'A6': 'Σούπερ Μάρκετ', 'B6': '200'
            },
            instructions: 'Επιλέξτε τα κελιά A1 και B1 (κλικ στο A1, μετά Shift+κλικ στο B1) και πατήστε το κουμπί "B" για να γίνουν έντονα.'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson5'
    },
    {
        id: 'module7-lesson7',
        moduleId: 'module7',
        lessonKey: 'sum-formula',
        titleKey: 'module7_lesson7_title',
        descriptionKey: 'module7_lesson7_desc',
        difficulty: 'intermediate',
        orderIndex: 7,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'enter-formula',
            targetFormula: 'SUM',
            targetCell: 'B7',
            initialApps: ['excel'],
            initialData: {
                'A1': 'Κατηγορία', 'B1': 'Ποσό (€)',
                'A2': 'Ενοίκιο', 'B2': '450',
                'A3': 'Ρεύμα', 'B3': '120',
                'A4': 'Νερό', 'B4': '45',
                'A5': 'Τηλέφωνο', 'B5': '35',
                'A6': 'Σούπερ Μάρκετ', 'B6': '200',
                'A7': 'Σύνολο'
            },
            instructions: 'Κάντε κλικ στο κελί B7. Γράψτε τον τύπο: =SUM(B2:B6) και πατήστε Enter για να υπολογίσετε το σύνολο των εξόδων.'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson6'
    },
    {
        id: 'module7-lesson8',
        moduleId: 'module7',
        lessonKey: 'average-formula',
        titleKey: 'module7_lesson8_title',
        descriptionKey: 'module7_lesson8_desc',
        difficulty: 'intermediate',
        orderIndex: 8,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'enter-formula',
            targetFormula: 'AVERAGE',
            targetCell: 'B8',
            initialApps: ['excel'],
            initialData: {
                'A1': 'Κατηγορία', 'B1': 'Ποσό (€)',
                'A2': 'Ενοίκιο', 'B2': '450',
                'A3': 'Ρεύμα', 'B3': '120',
                'A4': 'Νερό', 'B4': '45',
                'A5': 'Τηλέφωνο', 'B5': '35',
                'A6': 'Σούπερ Μάρκετ', 'B6': '200',
                'A7': 'Σύνολο', 'B7': '850',
                'A8': 'Μέσος Όρος'
            },
            instructions: 'Κάντε κλικ στο κελί B8. Γράψτε: =AVERAGE(B2:B6) και πατήστε Enter για να βρείτε τον μέσο μηνιαίο λογαριασμό.'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson7'
    },
    {
        id: 'module7-lesson9',
        moduleId: 'module7',
        lessonKey: 'max-formula',
        titleKey: 'module7_lesson9_title',
        descriptionKey: 'module7_lesson9_desc',
        difficulty: 'advanced',
        orderIndex: 9,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'enter-formula',
            targetFormula: 'MAX',
            targetCell: 'B9',
            initialApps: ['excel'],
            initialData: {
                'A1': 'Κατηγορία', 'B1': 'Ποσό (€)',
                'A2': 'Ενοίκιο', 'B2': '450',
                'A3': 'Ρεύμα', 'B3': '120',
                'A4': 'Νερό', 'B4': '45',
                'A5': 'Τηλέφωνο', 'B5': '35',
                'A6': 'Σούπερ Μάρκετ', 'B6': '200',
                'A7': 'Σύνολο', 'B7': '850',
                'A8': 'Μέσος Όρος', 'B8': '170',
                'A9': 'Μεγαλύτερο'
            },
            instructions: 'Κάντε κλικ στο κελί B9. Γράψτε: =MAX(B2:B6) και πατήστε Enter για να βρείτε τη μεγαλύτερη δαπάνη.'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson8'
    },
    {
        id: 'module7-lesson10',
        moduleId: 'module7',
        lessonKey: 'min-formula',
        titleKey: 'module7_lesson10_title',
        descriptionKey: 'module7_lesson10_desc',
        difficulty: 'advanced',
        orderIndex: 10,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'enter-formula',
            targetFormula: 'MIN',
            targetCell: 'B10',
            initialApps: ['excel'],
            initialData: {
                'A1': 'Κατηγορία', 'B1': 'Ποσό (€)',
                'A2': 'Ενοίκιο', 'B2': '450',
                'A3': 'Ρεύμα', 'B3': '120',
                'A4': 'Νερό', 'B4': '45',
                'A5': 'Τηλέφωνο', 'B5': '35',
                'A6': 'Σούπερ Μάρκετ', 'B6': '200',
                'A7': 'Σύνολο', 'B7': '850',
                'A8': 'Μέσος Όρος', 'B8': '170',
                'A9': 'Μεγαλύτερο', 'B9': '450',
                'A10': 'Μικρότερο'
            },
            instructions: 'Κάντε κλικ στο κελί B10. Γράψτε: =MIN(B2:B6) και πατήστε Enter για να βρείτε τη μικρότερη δαπάνη.'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson9'
    }
];
