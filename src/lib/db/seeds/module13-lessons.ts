import type { NewLesson } from '../schema';

/**
 * Module 13: Βοηθοί Τεχνητής Νοημοσύνης — AI Assistants [BETA]
 */
export const module13Lessons: NewLesson[] = [
    // Lesson 1: What is an AI Assistant (Quiz)
    {
        id: 'module13-lesson1',
        moduleId: 'module13',
        lessonKey: 'what-is-ai',
        titleKey: 'module13_lesson1_title',
        descriptionKey: 'module13_lesson1_desc',
        difficulty: 'beginner',
        orderIndex: 1,
        lessonType: 'quiz',
        config: {
            question: 'quiz_what_is_ai_question',
            explanation: 'quiz_what_is_ai_explanation',
            options: [
                { id: 'a', text: 'quiz_what_is_ai_opt_a', correct: false },
                { id: 'b', text: 'quiz_what_is_ai_opt_b', correct: true },
                { id: 'c', text: 'quiz_what_is_ai_opt_c', correct: false }
            ]
        },
        enabled: true,
        requiredLessonId: null
    },

    // Lesson 2: How to Ask a Question (Simulation)
    {
        id: 'module13-lesson2',
        moduleId: 'module13',
        lessonKey: 'how-to-ask',
        titleKey: 'module13_lesson2_title',
        descriptionKey: 'module13_lesson2_desc',
        difficulty: 'beginner',
        orderIndex: 2,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'type-ai-question',
            initialApps: ['browser'],
            targetUrl: 'chatgpt.com',
            instructions: 'Ρωτήστε τον AI: Πληκτρολογήστε μια ερώτηση στο πλαίσιο κειμένου, π.χ. "Πώς μπορώ να ανανεώσω το ΑΜΚΑ μου;"'
        },
        enabled: true,
        requiredLessonId: 'module13-lesson1'
    },

    // Lesson 3: Voice Input (Quiz)
    {
        id: 'module13-lesson3',
        moduleId: 'module13',
        lessonKey: 'voice-input',
        titleKey: 'module13_lesson3_title',
        descriptionKey: 'module13_lesson3_desc',
        difficulty: 'beginner',
        orderIndex: 3,
        lessonType: 'quiz',
        config: {
            question: 'quiz_voice_input_question',
            explanation: 'quiz_voice_input_explanation',
            options: [
                { id: 'a', text: 'quiz_voice_input_opt_a', correct: false },
                { id: 'b', text: 'quiz_voice_input_opt_b', correct: true },
                { id: 'c', text: 'quiz_voice_input_opt_c', correct: false }
            ]
        },
        enabled: true,
        requiredLessonId: 'module13-lesson2'
    },

    // Lesson 4: AI vs Google — When to Use Each (Quiz)
    {
        id: 'module13-lesson4',
        moduleId: 'module13',
        lessonKey: 'ai-vs-google',
        titleKey: 'module13_lesson4_title',
        descriptionKey: 'module13_lesson4_desc',
        difficulty: 'intermediate',
        orderIndex: 4,
        lessonType: 'quiz',
        config: {
            question: 'quiz_ai_vs_google_question',
            explanation: 'quiz_ai_vs_google_explanation',
            options: [
                { id: 'a', text: 'quiz_ai_vs_google_opt_a', correct: false },
                { id: 'b', text: 'quiz_ai_vs_google_opt_b', correct: false },
                { id: 'c', text: 'quiz_ai_vs_google_opt_c', correct: true }
            ]
        },
        enabled: true,
        requiredLessonId: 'module13-lesson3'
    },

    // Lesson 5: AI Limitations — Trust and Errors (Quiz)
    {
        id: 'module13-lesson5',
        moduleId: 'module13',
        lessonKey: 'ai-limitations',
        titleKey: 'module13_lesson5_title',
        descriptionKey: 'module13_lesson5_desc',
        difficulty: 'intermediate',
        orderIndex: 5,
        lessonType: 'quiz',
        config: {
            question: 'quiz_ai_limitations_question',
            explanation: 'quiz_ai_limitations_explanation',
            options: [
                { id: 'a', text: 'quiz_ai_limitations_opt_a', correct: false },
                { id: 'b', text: 'quiz_ai_limitations_opt_b', correct: true },
                { id: 'c', text: 'quiz_ai_limitations_opt_c', correct: false }
            ]
        },
        enabled: true,
        requiredLessonId: 'module13-lesson4'
    }
];
