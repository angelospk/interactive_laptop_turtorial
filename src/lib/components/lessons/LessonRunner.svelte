<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
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
		onExit,
		onLessonChange,
		moduleId = null,
		nextModuleId = null,
		isLastModule = false
	} = $props<{
		lessons: Lesson[];
		progress: Record<string, any>;
		startIndex?: number;
		onExit?: () => void;
		/** Called with the new lessonKey when the runner moves within the module (for URL sync). */
		onLessonChange?: (lessonKey: string) => void;
		moduleId?: string | null;
		nextModuleId?: string | null;
		isLastModule?: boolean;
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
	let countdownInterval: any = null;

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
					clearInterval(countdownInterval);
					countdownInterval = null;
					countdownRemaining = null;
					// Call nextLesson after layout is updated to prevent reactive jump bugs
					setTimeout(() => nextLesson(), 10);
				}
			}
		}, 1000);
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
		const isSuccess = score >= 50;

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

			if (isFirstCompletion && isSuccess) {
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

	// Notify the host route so it can keep the URL in sync with the current lesson.
	function syncUrl() {
		const key = lessons[currentLessonIndex]?.lessonKey;
		if (key) onLessonChange?.(key);
	}

	function nextLesson() {
		cancelAutoAdvance();
		if (currentLessonIndex < lessons.length - 1) {
			currentLessonIndex++;
			syncUrl();
		} else if (nextModuleId) {
			goto(`/modules/${nextModuleId}`);
		} else if (onExit) {
			onExit();
		}
	}

	function prevLesson() {
		cancelAutoAdvance();
		if (currentLessonIndex > 0) {
			currentLessonIndex--;
			syncUrl();
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
	let dismissedFullscreenPrompt = $state(false);

	// True when the current lesson recommends fullscreen
	let fullscreenRecommended = $derived(
		!!(currentLesson?.config as any)?.fullscreen
	);

	// Reset dismissal when lesson changes so prompt re-appears on each new lesson
	$effect(() => {
		const _ = currentLesson?.id;
		dismissedFullscreenPrompt = false;
	});

	// Show banner when lesson recommends fullscreen and we're not already there
	let showFullscreenBanner = $derived(
		fullscreenRecommended && !isFullscreen && !dismissedFullscreenPrompt
	);

	function toggleFullscreen() {
		if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
			document.documentElement.requestFullscreen().catch((err) => {
				console.error('Fullscreen failed:', err);
			});
		} else if (document.fullscreenElement && document.exitFullscreen) {
			document.exitFullscreen();
		}
	}

	function enterFullscreenFromBanner() {
		dismissedFullscreenPrompt = true;
		toggleFullscreen();
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
		<Button onclick={nextLesson} disabled={currentLessonIndex === lessons.length - 1 && !nextModuleId && !onExit}>
			{currentLessonIndex === lessons.length - 1
				? (nextModuleId ? 'Επόμενη Ενότητα' : getMessage('nav_finish'))
				: getMessage('nav_next')}
		</Button>
	</div>

	{#if showFullscreenBanner}
		<div class="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 shadow-sm">
			<div class="flex items-center gap-2">
				<Maximize2 class="h-4 w-4 shrink-0 text-blue-600" />
				<span>Για καλύτερη εμπειρία, ανοίξτε σε <strong>πλήρη οθόνη</strong>.</span>
			</div>
			<div class="flex items-center gap-2 shrink-0">
				<Button size="sm" onclick={enterFullscreenFromBanner} class="bg-blue-600 text-white hover:bg-blue-700">
					Πλήρης οθόνη
				</Button>
				<button
					class="rounded p-1 text-blue-500 hover:text-blue-700"
					onclick={() => (dismissedFullscreenPrompt = true)}
					title="Κλείσιμο"
					aria-label="Κλείσιμο"
				>
					✕
				</button>
			</div>
		</div>
	{/if}

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
					{#key currentLesson.id}
						<LessonRenderer
							lesson={currentLesson}
							onComplete={handleLessonComplete}
							onBack={handleBack}
						/>
					{/key}
				{/if}
			</CardContent>
		</Card>
	</div>

	{#if mergedProgress[currentLesson.id]?.completed}
		{@const isSuccess = (mergedProgress[currentLesson.id]?.score ?? 100) >= 50}
		<div
			class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-300 pointer-events-auto"
		>
			<div class="w-full max-w-xl mx-auto rounded-xl shadow-2xl p-10 text-center {isSuccess ? 'bg-green-50 border-t-8 border-green-500' : 'bg-red-50 border-t-8 border-red-500'} animate-in zoom-in-95 duration-500">
				<div class="flex flex-col items-center gap-6">
					<div class="flex h-20 w-20 items-center justify-center rounded-full {isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
						{#if isSuccess}
							<span class="text-4xl">✓</span>
						{:else}
							<span class="text-4xl">✕</span>
						{/if}
					</div>
					
					<div>
						<h3 class="text-3xl font-extrabold {isSuccess ? 'text-green-800' : 'text-red-800'}">
							{isSuccess ? (getMessage('lesson_completed') || 'Μπράβο, τα κατάφερες!') : 'Το μάθημα δεν ολοκληρώθηκε επιτυχώς'}
						</h3>
						{#if mergedProgress[currentLesson.id]?.score !== undefined && mergedProgress[currentLesson.id]?.score !== 100}
							<p class="mt-2 text-lg {isSuccess ? 'text-green-700' : 'text-red-700'}">
								{getMessage('score')}: {mergedProgress[currentLesson.id].score}%
							</p>
						{/if}

						{#if isSuccess && countdownRemaining !== null}
							<div class="mt-4 flex flex-col items-center gap-2 text-lg font-medium text-green-800">
								<span class="animate-pulse">
									{getMessage('auto_advancing_in', { seconds: String(countdownRemaining) }) ||
										`Επόμενο σε ${countdownRemaining} δευτερόλεπτα...`}
								</span>
								<button class="underline hover:text-green-900 cursor-pointer" onclick={cancelAutoAdvance}>
									{getMessage('cancel') || 'Ακύρωση'}
								</button>
							</div>
						{/if}
					</div>

					<div class="mt-4 flex flex-wrap items-center justify-center gap-4 w-full">
						<Button
							variant="outline"
							size="lg"
							onclick={handleRetry}
							class="{isSuccess ? 'text-green-700 hover:bg-green-100 border-green-300' : 'text-red-700 hover:bg-red-100 border-red-300'} w-[200px] text-lg py-6"
						>
							{getMessage('try_again') || 'Δοκίμασε ξανά'}
						</Button>

						{#if isSuccess}
							{#if currentLessonIndex < lessons.length - 1}
								<Button
									size="lg"
									onclick={nextLesson}
									class="bg-green-600 text-white shadow-md hover:bg-green-700 w-[200px] text-lg py-6 flex-1 gap-2"
								>
									{getMessage('next_lesson') || 'Επόμενο Μάθημα'}
									<span class="text-2xl">→</span>
								</Button>
							{:else if nextModuleId}
								<Button
									size="lg"
									onclick={nextLesson}
									class="bg-blue-600 text-white shadow-md hover:bg-blue-700 w-[200px] text-lg py-6 flex-1 gap-2"
								>
									{'Επόμενη Ενότητα'}
									<span class="text-2xl">→</span>
								</Button>
							{:else}
								<Button
									size="lg"
									onclick={onExit}
									class="bg-blue-600 text-white shadow-md hover:bg-blue-700 w-[200px] text-lg py-6 flex-1 gap-2"
								>
									{getMessage('back_to_modules') || 'Πίσω στις Ενότητες'}
								</Button>
							{/if}
						{/if}
					</div>
				</div>
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
