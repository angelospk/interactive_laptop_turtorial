import type { GuideDefinition } from './types';

/**
 * «Πληκτρολόγιο»: click into the box, type, press Enter — then the keys that
 * change what a letter looks like. Typing steps wait for the exact text; the
 * box empties on Enter, so each one starts clean.
 */
export const module2Guide: GuideDefinition = {
	id: 'module2',
	moduleId: 'module2',
	sim: 'keyboard-pad',
	simConfig: {},
	steps: [
		{ id: 'text-box', target: 'text-box', lessonIds: [], task: { type: 'pad-focus' } },
		{
			id: 'type',
			target: 'text-box',
			lessonIds: ['module2-lesson1'],
			task: { type: 'pad-typed', where: { text: 'γεια σας' } }
		},
		{ id: 'enter', target: 'enter-key', lessonIds: [], task: { type: 'pad-enter' } },
		{
			id: 'capitals',
			target: 'shift-key',
			lessonIds: ['module2-lesson2', 'module2-lesson3'],
			task: { type: 'pad-typed', where: { text: 'ΑΘΗΝΑ' } }
		},
		{
			id: 'backspace',
			target: 'backspace-key',
			lessonIds: ['module2-lesson5'],
			task: { type: 'pad-cleared' }
		},
		{
			id: 'accents',
			target: 'tonos-key',
			lessonIds: ['module2-lesson4'],
			task: { type: 'pad-typed', where: { text: 'παιδί' } }
		},
		{ id: 'language', target: 'language', lessonIds: ['module2-lesson6'] },
		{ id: 'at', target: 'at-key', lessonIds: ['module2-lesson7'] },
		{
			id: 'shortcuts',
			target: 'shortcuts',
			lessonIds: ['module2-lesson6b', 'module2-lesson6c', 'module2-lesson8']
		}
	]
};
