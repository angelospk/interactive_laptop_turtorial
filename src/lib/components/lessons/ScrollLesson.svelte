<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { Lesson } from '$lib/db/schema';

	let { lesson, onComplete } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
	}>();

	let completed = $state(false);

	function handleScroll(e: Event) {
		const target = e.currentTarget as HTMLElement;
		// Check if scrolled to the bottom (with some tolerance)
		if (Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 5) {
			if (!completed) {
				completed = true;
				toast.success('Lesson Completed!');
				onComplete(100);
			}
		}
	}
</script>

<div class="flex flex-col gap-4 p-4">
	<div
		class="h-64 overflow-y-scroll rounded-md border-2 border-slate-200 bg-slate-50 p-8 text-center shadow-inner"
		onscroll={handleScroll}
		tabindex="0"
		role="region"
		aria-label="Scrollable content"
	>
		<p class="mb-8 text-lg font-medium text-slate-700">Scroll down to find the secret code...</p>

		<div class="space-y-12 text-slate-400">
			<p>Keep scrolling...</p>
			<p>Almost there...</p>
			<p>Just a bit more...</p>
			<p>You're doing great!</p>
			<p>Nearly at the bottom...</p>
		</div>

		<div class="mt-12 rounded border border-slate-200 bg-white p-4 shadow">
			<p class="text-xl font-bold text-green-600">Secret Code: SVELTE-MASTERY</p>
		</div>
	</div>

	{#if completed}
		<div class="animate-in text-center font-bold text-green-600 fade-in slide-in-from-bottom-2">
			You reached the bottom!
		</div>
	{/if}
</div>
