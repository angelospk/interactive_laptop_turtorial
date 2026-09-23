<script lang="ts">
	import { afterNavigate, goto, replaceState } from '$app/navigation';
	import LessonRunner from '$lib/components/lessons/LessonRunner.svelte';
	import { ArrowLeft } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();

	// SSR decides the initial lesson via `startIndex`; the client only mirrors
	// advancement afterwards. No `$effect` racing against `$page.params` here.
	let moduleLessons = $derived(data.moduleLessons || []);
	let progress = $derived((data.progress || {}) as Record<string, any>);

	// `replaceState` is shallow: it rewrites the address bar but leaves the route
	// params, `page.url` and so `data.startIndex` at the last real navigation. The
	// runner therefore follows `startIndex` only when a real navigation happened,
	// which `afterNavigate` counts (it does not fire for replaceState or for the
	// `invalidateAll()` that saving progress triggers).
	let startIndex = $derived(data.startIndex ?? 0);
	let navigation = $state(0);
	afterNavigate(() => {
		navigation++;
	});

	function backToGrid() {
		goto(`/modules/${data.moduleId}`);
	}

	// Keep the URL in step with in-runner navigation so a refresh stays put.
	// Shallow (replaceState) — the lesson list is already loaded, no reload needed.
	function handleLessonChange(lessonKey: string) {
		if (!lessonKey) return;
		replaceState(`/modules/${data.moduleId}/${encodeURIComponent(lessonKey)}`, {});
	}
</script>

<!--
	The page owns the viewport: one auto-sized bar, then the lesson taking every
	remaining pixel. Previously the chrome above the lesson ate 213px on a 1280x800
	laptop and the document itself scrolled, so the button that starts the lesson
	sat below the fold and learners assumed the lesson was broken.
-->
<div class="lesson-page">
	<div class="lesson-bar">
		<!-- Breadcrumb doubles as the way back; a separate "back" button was a
		     third row saying the same thing. -->
		<nav aria-label={m.breadcrumb_aria()} class="flex min-w-0 items-center gap-1 text-base">
			<a class="crumb-link" href="/">{m.nav_home()}</a>
			<span aria-hidden="true" class="text-muted-foreground">›</span>
			<a class="crumb-link crumb-current" href={`/modules/${data.moduleId}`}>
				<ArrowLeft class="h-5 w-5 shrink-0" aria-hidden="true" />
				<span class="truncate">{m.breadcrumb_lessons()}</span>
			</a>
		</nav>
	</div>

	<div class="lesson-stage">
		{#if moduleLessons.length > 0}
			<LessonRunner
				lessons={moduleLessons}
				{progress}
				{startIndex}
				{navigation}
				moduleId={data.moduleId}
				onLessonChange={handleLessonChange}
				onExit={backToGrid}
				nextModuleId={data.nextModuleId}
				isLastModule={data.isLastModule}
			/>
		{/if}
	</div>
</div>

<style>
	/* Viewport-owned layout: `auto` for the bar, `minmax(0, 1fr)` for the lesson.
	   `minmax(0, …)` (not `1fr`) is what lets the lesson shrink instead of pushing
	   the document taller, and every descendant keeps `min-height: 0` so the
	   scroll happens inside the lesson content, never on the page. */
	.lesson-page {
		block-size: 100svh;
		block-size: 100dvh;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		gap: 0.5rem;
		padding: 0.5rem 1rem 1rem;
	}

	.lesson-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
		min-block-size: 0;
	}

	.lesson-stage {
		min-block-size: 0;
		display: flex;
		flex-direction: column;
	}

	.crumb-link {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		min-block-size: 44px;
		padding-inline: 0.5rem;
		border-radius: 0.5rem;
		color: var(--muted-foreground);
	}

	.crumb-current {
		color: var(--foreground);
		font-weight: 600;
	}

	.crumb-link:hover {
		background: color-mix(in oklab, currentColor 8%, transparent);
	}

	.crumb-link:focus-visible {
		outline: 3px solid var(--ring, #2563eb);
		outline-offset: 2px;
	}
</style>
