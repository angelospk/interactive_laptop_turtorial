<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import LessonCard from '$lib/components/ui/lesson/LessonCard.svelte';
	import { ArrowLeft, Info } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { isLessonLocked } from '$lib/utils/progress';
	import { reveal } from '$lib/actions/reveal';
	import { buildLessonSections } from '$lib/config/moduleOrganization';

	let { data } = $props();

	let moduleLessons = $derived(data.moduleLessons || []);
	let progress = $derived((data.progress || {}) as Record<string, any>);

	// For long modules, split the lessons into labelled sub-sections (null = plain grid).
	let sections = $derived(buildLessonSections($page.params.id, moduleLessons));

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

<main class="relative min-h-[100dvh] overflow-hidden bg-background">
	<div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden">
		<div
			class="absolute -top-40 right-1/4 h-[30rem] w-[30rem] rounded-full opacity-35 blur-3xl"
			style="background: radial-gradient(circle, oklch(0.88 0.07 264 / 0.5), transparent 70%);"
		></div>
	</div>

	<div class="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-10">
		<div class="mb-8" data-reveal use:reveal>
			<Button
				variant="outline"
				href="/"
				class="h-11 gap-2 rounded-full px-5 text-base shadow-soft"
			>
				<ArrowLeft class="h-5 w-5" strokeWidth={1.75} />
				{m.back_to_modules ? m.back_to_modules() : 'Πίσω στις Ενότητες'}
			</Button>

			<div class="mt-6 flex items-baseline gap-3">
				<span
					class="inline-block rounded-full bg-brand/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase"
				>
					Μαθήματα
				</span>
				{#if moduleLessons.length > 0}
					<span class="text-sm font-medium text-muted-foreground tabular-nums">
						{moduleLessons.length} μαθήματα
					</span>
				{/if}
			</div>
		</div>

		{#if notice === 'locked' || notice === 'missing'}
			<div
				class="bezel-shell mb-8 shadow-soft"
				data-reveal
				use:reveal
				role="status"
			>
				<div class="bezel-core flex items-center gap-3 px-5 py-4">
					<span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
						<Info class="h-5 w-5 text-amber-600" strokeWidth={1.75} />
					</span>
					<p class="text-base text-foreground">
						{#if notice === 'locked'}
							Κάντε πρώτα τα προηγούμενα μαθήματα για να ξεκλειδώσετε αυτό.
						{:else}
							Το μάθημα που ζητήσατε δεν βρέθηκε. Διαλέξτε ένα από τη λίστα.
						{/if}
					</p>
				</div>
			</div>
		{/if}

		{#snippet lessonItem(lesson: any, index: number)}
			{@const locked = checkLocked(index, lesson)}
			<div data-reveal use:reveal={{ delay: (index % 3) * 50 }}>
				<LessonCard
					{lesson}
					progress={progress[lesson.id]}
					isLocked={locked}
					href={`/modules/${$page.params.id}/${encodeURIComponent(lesson.lessonKey)}`}
					onclick={requestFullscreenOnNavigate}
				/>
			</div>
		{/snippet}

		{#if moduleLessons.length > 0}
			{#if sections}
				<!-- Long module: lessons grouped into labelled sub-sections -->
				<div class="space-y-10">
					{#each sections as section (section.title)}
						<section data-reveal use:reveal>
							<div class="mb-5 flex items-baseline gap-3">
								<h2 class="text-sm font-semibold tracking-[0.14em] text-brand uppercase">
									{section.title}
								</h2>
								<span class="h-px flex-1 bg-border"></span>
								<span class="text-xs font-medium tabular-nums text-muted-foreground">
									{section.items.length}
								</span>
							</div>
							<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
								{#each section.items as { lesson, index } (lesson.id)}
									{@render lessonItem(lesson, index)}
								{/each}
							</div>
						</section>
					{/each}
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
					{#each moduleLessons as lesson, i (lesson.id)}
						{@render lessonItem(lesson, i)}
					{/each}
				</div>
			{/if}
		{:else}
			<div class="bezel-shell mx-auto max-w-md shadow-soft" data-reveal use:reveal>
				<div class="bezel-core px-6 py-12 text-center">
					<p class="text-base text-muted-foreground">Δεν βρέθηκαν μαθήματα για αυτή την ενότητα.</p>
					<Button class="mt-6 rounded-full" href="/">Αρχική</Button>
				</div>
			</div>
		{/if}
	</div>
</main>
