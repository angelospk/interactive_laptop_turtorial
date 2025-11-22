<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import LessonRunner from '$lib/components/lessons/LessonRunner.svelte';
	import LessonCard from '$lib/components/ui/lesson/LessonCard.svelte';
	import { ArrowLeft } from '@lucide/svelte';
	import { invalidateAll } from '$app/navigation';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();

	// Get lessons for this module
	let moduleLessons = $derived(data.moduleLessons || []);
	let progress = $derived((data.progress || {}) as Record<string, any>);

	// Selection state
	let selectedLessonId = $state<string | null>(null);

	// Find index of selected lesson to pass to LessonRunner
	let initialLessonIndex = $derived(
		selectedLessonId ? moduleLessons.findIndex((l) => l.id === selectedLessonId) : 0
	);

	function selectLesson(lessonId: string) {
		selectedLessonId = lessonId;
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
		{#if selectedLessonId}
			<Button variant="ghost" onclick={backToGrid} class="gap-2">
				<ArrowLeft class="h-4 w-4" />
				{m.back_to_lessons ? m.back_to_lessons() : 'Back to Lessons'}
			</Button>
		{:else}
			<Button variant="ghost" href="/" class="gap-2">
				<ArrowLeft class="h-4 w-4" />
				{m.back_to_modules ? m.back_to_modules() : 'Back to Modules'}
			</Button>
		{/if}
	</div>

	{#if selectedLessonId}
		<LessonRunner
			lessons={moduleLessons}
			{progress}
			startIndex={initialLessonIndex}
			onExit={backToGrid}
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
