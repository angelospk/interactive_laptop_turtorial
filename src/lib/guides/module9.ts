import type { GuideDefinition } from './types';

/**
 * «Προχωρημένες Λειτουργίες»: the learner opens Settings from the taskbar,
 * joins a WiFi network, pairs a Bluetooth device, and visits Display,
 * Accessibility and Sound. Printers, apps, installing and Task Manager are
 * told, not tried.
 */
export const module9Guide: GuideDefinition = {
	id: 'module9',
	moduleId: 'module9',
	sim: 'desktop',
	simConfig: { initialApps: [] },
	// Closed Settings by mistake? The demo comes back with it open.
	resumeConfig: { initialApps: ['settings'] },
	steps: [
		{
			id: 'open',
			target: 'taskbar-settings',
			lessonIds: [],
			task: { type: 'open-app', where: { appId: 'settings' } }
		},
		{
			id: 'wifi',
			target: 'settings-network',
			lessonIds: ['module9-lesson2'],
			task: { type: 'connect-wifi' }
		},
		{
			id: 'bluetooth',
			target: 'settings-bluetooth',
			lessonIds: ['module9-lesson6'],
			task: { type: 'connect-bluetooth' }
		},
		{ id: 'printer', target: 'settings-devices', lessonIds: ['module9-lesson3'] },
		{
			id: 'display',
			target: 'settings-display',
			lessonIds: ['module9-lesson7'],
			task: { type: 'open-display-settings' }
		},
		{
			id: 'accessibility',
			target: 'settings-accessibility',
			lessonIds: ['module9-lesson8', 'module9-lesson13'],
			task: { type: 'toggle-accessibility' }
		},
		{
			id: 'sound',
			target: 'settings-sound',
			lessonIds: ['module9-lesson9'],
			task: { type: 'open-sound-settings' }
		},
		{ id: 'apps', target: 'settings-apps', lessonIds: ['module9-lesson4', 'module9-lesson5'] },
		{
			id: 'install',
			target: 'settings-apps',
			lessonIds: ['module9-lesson1', 'module9-lesson10', 'module9-lesson11']
		},
		{ id: 'task-manager', target: 'taskbar', lessonIds: ['module9-lesson14'] }
	]
};
