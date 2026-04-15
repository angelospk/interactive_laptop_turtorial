import type { NewLesson } from '../schema';
import { autoOrder } from './utils';

/**
 * Word Processor module lessons.
 * Scenario: ο χρήστης γράφει μια αίτηση/επιστολή βήμα-βήμα.
 *
 * To add/remove/reorder: just edit the array — orderIndex and requiredLessonId are auto-assigned.
 */
const _wordLessons: Omit<NewLesson, 'orderIndex' | 'requiredLessonId'>[] = [
    {
        id: 'word-lesson1',
        moduleId: 'word',
        lessonKey: 'open-word',
        titleKey: 'word_lesson1_title',
        descriptionKey: 'word_lesson1_desc',
        difficulty: 'beginner',
        lessonType: 'desktop-simulation',
        config: {
            goal: 'open-app',
            targetAppId: 'word'
        },
        enabled: true
    },
    {
        id: 'word-lesson2',
        moduleId: 'word',
        lessonKey: 'type-title',
        titleKey: 'word_lesson2_title',
        descriptionKey: 'word_lesson2_desc',
        difficulty: 'beginner',
        lessonType: 'desktop-simulation',
        config: {
            goal: 'update-text',
            initialApps: ['word'],
            targetText: 'ΑΙΤΗΣΗ',
            instructions: 'Γράψτε "ΑΙΤΗΣΗ" στην αρχή του εγγράφου και πατήστε Enter.'
        },
        enabled: true
    },
    {
        id: 'word-lesson3',
        moduleId: 'word',
        lessonKey: 'type-body',
        titleKey: 'word_lesson3_title',
        descriptionKey: 'word_lesson3_desc',
        difficulty: 'beginner',
        lessonType: 'desktop-simulation',
        config: {
            goal: 'update-text',
            initialApps: ['word'],
            initialText: 'ΑΙΤΗΣΗ\n\n',
            instructions: 'Γράψτε το σώμα της αίτησης: "Αξιότιμε κύριε,"'
        },
        enabled: true
    },
    {
        id: 'word-lesson4',
        moduleId: 'word',
        lessonKey: 'bold-title',
        titleKey: 'word_lesson4_title',
        descriptionKey: 'word_lesson4_desc',
        difficulty: 'beginner',
        lessonType: 'desktop-simulation',
        config: {
            goal: 'format-text-bold',
            initialApps: ['word'],
            initialText: 'ΑΙΤΗΣΗ\n\nΑξιότιμε κύριε,',
            instructions: 'Επιλέξτε τη λέξη "ΑΙΤΗΣΗ" και πατήστε το κουμπί B (Bold) για να γίνει έντονη.'
        },
        enabled: true
    },
    {
        id: 'word-lesson5',
        moduleId: 'word',
        lessonKey: 'center-title',
        titleKey: 'word_lesson5_title',
        descriptionKey: 'word_lesson5_desc',
        difficulty: 'beginner',
        lessonType: 'desktop-simulation',
        config: {
            goal: 'format-text-align',
            targetAlign: 'center',
            initialApps: ['word'],
            initialText: 'ΑΙΤΗΣΗ\n\nΑξιότιμε κύριε,',
            instructions: 'Επιλέξτε τον τίτλο "ΑΙΤΗΣΗ" και πατήστε το κουμπί κεντραρίσματος (Center).'
        },
        enabled: true
    },
    {
        id: 'word-lesson6',
        moduleId: 'word',
        lessonKey: 'font-size',
        titleKey: 'word_lesson6_title',
        descriptionKey: 'word_lesson6_desc',
        difficulty: 'intermediate',
        lessonType: 'desktop-simulation',
        config: {
            goal: 'format-font-size',
            targetSize: '18',
            initialApps: ['word'],
            initialText: 'ΑΙΤΗΣΗ\n\nΑξιότιμε κύριε,',
            instructions: 'Επιλέξτε τον τίτλο και αλλάξτε το μέγεθος γραμματοσειράς σε 18.'
        },
        enabled: true
    },
    {
        id: 'word-lesson7',
        moduleId: 'word',
        lessonKey: 'italic-date',
        titleKey: 'word_lesson7_title',
        descriptionKey: 'word_lesson7_desc',
        difficulty: 'beginner',
        lessonType: 'desktop-simulation',
        config: {
            goal: 'format-text-italic',
            initialApps: ['word'],
            initialText: 'ΑΙΤΗΣΗ\n\nΑξιότιμε κύριε,\n\nΑθήνα, 15/04/2026',
            instructions: 'Επιλέξτε την ημερομηνία και πατήστε I (Italic) για πλάγια γράμματα.'
        },
        enabled: true
    },
    {
        id: 'word-lesson8',
        moduleId: 'word',
        lessonKey: 'underline-name',
        titleKey: 'word_lesson8_title',
        descriptionKey: 'word_lesson8_desc',
        difficulty: 'beginner',
        lessonType: 'desktop-simulation',
        config: {
            goal: 'format-text-underline',
            initialApps: ['word'],
            initialText: 'ΑΙΤΗΣΗ\n\nΑξιότιμε κύριε,\n\nΑθήνα, 15/04/2026\n\nΜε εκτίμηση,\nΙωάννης Παπαδόπουλος',
            instructions: 'Επιλέξτε το όνομα "Ιωάννης Παπαδόπουλος" και πατήστε U (Underline) για υπογράμμιση.'
        },
        enabled: true
    },
    {
        id: 'word-lesson9',
        moduleId: 'word',
        lessonKey: 'bullet-list',
        titleKey: 'word_lesson9_title',
        descriptionKey: 'word_lesson9_desc',
        difficulty: 'intermediate',
        lessonType: 'desktop-simulation',
        config: {
            goal: 'insert-bullet-list',
            initialApps: ['word'],
            initialText: 'ΑΙΤΗΣΗ\n\nΑξιότιμε κύριε,\n\nΠροσόντα μου:\n',
            instructions: 'Πατήστε το κουμπί λίστας με κουκίδες (bullet list) για να δημιουργήσετε μια λίστα.'
        },
        enabled: true
    },
    {
        id: 'word-lesson10',
        moduleId: 'word',
        lessonKey: 'save-document',
        titleKey: 'word_lesson10_title',
        descriptionKey: 'word_lesson10_desc',
        difficulty: 'beginner',
        lessonType: 'desktop-simulation',
        config: {
            goal: 'save-document',
            initialApps: ['word'],
            instructions: 'Πατήστε το κουμπί Αποθήκευση (💾) για να αποθηκεύσετε το έγγραφό σας.'
        },
        enabled: true
    }
];

export const wordLessons = autoOrder(_wordLessons);
