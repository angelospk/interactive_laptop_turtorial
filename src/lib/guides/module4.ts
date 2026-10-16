import type { GuideDefinition } from './types';

/**
 * «Αρχεία & Φάκελοι»: the learner opens File Explorer from the taskbar, goes
 * into «Έγγραφα», makes a folder, selects a file and deletes one. Copy, cut,
 * rename and drag are told, not tried.
 */
export const module4Guide: GuideDefinition = {
	id: 'module4',
	moduleId: 'module4',
	sim: 'desktop',
	simConfig: { initialApps: [] },
	// Closed Explorer by mistake? The demo comes back with it open.
	resumeConfig: { initialApps: ['explorer'] },
	steps: [
		{
			id: 'open',
			// Explorer is the first pinned app, so it stays on a narrow taskbar.
			target: 'taskbar-explorer',
			lessonIds: ['module4-lesson1'],
			task: { type: 'open-app', where: { appId: 'explorer' } }
		},
		{
			id: 'folder',
			target: 'explorer-files',
			lessonIds: [],
			task: { type: 'navigate', where: { folderId: '1' } }
		},
		{
			id: 'new-folder',
			target: 'explorer-new-folder',
			lessonIds: ['module4-lesson2'],
			task: { type: 'create-folder' }
		},
		{
			id: 'select',
			target: 'explorer-files',
			lessonIds: ['module4-lesson3'],
			task: { type: 'select-file' }
		},
		{ id: 'copy', target: 'explorer-copy', lessonIds: ['module4-lesson4'] },
		{ id: 'cut', target: 'explorer-cut', lessonIds: ['module4-lesson5'] },
		{ id: 'rename', target: 'explorer-rename', lessonIds: ['module4-lesson6'] },
		{
			id: 'delete',
			target: 'explorer-delete',
			lessonIds: ['module4-lesson7'],
			task: { type: 'delete' }
		},
		{ id: 'drag', target: 'explorer-files', lessonIds: ['module4-lesson8'] }
	]
};
