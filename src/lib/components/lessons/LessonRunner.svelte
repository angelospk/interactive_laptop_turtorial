<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { Lesson } from '$lib/db/schema';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import LessonRenderer from './LessonRenderer.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { Maximize2, Minimize2 } from 'lucide-svelte';

	let {
		lessons,
		progress,
		startIndex = 0,
		onExit
	} = $props<{
		lessons: Lesson[];
		progress: Record<string, any>;
		startIndex?: number;
		onExit?: () => void;
	}>();

	let currentLessonIndex = $state(startIndex);
	let currentLesson = $derived(lessons[currentLessonIndex]);

	// Optimistic UI state
	let localUpdates = $state<Record<string, any>>({});

	// Merge prop progress with local updates
	let mergedProgress = $derived({ ...progress, ...localUpdates });

	// Determine if current lesson is locked
	// All lessons are now unlocked - users can navigate freely
	let isLocked = $derived(false);

	// Setup countdown state
	let countdownRemaining = $state<number | null>(null);
	let countdownInterval = $state<number | null>(null);

	$effect(() => {
		return () => {
			if (countdownInterval !== null) clearInterval(countdownInterval);
		};
	});

	function startAutoAdvance() {
		countdownRemaining = 5; // 5 seconds
		if (countdownInterval !== null) clearInterval(countdownInterval);

		countdownInterval = setInterval(() => {
			if (countdownRemaining !== null) {
				countdownRemaining -= 1;
				if (countdownRemaining <= 0) {
					clearInterval(countdownInterval as number);
					countdownRemaining = null;
					nextLesson(); // If it's the last lesson, nextLesson() calls onExit()
				}
			}
		}, 1000) as unknown as number;
	}

	function cancelAutoAdvance() {
		if (countdownInterval !== null) {
			clearInterval(countdownInterval);
			countdownInterval = null;
		}
		countdownRemaining = null;
	}

	async function handleLessonComplete(score: number) {
		const isFirstCompletion = !mergedProgress[currentLesson.id]?.completed;

		// Optimistically update UI immediately
		localUpdates[currentLesson.id] = {
			completed: true,
			score,
			stars: score <= 33 ? 1 : score <= 66 ? 2 : 3, // Estimate stars
			completedAt: new Date().toISOString()
		};

		// Save progress using the new API endpoint
		const res = await fetch('/api/lessons/complete', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				lessonId: currentLesson.id,
				score
			})
		});

		if (res.ok) {
			const data = await res.json();
			// Update with actual server response if needed, or just rely on invalidateAll
			if (data.progress) {
				localUpdates[currentLesson.id] = data.progress;
			}

			if (isFirstCompletion) {
				startAutoAdvance();
			}

			await invalidateAll(); // Refresh data to get updated progress
		} else {
			// Revert optimistic update on failure
			const { [currentLesson.id]: _, ...rest } = localUpdates;
			localUpdates = rest;
			console.error('Failed to save progress');
		}
	}

	async function handleRetry() {
		cancelAutoAdvance();
		// Clear local state immediately for instant UI feedback
		const { [currentLesson.id]: _, ...rest } = localUpdates;
		localUpdates = rest;

		// Delete progress from database
		try {
			const res = await fetch('/api/lessons/delete-progress', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					lessonId: currentLesson.id
				})
			});

			if (res.ok) {
				await invalidateAll(); // Refresh to get updated state
			}
		} catch (error) {
			console.error('Failed to delete progress:', error);
		}
	}

	function nextLesson() {
		cancelAutoAdvance();
		if (currentLessonIndex < lessons.length - 1) {
			currentLessonIndex++;
		} else if (onExit) {
			onExit();
		}
	}

	function prevLesson() {
		cancelAutoAdvance();
		if (currentLessonIndex > 0) {
			currentLessonIndex--;
		}
	}

	function handleBack() {
		cancelAutoAdvance();
		if (onExit) {
			onExit();
		}
	}

	// Helper to get message safely
	function getMessage(key: string, params?: Record<string, string>) {
		// @ts-ignore - Dynamic access to messages
		return m[key]?.(params) || key;
	}

	// Fullscreen state
	let isFullscreen = $state(false);
	let lessonContainer: HTMLElement;

	function toggleFullscreen() {
		if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
			document.documentElement.requestFullscreen().catch((err) => {
				console.error('Fullscreen failed:', err);
			});
		} else if (document.fullscreenElement && document.exitFullscreen) {
			document.exitFullscreen();
		}
	}

	// Listen for fullscreen changes
	$effect(() => {
		function handleFullscreenChange() {
			isFullscreen = !!document.fullscreenElement;
		}

		document.addEventListener('fullscreenchange', handleFullscreenChange);
		return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
	});

	// Auto-scroll to lesson content when lesson changes
	let lessonCard: HTMLElement;

	$effect(() => {
		// Track currentLessonIndex changes
		const _ = currentLessonIndex;

		// Small timeout to ensure DOM is updated
		setTimeout(() => {
			lessonCard?.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		}, 100);
	});
