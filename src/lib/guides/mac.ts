import type { GuideDefinition } from './types';
import { macGuideConfig } from '$lib/db/seeds/mac-lessons';

/**
 * «Mac»: what differs from Windows. The learner opens Safari from the Dock,
 * closes its window, quits it from the menu bar, opens a Finder folder, finds
 * the Calculator with Spotlight and makes the text larger. Cmd instead of Ctrl
 * is told, not tried.
 */
export const macGuide: GuideDefinition = {
	id: 'mac',
	moduleId: 'mac',
	sim: 'mac',
	simConfig: macGuideConfig(),
	steps: [
		{ id: 'desktop', target: 'mac-desktop', lessonIds: ['mac-intro'] },
		{
			id: 'dock',
			target: 'dock-safari',
			lessonIds: ['mac-open-dock'],
			task: { type: 'mac-app-opened', where: { appId: 'safari' } }
		},
		{
			id: 'close',
			target: 'mac-close',
			lessonIds: ['mac-close-window'],
			task: { type: 'mac-window-closed', where: { appId: 'safari' } }
		},
		{ id: 'still-running', target: 'dock-safari', lessonIds: [] },
		{
			id: 'quit',
			target: 'mac-app-menu',
			lessonIds: ['mac-quit'],
			task: { type: 'mac-app-quit', where: { appId: 'safari' } }
		},
		{
			id: 'finder',
			target: 'dock-finder',
			lessonIds: ['mac-finder'],
			task: { type: 'mac-folder-opened', where: { folderId: 'documents' } }
		},
		{
			id: 'spotlight',
			target: 'mac-spotlight',
			lessonIds: ['mac-spotlight'],
			task: { type: 'mac-app-opened', where: { appId: 'calculator' } }
		},
		{
			id: 'text-size',
			target: 'dock-settings',
			lessonIds: ['mac-text-size', 'mac-pointer-size'],
			task: { type: 'mac-size-changed', where: { setting: 'text', size: 'large' } }
		},
		{ id: 'cmd', target: 'mac-desktop', lessonIds: ['mac-copy-paste'] }
	]
};
