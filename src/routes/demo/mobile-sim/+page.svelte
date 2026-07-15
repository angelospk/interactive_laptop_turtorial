<script lang="ts">
	import MobileSimLesson from '$lib/components/lessons/interactive/MobileSimLesson.svelte';
	import { buildMobileTrackLessons } from '$lib/db/seeds/mobile-track';
	import type { Lesson } from '$lib/db/schema';

	/**
	 * Dev playground for the mobile simulator (no DB involved): renders every
	 * builder lesson for both variants, with a picker. Not linked anywhere.
	 */
	const android = buildMobileTrackLessons('android') as unknown as Lesson[];
	const ios = buildMobileTrackLessons('ios') as unknown as Lesson[];

	let variant: 'android' | 'ios' = $state('android');
	let index = $state(0);

	const lessons = $derived(variant === 'android' ? android : ios);
	const lesson = $derived(lessons[Math.min(index, lessons.length - 1)]);
	const noop = () => {};
</script>

<div class="p-6">
	<div class="mx-auto mb-4 flex max-w-xl flex-wrap items-center justify-center gap-2">
		{#each ['android', 'ios'] as v (v)}
			<button
				class="rounded-full border px-4 py-2 text-sm font-semibold"
				class:bg-slate-900={variant === v}
				class:text-white={variant === v}
				onclick={() => (variant = v as typeof variant)}
			>
				{v}
			</button>
		{/each}
		{#each lessons as l, i (l.id)}
			<button
				class="rounded-full border px-3 py-2 text-xs"
				class:bg-blue-600={index === i}
				class:text-white={index === i}
				onclick={() => (index = i)}
			>
				{l.lessonKey}
			</button>
		{/each}
	</div>

	{#key lesson.id}
		<MobileSimLesson {lesson} onComplete={noop} onBack={noop} />
	{/key}
</div>
