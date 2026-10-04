import type { GuideDefinition } from './types';

/** «Περιήγηση στο Διαδίκτυο»: a walk around the browser, one step per control. */
export const module5Guide: GuideDefinition = {
	id: 'module5',
	moduleId: 'module5',
	sim: 'browser',
	// Two tabs, so «switch tab» and «close tab» have something to show; the
	// showcase puts the download, zoom and find controls on screen for their steps.
	simConfig: { initialTabs: ['home', 'news.gr'], guideShowcase: true },
	steps: [
		{ id: 'tabs', target: 'tabs', lessonIds: ['module5-lesson4'] },
		{ id: 'new-tab', target: 'new-tab', lessonIds: ['module5-lesson1'] },
		{ id: 'close-tab', target: 'close-tab', lessonIds: ['module5-lesson5'] },
		{ id: 'nav-buttons', target: 'nav-buttons', lessonIds: ['module5-lesson12'] },
		{ id: 'address-bar', target: 'address-bar', lessonIds: ['module5-lesson2'] },
		{ id: 'search', target: 'search', lessonIds: ['module5-lesson3', 'module5-lesson11'] },
		{ id: 'bookmark', target: 'bookmark', lessonIds: ['module5-lesson6'] },
		{ id: 'history', target: 'history', lessonIds: ['module5-lesson7'] },
		{ id: 'page', target: 'download', lessonIds: ['module5-lesson8'] },
		{ id: 'zoom', target: 'zoom', lessonIds: ['module5-lesson9'] },
		{ id: 'find', target: 'find', lessonIds: ['module5-lesson10'] }
	]
};
