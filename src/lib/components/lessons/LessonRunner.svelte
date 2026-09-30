<script lang="ts">
	import { onMount, tick, untrack } from 'svelte';
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
		navigation = 0,
		onExit,
		onLessonChange,
		moduleId = null,
		nextModuleId = null,
		isLastModule = false
	} = $props<{
		lessons: Lesson[];
		progress: Record<string, any>;
		startIndex?: number;
		/** Counts real navigations; a change means "go to startIndex", even the same one. */
		navigation?: number;
		onExit?: () => void;
		/** Called with the new lessonKey when the runner moves within the module (for URL sync). */
		onLessonChange?: (lessonKey: string) => void;
		moduleId?: string | null;
		nextModuleId?: string | null;
		isLastModule?: boolean;
	}>();

	// `startIndex` is where the route params say we are; Next/Prev move from
	// there. Next rewrites the address bar with a *shallow* replaceState, which
	// leaves the params — and so startIndex — at the arrival lesson, and every
	// `invalidateAll()` re-emits that stale number. So the runner jumps to
	// startIndex only on a real navigation (`navigation` changed), or when the
	// number itself changes. Comparing numbers alone missed a real navigation
	// back to the arrival lesson: it re-emits the very same number.
	let currentLessonIndex = $state(startIndex);
	let syncedStartIndex = startIndex;
	let syncedNavigation = navigation;

	$effect(() => {
		const incoming = startIndex;
		const nav = navigation;
		if (incoming === syncedStartIndex && nav === syncedNavigation) return;
		syncedStartIndex = incoming;
		syncedNavigation = nav;
		// Arriving is not finishing: no result overlay comes along.
		untrack(() => {
			justCompletedLessonId = null;
		});
		currentLessonIndex = incoming;
	});

	let currentLesson = $derived(lessons[currentLessonIndex]);

	// Optimistic UI state
	let localUpdates = $state<Record<string, any>>({});

	// Merge prop progress with local updates
	let mergedProgress = $derived({ ...progress, ...localUpdates });

	// Determine if current lesson is locked
	// All lessons are now unlocked - users can navigate freely
	let isLocked = $derived(false);

	// The result overlay belongs to a completion that just happened here. Keying
	// it off stored progress meant walking into an already-finished lesson opened
	// a full-screen "Μπράβο" over a lesson the learner had not played yet.
	let justCompletedLessonId = $state<string | null>(null);
	let showResultOverlay = $derived(
		!!currentLesson &&
			justCompletedLessonId === currentLesson.id &&
			!!mergedProgress[currentLesson.id]?.completed
	);

	// Per lesson, bumped by every completion of it and by Retry on it: a save that
	// comes back after a newer completion of the same lesson, or after Retry, must
	// not touch the screen — it would restore cleared progress or start a hidden
	// countdown. Per lesson, because finishing another lesson is not a reason to
	// drop this one's save.
	const attempts = new Map<string, number>();
	const nextAttempt = (lessonId: string) => {
		const n = (attempts.get(lessonId) ?? 0) + 1;
		attempts.set(lessonId, n);
		return n;
	};
	// One queue per lesson: every request for a lesson waits for the one before
	// it, so saves and Retry's deletes reach the server in the order they were
	// made. Otherwise a late save could undo a delete, or a late delete wipe a
	// newer result.
	const serverQueues = new Map<string, Promise<unknown>>();
	function inOrder<T>(lessonId: string, request: () => Promise<T> | T): Promise<T> {
		const run = (serverQueues.get(lessonId) ?? Promise.resolve()).then(request);
		serverQueues.set(
			lessonId,
			run.catch(() => undefined)
		);
		return run;
	}

	/**
	 * `lessonId` is captured where the renderer was created, not read from the
	 * current state: a drill reports its result on a short delay, and if the
	 * learner moved on in the meantime the result belongs to the lesson they
	 * left — crediting the one now on screen would mark it complete unplayed and
	 * arm the auto-advance from there.
	 */
	// A result the server never received. Shown in plain words with a way to send
	// it again, instead of a "Μπράβο" that quietly disappears or a console line.
	let unsavedResult = $state<{ lessonId: string; score: number } | null>(null);
	let showUnsaved = $derived(!!unsavedResult && unsavedResult.lessonId === currentLesson?.id);

	function retrySave() {
		if (!unsavedResult) return;
		const { lessonId, score } = unsavedResult;
		unsavedResult = null;
		handleLessonComplete(score, lessonId);
	}

	async function handleLessonComplete(score: number, lessonId: string) {
		if (lessonId !== currentLesson?.id) return;
		const mine = nextAttempt(lessonId);
		if (unsavedResult?.lessonId === lessonId) unsavedResult = null;

		justCompletedLessonId = lessonId;

		// Optimistically update UI immediately
		localUpdates[lessonId] = {
			completed: true,
			score,
			stars: score <= 33 ? 1 : score <= 66 ? 2 : 3, // Estimate stars
			completedAt: new Date().toISOString()
		};

		// Save progress using the new API endpoint
		// Skipped if a Retry came first: this result no longer stands.
		let res: Response | null;
		let data: { progress?: Record<string, any> } | null = null;
		try {
			res = await inOrder(lessonId, () =>
				mine === attempts.get(lessonId)
					? fetch('/api/lessons/complete', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ lessonId, score })
						})
					: null
			);
			if (!res) return;
			// Read the body before the freshness check: Retry can land while it arrives.
			data = res.ok ? await res.json() : null;
		} catch {
			// Offline or the server unreachable: the same as a refused save.
			res = new Response(null, { status: 503 });
		}
		if (mine !== attempts.get(lessonId)) return;

		if (res.ok && data) {
			// Update with actual server response if needed, or just rely on invalidateAll
			if (data.progress) {
				localUpdates[lessonId] = data.progress;
			}

			// The request outlives the lesson: a learner who pressed Επόμενο while it
			// was in flight must not come back to an overlay armed
			// for a lesson they already left. The stored progress above still stands.
			if (lessonId !== currentLesson?.id) {
				if (justCompletedLessonId === lessonId) justCompletedLessonId = null;
				await invalidateAll();
				return;
			}

			await invalidateAll(); // Refresh data to get updated progress
		} else {
			// Revert optimistic update on failure
			const { [lessonId]: _, ...rest } = localUpdates;
			localUpdates = rest;
			if (justCompletedLessonId === lessonId) justCompletedLessonId = null;
			unsavedResult = { lessonId, score };
		}
	}

	// Part of the lesson's key: Retry must hand the learner a fresh drill, not the
	// finished one whose progress was just cleared.
	let retryEpoch = $state(0);

	async function handleRetry() {
		retryEpoch++;
		unsavedResult = null;
		justCompletedLessonId = null;
		const lessonId = currentLesson.id;
		nextAttempt(lessonId);
		// Clear local state immediately for instant UI feedback
		// A tombstone, not just a removal: until the delete reloads the server's
		// progress, that still says "completed", and a quick replay would look
		// like a repeat instead of the first completion it now is.
		localUpdates = { ...localUpdates, [lessonId]: { completed: false } };

		// Delete progress from database, in turn with this lesson's other requests.
		try {
			const res = await inOrder(lessonId, () =>
				fetch('/api/lessons/delete-progress', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ lessonId })
				})
			);
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
		justCompletedLessonId = null;
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
		justCompletedLessonId = null;
		if (currentLessonIndex > 0) {
			currentLessonIndex--;
			syncUrl();
		}
	}

	function handleBack() {
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

	// True when the current lesson recommends fullscreen
	let fullscreenRecommended = $derived(!!(currentLesson?.config as any)?.fullscreen);

	// Which lesson the learner dismissed the prompt for. Storing the id instead
	// of a boolean means the banner reappears on the next lesson without an
	// effect writing state — that extra render pass made it flicker and shift
	// the layout on every lesson change (bd-afz).
	let dismissedForLessonId = $state<string | null>(null);

	// Show banner when lesson recommends fullscreen and we're not already there
	let showFullscreenBanner = $derived(
		fullscreenRecommended && !isFullscreen && dismissedForLessonId !== currentLesson?.id
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
		dismissedForLessonId = currentLesson?.id ?? null;
		toggleFullscreen();
	}

	// Listen for fullscreen changes
	function handleFullscreenChange() {
		isFullscreen = !!document.fullscreenElement;
	}
	// Arriving already in fullscreen fires no change event.
	onMount(handleFullscreenChange);

	// Auto-scroll to lesson content when lesson changes
	let lessonCard: HTMLElement;

	// Deep links land mid-page already; scrolling on mount produced a visible
	// jump 100ms after paint. Only *changes* scroll, and each one cancels the
	// previous frame so rapid Next/Prev cannot stack smooth scrolls (bd-afz).
	let lastScrolledIndex = $state<number | null>(null);

	$effect(() => {
		const index = currentLessonIndex;
		if (lastScrolledIndex === null) {
			lastScrolledIndex = index;
			return;
		}
		if (lastScrolledIndex === index) return;
		lastScrolledIndex = index;

		const frame = requestAnimationFrame(() => {
			lessonCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
		return () => cancelAnimationFrame(frame);
	});

	// The result is a modal moment: the keyboard goes to its next step, and comes
	// back to where it was once the result is gone.
	let resultDialog = $state<HTMLElement | null>(null);
	$effect(() => {
		if (!showResultOverlay || !resultDialog) return;
		const before = document.activeElement as HTMLElement | null;
		const dialog = resultDialog;
		tick().then(() => {
			const primary =
				dialog.querySelector<HTMLElement>('[data-primary]') ??
				dialog.querySelector<HTMLElement>('button');
			primary?.focus();
		});
		return () => {
			if (before?.isConnected && !before.closest('[inert]')) before.focus();
		};
	});
</script>

<svelte:document onfullscreenchange={handleFullscreenChange} />

<div class="lesson-runner" class:fullscreen-active={isFullscreen} bind:this={lessonContainer}>
	<!-- Portal target for dialogs/modals in fullscreen mode -->
	<div id="fullscreen-portal-target" class="fullscreen-portal-container"></div>

	<!--
		The whole row stays in fullscreen: hiding it left the learner with no visible
		way out, and hiding Previous/Next left them with no familiar way on.
	-->
	<nav
		class="lesson-nav"
		inert={showResultOverlay}
		aria-label={getMessage('lesson_nav_aria') || 'Πλοήγηση μαθήματος'}
	>
		<Button
			variant="outline"
			onclick={prevLesson}
			disabled={currentLessonIndex === 0}
			class="min-h-12 px-5 text-base"
		>
			{getMessage('nav_previous')}
		</Button>
		<div class="flex items-center gap-2">
			<span class="text-base font-semibold text-slate-600" class:fullscreen-counter={isFullscreen}>
				{getMessage('lesson_x_of_y', {
					current: String(currentLessonIndex + 1),
					total: String(lessons.length)
				})}
			</span>
			<Button
				variant={isFullscreen ? 'secondary' : 'ghost'}
				onclick={toggleFullscreen}
				aria-label={isFullscreen ? getMessage('fullscreen_exit') : getMessage('fullscreen_enter')}
				class="min-h-12 min-w-12 gap-2 px-3"
			>
				{#if isFullscreen}
					<Minimize2 class="h-5 w-5" />
					<span class="text-base">{getMessage('fullscreen_exit')}</span>
				{:else}
					<Maximize2 class="h-5 w-5" />
				{/if}
			</Button>
		</div>
		<Button
			onclick={nextLesson}
			disabled={currentLessonIndex === lessons.length - 1 && !nextModuleId && !onExit}
			class="min-h-12 px-5 text-base"
		>
			{currentLessonIndex === lessons.length - 1
				? nextModuleId
					? 'Επόμενη Ενότητα'
					: getMessage('nav_finish')
				: getMessage('nav_next')}
		</Button>
	</nav>

	<!-- One row for notices, however many are up: a second notice in its own row
	     would push the lesson card past the bottom of the screen. -->
	<div class="lesson-notices">
		{#if showFullscreenBanner}
			<div
				class="fullscreen-banner flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 shadow-sm"
			>
				<div class="flex items-center gap-2">
					<Maximize2 class="h-4 w-4 shrink-0 text-blue-600" />
					<span>Για καλύτερη εμπειρία, ανοίξτε σε <strong>πλήρη οθόνη</strong>.</span>
				</div>
				<div class="flex shrink-0 items-center gap-2">
					<Button
						onclick={enterFullscreenFromBanner}
						class="min-h-11 bg-blue-600 px-4 text-base text-white hover:bg-blue-700"
					>
						Πλήρης οθόνη
					</Button>
					<button
						class="min-h-11 rounded-lg px-3 text-base font-medium text-blue-700 underline hover:text-blue-900 focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:outline-none"
						onclick={() => (dismissedForLessonId = currentLesson?.id ?? null)}
					>
						Όχι τώρα
					</button>
				</div>
			</div>
		{/if}

		{#if showUnsaved}
			<div
				role="alert"
				class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-base text-amber-900"
			>
				<span
					>Το αποτέλεσμα δεν αποθηκεύτηκε. Ελέγξτε τη σύνδεση στο ίντερνετ και πατήστε ξανά.</span
				>
				<Button onclick={retrySave} class="min-h-12 px-5 text-base">Αποθήκευση ξανά</Button>
			</div>
		{/if}
	</div>

	<div class="lesson-card" inert={showResultOverlay} bind:this={lessonCard}>
		<Card class="flex h-full min-h-0 flex-col overflow-hidden py-0">
			<!-- Scrolls when a lesson is taller than the screen (a short laptop, or the
			     browser zoomed in). Lessons built on LessonTemplate scroll inside and
			     never trigger it; a quiz, sized to its content, used to be cut off. -->
			<CardContent class="min-h-0 flex-1 overflow-y-auto px-0 py-0">
				{#if isLocked}
					<div class="flex h-64 items-center justify-center rounded-md bg-slate-100 text-slate-500">
						<div class="text-center">
							<span class="text-4xl">🔒</span>
							<p class="mt-2">{getMessage('lesson_locked_message')}</p>
						</div>
					</div>
				{:else}
					<!-- Use the new LessonRenderer component -->
					{#key `${currentLesson.id}:${retryEpoch}`}
						{@const renderedLessonId = currentLesson.id}
						<LessonRenderer
							lesson={currentLesson}
							onComplete={(score: number) => handleLessonComplete(score, renderedLessonId)}
							onBack={handleBack}
						/>
					{/key}
				{/if}
			</CardContent>
		</Card>
	</div>

	{#if showResultOverlay}
		{@const isSuccess = (mergedProgress[currentLesson.id]?.score ?? 100) >= 50}
		<div
			class="pointer-events-auto fixed inset-0 z-[100] flex animate-in items-center justify-center bg-black/40 p-4 backdrop-blur-[2px] duration-300 fade-in"
		>
			<div
				bind:this={resultDialog}
				role="dialog"
				aria-modal="true"
				aria-labelledby="lesson-result-title"
				class="mx-auto max-h-full w-full max-w-xl overflow-y-auto rounded-xl p-6 text-center shadow-2xl sm:p-10 {isSuccess
					? 'border-t-8 border-green-500 bg-green-50'
					: 'border-t-8 border-red-500 bg-red-50'} animate-in duration-500 zoom-in-95"
			>
				<div class="flex flex-col items-center gap-6">
					<div
						class="flex h-20 w-20 items-center justify-center rounded-full {isSuccess
							? 'bg-green-100 text-green-600'
							: 'bg-red-100 text-red-600'}"
					>
						{#if isSuccess}
							<span class="text-4xl">✓</span>
						{:else}
							<span class="text-4xl">✕</span>
						{/if}
					</div>

					<div>
						<h3
							id="lesson-result-title"
							class="text-3xl font-extrabold {isSuccess ? 'text-green-800' : 'text-red-800'}"
						>
							{isSuccess
								? getMessage('lesson_completed') || 'Μπράβο, τα κατάφερες!'
								: 'Το μάθημα δεν ολοκληρώθηκε επιτυχώς'}
						</h3>
						{#if mergedProgress[currentLesson.id]?.score !== undefined && mergedProgress[currentLesson.id]?.score !== 100}
							<p class="mt-2 text-lg {isSuccess ? 'text-green-700' : 'text-red-700'}">
								{getMessage('score')}: {mergedProgress[currentLesson.id].score}%
							</p>
						{/if}
					</div>

					<div class="mt-4 flex w-full flex-wrap items-center justify-center gap-4">
						<Button
							variant="outline"
							size="lg"
							onclick={handleRetry}
							class="{isSuccess
								? 'border-green-300 text-green-700 hover:bg-green-100'
								: 'border-red-300 text-red-700 hover:bg-red-100'} w-[200px] py-6 text-lg"
						>
							{getMessage('try_again') || 'Δοκίμασε ξανά'}
						</Button>

						{#if isSuccess}
							{#if currentLessonIndex < lessons.length - 1}
								<Button
									size="lg"
									data-primary
									onclick={nextLesson}
									class="w-[200px] flex-1 gap-2 bg-green-600 py-6 text-lg text-white shadow-md hover:bg-green-700"
								>
									{getMessage('next_lesson') || 'Επόμενο Μάθημα'}
									<span class="text-2xl">→</span>
								</Button>
							{:else if nextModuleId}
								<Button
									size="lg"
									data-primary
									onclick={nextLesson}
									class="w-[200px] flex-1 gap-2 bg-blue-600 py-6 text-lg text-white shadow-md hover:bg-blue-700"
								>
									{'Επόμενη Ενότητα'}
									<span class="text-2xl">→</span>
								</Button>
							{:else}
								<Button
									size="lg"
									data-primary
									onclick={onExit}
									class="w-[200px] flex-1 gap-2 bg-blue-600 py-6 text-lg text-white shadow-md hover:bg-blue-700"
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
	/* Navigation row, optional fullscreen banner, then the lesson card taking the
	   rest. The banner row is declared even when the banner is absent — with only
	   two rows declared it landed in an implicit row and pushed the card past the
	   bottom of the screen. `minmax(0, 1fr)` lets the card shrink; a plain `1fr`
	   would let the lesson push the page taller and bring back the document
	   scrollbar. */
	.lesson-runner {
		display: grid;
		grid-template-rows: auto auto minmax(0, 1fr);
		gap: 0.5rem;
		min-block-size: 0;
		block-size: 100%;
	}

	.lesson-nav {
		grid-row: 1;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	/* The shared button's `focus-visible:ring` resolves to a fully transparent
	   box-shadow and its base utilities zero the outline width, so a keyboard user
	   saw nothing move at all. `!important` is what it takes to beat a utility
	   that sets the same property; the alternative is editing the button every
	   screen shares. */
	.lesson-nav :global(button:focus-visible) {
		outline: 3px solid #b45309 !important;
		outline-offset: 3px;
	}

	/* On the fullscreen gradient the plain counter was unreadable. */
	.fullscreen-counter {
		border-radius: 9999px;
		background: rgb(255 255 255 / 0.92);
		padding: 0.25rem 0.75rem;
	}

	.lesson-notices {
		grid-row: 2;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-block-size: 0;
	}

	.lesson-card {
		/* Explicit row: without it the card was auto-placed into row 2 and the
		   flexible row 3 stayed empty, so the lesson did not actually take the
		   space the layout had reserved for it. */
		grid-row: 3;
		min-block-size: 0;
		display: flex;
		flex-direction: column;
	}

	.lesson-card > :global(*) {
		min-block-size: 0;
		flex: 1;
	}

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
		padding: 0;
		margin: 0;
		/* Fullscreen keeps a slim row for the "leave fullscreen" control, and the
		   notices row so a failed save is still announced. */
		grid-template-rows: auto auto minmax(0, 1fr);
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
