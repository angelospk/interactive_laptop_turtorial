<script lang="ts">
	import { afterNavigate, goto, replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { ComponentProps } from 'svelte';
	import LessonRunner from '$lib/components/lessons/LessonRunner.svelte';
	import { ArrowLeft } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { rememberTitle } from '$lib/offlineLessons';

	let { data } = $props();

	// SSR decides the initial lesson via `startIndex`; the client only mirrors
	// advancement afterwards. No `$effect` racing against `$page.params` here.
	let moduleLessons = $derived(data.moduleLessons || []);
	let progress = $derived((data.progress || {}) as ComponentProps<typeof LessonRunner>['progress']);

	// `replaceState` is shallow: it rewrites the address bar but leaves the route
	// params, `page.url` and so `data.startIndex` at the last real navigation. The
	// runner therefore follows `startIndex` only when a real navigation happened,
	// which `afterNavigate` counts (it does not fire for replaceState or for the
	// `invalidateAll()` that saving progress triggers).
	let startIndex = $derived(data.startIndex ?? 0);
	let navigation = $state(0);
	afterNavigate(() => {
		navigation++;
		shownKey = null;
	});

	// The tab title names the lesson on screen (and is what the offline page
	// lists it by). Moving inside the runner is shallow, so it is tracked here.
	const messages = m as unknown as Record<string, (() => string) | undefined>;
	let shownKey = $state<string | null>(null);
	let shownLesson = $derived(
		moduleLessons.find((l: { lessonKey: string }) => l.lessonKey === shownKey) ??
			moduleLessons[startIndex]
	);
	let lessonTitle = $derived(
		(shownLesson && messages[shownLesson.titleKey]?.()) || shownLesson?.lessonKey || ''
	);
	// Noted for the offline page, which may only have this lesson's data cached.
	$effect(() => {
		if (shownLesson) {
			rememberTitle(
				`/modules/${data.moduleId}/${encodeURIComponent(shownLesson.lessonKey)}`,
				lessonTitle
			);
		}
	});

	function backToGrid() {
		goto(resolve('/modules/[id]', { id: data.moduleId }));
	}

	// Keep the URL in step with in-runner navigation so a refresh stays put.
	// Shallow (replaceState) — the lesson list is already loaded, no reload needed.
	function handleLessonChange(lessonKey: string) {
		if (!lessonKey) return;
		shownKey = lessonKey;
		replaceState(
			resolve('/modules/[id]/[lesson]', {
				id: data.moduleId,
				lesson: encodeURIComponent(lessonKey)
			}),
			{}
		);
	}
</script>

<!--
	The page owns the viewport and the lesson takes all of it. The breadcrumb and
	lesson navigation live in a bar laid over the lesson that hides once the
	learner starts. Previously that chrome sat above the lesson and ate ~240px of
	a laptop screen, leaving the simulation small inside a purple margin.
-->
<svelte:head>
	<title>{lessonTitle} — {m.app_title()}</title>
</svelte:head>

<div class="lesson-page">
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
		>
			{#snippet crumbs()}
				<!-- Breadcrumb doubles as the way back; a separate "back" button was a
				     third row saying the same thing. -->
				<nav aria-label={m.breadcrumb_aria()} class="flex min-w-0 items-center gap-1 text-base">
					<a class="crumb-link" href={resolve('/')}>{m.nav_home()}</a>
					<span aria-hidden="true" class="text-muted-foreground">›</span>
					<a
						class="crumb-link crumb-current"
						href={resolve('/modules/[id]', { id: data.moduleId })}
					>
						<ArrowLeft class="h-5 w-5 shrink-0" aria-hidden="true" />
						<span class="truncate">{m.breadcrumb_lessons()}</span>
					</a>
				</nav>
			{/snippet}
		</LessonRunner>
	{/if}
</div>

<style>
	/* Viewport-owned layout: the runner gets exactly the screen. Every
	   descendant keeps `min-height: 0` so the scroll happens inside the lesson
	   content, never on the page. */
	.lesson-page {
		block-size: 100svh;
		block-size: 100dvh;
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
