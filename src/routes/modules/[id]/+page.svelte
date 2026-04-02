<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import LessonRunner from '$lib/components/lessons/LessonRunner.svelte';
	import LessonCard from '$lib/components/ui/lesson/LessonCard.svelte';
	import { ArrowLeft } from '@lucide/svelte';
	import { invalidateAll } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();

	// Get lessons for this module
	let moduleLessons = $derived(data.moduleLessons || []);
	let progress = $derived((data.progress || {}) as Record<string, any>);

	// Selection state
	let selectedLessonId = $state<string | null>(null);

	// Synchronously track if the currently selected lesson actually belongs to the current module.
	// This prevents Svelte from crashing when navigating between modules with different counts of lessons.
	let validSelectedLessonId = $derived(
		selectedLessonId && moduleLessons.some((l) => l.id === selectedLessonId) ? selectedLessonId : null
	);

	// Watch for module changes to reset selection state cleanly (to avoid ghost state if returning later)
	let currentModuleId = $state($page.params.id);
	$effect(() => {
		if (currentModuleId !== $page.params.id) {
			currentModuleId = $page.params.id;
			selectedLessonId = null;
		}
	});

	// Find index of selected lesson to pass to LessonRunner
	let initialLessonIndex = $derived(
		validSelectedLessonId ? moduleLessons.findIndex((l) => l.id === validSelectedLessonId) : 0
	);

	function selectLesson(lessonId: string) {
		selectedLessonId = lessonId;
		if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
			document.documentElement.requestFullscreen().catch((err) => {
				console.error('Fullscreen failed:', err);
			});
		}
	}

	async function backToGrid() {
		selectedLessonId = null;
		// Refresh data to update progress
		await invalidateAll();
	}

	// Determine if a lesson is locked based on previous completion
	import { isLessonLocked } from '$lib/utils/progress';

	// Determine if a lesson is locked based on previous completion
	function checkLocked(index: number, lesson: any) {
		return isLessonLocked(index, lesson, moduleLessons, progress);
	}
</script>

<div class="container mx-auto p-4 md:p-8">
	<div class="mb-6">
		{#if validSelectedLessonId}
			<Button variant="ghost" onclick={backToGrid} class="gap-2">
				<ArrowLeft class="h-4 w-4" />
				{m.back_to_lessons ? m.back_to_lessons() : 'Πίσω στα Μαθήματα'}
			</Button>
		{:else}
			<Button variant="ghost" href="/" class="gap-2">
				<ArrowLeft class="h-4 w-4" />
				{m.back_to_modules ? m.back_to_modules() : 'Πίσω στις Ενότητες'}
			</Button>
		{/if}
	</div>

	{#if validSelectedLessonId}
		<LessonRunner
			lessons={moduleLessons}
			{progress}
			startIndex={initialLessonIndex}
			onExit={backToGrid}
			nextModuleId={data.nextModuleId}
			isLastModule={data.isLastModule}
		/>
	{:else if moduleLessons.length > 0}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each moduleLessons as lesson, i (lesson.id)}
				{@const locked = checkLocked(i, lesson)}
				<LessonCard
					{lesson}
					progress={progress[lesson.id]}
					isLocked={locked}
					onclick={() => !locked && selectLesson(lesson.id)}
				/>
			{/each}
		</div>
	{:else}
		<div class="py-12 text-center">
			<p class="mt-2 text-slate-500">No lessons found for this module.</p>
			<Button class="mt-6" href="/">Go Home</Button>
		</div>
	{/if}
</div>
