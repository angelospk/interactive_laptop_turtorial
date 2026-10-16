import type { GuideDefinition } from './types';

/**
 * «Κρατικές Υπηρεσίες Online»: in the browser, the learner opens gov.gr and
 * fills in a practice «Υπεύθυνη Δήλωση». Finding a service and getting help
 * are told, not tried.
 */
export const module12Guide: GuideDefinition = {
	id: 'module12',
	moduleId: 'module12',
	sim: 'browser',
	simConfig: { initialTabs: ['home'] },
	steps: [
		{ id: 'what', target: 'address-bar', lessonIds: [] },
		{
			id: 'open',
			target: 'address-bar',
			lessonIds: [],
			task: { type: 'navigate', where: { page: 'gov' } }
		},
		{ id: 'find', target: 'page', lessonIds: ['module12-lesson1'] },
		{ id: 'declaration', target: 'page', lessonIds: [], task: { type: 'gov-submit' } },
		{ id: 'help', target: 'page', lessonIds: [] }
	]
};
