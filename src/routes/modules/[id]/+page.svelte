<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import LessonCard from '$lib/components/ui/lesson/LessonCard.svelte';
	import { ArrowLeft } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { isLessonLocked } from '$lib/utils/progress';

	let { data } = $props();

	let moduleLessons = $derived(data.moduleLessons || []);
	let progress = $derived((data.progress || {}) as Record<string, any>);

	// Notice surfaced after a guarded redirect from a lesson URL (locked / missing).
	let notice = $derived($page.url.searchParams.get('notice'));

	function checkLocked(index: number, lesson: any) {
		return isLessonLocked(index, lesson, moduleLessons, progress);
	}

	// Request fullscreen during the click gesture so the lesson page can stay fullscreen
	// after client-side navigation (browsers block fullscreen on a fresh page load).
	function requestFullscreenOnNavigate() {
		if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
			document.documentElement.requestFullscreen().catch(() => {});
		}
	}
</script>

<div class="container mx-auto p-4 md:p-8">
	<div class="mb-6">
		<Button variant="ghost" href="/" class="gap-2 text-base">
			<ArrowLeft class="h-5 w-5" />
			{m.back_to_modules ? m.back_to_modules() : 'Πίσω στις Ενότητες'}
		</Button>
	</div>

	{#if notice === 'locked'}
		<div
			class="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-base text-amber-800"
			role="status"
		>
			Κάντε πρώτα τα προηγούμενα μαθήματα για να ξεκλειδώσετε αυτό.
		</div>
	{:else if notice === 'missing'}
		<div
			class="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-700"
			role="status"
		>
			Το μάθημα που ζητήσατε δεν βρέθηκε. Διαλέξτε ένα από τη λίστα.
		</div>
	{/if}

	{#if moduleLessons.length > 0}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each moduleLessons as lesson, i (lesson.id)}
				{@const locked = checkLocked(i, lesson)}
				<LessonCard
					{lesson}
					progress={progress[lesson.id]}
					isLocked={locked}
					href={`/modules/${$page.params.id}/${encodeURIComponent(lesson.lessonKey)}`}
					onclick={requestFullscreenOnNavigate}
				/>
			{/each}
		</div>
	{:else}
		<div class="py-12 text-center">
			<p class="mt-2 text-slate-500">Δεν βρέθηκαν μαθήματα για αυτή την ενότητα.</p>
			<Button class="mt-6" href="/">Αρχική</Button>
		</div>
	{/if}
</div>
