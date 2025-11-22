<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { Lesson } from '$lib/db/schema';
	import * as ContextMenu from '$lib/components/ui/context-menu';

	let { lesson, onComplete } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
	}>();

	let completed = $state(false);

	function handleRightClick() {
		if (!completed) {
			completed = true;
			toast.success('Lesson Completed!');
			onComplete(100);
		}
	}
</script>

<div
	class="flex min-h-[250px] flex-col items-center justify-center rounded-md border border-slate-200 bg-slate-50 p-12"
>
	<ContextMenu.Root>
		<ContextMenu.Trigger>
			<div
				class="flex h-64 w-64 cursor-context-menu flex-col items-center justify-center rounded-lg border-2 border-amber-200 bg-amber-100 transition-colors hover:bg-amber-200"
				oncontextmenu={() => {
					handleRightClick();
				}}
			>
				<span class="mb-4 text-6xl">🍎</span>
				<p class="font-bold text-amber-900">Right-click the apple!</p>
			</div>
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.Item>Eat me</ContextMenu.Item>
			<ContextMenu.Item>Properties</ContextMenu.Item>
		</ContextMenu.Content>
	</ContextMenu.Root>

	{#if completed}
		<div class="mt-4 animate-in font-bold text-green-600 fade-in slide-in-from-bottom-2">
			Success! You found the hidden menu.
		</div>
	{/if}
</div>
