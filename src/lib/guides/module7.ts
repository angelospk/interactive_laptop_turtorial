import type { GuideDefinition } from './types';

/**
 * «Υπολογιστικά Φύλλα»: the learner opens Excel from its desktop icon, picks a
 * cell, types in it and makes it bold. Numbers and formulas are told, not tried.
 */
export const module7Guide: GuideDefinition = {
	id: 'module7',
	moduleId: 'module7',
	sim: 'desktop',
	simConfig: { initialApps: [] },
	// Closed Excel by mistake? The demo comes back with it open.
	resumeConfig: { initialApps: ['excel'] },
	steps: [
		{
			id: 'open',
			target: 'icon-excel',
			lessonIds: ['module7-lesson1'],
			task: { type: 'open-app', where: { appId: 'excel' } }
		},
		{ id: 'cells', target: 'excel-grid', lessonIds: [], task: { type: 'select-cell' } },
		{
			id: 'type',
			target: 'excel-grid',
			lessonIds: ['module7-lesson2', 'module7-lesson3'],
			task: { type: 'update-cell' }
		},
		{ id: 'numbers', target: 'excel-grid', lessonIds: ['module7-lesson4', 'module7-lesson5'] },
		{
			id: 'bold',
			target: 'excel-bold',
			lessonIds: ['module7-lesson6'],
			task: { type: 'format-cell' }
		},
		{ id: 'sum', target: 'excel-formula-bar', lessonIds: ['module7-lesson7'] },
		{
			id: 'functions',
			target: 'excel-functions',
			lessonIds: ['module7-lesson8', 'module7-lesson9', 'module7-lesson10']
		}
	]
};
