<script lang="ts">
	import { goto, replaceState } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import LessonRunner from '$lib/components/lessons/LessonRunner.svelte';
	import { ArrowLeft } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();

	// SSR decides the initial lesson via `startIndex`; the client only mirrors
	// advancement afterwards. No `$effect` racing against `$page.params` here.
	let moduleLessons = $derived(data.moduleLessons || []);
	let progress = $derived((data.progress || {}) as Record<string, any>);

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

<div class="container mx-auto p-4 md:p-8">
	<!-- Breadcrumb so users always know where they are and how to get back. -->
	<nav class="text-muted-foreground mb-4 text-sm" aria-label="Διαδρομή">
		<a class="hover:text-foreground hover:underline" href="/">Αρχική</a>
		<span class="mx-1">›</span>
		<a class="hover:text-foreground hover:underline" href={`/modules/${data.moduleId}`}>Μαθήματα</a>
	</nav>

	<div class="mb-6">
		<Button variant="ghost" onclick={backToGrid} class="gap-2 text-base">
			<ArrowLeft class="h-5 w-5" />
			{m.back_to_lessons ? m.back_to_lessons() : 'Πίσω στα Μαθήματα'}
		</Button>
	</div>

	{#if moduleLessons.length > 0}
		<LessonRunner
			lessons={moduleLessons}
			{progress}
			startIndex={data.startIndex}
			moduleId={data.moduleId}
			onLessonChange={handleLessonChange}
			onExit={backToGrid}
			nextModuleId={data.nextModuleId}
			isLastModule={data.isLastModule}
		/>
	{/if}
</div>
