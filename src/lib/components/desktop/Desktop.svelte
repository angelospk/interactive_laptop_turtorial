<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import { osState } from '$lib/osState.svelte';

	/**
	 * The Windows 11 screen: wallpaper, the windows/menus the lesson places inside,
	 * and two full-screen tints driven by the shared machine state — a dim layer
	 * for the brightness slider and a warm layer for night light — so a toggle in
	 * Quick Settings visibly changes the screen the learner is looking at.
	 *
	 * The wallpaper is pure CSS (no network image): the lesson must look the same
	 * offline and in tests.
	 */
	let {
		children,
		backgroundUrl,
		onBackgroundClick,
		class: className
	} = $props<{
		children?: Snippet;
		/** Optional photo; without it the Win11-style "bloom" gradient is used. */
		backgroundUrl?: string;
		/** A click on the bare wallpaper (windows/menus stop propagation) — closes menus, like Windows. */
		onBackgroundClick?: () => void;
		class?: string;
	}>();

	// Brightness 100 → no dimming; 0 → still readable (never fully black).
	const dim = $derived(Math.min(0.75, (100 - osState.brightness) / 100));
</script>

<!-- the wallpaper is a click-outside surface, not a control; menus have their own close paths -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	class={cn(
		'relative h-full min-h-[22rem] w-full overflow-hidden rounded-lg border-4 border-slate-800 shadow-2xl select-none',
		'bg-[#0b3b8c] bg-cover bg-center [font-family:Segoe_UI,system-ui,sans-serif]',
		className
	)}
	style={backgroundUrl ? `background-image: url('${backgroundUrl}')` : ''}
	onclick={() => onBackgroundClick?.()}
	data-desktop
>
	{#if !backgroundUrl}
		<!-- Win11 "Bloom": a blue field with a soft light flower in the lower middle. -->
		<div
			class="pointer-events-none absolute inset-0"
			aria-hidden="true"
			style="background:
				radial-gradient(ellipse 55% 45% at 50% 70%, rgba(132,196,255,0.95) 0%, rgba(84,146,235,0.55) 35%, transparent 70%),
				radial-gradient(ellipse 35% 30% at 42% 62%, rgba(255,255,255,0.45) 0%, transparent 60%),
				radial-gradient(ellipse 40% 35% at 62% 78%, rgba(173,216,255,0.6) 0%, transparent 65%),
				linear-gradient(180deg, #0a2a6b 0%, #0c3f9b 45%, #0f55c4 100%);"
		></div>
		<div
			class="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
			aria-hidden="true"
			style="background-image: repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 7px);"
		></div>
	{/if}

	{@render children?.()}

	<!-- Machine-state tints: above the windows, below nothing clickable. -->
	{#if osState.nightLight}
		<div
			class="pointer-events-none absolute inset-0 z-[60] bg-amber-400/25 mix-blend-multiply"
			data-night-light
			aria-hidden="true"
		></div>
	{/if}
	{#if dim > 0}
		<div
			class="pointer-events-none absolute inset-0 z-[60] bg-black"
			style:opacity={dim}
			data-brightness-dim
			aria-hidden="true"
		></div>
	{/if}
</div>
