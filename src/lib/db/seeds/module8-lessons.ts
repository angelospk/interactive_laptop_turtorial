import type { NewLesson } from '../schema';

/**
 * Module 8: Internet Safety & Banking
 */
export const module8Lessons: NewLesson[] = [
	{
		id: 'module8-lesson1',
		moduleId: 'module8',
		lessonKey: 'secure-site',
		titleKey: 'module8_lesson1_title',
		descriptionKey: 'module8_lesson1_desc',
		difficulty: 'beginner',
		orderIndex: 1,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'navigate-site',
			targetUrl: 'gov',
			initialApps: ['browser']
		},
		enabled: true,
		requiredLessonId: null
	},
	{
		id: 'module8-lesson2',
		moduleId: 'module8',
		lessonKey: 'cookies',
		titleKey: 'module8_lesson2_title',
		descriptionKey: 'module8_lesson2_desc',
		difficulty: 'beginner',
		orderIndex: 2,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'handle-cookies',
			targetChoice: 'accept', // Or reject, both work educationally, but let's say accept for the flow
			targetUrl: 'news',
			initialApps: ['browser']
		},
		enabled: true,
		requiredLessonId: 'module8-lesson1'
	},
	{
		id: 'module8-lesson3',
		moduleId: 'module8',
		lessonKey: 'strong-password',
		titleKey: 'module8_lesson3_title',
		descriptionKey: 'module8_lesson3_desc',
		difficulty: 'intermediate',
		orderIndex: 3,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'secure-login',
			targetUrl: 'bank',
			initialApps: ['browser']
		},
		enabled: true,
		requiredLessonId: 'module8-lesson2'
	},
	{
		id: 'module8-lesson4',
		moduleId: 'module8',
		lessonKey: 'bank-login',
		titleKey: 'module8_lesson4_title',
		descriptionKey: 'module8_lesson4_desc',
		difficulty: 'intermediate',
		orderIndex: 4,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'secure-login',
			targetUrl: 'bank',
			initialApps: ['browser']
		},
		enabled: true,
		requiredLessonId: 'module8-lesson3'
	},
	{
		id: 'module8-lesson5',
		moduleId: 'module8',
		lessonKey: 'bank-transfer',
		titleKey: 'module8_lesson5_title',
		descriptionKey: 'module8_lesson5_desc',
		difficulty: 'advanced',
		orderIndex: 5,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'make-transfer',
			targetUrl: 'bank',
			initialApps: ['browser']
		},
		enabled: true,
		requiredLessonId: 'module8-lesson4'
	},
	{
		id: 'module8-lesson6',
		moduleId: 'module8',
		lessonKey: 'gov-service',
		titleKey: 'module8_lesson6_title',
		descriptionKey: 'module8_lesson6_desc',
		difficulty: 'advanced',
		orderIndex: 6,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'gov-service',
			targetUrl: 'gov',
			initialApps: ['browser']
		},
		enabled: true,
		requiredLessonId: 'module8-lesson5'
	}
];
