<script lang="ts">
	// The first thing somebody sees when they come back.
	//
	// This audience returns after two or three weeks, and what used to greet
	// them was 218 lessons across eleven modules and no indication of which one
	// they had been in. The card answers the only question they arrive with —
	// "what was I doing" — and gives two ways forward: carry on, or do the last
	// one again together with whoever is sitting next to them.
	//
	// Nothing here counts a streak, and nothing is phrased as being behind.

	import { Button } from '$lib/components/ui/button';
	import { ArrowRight, RotateCcw } from '@lucide/svelte';
	import type { ResumeLesson } from '$lib/resume';

	let {
		last,
		next,
		gap,
		finished,
		lessonTitle
	}: {
		last: ResumeLesson | null;
		next: ResumeLesson | null;
		/** "πριν από 3 εβδομάδες", already in words. Null on a first visit. */
		gap: string | null;
		finished: boolean;
		/** Turns a lesson's titleKey into its Greek title. */
		lessonTitle: (lesson: ResumeLesson) => string;
	} = $props();

	const href = (l: ResumeLesson) => `/modules/${l.moduleId}/${l.lessonKey}`;
</script>

<section
	class="mb-10 rounded-3xl border border-brand/15 bg-brand/[0.04] p-6 shadow-soft sm:p-7"
	aria-labelledby="resume-heading"
>
	<h2 id="resume-heading" class="text-2xl font-bold text-foreground sm:text-3xl">
		{#if !last}
			Ας ξεκινήσουμε
		{:else if finished}
			Τα κατάφερες
		{:else}
			Καλώς ήρθες πάλι
		{/if}
	</h2>

	<p class="mt-2 text-lg text-muted-foreground">
		{#if !last}
			Το πρώτο μάθημα σε περιμένει. Δεν χρειάζεται να ξέρεις τίποτα από πριν.
		{:else if finished}
			Έχεις τελειώσει όλα τα μαθήματα. Αν θέλεις, ξανακάνε κάποιο — δεν χάνεται τίποτα.
		{:else}
			{#if gap}Ήσουν εδώ {gap}.{/if}
			Σταμάτησες στο
			<strong class="font-semibold text-foreground">«{lessonTitle(last)}»</strong>.
		{/if}
	</p>

	<div class="mt-6 flex flex-col gap-3 sm:flex-row">
		{#if next}
			<Button
				href={href(next)}
				class="h-14 justify-center gap-2 rounded-2xl px-7 text-lg shadow-soft"
				data-testid="resume-continue"
			>
				Συνέχεια
				<ArrowRight class="h-5 w-5" strokeWidth={2} />
			</Button>
		{/if}

		{#if last}
			<!-- The repeat is a first-class button, not a fallback. Doing the last
			     thing again with a grandchild beside you is how it sticks, and
			     hiding it behind "already completed" is how it never happens. -->
			<Button
				variant="outline"
				href={href(last)}
				class="h-14 justify-center gap-2 rounded-2xl px-7 text-lg"
				data-testid="resume-repeat"
			>
				<RotateCcw class="h-5 w-5" strokeWidth={1.75} />
				Να το θυμηθούμε μαζί
			</Button>
		{/if}
	</div>
</section>
