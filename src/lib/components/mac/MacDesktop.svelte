<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	/**
	 * The Mac desktop shell: wallpaper + rounded bezel. The menu bar, Dock, windows
	 * and Spotlight are placed inside by the lesson (MacSimLesson), the same way
	 * Desktop.svelte hosts the Windows chrome. `brightness` (from the host-owned
	 * machine state) dims the whole screen like the real brightness keys do.
	 */
	let {
		children,
		brightness = 100,
		dark = false,
		class: className
	} = $props<{
		children?: Snippet;
		/** 10–100; anything below 100 draws a dim layer over the screen. */
		brightness?: number;
		/** System appearance: tints the wallpaper darker. */
		dark?: boolean;
		class?: string;
	}>();

	const dim = $derived(Math.min(0.75, (100 - brightness) / 100));
</script>

<div
	class={cn(
		// Sized by its container, not by a fixed 600px: the lesson shell now hands the
		// simulation whatever height the screen has, and a hardcoded height either
		// wasted it or pushed the Dock below the fold.
		'relative h-full max-h-full min-h-[18rem] w-full overflow-hidden rounded-xl border-4 border-slate-800 [font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif] shadow-2xl select-none',
		dark
			? 'bg-[linear-gradient(160deg,#1b1b3a_0%,#2a1e4f_45%,#0f2b4e_100%)]'
			: 'bg-[linear-gradient(160deg,#f6a0b5_0%,#c76fb8_30%,#6d5fd0_60%,#3a7bd5_100%)]',
		className
	)}
	data-mac-desktop
>
	<!-- Sonoma-style wallpaper: soft colour fields with two light blooms -->
	<div
		class="pointer-events-none absolute inset-0"
		aria-hidden="true"
		style="background:
			radial-gradient(ellipse 60% 50% at 20% 25%, rgba(255,255,255,0.35), transparent 60%),
			radial-gradient(ellipse 50% 60% at 80% 85%, rgba(255,210,120,0.35), transparent 60%),
			radial-gradient(ellipse 40% 40% at 60% 40%, rgba(255,255,255,0.15), transparent 70%);"
	></div>

	{@render children?.()}

	{#if dim > 0}
		<div
			class="pointer-events-none absolute inset-0 z-[60] bg-black"
			style:opacity={dim}
			data-brightness-dim
			aria-hidden="true"
		></div>
	{/if}
</div>
