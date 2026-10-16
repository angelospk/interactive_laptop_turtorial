import type { GuideDefinition } from './types';

/**
 * «Περιβάλλον Windows 11»: the desktop, the Start menu, and a window's three
 * buttons. Word starts open and not maximized, so «μεγιστοποίηση» has
 * something to do.
 */
export const module3Guide: GuideDefinition = {
	id: 'module3',
	moduleId: 'module3',
	sim: 'desktop',
	simConfig: { initialApps: [{ appId: 'word', maximized: false }] },
	steps: [
		{ id: 'desktop', target: 'desktop-icons', lessonIds: [] },
		{ id: 'taskbar', target: 'taskbar', lessonIds: [] },
		{
			id: 'start',
			target: 'start-button',
			lessonIds: ['module3-lesson7'],
			task: { type: 'open-start-menu' }
		},
		{
			id: 'minimize',
			target: 'window-minimize',
			lessonIds: ['module3-lesson2'],
			task: { type: 'minimize-app' }
		},
		{
			id: 'restore',
			// The whole bar: on a narrow screen Word's icon moves into the overflow menu.
			target: 'taskbar',
			lessonIds: ['module3-lesson3'],
			task: { type: 'restore-app' }
		},
		{
			id: 'maximize',
			target: 'window-maximize',
			lessonIds: ['module3-lesson4'],
			task: { type: 'maximize-app' }
		},
		{
			id: 'close',
			target: 'window-close',
			lessonIds: ['module3-lesson5'],
			task: { type: 'close-app' }
		},
		{
			id: 'quick-settings',
			target: 'quick-settings',
			lessonIds: ['module3-lesson6'],
			task: { type: 'open-quick-settings' }
		},
		{
			id: 'task-view',
			target: 'task-view',
			lessonIds: ['module3-lesson8'],
			task: { type: 'open-task-view' }
		}
	]
};
