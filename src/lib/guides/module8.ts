import type { GuideDefinition } from './types';

/**
 * «Ασφαλής Χρήση & e-Banking»: in the browser, the learner opens a secure site
 * and answers a cookie banner. Passwords, e-banking, 2FA and good habits are
 * told, not tried.
 */
export const module8Guide: GuideDefinition = {
	id: 'module8',
	moduleId: 'module8',
	sim: 'browser',
	simConfig: { initialTabs: ['home'] },
	steps: [
		{ id: 'padlock', target: 'address-bar', lessonIds: ['module8-lesson1'] },
		{
			id: 'secure-site',
			target: 'address-bar',
			lessonIds: ['module8-lesson2'],
			task: { type: 'navigate', where: { page: 'gov', isSecure: true } }
		},
		{
			id: 'cookies',
			target: 'address-bar',
			lessonIds: ['module8-lesson3', 'module8-lesson4'],
			task: { type: 'cookie-choice' }
		},
		{ id: 'passwords', target: 'page', lessonIds: ['module8-lesson5', 'module8-lesson8'] },
		{ id: 'bank', target: 'address-bar', lessonIds: ['module8-lesson6'] },
		{ id: 'two-factor', target: 'page', lessonIds: ['module8-lesson9'] },
		{ id: 'gov', target: 'address-bar', lessonIds: ['module8-lesson7'] },
		{ id: 'privacy', target: 'page', lessonIds: ['module8-lesson10'] },
		{ id: 'wifi', target: 'page', lessonIds: ['module8-lesson11'] },
		{ id: 'habits', target: 'page', lessonIds: ['module8-lesson12', 'module8-lesson13'] }
	]
};
