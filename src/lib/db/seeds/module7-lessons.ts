import type { NewLesson } from '../schema';

/**
 * Module 7: Spreadsheets (Excel)
 * Enhanced with Formatting, Functions, and a Progressive Scenario (Household Budget)
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
        config: {
            goal: 'open-app',
            targetAppId: 'excel'
        },
        enabled: true,
        requiredLessonId: null
    },
    {
        id: 'module7-lesson2',
        moduleId: 'module7',
        lessonKey: 'create-headers',
        titleKey: 'module7_lesson2_title',
        descriptionKey: 'module7_lesson2_desc',
        difficulty: 'beginner',
        orderIndex: 2,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'check-value',
            targetCell: 'B1',
            targetValue: 'Ποσό',
            initialApps: ['excel'],
            initialData: {},
            instructions: 'Δημιουργήστε τις επικεφαλίδες για τον προϋπολογισμό. Γράψτε "Ποσό" στο κελί B1.'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson1'
    },
    {
        id: 'module7-lesson3',
        moduleId: 'module7',
        lessonKey: 'enter-expenses',
        titleKey: 'module7_lesson3_title',
        descriptionKey: 'module7_lesson3_desc',
        difficulty: 'beginner',
        orderIndex: 3,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'check-value',
            targetCell: 'B2',
            targetValue: '500',
            initialApps: ['excel'],
            initialData: { 'A1': 'Έξοδο', 'B1': 'Ποσό', 'A2': 'Ενοίκιο' },
            instructions: 'Συμπληρώστε τα έξοδα. Γράψτε 500 στο κελί B2 (δίπλα στο Ενοίκιο).'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson2'
    },
    {
        id: 'module7-lesson4',
        moduleId: 'module7',
        lessonKey: 'format-headers',
        titleKey: 'module7_lesson4_title',
        descriptionKey: 'module7_lesson4_desc',
        difficulty: 'beginner',
        orderIndex: 4,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'format-cell',
            targetCell: 'A1',
            requiredStyle: { bold: true, align: 'center' },
            initialApps: ['excel'],
            initialData: {
                'A1': 'Έξοδο', 'B1': 'Ποσό',
                'A2': 'Ενοίκιο', 'B2': '500',
                'A3': 'Ρεύμα', 'B3': '100',
                'A4': 'Σούπερ Μάρκετ', 'B4': '200'
            },
            instructions: 'Μορφοποιήστε την επικεφαλίδα "Έξοδο" (A1) σε Έντονα (Bold) και Κεντρική Στοίχιση.'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson3'
    },
    {
        id: 'module7-lesson5',
        moduleId: 'module7',
        lessonKey: 'simple-math',
        titleKey: 'module7_lesson5_title',
        descriptionKey: 'module7_lesson5_desc',
        difficulty: 'intermediate',
        orderIndex: 5,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'check-value',
            targetCell: 'B6',
            targetValue: '600',
            initialApps: ['excel'],
            initialData: {
                'A1': 'Έξοδο', 'B1': 'Ποσό',
                'A2': 'Ενοίκιο', 'B2': '500',
                'A3': 'Ρεύμα', 'B3': '100',
                'A4': 'Σούπερ Μάρκετ', 'B4': '200',
                'A5': 'Ίντερνετ', 'B5': '30',
                'A6': 'Πάγια (Ενοίκιο+Ρεύμα)'
            },
            instructions: 'Υπολογίστε το άθροισμα Ενοικίου και Ρεύματος στο B6 χρησιμοποιώντας απλή πρόσθεση (=B2+B3).'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson4'
    },
    {
        id: 'module7-lesson6',
        moduleId: 'module7',
        lessonKey: 'sum-function',
        titleKey: 'module7_lesson6_title',
        descriptionKey: 'module7_lesson6_desc',
        difficulty: 'intermediate',
        orderIndex: 6,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'check-value',
            targetCell: 'B7',
            targetValue: '830',
            initialApps: ['excel'],
            initialData: {
                'A1': 'Έξοδο', 'B1': 'Ποσό',
                'A2': 'Ενοίκιο', 'B2': '500',
                'A3': 'Ρεύμα', 'B3': '100',
                'A4': 'Σούπερ Μάρκετ', 'B4': '200',
                'A5': 'Ίντερνετ', 'B5': '30',
                'A6': 'Πάγια', 'B6': '600',
                'A7': 'ΣΥΝΟΛΟ'
            },
            instructions: 'Υπολογίστε το συνολικό κόστος όλων των εξόδων (B2 έως B5) στο B7 χρησιμοποιώντας τη συνάρτηση =SUM(B2:B5).'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson5'
    },
    {
        id: 'module7-lesson7',
        moduleId: 'module7',
        lessonKey: 'calculate-net',
        titleKey: 'module7_lesson7_title',
        descriptionKey: 'module7_lesson7_desc',
        difficulty: 'intermediate',
        orderIndex: 7,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'check-value',
            targetCell: 'B9',
            targetValue: '170',
            initialApps: ['excel'],
            initialData: {
                'A1': 'Έξοδο', 'B1': 'Ποσό',
                'A2': 'Ενοίκιο', 'B2': '500',
                'A3': 'Ρεύμα', 'B3': '100',
                'A4': 'Σούπερ Μάρκετ', 'B4': '200',
                'A5': 'Ίντερνετ', 'B5': '30',
                'A7': 'ΣΥΝΟΛΟ', 'B7': '830',
                'A8': 'ΕΙΣΟΔΗΜΑ', 'B8': '1000',
                'A9': 'ΥΠΟΛΟΙΠΟ'
            },
            instructions: 'Έχουμε εισόδημα 1000€. Υπολογίστε στο B9 πόσα χρήματα μένουν (Εισόδημα - Σύνολο Εξόδων) χρησιμοποιώντας αφαίρεση.'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson6'
    },
    {
        id: 'module7-lesson8',
        moduleId: 'module7',
        lessonKey: 'average-function',
        titleKey: 'module7_lesson8_title',
        descriptionKey: 'module7_lesson8_desc',
        difficulty: 'advanced',
        orderIndex: 8,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'check-value',
            targetCell: 'B10',
            targetValue: '207.5',
            initialApps: ['excel'],
            initialData: {
                'A1': 'Έξοδο', 'B1': 'Ποσό',
                'A2': 'Ενοίκιο', 'B2': '500',
                'A3': 'Ρεύμα', 'B3': '100',
                'A4': 'Σούπερ Μάρκετ', 'B4': '200',
                'A5': 'Ίντερνετ', 'B5': '30',
                'A7': 'ΣΥΝΟΛΟ', 'B7': '830',
                'A10': 'Μέσος Όρος'
            },
            instructions: 'Βρείτε το μέσο όρο των εξόδων (B2:B5) στο κελί B10 χρησιμοποιώντας τη συνάρτηση =AVERAGE(B2:B5).'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson7'
    },
    {
        id: 'module7-lesson9',
        moduleId: 'module7',
        lessonKey: 'adjust-budget',
        titleKey: 'module7_lesson9_title',
        descriptionKey: 'module7_lesson9_desc',
        difficulty: 'advanced',
        orderIndex: 9,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'check-value',
            targetCell: 'B7',
            targetValue: '780', // 500+100+150+30 = 780
            initialApps: ['excel'],
            initialData: {
                'A1': 'Έξοδο', 'B1': 'Ποσό',
                'A2': 'Ενοίκιο', 'B2': '500',
                'A3': 'Ρεύμα', 'B3': '100',
                'A4': 'Σούπερ Μάρκετ', 'B4': '200',
                'A5': 'Ίντερνετ', 'B5': '30',
                'A7': 'ΣΥΝΟΛΟ', 'B7': '=SUM(B2:B5)' // Formula is already there!
            },
            instructions: 'Μειώστε τα έξοδα για το Σούπερ Μάρκετ (B4) σε 150. Παρατηρήστε πώς το Σύνολο (B7) αλλάζει αυτόματα.'
        },
        enabled: true,
        requiredLessonId: 'module7-lesson8'
    }
];
