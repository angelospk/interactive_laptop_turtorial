<script lang="ts">
	import { cn } from '$lib/utils';
	import { onDestroy, type Snippet } from 'svelte';
	import Wifi from '@lucide/svelte/icons/wifi';
	import Plane from '@lucide/svelte/icons/plane';
	import SignalHigh from '@lucide/svelte/icons/signal-high';
	import Flashlight from '@lucide/svelte/icons/flashlight';
	import type { PhoneState } from './phoneState.svelte';

	/**
	 * Phone-screen simulation frame — the mobile counterpart of Desktop.svelte.
	 * Wraps interactive mobile-lesson content in a realistic phone bezel so
	 * Android/iPhone lessons can be practised the same way desktop ones are
	 * (ROADMAP Φάση 2.5). Android: status bar with the time on the left and the
	 * signal/Wi-Fi/battery cluster on the right, a gesture pill at the bottom.
	 * iPhone: Dynamic Island, bold time left, icons right, home indicator.
	 *
	 * The chrome is presentational, except that when the lesson hands over its
	 * `phone` state the status bar reflects it (Wi-Fi off, airplane mode, torch,
	 * battery) and the screen dims with the brightness slider.
	 */
	let {
		children,
		variant = 'android',
		time = '9:41',
		phone,
		onHome,
		onRecents,
		showSystemButtons = false,
		onSystemChord,
		onPullDown,
		class: className
	}: {
		children?: Snippet;
		/** Subtle chrome differences between the two mobile tracks. */
		variant?: 'android' | 'ios';
		/** Status-bar clock text. */
		time?: string;
		/** Host-owned phone state; the status bar and the dim layer read it. */
		phone?: PhoneState;
		/**
		 * When provided, the home indicator becomes a real "go home" button
		 * (used by goal-driven simulations); otherwise it stays decorative.
		 */
		onHome?: () => void;
		/** When provided, adds a «recent apps» button next to the home indicator. */
		onRecents?: () => void;
		/** Show the physical Power/Volume buttons on the bezel (screenshot lesson). */
		showSystemButtons?: boolean;
		/**
		 * Emitted when two hardware buttons are pressed "together" (canonical
		 * sorted `a+b` id, e.g. `power+volume-down`). MobileFrame stays
		 * presentational: it knows nothing about goals — the lesson decides what a
		 * chord means for the current platform.
		 */
		onSystemChord?: (chord: string) => void;
		/**
		 * When provided, the status bar becomes the «pull down» handle for quick
		 * settings: a downward swipe or a plain tap (senior-friendly) opens them.
		 */
		onPullDown?: () => void;
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

	let pullStartY: number | null = null;
	// A swipe already opened the panel; swallow the click that follows the pointerup.
	let swiped = false;

	// Status bar truth from the phone state (defaults: everything on, battery full).
	const wifiOn = $derived(phone ? phone.wifiOn : true);
	const airplane = $derived(phone ? phone.airplaneMode : false);
	const torch = $derived(phone ? phone.torchOn : false);
	const battery = $derived(phone ? phone.batteryPercent : 100);
	const dim = $derived(phone ? Math.min(0.75, (100 - phone.brightness) / 100) : 0);
	const pullLabel = $derived(isIos ? 'Κέντρο ελέγχου' : 'Γρήγορες ρυθμίσεις');
</script>

<div
	data-testid="mobile-frame"
	data-variant={variant}
	class={cn(
		'relative mx-auto flex aspect-[9/19.5] w-full max-w-[22rem] flex-col overflow-hidden bg-white shadow-2xl select-none',
		// iOS has more rounded corners and a thin titanium-like rim; Android is slightly squarer.
		isIos
			? 'rounded-[2.75rem] border-[10px] border-[#2b2b2e] ring-1 ring-[#6b6b70]'
			: 'rounded-[2rem] border-8 border-[#111216] ring-1 ring-[#3a3b40]',
		isIos
			? '[font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif]'
			: '[font-family:Roboto,system-ui,sans-serif]',
		className
	)}
	role="group"
	aria-label={isIos ? 'Προσομοίωση οθόνης iPhone' : 'Προσομοίωση οθόνης Android'}
>
	{#if showSystemButtons}
		<!-- Physical bezel buttons (screenshot lesson). Recognisable placement,
		     not photorealistic: volume on the left edge, power on the right. -->
		{#snippet bezelButton(id: string, extra: string)}
			<!-- Wide transparent hit area (≥24px, senior-friendly) with a narrow
			     visual bar inside, so the bezel still looks slim. -->
			<button
				type="button"
				data-testid={`bezel-${id}`}
				data-armed={armed === id}
				onclick={() => pressButton(id)}
				aria-label={BUTTON_LABEL[id]}
				aria-pressed={armed === id}
				class={cn(
					'absolute z-20 flex w-7 items-center justify-center rounded-md focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none',
					extra
				)}
			>
				<span
					aria-hidden="true"
					class={cn(
						'h-full w-2.5 rounded-full bg-slate-700 shadow-md transition',
						armed === id && 'bg-emerald-400 ring-2 ring-emerald-300'
					)}
				></span>
			</button>
		{/snippet}
		{@render bezelButton('volume-up', 'left-0 top-[26%] h-12')}
		{@render bezelButton('volume-down', 'left-0 top-[40%] h-12')}
		{@render bezelButton('power', 'right-0 top-[30%] h-16')}
	{/if}

	<!-- Status bar (also the quick-settings pull-down handle when onPullDown is set) -->
	{#snippet statusContent()}
		<span
			class={cn('tabular-nums', isIos ? 'pl-2 text-[15px] font-semibold' : 'text-xs font-medium')}
			>{time}</span
		>
		{#if isIos}
			<!-- Dynamic Island -->
			<span
				aria-hidden="true"
				class="absolute top-1.5 left-1/2 h-[26px] w-[7.25rem] -translate-x-1/2 rounded-full bg-black"
			></span>
		{/if}
		<span class="flex items-center gap-1.5" data-testid="mobile-status-icons">
			{#if torch}
				<Flashlight class="h-3.5 w-3.5 text-amber-500" aria-hidden="true" data-status="torch" />
			{/if}
			{#if airplane}
				<Plane class="h-3.5 w-3.5" aria-hidden="true" data-status="airplane" />
			{:else}
				<SignalHigh class="h-3.5 w-3.5" aria-hidden="true" />
				{#if wifiOn}
					<Wifi class="h-3.5 w-3.5" aria-hidden="true" data-status="wifi" />
				{/if}
			{/if}
			{#if !isIos}
				<span class="text-[11px] tabular-nums" aria-hidden="true">{battery}%</span>
			{/if}
			<!-- Battery glyph: level proportional -->
			<span
				class={cn(
					'relative inline-block rounded-[3px] border border-current',
					isIos ? 'h-[12px] w-[25px]' : 'h-[11px] w-[20px]'
				)}
				aria-label={`Μπαταρία ${battery}%`}
				role="img"
			>
				<span
					class={cn(
						'absolute inset-y-[1px] left-[1px] rounded-[1px]',
						battery < 20 ? 'bg-red-500' : 'bg-current'
					)}
					style:width={`${Math.max(2, Math.round((isIos ? 21 : 16) * (battery / 100)))}px`}
				></span>
			</span>
		</span>
	{/snippet}
	{#if onPullDown}
		<button
			type="button"
			aria-label={pullLabel}
			data-testid="mobile-statusbar"
			onclick={() => {
				if (swiped) {
					swiped = false;
					return;
				}
				onPullDown?.();
			}}
			onpointerdown={(e) => {
				// Capture so the release still reaches us after the finger slides down off the bar.
				e.currentTarget.setPointerCapture(e.pointerId);
				pullStartY = e.clientY;
			}}
			onpointerup={(e) => {
				swiped = pullStartY !== null && e.clientY - pullStartY > 20;
				if (swiped) onPullDown?.();
				pullStartY = null;
			}}
			class={cn(
				'relative z-10 flex w-full shrink-0 cursor-grab touch-none items-center justify-between bg-transparent px-5 text-slate-900',
				isIos ? 'h-11 pt-1' : 'h-8'
			)}
			title={isIos
				? 'Σύρε προς τα κάτω για το Κέντρο ελέγχου'
				: 'Σύρε προς τα κάτω για τις γρήγορες ρυθμίσεις'}
		>
			{@render statusContent()}
		</button>
	{:else}
		<div
			data-testid="mobile-statusbar"
			class={cn(
				'relative z-10 flex shrink-0 items-center justify-between bg-transparent px-5 text-slate-900',
				isIos ? 'h-11 pt-1' : 'h-8'
			)}
		>
			{@render statusContent()}
		</div>
	{/if}

	<!-- Screen content. -mt pulls it under the status bar so wallpapers run edge to edge. -->
	<div
		data-testid="mobile-screen"
		class={cn('relative flex-1 overflow-y-auto bg-slate-50', isIos ? '-mt-11 pt-11' : '-mt-8 pt-8')}
	>
		{@render children?.()}
	</div>

	<!-- Home indicator (iOS bar) / gesture pill (Android) -->
	<div class="relative z-10 flex h-8 shrink-0 items-center justify-center bg-white">
		{#if onRecents}
			<button
				type="button"
				data-testid="mobile-recents-button"
				onclick={onRecents}
				aria-label="Πρόσφατες εφαρμογές"
				class="absolute right-2 flex h-11 w-11 items-center justify-center rounded-md focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
			>
				<span
					aria-hidden="true"
					class="h-5 w-5 rounded-[3px] border-2 border-slate-700/80 bg-white/40"
				></span>
			</button>
		{/if}
		{#if onHome}
			<button
				type="button"
				onclick={onHome}
				aria-label="Αρχική οθόνη"
				class="flex min-h-11 items-center justify-center px-6 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
			>
				<span
					data-testid="mobile-home-indicator"
					class={cn('rounded-full bg-slate-900/80', isIos ? 'h-[5px] w-32' : 'h-1 w-24')}
				></span>
			</button>
		{:else}
			<span
				data-testid="mobile-home-indicator"
				class={cn('rounded-full bg-slate-900/80', isIos ? 'h-[5px] w-32' : 'h-1 w-24')}
			></span>
		{/if}
	</div>

	<!-- Brightness: dims everything inside the bezel, never blocks taps. -->
	{#if dim > 0}
		<div
			class="pointer-events-none absolute inset-0 z-40 bg-black"
			style:opacity={dim}
			data-brightness-dim
			aria-hidden="true"
		></div>
	{/if}
</div>
