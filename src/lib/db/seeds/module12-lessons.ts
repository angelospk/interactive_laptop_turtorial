import type { NewLesson } from '../schema';

/**
 * Module 12: Κρατικές Υπηρεσίες Online — Gov.gr [OPTIONAL/BETA]
 */
export const module12Lessons: NewLesson[] = [
	// «Οδηγός»: οι κρατικές υπηρεσίες βήμα-βήμα, πριν τις ασκήσεις.
	{
		id: 'module12-guide',
		moduleId: 'module12',
		lessonKey: 'guide',
		titleKey: 'module12_guide_title',
		descriptionKey: 'module12_guide_desc',
		difficulty: 'beginner',
		orderIndex: 0,
		lessonType: 'guide',
		config: { guideId: 'module12' },
		enabled: true,
		requiredLessonId: null
	},

	// Lesson 1: Intro — Using Google/AI to Find Gov.gr Services
	{
		id: 'module12-lesson1',
		moduleId: 'module12',
		lessonKey: 'gov-intro',
		titleKey: 'module12_lesson1_title',
		descriptionKey: 'module12_lesson1_desc',
		difficulty: 'beginner',
		orderIndex: 1,
		lessonType: 'quiz',
		config: {
			question: 'quiz_gov_intro_question',
			explanation: 'quiz_gov_intro_explanation',
			options: [
				{ id: 'a', text: 'quiz_gov_intro_opt_a', correct: false },
				{ id: 'b', text: 'quiz_gov_intro_opt_b', correct: true },
				{ id: 'c', text: 'quiz_gov_intro_opt_c', correct: false }
			]
		},
		enabled: true,
		requiredLessonId: null
	}
];
