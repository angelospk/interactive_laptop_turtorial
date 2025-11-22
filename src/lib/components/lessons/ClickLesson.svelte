<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { Lesson } from '$lib/db/schema';
	import { Button } from '$lib/components/ui/button';

	let { lesson, onComplete } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
	}>();

	let config = $derived(
		(lesson.config as { targetCount: number; timeLimit: number }) || {
			targetCount: 5,
			timeLimit: 30
		}
	);

	let targets = $state<{ id: string; active: boolean }[]>([]);

	function initGame() {
		targets = Array(config.targetCount)
			.fill(0)
			.map(() => ({
				id: crypto.randomUUID(),
				active: true
			}));
	}

	onMount(initGame);

	function handleClick(id: string) {
		const target = targets.find((t) => t.id === id);
		if (target && target.active) {
			target.active = false;
			checkCompletion();
		}
	}

	function checkCompletion() {
		if (targets.every((t) => !t.active)) {
			toast.success('Lesson Completed!');
			onComplete(100);
		}
	}
</script>

<div
	class="flex min-h-[200px] flex-wrap items-center justify-center gap-4 rounded-md border border-slate-200 bg-slate-50 p-8"
>
	{#each targets as target}
		{#if target.active}
			<Button onclick={() => handleClick(target.id)} class="animate-in duration-300 zoom-in">
				Click Me!
			</Button>
		{/if}
	{/each}

	{#if targets.length > 0 && targets.every((t) => !t.active)}
		<div class="animate-in text-xl font-bold text-green-600 fade-in slide-in-from-bottom-4">
			Great Job!
		</div>
	{/if}
</div>

<div class="mt-4 text-center text-sm text-slate-600">
	Click all the buttons to complete the lesson.
</div>
