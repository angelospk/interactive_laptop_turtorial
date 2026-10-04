<script lang="ts">
	import { onMount, tick, untrack, type Snippet } from 'svelte';
	import { invalidateAll, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { Lesson } from '$lib/db/schema';
	import { Button } from '$lib/components/ui/button';
	import LessonRenderer from './LessonRenderer.svelte';
	import { practiceAfterCompletion, readPractice, savePractice } from '$lib/lessons/guidePractice';
	import { nextUnfinished } from '$lib/lessons/nextUnfinished';
	import * as m from '$lib/paraglide/messages.js';
	import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-svelte';
	import {
		barReducer,
		canScrollUp,
		stuckDelayMs,
		type BarEvent,
		type BarState
	} from '$lib/lessons/lessonBar';
	import { fillShortcutText, type LearnerDevice } from '$lib/lessons/shortcuts';

	// Shape of one lesson's progress: the stored row, or the optimistic update made here.
	type LessonProgress = {
		completed?: boolean;
		score?: number | null;
		stars?: number | null;
		attempts?: number;
		completedAt?: Date | string | null;
		lastAttemptAt?: Date | string | null;
	};

	let {
		lessons,
		progress,
		startIndex = 0,
		navigation = 0,
		onExit,
		moduleId,
		onLessonChange,
		nextModuleId = null,
		crumbs
	} = $props<{
		lessons: Lesson[];
		progress: Record<string, LessonProgress>;
		startIndex?: number;
		/** Counts real navigations; a change means "go to startIndex", even the same one. */
		navigation?: number;
		onExit?: () => void;
		/** Called with the new lessonKey when the runner moves within the module (for URL sync). */
		onLessonChange?: (lessonKey: string) => void;
		moduleId?: string | null;
		nextModuleId?: string | null;
		isLastModule?: boolean;
		/** The way back (breadcrumb), shown at the start of the lesson bar. */
		crumbs?: Snippet;
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
			arrive();
		});
		currentLessonIndex = incoming;
	});

	let currentLesson = $derived(lessons[currentLessonIndex]);

	// Optimistic UI state
	let localUpdates = $state<Record<string, LessonProgress>>({});

	// Merge prop progress with local updates
	let mergedProgress = $derived({ ...progress, ...localUpdates });

	// Determine if current lesson is locked
	// All lessons are now unlocked - users can navigate freely
	let isLocked = $derived(false);

	// The result overlay belongs to a completion that just happened here. Keying
	// it off stored progress meant walking into an already-finished lesson opened
	// a full-screen "Μπράβο" over a lesson the learner had not played yet.
	let justCompletedLessonId = $state<string | null>(null);
	// A fresh guide answer may request practice of an exercise solved in an earlier session.
	let practiceLessonIds = $state<string[]>([]);
	let practiceLoadedFor = $state<string | null>(null);
	const practiceStorageKey = $derived(
		moduleId && page.data?.user?.id ? `guide-practice:${page.data.user.id}:${moduleId}` : null
	);
	$effect(() => {
		const key = practiceStorageKey;
		practiceLessonIds =
			key && typeof sessionStorage !== 'undefined' ? readPractice(sessionStorage, key) : [];
		practiceLoadedFor = key;
	});
	$effect(() => {
		if (
			practiceStorageKey &&
			practiceLoadedFor === practiceStorageKey &&
			typeof sessionStorage !== 'undefined'
		) {
			savePractice(sessionStorage, practiceStorageKey, practiceLessonIds);
		}
	});
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
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- bookkeeping only, never read by the template or a $derived/$effect
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
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- promise queue bookkeeping only, never read reactively
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
	// Per lesson: a late failure of one lesson must not replace another's.
	let unsavedScores = $state<Record<string, number>>({});
	let showUnsaved = $derived(!!currentLesson && currentLesson.id in unsavedScores);
	function forgetUnsaved(lessonId: string) {
		if (!(lessonId in unsavedScores)) return;
		const rest = { ...unsavedScores };
		delete rest[lessonId];
		unsavedScores = rest;
	}

	function retrySave() {
		const lessonId = currentLesson?.id;
		if (!lessonId || !(lessonId in unsavedScores)) return;
		const score = unsavedScores[lessonId];
		forgetUnsaved(lessonId);
		handleLessonComplete(score, lessonId);
	}

	async function handleLessonComplete(
		score: number,
		lessonId: string,
		guidePracticeIds?: string[]
	) {
		if (lessonId !== currentLesson?.id) return;
		practiceLessonIds = practiceAfterCompletion(practiceLessonIds, currentLesson, guidePracticeIds);
		const mine = nextAttempt(lessonId);
		forgetUnsaved(lessonId);

		justCompletedLessonId = lessonId;
		finishedHere = true;

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
		let data: { progress?: LessonProgress } | null = null;
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
			const rest = { ...localUpdates };
			delete rest[lessonId];
			localUpdates = rest;
			if (justCompletedLessonId === lessonId) justCompletedLessonId = null;
			unsavedScores = { ...unsavedScores, [lessonId]: score };
		}
	}

	// Part of the lesson's key: Retry must hand the learner a fresh drill, not the
	// finished one whose progress was just cleared.
	let retryEpoch = $state(0);

	async function handleRetry() {
		retryEpoch++;
		finishedHere = false;
		forgetUnsaved(currentLesson.id);
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
			arrive();
			syncUrl();
		} else {
			leaveModule();
		}
	}

	function leaveModule() {
		if (nextModuleId) {
			goto(resolve('/modules/[id]', { id: nextModuleId }));
		} else if (onExit) {
			onExit();
		}
	}

	// After a completion, Next skips what the learner already has (solved, or
	// «Το ξέρω» in a guide). The navigation bar still steps one at a time.
	let nextOpenIndex = $derived(
		nextUnfinished(lessons, mergedProgress, currentLessonIndex, practiceLessonIds)
	);

	function nextUnfinishedLesson() {
		justCompletedLessonId = null;
		if (nextOpenIndex === null) {
			leaveModule();
			return;
		}
		currentLessonIndex = nextOpenIndex;
		arrive();
		syncUrl();
	}

	function prevLesson() {
		justCompletedLessonId = null;
		if (currentLessonIndex > 0) {
			currentLessonIndex--;
			arrive();
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
		const messages = m as unknown as Record<
			string,
			((params?: Record<string, string>) => string) | undefined
		>;
		return messages[key]?.(params) || key;
	}

	// Fullscreen state
	let isFullscreen = $state(false);
	let lessonContainer: HTMLElement;

	// True when the current lesson recommends fullscreen
	let fullscreenRecommended = $derived(
		!!(currentLesson?.config as { fullscreen?: boolean } | null | undefined)?.fullscreen
	);

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

	// The lesson takes the whole screen. Title, instruction and the way to other
	// lessons sit in a bar laid over its top edge — laid over, so showing and
	// hiding it never resizes the simulation under the learner's hand. Rules for
	// when it opens and closes live in lessonBar.ts.
	let bar = $state<BarState>({ open: true, reason: 'arrival' });
	// A failed save is announced in the bar, so it stays open while there is one.
	let barOpen = $derived(bar.open || showUnsaved);
	// On arrival the bar sits above the lesson instead of over it: laid over, it
	// hid the top of the lesson, and whatever the learner had to press there.
	let docked = $derived(bar.open && bar.reason === 'arrival');
	let stuck = $derived(bar.open && bar.reason === 'stuck');
	let helpOpen = $state(false);
	let stuckRound = $state(0);
	// Finished on this visit: no "Κόλλησες;" after that, even once the result is
	// gone (a failed save takes it away). Cleared by arriving and by Retry.
	let finishedHere = $state(false);
	let barEl = $state<HTMLElement | null>(null);
	let stageEl = $state<HTMLElement | null>(null);
	let menuButton = $state<HTMLButtonElement | null>(null);

	function send(event: BarEvent) {
		bar = barReducer(bar, event);
		if (!bar.open) helpOpen = false;
	}

	function arrive() {
		send('arrive');
		stuckRound = 0;
		finishedHere = false;
	}

	async function openMenu() {
		send('toggle');
		await tick();
		barEl?.querySelector<HTMLElement>('a[href], button:not([disabled])')?.focus();
	}

	async function hideBar() {
		send('dismiss');
		await tick();
		menuButton?.focus();
	}

	function keepGoing() {
		stuckRound++;
		hideBar();
	}

	// "Κόλλησες;" after a while without finishing. Each "Συνεχίζω" doubles the
	// wait: asked once is help, asked every 40 seconds is nagging.
	$effect(() => {
		const lesson = currentLesson;
		void retryEpoch;
		const round = stuckRound;
		if (!lesson || showResultOverlay || finishedHere) return;
		const delay = stuckDelayMs(lesson);
		if (delay === null) return;
		const timer = setTimeout(() => send('stuck'), delay * 2 ** round);
		return () => clearTimeout(timer);
	});

	// Whatever the lesson says about what to do, in one place for "Βοήθεια".
	const device = $derived((page.data?.user?.preferredDevice ?? null) as LearnerDevice);
	let lessonTitle = $derived(currentLesson ? getMessage(currentLesson.titleKey) : '');
	let lessonDescription = $derived(
		currentLesson?.descriptionKey ? getMessage(currentLesson.descriptionKey) : ''
	);
	let helpLines = $derived.by(() => {
		const config = (currentLesson?.config ?? {}) as Record<string, unknown>;
		const steps = Array.isArray(config.tutorialSteps) ? config.tutorialSteps : [];
		const lines = [lessonDescription, config.prompt, config.instructions, ...steps]
			.filter((line): line is string => typeof line === 'string' && line.trim() !== '')
			.map((line) => fillShortcutText(line, device));
		return lines.length ? [...new Set(lines)] : [lessonTitle];
	});

	// The tip names the gesture this learner has: a mouse to move up, or a finger.
	let hasMouse = $state(true);
	onMount(() => {
		hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	});

	// On pointerup, not pointerdown: an arrival bar sits above the lesson, so
	// putting it away moves the lesson up — after the click, never under it.
	function onStagePointerUp() {
		send('stage-interact');
	}

	function onStageKeyDown(event: KeyboardEvent) {
		if (event.key !== 'Tab') send('stage-interact');
	}

	// Scrolling up past the top of whatever is under the pointer means "show me".
	function onStageWheel(event: WheelEvent) {
		if (event.deltaY < 0 && stageEl && !canScrollUp(event.target, stageEl)) send('peek');
	}

	// On a touch screen: a downward swipe that starts near the top of the lesson.
	let swipeFrom: number | null = null;
	function onStageTouchStart(event: TouchEvent) {
		const box = stageEl?.getBoundingClientRect();
		const y = event.touches[0]?.clientY;
		swipeFrom =
			box && y !== undefined && y - box.top < box.height / 4 && !canScrollUp(event.target, stageEl!)
				? y
				: null;
	}
	function onStageTouchMove(event: TouchEvent) {
		const y = event.touches[0]?.clientY;
		if (swipeFrom !== null && y !== undefined && y - swipeFrom > 60) {
			swipeFrom = null;
			send('peek');
		}
	}

	// The mouse at the very top of the screen. The page owns the viewport, so the
	// top of the window is the top of the lesson.
	function onWindowPointerMove(event: PointerEvent) {
		if (event.pointerType === 'mouse' && event.clientY <= 8 && !bar.open && !showResultOverlay) {
			send('peek');
		}
	}

	// A peeked-at bar leaves when the mouse does, after a moment so that a
	// wobbly hand passing the edge does not snap it shut.
	let leaveTimer: ReturnType<typeof setTimeout> | undefined;
	function onBarPointerLeave(event: PointerEvent) {
		if (event.pointerType !== 'mouse') return;
		clearTimeout(leaveTimer);
		leaveTimer = setTimeout(() => send('leave'), 700);
	}
	function onBarPointerEnter() {
		clearTimeout(leaveTimer);
	}
	$effect(() => () => clearTimeout(leaveTimer));

	function onBarKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && bar.open) {
			event.stopPropagation();
			hideBar();
		}
	}

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

	// aria-modal promises the rest of the page is out of reach; `inert` covers the
	// runner, and this keeps Tab from walking out to the page around it (the
	// breadcrumb, the browser's own controls) and back in behind the result.
	function trapTab(event: KeyboardEvent) {
		if (event.key !== 'Tab' || !resultDialog) return;
		const focusable = [
			...resultDialog.querySelectorAll<HTMLElement>(
				'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
			)
		];
		if (!focusable.length) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const inside = resultDialog.contains(document.activeElement);
		if (event.shiftKey && (document.activeElement === first || !inside)) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && (document.activeElement === last || !inside)) {
			event.preventDefault();
			first.focus();
		}
	}