</script>

<div class="space-y-6" class:fullscreen-active={isFullscreen} bind:this={lessonContainer}>
	<!-- Portal target for dialogs/modals in fullscreen mode -->
	<div id="fullscreen-portal-target" class="fullscreen-portal-container"></div>

	<div class="flex items-center justify-between" class:hidden={isFullscreen}>
		<Button variant="outline" onclick={prevLesson} disabled={currentLessonIndex === 0}>
			{getMessage('nav_previous')}
		</Button>
		<div class="flex items-center gap-2">
			<span class="text-sm font-medium text-slate-500">
				{getMessage('lesson_x_of_y', {
					current: String(currentLessonIndex + 1),
					total: String(lessons.length)
				})}
			</span>
			<Button
				variant="ghost"
				size="icon"
				onclick={toggleFullscreen}
				title={isFullscreen ? getMessage('fullscreen_exit') : getMessage('fullscreen_enter')}
				class="h-8 w-8"
			>
				{#if isFullscreen}
					<Minimize2 class="h-4 w-4" />
				{:else}
					<Maximize2 class="h-4 w-4" />
				{/if}
			</Button>
		</div>
		<Button onclick={nextLesson} disabled={currentLessonIndex === lessons.length - 1 && !onExit}>
			{currentLessonIndex === lessons.length - 1
				? getMessage('nav_finish')
				: getMessage('nav_next')}
		</Button>
	</div>

	<div bind:this={lessonCard}>
		<Card>
			<CardContent>
				{#if isLocked}
					<div class="flex h-64 items-center justify-center rounded-md bg-slate-100 text-slate-500">
						<div class="text-center">
							<span class="text-4xl">🔒</span>
							<p class="mt-2">{getMessage('lesson_locked_message')}</p>
						</div>
					</div>
				{:else}
					<!-- Use the new LessonRenderer component -->
					<LessonRenderer
						lesson={currentLesson}
						onComplete={handleLessonComplete}
						onBack={handleBack}
					/>
				{/if}
			</CardContent>
		</Card>
	</div>

	{#if mergedProgress[currentLesson.id]?.completed}
		<div
			class="fixed right-0 bottom-0 left-0 z-50 flex animate-in items-center justify-between border-t border-green-200 bg-green-50 p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] duration-500 slide-in-from-bottom-full"
		>
			<div class="flex items-center gap-4">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600"
				>
					<span class="text-2xl">✓</span>
				</div>
				<div>
					<h3 class="text-lg font-bold text-green-800">{getMessage('lesson_completed')}</h3>
					{#if mergedProgress[currentLesson.id]?.score}
						<p class="text-sm text-green-700">
							{getMessage('score')}: {mergedProgress[currentLesson.id].score}
						</p>
					{/if}
					{#if countdownRemaining !== null}
						<div class="mt-1 flex items-center gap-2 text-sm font-medium text-green-800">
							<span class="animate-pulse">
								{getMessage('auto_advancing_in', { seconds: String(countdownRemaining) }) ||
									`Επόμενο σε ${countdownRemaining} δευτερόλεπτα...`}
							</span>
							<button class="underline hover:text-green-900" onclick={cancelAutoAdvance}>
								{getMessage('cancel') || 'Ακύρωση'}
							</button>
						</div>
					{/if}
				</div>
			</div>

			<div class="flex items-center gap-3">
				<Button
					variant="ghost"
					onclick={handleRetry}
					class="text-green-700 hover:bg-green-100 hover:text-green-900"
				>
					{getMessage('try_again') || 'Retry'}
				</Button>

				{#if currentLessonIndex < lessons.length - 1}
					<Button
						size="lg"
						onclick={nextLesson}
						class="gap-2 bg-green-600 text-white shadow-md hover:bg-green-700"
					>
						{getMessage('next_lesson') || 'Next Lesson'}
						<span class="text-xl">→</span>
					</Button>
				{:else}
					<Button
						size="lg"
						onclick={onExit}
						variant="outline"
						class="gap-2 border-green-200 bg-white text-green-700 hover:bg-green-50"
					>
						{getMessage('back_to_modules') || 'Back to Modules'}
					</Button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.fullscreen-active {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 50;
		height: 100vh;
		width: 100vw;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		overflow-y: auto;
		padding: 0;
		margin: 0;
	}

	.fullscreen-active :global(.lesson-template) {
		border-radius: 0;
		height: 100%;
	}

	/* Portal container for dialogs in fullscreen */
	.fullscreen-portal-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 9999;
	}

	.fullscreen-portal-container > :global(*) {
		pointer-events: auto;
	}
</style>
