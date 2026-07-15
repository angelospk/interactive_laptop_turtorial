<script lang="ts">
	import { cn } from '$lib/utils';
	import { onDestroy, type Snippet } from 'svelte';
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
		showSystemButtons = false,
		onSystemChord,
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
		/** Show the physical Power/Volume buttons on the bezel (screenshot lesson). */
		showSystemButtons?: boolean;
		/**
		 * Emitted when two hardware buttons are pressed "together" (canonical
		 * sorted `a+b` id, e.g. `power+volume-down`). MobileFrame stays
		 * presentational: it knows nothing about goals — the lesson decides what a
		 * chord means for the current platform.
		 */
		onSystemChord?: (chord: string) => void;
		class?: string;
	} = $props();

	const isIos = $derived(variant === 'ios');

	// Senior-friendly chord: pressing one button "arms" it for a short window;
	// pressing a *different* button while armed counts as pressing both together.
	// This teaches the combination without demanding true simultaneous multitouch
	// on tiny bezel controls, and works with a keyboard (they are real buttons).
	const CHORD_WINDOW_MS = 1500;
	let armed: string | null = $state(null);
	let armTimer: ReturnType<typeof setTimeout> | undefined;
	onDestroy(() => clearTimeout(armTimer));

	function pressButton(id: string) {
		if (armed && armed !== id) {
			const chord = [armed, id].sort().join('+');
			clearTimeout(armTimer);
			armed = null;
			onSystemChord?.(chord);
			return;
		}
		// (Re-)arm this button and start the window.
		armed = id;
		clearTimeout(armTimer);
		armTimer = setTimeout(() => (armed = null), CHORD_WINDOW_MS);
	}

	const BUTTON_LABEL = $derived<Record<string, string>>({
		power: isIos ? 'Πλαϊνό κουμπί' : 'Κουμπί λειτουργίας',
		'volume-up': 'Ένταση πάνω',
		'volume-down': 'Ένταση κάτω'
	});
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
	{#if showSystemButtons}
		<!-- Physical bezel buttons (screenshot lesson). Recognisable placement,
		     not photorealistic: volume on the left edge, power on the right. -->
		{#snippet bezelButton(id: string, extra: string)}
			<button
				type="button"
				data-testid={`bezel-${id}`}
				data-armed={armed === id}
				onclick={() => pressButton(id)}
				aria-label={BUTTON_LABEL[id]}
				aria-pressed={armed === id}
				class={cn(
					'absolute z-20 w-2.5 rounded-full bg-slate-700 shadow-md transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none',
					armed === id && 'bg-emerald-400 ring-2 ring-emerald-300',
					extra
				)}
			></button>
		{/snippet}
		{@render bezelButton('volume-up', 'left-0 top-[26%] h-12')}
		{@render bezelButton('volume-down', 'left-0 top-[40%] h-12')}
		{@render bezelButton('power', 'right-0 top-[30%] h-16')}
	{/if}

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
