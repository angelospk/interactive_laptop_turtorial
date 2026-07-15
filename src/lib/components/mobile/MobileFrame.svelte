<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import Wifi from '@lucide/svelte/icons/wifi';
	import SignalHigh from '@lucide/svelte/icons/signal-high';
	import BatteryFull from '@lucide/svelte/icons/battery-full';

	/**
	 * Phone-screen simulation frame — the mobile counterpart of Desktop.svelte.
	 * Wraps interactive mobile-lesson content in a realistic phone bezel so
	 * Android/iPhone lessons can be practised the same way desktop ones are
	 * (ROADMAP Φάση 2.5). Presentational only: the status bar / home indicator
	 * are decorative chrome; lesson content renders inside {children}.
	 */
	let {
		children,
		variant = 'android',
		time = '9:41',
		onHome,
		class: className
	}: {
		children?: Snippet;
		/** Subtle chrome differences between the two mobile tracks. */
		variant?: 'android' | 'ios';
		/** Status-bar clock text. */
		time?: string;
		/**
		 * When provided, the home indicator becomes a real "go home" button
		 * (used by goal-driven simulations); otherwise it stays decorative.
		 */
		onHome?: () => void;
		class?: string;
	} = $props();

	const isIos = $derived(variant === 'ios');
</script>

<div
	data-testid="mobile-frame"
	data-variant={variant}
	class={cn(
		'relative mx-auto flex aspect-[9/19.5] w-full max-w-[22rem] flex-col overflow-hidden bg-white shadow-2xl select-none',
		// iOS has more rounded corners; Android is slightly squarer.
		isIos ? 'rounded-[2.75rem] border-[10px]' : 'rounded-[2rem] border-8',
		'border-slate-900',
		className
	)}
	role="group"
	aria-label={isIos ? 'Προσομοίωση οθόνης iPhone' : 'Προσομοίωση οθόνης Android'}
>
	<!-- Status bar -->
	<div
		data-testid="mobile-statusbar"
		class="flex shrink-0 items-center justify-between bg-white px-5 pt-2 pb-1 text-xs font-semibold text-slate-900"
	>
		<span class="tabular-nums">{time}</span>
		{#if isIos}
			<!-- iOS notch -->
			<span
				aria-hidden="true"
				class="absolute left-1/2 top-0 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-slate-900"
			></span>
		{/if}
		<span class="flex items-center gap-1.5">
			<SignalHigh class="h-3.5 w-3.5" aria-hidden="true" />
			<Wifi class="h-3.5 w-3.5" aria-hidden="true" />
			<BatteryFull class="h-4 w-4" aria-hidden="true" />
		</span>
	</div>

	<!-- Screen content -->
	<div data-testid="mobile-screen" class="relative flex-1 overflow-y-auto bg-slate-50">
		{@render children?.()}
	</div>

	<!-- Home indicator (iOS bar) / gesture pill (Android) -->
	<div class="flex shrink-0 items-center justify-center bg-white py-2">
		{#if onHome}
			<button
				type="button"
				onclick={onHome}
				aria-label="Αρχική οθόνη"
				class="flex min-h-[28px] items-center justify-center px-6 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
			>
				<span
					data-testid="mobile-home-indicator"
					class={cn('rounded-full bg-slate-900/80', isIos ? 'h-1 w-32' : 'h-1 w-24')}
				></span>
			</button>
		{:else}
			<span
				data-testid="mobile-home-indicator"
				class={cn('rounded-full bg-slate-900/80', isIos ? 'h-1 w-32' : 'h-1 w-24')}
			></span>
		{/if}
	</div>
</div>
