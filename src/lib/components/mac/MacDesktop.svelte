<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	/**
	 * The Mac desktop shell: wallpaper + rounded bezel. The menu bar, Dock, windows
	 * and Spotlight are placed inside by the lesson (MacSimLesson), the same way
	 * Desktop.svelte hosts the Windows chrome.
	 */
	let { children, class: className } = $props<{
		children?: Snippet;
		class?: string;
	}>();
</script>

<div
	class={cn(
		'relative h-[600px] w-full overflow-hidden rounded-xl border-4 border-slate-800 bg-gradient-to-br from-sky-400 via-indigo-400 to-purple-500 shadow-2xl select-none',
		className
	)}
>
	<!-- soft wallpaper glow -->
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_45%)]"
		aria-hidden="true"
	></div>
	{@render children?.()}
</div>
