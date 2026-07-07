<script lang="ts">
	import type { Lesson } from '$lib/db/schema';
	import type { Component } from 'svelte';

	// Lesson component imports
	interface Props {
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}

	let { lesson, onComplete, onBack }: Props = $props();

	// Map lessonType to dynamic import
	const lessonComponents: Record<string, (lesson: Lesson) => Promise<{ default: Component<any> }>> =
		{
			hover: () => import('./interactive/HoverLesson.svelte'),
			click: () => import('./interactive/ClickLesson.svelte'),
			'double-click': () => import('./interactive/DoubleClickLesson.svelte'),
			drag: () => import('./interactive/DragLesson.svelte'),
			'right-click': () => import('./interactive/RightClickLesson.svelte'),
			scroll: () => import('./interactive/ScrollLesson.svelte'),
			typing: () => import('./interactive/TypingLesson.svelte'),
			'keyboard-action': (lesson: any) => {
				const config = lesson.config as any;
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

	const componentPromise = $derived((lessonComponents[lesson.lessonType] as any)?.(lesson));
</script>

{#if componentPromise}
	{#await componentPromise}
		<div class="flex h-full items-center justify-center">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
			></div>
		</div>
	{:then module}
		<module.default {lesson} {onComplete} {onBack} />
	{:catch error}
		<div class="error-container">
			<h2>Error Loading Lesson</h2>
			<p>Failed to load the lesson component.</p>
			<p class="text-sm text-red-300">{error.message}</p>
			<button onclick={onBack}>Go Back</button>
		</div>
	{/await}
{:else}
	<div class="error-container">
		<h2>Lesson Type Not Implemented</h2>
		<p>The lesson type "{lesson.lessonType}" has not been implemented yet.</p>
		<p>Please contact support or try another lesson.</p>
		<button onclick={onBack}>Go Back</button>
	</div>
{/if}

<style>
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		padding: 2rem;
		text-align: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 12px;
		color: white;
	}

	.error-container h2 {
		margin-bottom: 1rem;
		font-size: 2rem;
	}

	.error-container p {
		margin-bottom: 0.5rem;
		opacity: 0.9;
	}

	.error-container button {
		margin-top: 1.5rem;
		padding: 0.75rem 2rem;
		background: white;
		color: #667eea;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.error-container button:hover {
		transform: scale(1.05);
	}
</style>
