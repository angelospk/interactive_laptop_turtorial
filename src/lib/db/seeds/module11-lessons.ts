import type { NewLesson } from '../schema';

/**
 * Module 11: Βιντεοκλήση (Video Calls)
 */
export const module11Lessons: NewLesson[] = [
    // Lesson 1: What is a Video Call (Quiz)
    {
        id: 'module11-lesson1',
        moduleId: 'module11',
        lessonKey: 'what-is-videocall',
        titleKey: 'module11_lesson1_title',
        descriptionKey: 'module11_lesson1_desc',
        difficulty: 'beginner',
        orderIndex: 1,
        lessonType: 'quiz',
        config: {
            question: 'quiz_what_is_videocall_question',
            explanation: 'quiz_what_is_videocall_explanation',
            options: [
                { id: 'a', text: 'quiz_what_is_videocall_opt_a', correct: false },
                { id: 'b', text: 'quiz_what_is_videocall_opt_b', correct: true },
                { id: 'c', text: 'quiz_what_is_videocall_opt_c', correct: false }
            ]
        },
        enabled: true,
        requiredLessonId: null
    },

    // Lesson 2: Open Video Call App
    {
        id: 'module11-lesson2',
        moduleId: 'module11',
        lessonKey: 'open-viber',
        titleKey: 'module11_lesson2_title',
        descriptionKey: 'module11_lesson2_desc',
        difficulty: 'beginner',
        orderIndex: 2,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'open-app',
            targetAppId: 'viber',
            instructions: 'Ανοίξτε το Viber: Κάντε διπλό κλικ στο εικονίδιο Viber στην επιφάνεια εργασίας.'
        },
        enabled: true,
        requiredLessonId: 'module11-lesson1'
    },

    // Lesson 3: Start a Video Call
    {
        id: 'module11-lesson3',
        moduleId: 'module11',
        lessonKey: 'start-call',
        titleKey: 'module11_lesson3_title',
        descriptionKey: 'module11_lesson3_desc',
        difficulty: 'beginner',
        orderIndex: 3,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'start-videocall',
            initialApps: ['viber'],
            instructions: 'Ξεκινήστε βιντεοκλήση: Επιλέξτε μια επαφή και πατήστε το εικονίδιο βιντεοκλήσης (📹).'
        },
        enabled: true,
        requiredLessonId: 'module11-lesson2'
    },

    // Lesson 4: Mute/Unmute
    {
        id: 'module11-lesson4',
        moduleId: 'module11',
        lessonKey: 'mute-unmute',
        titleKey: 'module11_lesson4_title',
        descriptionKey: 'module11_lesson4_desc',
        difficulty: 'beginner',
        orderIndex: 4,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'mute-call',
            initialApps: ['viber'],
            instructions: 'Σίγαση μικροφώνου: Κατά τη διάρκεια κλήσης, πατήστε το εικονίδιο μικροφώνου 🎤 για να κάνετε σίγαση.'
        },
        enabled: true,
        requiredLessonId: 'module11-lesson3'
    },

    // Lesson 5: End Call
    {
        id: 'module11-lesson5',
        moduleId: 'module11',
        lessonKey: 'end-call',
        titleKey: 'module11_lesson5_title',
        descriptionKey: 'module11_lesson5_desc',
        difficulty: 'beginner',
        orderIndex: 5,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'end-call',
            initialApps: ['viber'],
            instructions: 'Τερματισμός κλήσης: Πατήστε το κόκκινο κουμπί 📵 για να τερματίσετε τη βιντεοκλήση.'
        },
        enabled: true,
        requiredLessonId: 'module11-lesson4'
    },

    // Lesson 6: Best Practices & Tips (Quiz)
    {
        id: 'module11-lesson6',
        moduleId: 'module11',
        lessonKey: 'videocall-tips',
        titleKey: 'module11_lesson6_title',
        descriptionKey: 'module11_lesson6_desc',
        difficulty: 'beginner',
        orderIndex: 6,
        lessonType: 'quiz',
        config: {
            question: 'quiz_videocall_tips_question',
            explanation: 'quiz_videocall_tips_explanation',
            options: [
                { id: 'a', text: 'quiz_videocall_tips_opt_a', correct: false },
                { id: 'b', text: 'quiz_videocall_tips_opt_b', correct: false },
                { id: 'c', text: 'quiz_videocall_tips_opt_c', correct: true }
            ]
        },
        enabled: true,
        requiredLessonId: 'module11-lesson5'
    }
];
