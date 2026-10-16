import type { GuideDefinition } from './types';

/**
 * «Επεξεργαστής Κειμένου»: the learner opens Word from its desktop icon, types,
 * makes text bold, centres it, changes the size, adds a list and saves.
 * Italic and underline are told, not tried.
 */
export const wordGuide: GuideDefinition = {
	id: 'word',
	moduleId: 'word',
	sim: 'desktop',
	simConfig: { initialApps: [] },
	// Closed Word by mistake? The demo comes back with it open.
	resumeConfig: { initialApps: ['word'] },
	steps: [
		{
			id: 'open',
			target: 'icon-word',
			lessonIds: ['word-lesson1'],
			task: { type: 'open-app', where: { appId: 'word' } }
		},
		{
			id: 'type',
			target: 'word-editor',
			lessonIds: ['word-lesson2', 'word-lesson3'],
			task: { type: 'update-text' }
		},
		{
			id: 'bold',
			target: 'word-bold',
			lessonIds: ['word-lesson4'],
			task: { type: 'format-bold' }
		},
		{
			id: 'center',
			target: 'word-align-center',
			lessonIds: ['word-lesson5'],
			task: { type: 'format-align', where: { align: 'center' } }
		},
		{
			id: 'size',
			target: 'word-font-size',
			lessonIds: ['word-lesson6'],
			task: { type: 'format-font-size' }
		},
		{ id: 'styles', target: 'word-italic', lessonIds: ['word-lesson7', 'word-lesson8'] },
		{
			id: 'list',
			target: 'word-bullets',
			lessonIds: ['word-lesson9'],
			task: { type: 'insert-bullet-list' }
		},
		{
			id: 'save',
			target: 'word-save',
			lessonIds: ['word-lesson10'],
			task: { type: 'save-document' }
		}
	]
};
