import type { Component } from 'svelte';
import type { Lesson } from '$lib/db/schema';

/**
 * lessonType → component loader. Single source of truth, kept as a plain TS
 * module (not inside LessonRenderer.svelte) so seed contract tests can assert
 * that every seeded lessonType has a registered renderer.
 */
export const lessonTypeRegistry: Record<
	string,
	(lesson: Lesson) => Promise<{ default: Component<any> }>
> = {
	hover: () => import('./interactive/HoverLesson.svelte'),
	click: () => import('./interactive/ClickLesson.svelte'),
	'double-click': () => import('./interactive/DoubleClickLesson.svelte'),
	drag: () => import('./interactive/DragLesson.svelte'),
	'right-click': () => import('./interactive/RightClickLesson.svelte'),
	scroll: () => import('./interactive/ScrollLesson.svelte'),
	typing: () => import('./interactive/TypingLesson.svelte'),
	'keyboard-action': (lesson) => {
		const config = lesson.config as { action?: string } | null;
		if (config?.action === 'copy-paste' || config?.action === 'cut-paste') {
			return import('./interactive/CopyPasteLesson.svelte');
		}
		return import('./interactive/KeyboardActionLesson.svelte');
	},

	// Legacy implementations - kept for backward compatibility if needed,
	// but new lessons should use desktop-simulation where appropriate
	'window-management': () => import('./interactive/WindowManagementLesson.svelte'),
	'file-explorer': () => import('./interactive/FileExplorerLesson.svelte'),
	browser: () => import('./interactive/BrowserLesson.svelte'),

	// The new unified desktop simulation
	'desktop-simulation': () => import('./interactive/DesktopLesson.svelte'),

	// Mobile (Android/iPhone) tap-to-open-app simulation — ROADMAP Φάση 2
	'mobile-tap': () => import('./interactive/MobileTapLesson.svelte'),

	// New Quiz Type
	quiz: () => import('./interactive/QuizLesson.svelte'),
	reading: () => import('./interactive/ReadingLesson.svelte'),

	// "Απάτη ή Όχι;" scam-recognition exercise
	'scam-spotter': () => import('./interactive/ScamSpotterLesson.svelte'),

	'legacy-module-3': () => import('./legacy/LegacyModule3Lesson.svelte'),
	'legacy-module-4': () => import('./legacy/LegacyModule4Lesson.svelte')
};
