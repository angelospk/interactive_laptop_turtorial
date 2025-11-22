<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { Lesson } from '$lib/db/schema';

	let { lesson, onComplete } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
	}>();

	let folderOpen = $state(false);

	function handleDoubleClick() {
		if (!folderOpen) {
			folderOpen = true;
			toast.success('Lesson Completed!');
			onComplete(100);
		}
	}
</script>

<div
	class="flex min-h-[250px] flex-col items-center justify-center rounded-md border border-slate-200 bg-slate-50 p-12"
>
	<div
		class="cursor-pointer transition-transform duration-200 select-none hover:scale-105 active:scale-95"
		ondblclick={handleDoubleClick}
		title="Double click here"
		role="button"
		tabindex="0"
	>
		<span class="mb-4 block text-8xl drop-shadow-sm filter">
			{folderOpen ? '📂' : '📁'}
		</span>
	</div>

	<p class="font-medium text-slate-600">
		{folderOpen ? 'Folder Opened!' : 'Double-click the folder to open it.'}
	</p>

	{#if folderOpen}
		<div class="mt-4 animate-in font-bold text-green-600 fade-in slide-in-from-bottom-2">
			Success!
		</div>
	{/if}
</div>
