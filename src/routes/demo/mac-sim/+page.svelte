<script lang="ts">
	import MacSimLesson from '$lib/components/lessons/interactive/MacSimLesson.svelte';
	import { macLessons } from '$lib/db/seeds/mac-lessons';
	import type { Lesson } from '$lib/db/schema';

	/**
	 * Dev playground for the Mac simulator (no DB involved): renders the six
	 * mac-simulation seed lessons with a picker, mirroring /demo/mobile-sim.
	 * Not linked from the app itself (only from /demo).
	 */
	const lessons = macLessons.filter(
		(l) => l.lessonType === 'mac-simulation'
	) as unknown as Lesson[];

	let index = $state(0);
	let lastScore = $state<number | null>(null);
	let resetCount = $state(0);

	const lesson = $derived(lessons[Math.min(index, lessons.length - 1)]);

	function pick(i: number) {
		index = i;
		lastScore = null;
		resetCount += 1;
	}
</script>

<div class="p-6">
	<div class="mx-auto mb-4 flex max-w-xl flex-wrap items-center justify-center gap-2">
		{#each lessons as l, i (l.id)}
			<button
				class="rounded-full border px-3 py-2 text-xs"
				class:bg-blue-600={index === i}
				class:text-white={index === i}
				onclick={() => pick(i)}
			>
				{l.lessonKey}
			</button>
		{/each}
	</div>

	{#if lastScore !== null}
		<p class="mx-auto mb-4 max-w-xl text-center text-sm font-semibold text-green-700" role="status">
			Ολοκληρώθηκε — σκορ: {lastScore}
		</p>
	{/if}

	{#key `${lesson.id}-${resetCount}`}
		<MacSimLesson {lesson} onComplete={(score) => (lastScore = score)} onBack={() => pick(index)} />
	{/key}
</div>
