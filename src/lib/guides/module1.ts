import type { GuideDefinition } from './types';

/** «Ποντίκι & Κλικ»: the learner tries each mouse skill once, in a small practice pad. */
export const module1Guide: GuideDefinition = {
	id: 'module1',
	moduleId: 'module1',
	sim: 'mouse-pad',
	simConfig: {},
	steps: [
		{ id: 'hover', target: 'hover', lessonIds: ['module1-lesson1'], task: { type: 'pad-hover' } },
		{ id: 'click', target: 'click', lessonIds: ['module1-lesson2'], task: { type: 'pad-click' } },
		{
			id: 'double-click',
			target: 'double-click',
			lessonIds: ['module1-lesson3'],
			task: { type: 'pad-double-click' }
		},
		{
			id: 'right-click',
			target: 'right-click',
			lessonIds: ['module1-lesson5'],
			task: { type: 'pad-right-click' }
		},
		{ id: 'drag', target: 'drag', lessonIds: ['module1-lesson4'], task: { type: 'pad-drag-drop' } }
	]
};