</script>

<svelte:document
	onfullscreenchange={handleFullscreenChange}
	onkeydown={showResultOverlay ? trapTab : undefined}
/>
<svelte:window onpointermove={onWindowPointerMove} />

<div class="lesson-runner" class:fullscreen-active={isFullscreen} bind:this={lessonContainer}>
	<!-- Portal target for dialogs/modals in fullscreen mode -->
	<div id="fullscreen-portal-target" class="fullscreen-portal-container"></div>

	<!-- A slim strip that stays when the bar is away: which lesson this is, and
	     the button that brings the bar back. A strip, not a tab floating over the
	     lesson, because a floating tab covered the instruction centred at the top
	     of many lessons. The open bar is laid over it. -->
	<div class="bar-strip" class:docked inert={barOpen || showResultOverlay}>
		<span class="strip-title">
			{getMessage('lesson_x_of_y', {
				current: String(currentLessonIndex + 1),
				total: String(lessons.length)
			})} · {lessonTitle}
		</span>
		{#if !barOpen}
			<button
				bind:this={menuButton}
				class="bar-handle"
				aria-expanded="false"
				aria-controls="lesson-bar"
				onclick={openMenu}
			>
				<ChevronDown class="h-5 w-5" aria-hidden="true" />
				{m.lesson_menu_show()}
			</button>
		{/if}
	</div>

	<!-- Then the lesson, taking every pixel left. -->
	<!-- Listens only to learn that the learner started; the lesson handles the input. -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="lesson-stage"
		bind:this={stageEl}
		onpointerup={onStagePointerUp}
		onkeydown={onStageKeyDown}
		onwheel={onStageWheel}
		ontouchstart={onStageTouchStart}
		ontouchmove={onStageTouchMove}
	>
		<div class="lesson-card" inert={showResultOverlay} bind:this={lessonCard}>
			<!-- Scrolls when a lesson is taller than the screen (a short laptop, or the
			     browser zoomed in). Lessons built on LessonTemplate scroll inside and
			     never trigger it; a quiz, sized to its content, used to be cut off. -->
			<div class="lesson-scroller">
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
							onComplete={(score: number, practiceIds?: string[]) =>
								handleLessonComplete(score, renderedLessonId, practiceIds)}
							onBack={handleBack}
						/>
					{/key}
				{/if}
			</div>
		</div>
	</div>

	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<section
		id="lesson-bar"
		aria-label={m.lesson_menu_show()}
		class="lesson-bar"
		class:open={barOpen}
		class:docked
		bind:this={barEl}
		inert={!barOpen || showResultOverlay}
		onpointerleave={onBarPointerLeave}
		onpointerenter={onBarPointerEnter}
		onkeydown={onBarKeyDown}
	>
		<div class="bar-top">
			{@render crumbs?.()}
			<!-- Not a heading: the lesson's own h1 stays in the page for screen readers. -->
			<p class="bar-title">
				<strong>{lessonTitle}</strong>
				{#if lessonDescription}
					<span class="bar-description">{lessonDescription}</span>
				{/if}
			</p>
			<button class="bar-hide" onclick={hideBar}>
				<ChevronUp class="h-5 w-5" aria-hidden="true" />
				{m.lesson_menu_hide()}
			</button>
		</div>

		<!--
			The whole row stays in fullscreen: hiding it left the learner with no visible
			way out, and hiding Previous/Next left them with no familiar way on.
		-->
		<nav class="lesson-nav" aria-label={getMessage('lesson_nav_aria') || 'Πλοήγηση μαθήματος'}>
			<Button
				variant="outline"
				onclick={prevLesson}
				disabled={currentLessonIndex === 0}
				class="min-h-12 px-5 text-base"
			>
				{getMessage('nav_previous')}
			</Button>
			<div class="flex items-center gap-2">
				<span class="text-base font-semibold text-slate-600">
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

		<div class="lesson-notices">
			{#if stuck}
				<div
					role="status"
					class="flex flex-col gap-3 rounded-lg border-2 border-amber-400 bg-amber-50 px-4 py-3 text-base text-amber-950"
				>
					<p class="text-xl font-bold">{m.lesson_stuck_title()}</p>
					<p>{m.lesson_stuck_body()}</p>
					<div class="flex flex-wrap gap-3">
						<Button
							onclick={() => (helpOpen = true)}
							aria-expanded={helpOpen}
							class="min-h-12 px-5 text-base"
						>
							{m.lesson_stuck_help()}
						</Button>
						<Button variant="outline" onclick={handleBack} class="min-h-12 px-5 text-base">
							{m.lesson_stuck_exit()}
						</Button>
						<Button variant="ghost" onclick={keepGoing} class="min-h-12 px-5 text-base underline">
							{m.lesson_stuck_continue()}
						</Button>
					</div>
					{#if helpOpen}
						<div class="rounded-md bg-white px-4 py-3 text-slate-900">
							<p class="font-semibold">{m.lesson_help_title()}</p>
							<ul class="mt-1 list-disc ps-5">
								{#each helpLines as line (line)}
									<li class="whitespace-pre-line">{line}</li>
								{/each}
							</ul>
						</div>
					{/if}
					<p class="text-sm">{hasMouse ? m.lesson_bar_tip_mouse() : m.lesson_bar_tip_touch()}</p>
				</div>
			{/if}

			<!-- One thing at a time for a learner who is already stuck. -->
			{#if showFullscreenBanner && !stuck}
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
					<span>{m.save_failed()}</span>
					<Button onclick={retrySave} class="min-h-12 px-5 text-base">{m.save_retry()}</Button>
				</div>
			{/if}
		</div>
	</section>

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
							{#if nextOpenIndex !== null}
								<Button
									size="lg"
									data-primary
									onclick={nextUnfinishedLesson}
									class="w-[200px] flex-1 gap-2 bg-green-600 py-6 text-lg text-white shadow-md hover:bg-green-700"
								>
									{getMessage('next_lesson') || 'Επόμενο Μάθημα'}
									<span class="text-2xl">→</span>
								</Button>
							{:else if nextModuleId}
								<Button
									size="lg"
									data-primary
									onclick={nextUnfinishedLesson}
									class="w-[200px] flex-1 gap-2 bg-blue-600 py-6 text-lg text-white shadow-md hover:bg-blue-700"
								>
									Επόμενη Ενότητα
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
	/* The lesson fills the runner; the bar and its Menu tab float over its top
	   edge. `min-block-size: 0` all the way down is what lets a long lesson
	   scroll inside itself instead of making the page taller. */
	.lesson-runner {
		position: relative;
		display: flex;
		flex-direction: column;
		min-block-size: 0;
		block-size: 100%;
	}

	/* `isolation` keeps the simulation's own z-indexes (taskbar, windows) under
	   the bar instead of competing with it. */
	.lesson-stage {
		flex: 1;
		min-block-size: 0;
		display: flex;
		flex-direction: column;
		isolation: isolate;
	}

	.lesson-card {
		flex: 1;
		min-block-size: 0;
		display: flex;
		flex-direction: column;
	}

	.lesson-scroller {
		flex: 1;
		min-block-size: 0;
		overflow-y: auto;
	}

	.lesson-bar {
		position: absolute;
		inset-inline: 0;
		inset-block-start: 0;
		z-index: 20;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-block-size: 100%;
		overflow-y: auto;
		padding: 0.5rem 1rem 0.75rem;
		background: var(--background, #fff);
		color: var(--foreground, #0f172a);
		border-block-end: 1px solid rgb(0 0 0 / 0.12);
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.18);
		transition:
			transform 0.2s ease,
			visibility 0s;
	}

	/* `visibility` waits for the slide to finish, then takes the bar out of
	   reach entirely; `inert` already keeps the keyboard out. */
	.lesson-bar:not(.open) {
		transform: translateY(-100%);
		visibility: hidden;
		transition:
			transform 0.2s ease,
			visibility 0s linear 0.2s;
	}

	.bar-top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem 0.75rem;
	}

	.bar-title {
		flex: 1 1 16rem;
		min-inline-size: 0;
		margin: 0;
		font-size: 1.125rem;
		line-height: 1.4;
	}

	.bar-description {
		display: block;
		font-size: 1rem;
		color: var(--muted-foreground, #475569);
	}

	.bar-hide,
	.bar-handle {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		min-block-size: 44px;
		padding-inline: 0.875rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
	}

	.bar-hide {
		border-radius: 0.5rem;
		background: transparent;
		color: inherit;
	}

	.bar-hide:hover {
		background: color-mix(in oklab, currentColor 8%, transparent);
	}

	/* Docked: in the flow, first in line, and the strip makes way for it. */
	.lesson-bar.docked {
		position: relative;
		order: -1;
		flex: none;
		max-block-size: 60%;
		box-shadow: none;
		/* Appears at once: a bar sliding in under a click sent the click to the
		   lesson instead of the button it was aimed at. */
		transition: none;
	}

	.bar-strip.docked {
		display: none;
	}

	.bar-strip {
		position: relative;
		flex: none;
		display: flex;
		align-items: center;
		justify-content: center;
		min-block-size: 44px;
		padding-inline: 1rem;
		background: rgb(15 23 42);
		color: #fff;
	}

	/* Context, not a control: on a narrow screen the button needs the room. */
	.strip-title {
		position: absolute;
		inset-inline-start: 1rem;
		max-inline-size: calc(50% - 7rem);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.9375rem;
		color: rgb(255 255 255 / 0.85);
	}

	@media (max-width: 640px) {
		.strip-title {
			display: none;
		}
	}

	.bar-handle {
		border-radius: 9999px;
		background: rgb(255 255 255 / 0.14);
		color: #fff;
	}

	.bar-handle:hover {
		background: rgb(255 255 255 / 0.24);
	}

	.lesson-nav {
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
	.lesson-bar :global(button:focus-visible),
	.lesson-bar :global(a:focus-visible),
	.bar-handle:focus-visible {
		outline: 3px solid #b45309 !important;
		outline-offset: 3px;
	}

	.lesson-notices {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.lesson-notices:empty {
		display: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.lesson-bar,
		.lesson-bar:not(.open) {
			transition: none;
		}
	}

	.fullscreen-active {
		position: fixed;
		inset: 0;
		z-index: 50;
		background: var(--background, #fff);
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
