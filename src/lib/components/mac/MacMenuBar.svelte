<script lang="ts">
	import Wifi from '@lucide/svelte/icons/wifi';
	import WifiOff from '@lucide/svelte/icons/wifi-off';
	import Search from '@lucide/svelte/icons/search';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import Bluetooth from '@lucide/svelte/icons/bluetooth';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import Check from '@lucide/svelte/icons/check';
	import { cn } from '$lib/utils';
	import type { MacState } from './macState.svelte';

	/**
	 * The macOS menu bar (top strip). Left: the Apple menu, the frontmost app's
	 * name menu (its «Τερματισμός» item is the reliable way to fully quit — ⌘Q is
	 * often intercepted by the host browser, codex plan review) and the standard
	 * File/Edit/View/Window/Help menus. Right: Wi-Fi, battery, Spotlight, Control
	 * Center and the clock. Wi-Fi and Control Center read and write the lesson's
	 * machine state, so what is toggled here is also what System Settings shows.
	 */
	let {
		activeLabel,
		canQuit = false,
		onQuit,
		onSpotlight,
		onOpenSettings,
		clock,
		machine,
		disabled = false
	} = $props<{
		activeLabel: string;
		canQuit?: boolean;
		onQuit: () => void;
		onSpotlight: () => void;
		/** Apple menu → «Ρυθμίσεις συστήματος…»; undefined when the lesson has no Settings app. */
		onOpenSettings?: () => void;
		/** Fixed clock text; by default the real time, formatted the macOS way. */
		clock?: string;
		machine?: MacState;
		disabled?: boolean;
	}>();

	type Menu = 'apple' | 'app' | 'file' | 'edit' | 'view' | 'window' | 'help' | 'wifi' | 'control';
	let open = $state<Menu | null>(null);
	// Inline explanation for menu items that exist on a real Mac but do nothing here.
	let notice = $state('');

	function toggle(menu: Menu) {
		open = open === menu ? null : menu;
	}
	function closeAll() {
		open = null;
	}
	function explain(text: string) {
		notice = text;
		closeAll();
	}
	function quit() {
		closeAll();
		onQuit();
	}

	// Live clock, macOS style: «Τρί 4 Οκτ 10:09».
	let now = $state(new Date());
	$effect(() => {
		const t = setInterval(() => (now = new Date()), 30000);
		return () => clearInterval(t);
	});
	const clockText = $derived(
		clock ??
			`${now.toLocaleDateString('el-GR', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '')} ${now.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}`
	);

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) closeAll();
	}

	const STANDARD_MENUS: { id: Menu; label: string; items: string[] }[] = [
		{ id: 'file', label: 'Αρχείο', items: ['Νέο παράθυρο', 'Άνοιγμα…', 'Κλείσιμο παραθύρου'] },
		{ id: 'edit', label: 'Επεξεργασία', items: ['Αναίρεση', 'Αποκοπή', 'Αντιγραφή', 'Επικόλληση'] },
		{
			id: 'view',
			label: 'Προβολή',
			items: ['ως Εικονίδια', 'ως Λίστα', 'Εμφάνιση πλαϊνής στήλης']
		},
		{ id: 'window', label: 'Παράθυρο', items: ['Ελαχιστοποίηση', 'Ζουμ'] },
		{ id: 'help', label: 'Βοήθεια', items: ['Βοήθεια macOS'] }
	];

	const menuItem =
		'flex w-full items-center justify-between gap-6 rounded-md px-3 py-1.5 text-left text-[13px] hover:bg-[#0a60ff] hover:text-white focus-visible:bg-[#0a60ff] focus-visible:text-white focus-visible:outline-none disabled:cursor-not-allowed disabled:text-neutral-400 disabled:hover:bg-transparent disabled:hover:text-neutral-400';
	const dropdown =
		'absolute top-7 left-0 z-30 min-w-56 rounded-lg border border-black/10 bg-white/95 p-1 text-neutral-800 shadow-2xl backdrop-blur';
	const barButton =
		'flex h-7 items-center gap-1 rounded px-2 text-[13px] hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-60';
</script>

<svelte:window onkeydown={onKeydown} />

<div
	class="absolute inset-x-0 top-0 z-20 flex h-8 items-center justify-between bg-white/25 px-2 text-sm text-white shadow-[0_1px_0_rgba(0,0,0,0.08)] backdrop-blur-md [text-shadow:0_0_2px_rgba(0,0,0,0.35)]"
	role="menubar"
	aria-label="Γραμμή μενού"
	data-mac-menubar
>
	<div class="flex items-center gap-0.5">
		<!-- Apple menu -->
		<div class="relative">
			<button
				type="button"
				{disabled}
				class={cn(barButton, 'px-2.5 text-base leading-none', open === 'apple' && 'bg-white/25')}
				aria-label="Μενού Apple"
				aria-haspopup="menu"
				aria-expanded={open === 'apple'}
				onclick={() => toggle('apple')}
			>
				<!-- Vector apple: the  private-use glyph renders blank on Windows/Linux. -->
				<svg viewBox="0 0 24 24" class="h-4 w-4 fill-current" aria-hidden="true">
					<path
						d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.1.8 1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.6 1.3-2.7 0 0-2.7-1-2.7-4.1zM14.1 5.8c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z"
					/>
				</svg>
			</button>
			{#if open === 'apple'}
				<div class={dropdown} role="menu" aria-label="Μενού Apple">
					<button
						type="button"
						role="menuitem"
						class={menuItem}
						onclick={() =>
							explain('Σχετικά με αυτό το Mac: εδώ βλέπεις το μοντέλο και την έκδοση του macOS.')}
					>
						Σχετικά με αυτό το Mac
					</button>
					<div class="my-1 h-px bg-black/10"></div>
					<button
						type="button"
						role="menuitem"
						class={menuItem}
						disabled={!onOpenSettings}
						onclick={() => {
							closeAll();
							onOpenSettings?.();
						}}
					>
						Ρυθμίσεις συστήματος…
					</button>
					{#if !onOpenSettings}
						<p class="px-3 pb-1 text-[11px] text-neutral-500">
							Δεν περιλαμβάνεται σε αυτή την άσκηση.
						</p>
					{/if}
					<button
						type="button"
						role="menuitem"
						class={menuItem}
						onclick={() =>
							explain(
								'App Store: από εδώ κατεβάζεις προγράμματα. Δεν χρειάζεται σε αυτό το μάθημα.'
							)}
					>
						App Store…
					</button>
					<div class="my-1 h-px bg-black/10"></div>
					{#each ['Ύπνος', 'Επανεκκίνηση…', 'Τερματισμός λειτουργίας…'] as item (item)}
						<button
							type="button"
							role="menuitem"
							class={menuItem}
							onclick={() =>
								explain(`«${item}»: στην εξάσκηση το Mac δεν σβήνει, για να συνεχίσεις το μάθημα.`)}
						>
							{item}
						</button>
					{/each}
					<div class="my-1 h-px bg-black/10"></div>
					<button
						type="button"
						role="menuitem"
						class={menuItem}
						onclick={() =>
							explain('Κλείδωμα οθόνης: κρύβει την οθόνη μέχρι να βάλεις τον κωδικό σου.')}
					>
						<span>Κλείδωμα οθόνης</span><span class="text-xs opacity-60">⌃⌘Q</span>
					</button>
				</div>
			{/if}
		</div>

		<!-- App menu (owned by the frontmost app) -->
		<div class="relative">
			<button
				type="button"
				{disabled}
				class={cn(barButton, 'font-bold', open === 'app' && 'bg-white/25')}
				aria-haspopup="menu"
				aria-expanded={open === 'app'}
				onclick={() => toggle('app')}
			>
				{activeLabel}
			</button>
			{#if open === 'app'}
				<div class={dropdown} role="menu">
					<button
						type="button"
						role="menuitem"
						class={menuItem}
						onclick={() =>
							explain(`Σχετικά με το «${activeLabel}»: έκδοση και πληροφορίες του προγράμματος.`)}
					>
						Σχετικά με το «{activeLabel}»
					</button>
					<div class="my-1 h-px bg-black/10"></div>
					<button
						type="button"
						role="menuitem"
						class={menuItem}
						onclick={() =>
							explain('Ρυθμίσεις του προγράμματος. Δεν χρειάζονται σε αυτό το μάθημα.')}
					>
						<span>Ρυθμίσεις…</span><span class="text-xs opacity-60">⌘,</span>
					</button>
					<div class="my-1 h-px bg-black/10"></div>
					<button type="button" role="menuitem" disabled={!canQuit} class={menuItem} onclick={quit}>
						<span>Τερματισμός «{activeLabel}»</span>
						<span class="text-xs opacity-60" aria-hidden="true">⌘Q</span>
					</button>
					{#if !canQuit}
						<p class="px-3 pb-1 text-[11px] text-neutral-500">
							Το Finder τρέχει πάντα, δεν τερματίζεται.
						</p>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Standard menus: shown as on a real Mac, items explain themselves -->
		{#each STANDARD_MENUS as menu (menu.id)}
			<div class="relative hidden sm:block">
				<button
					type="button"
					{disabled}
					class={cn(barButton, open === menu.id && 'bg-white/25')}
					aria-haspopup="menu"
					aria-expanded={open === menu.id}
					onclick={() => toggle(menu.id)}
				>
					{menu.label}
				</button>
				{#if open === menu.id}
					<div class={dropdown} role="menu" aria-label={menu.label}>
						{#each menu.items as item (item)}
							<button
								type="button"
								role="menuitem"
								class={menuItem}
								onclick={() =>
									explain(`«${menu.label} › ${item}»: δεν χρησιμοποιείται σε αυτή την άσκηση.`)}
							>
								{item}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<div class="flex items-center gap-0.5">
		{#if notice}
			<p
				class="absolute inset-x-2 top-full mt-2 rounded-lg bg-slate-900/95 p-3 text-left text-sm leading-relaxed whitespace-normal text-white shadow-lg"
				role="status"
				aria-live="polite"
			>
				{notice}
			</p>
		{/if}

		<!-- Wi-Fi -->
		{#if machine}
			<div class="relative">
				<button
					type="button"
					{disabled}
					class={cn(barButton, 'w-8 justify-center px-0', open === 'wifi' && 'bg-white/25')}
					aria-label={machine.wifiOn
						? `Wi-Fi: ${machine.connectedSsid ?? 'χωρίς σύνδεση'}`
						: 'Wi-Fi: κλειστό'}
					aria-haspopup="dialog"
					aria-expanded={open === 'wifi'}
					data-wifi={machine.wifiOn ? 'on' : 'off'}
					onclick={() => toggle('wifi')}
				>
					{#if machine.wifiOn}<Wifi class="h-4 w-4" />{:else}<WifiOff
							class="h-4 w-4 opacity-70"
						/>{/if}
				</button>
				{#if open === 'wifi'}
					<div
						class="absolute top-8 right-0 z-30 w-64 rounded-xl border border-black/10 bg-white/95 p-2 text-neutral-800 shadow-2xl backdrop-blur [text-shadow:none]"
						role="dialog"
						aria-label="Wi-Fi"
						tabindex="-1"
					>
						<div class="flex items-center justify-between px-2 py-1">
							<span class="text-sm font-semibold">Wi-Fi</span>
							<button
								type="button"
								role="switch"
								aria-checked={machine.wifiOn}
								aria-label="Wi-Fi ενεργό"
								class={cn(
									'relative h-5 w-9 rounded-full transition-colors',
									machine.wifiOn ? 'bg-[#0a60ff]' : 'bg-neutral-300'
								)}
								onclick={() => machine.setWifi(!machine.wifiOn)}
							>
								<span
									class={cn(
										'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
										machine.wifiOn ? 'left-[18px]' : 'left-0.5'
									)}
								></span>
							</button>
						</div>
						{#if machine.wifiOn}
							<p class="px-2 pt-1 text-[11px] font-semibold text-neutral-500">Γνωστά δίκτυα</p>
							{#each machine.networks as ssid (ssid)}
								{@const on = machine.connectedSsid === ssid}
								<button
									type="button"
									class={cn(menuItem, 'justify-start gap-2')}
									onclick={() => machine.connect(ssid)}
									aria-label={on ? `${ssid} (συνδεδεμένο)` : `Σύνδεση στο δίκτυο ${ssid}`}
								>
									<span
										class={cn(
											'flex h-5 w-5 items-center justify-center rounded-full',
											on ? 'bg-[#0a60ff] text-white' : 'bg-neutral-200 text-neutral-600'
										)}
									>
										{#if on}<Check class="h-3 w-3" />{:else}<Wifi class="h-3 w-3" />{/if}
									</span>
									{ssid}
								</button>
							{/each}
						{:else}
							<p class="px-2 py-2 text-xs text-neutral-500">Το Wi-Fi είναι κλειστό.</p>
						{/if}
					</div>
				{/if}
			</div>
			<span
				class="hidden items-center gap-1 px-1 text-xs tabular-nums sm:flex"
				aria-label={`Μπαταρία ${machine.batteryPercent}%`}
			>
				{machine.batteryPercent}%
				<span
					class="relative inline-block h-[11px] w-[22px] rounded-[3px] border border-white/80"
					aria-hidden="true"
				>
					<span
						class="absolute inset-y-[1px] left-[1px] rounded-[1px] bg-white/90"
						style:width={`${Math.round(machine.batteryPercent * 0.18)}px`}
					></span>
				</span>
			</span>
		{/if}

		<!-- Spotlight -->
		<button
			type="button"
			{disabled}
			aria-label="Spotlight αναζήτηση"
			title="Spotlight (αναζήτηση)"
			class="flex h-11 min-w-11 items-center justify-center rounded px-2 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none disabled:opacity-60"
			onclick={() => {
				closeAll();
				onSpotlight();
			}}
		>
			<Search class="h-4 w-4" />
		</button>

		<!-- Control Center -->
		{#if machine}
			<div class="relative">
				<button
					type="button"
					{disabled}
					class={cn(barButton, 'w-8 justify-center px-0', open === 'control' && 'bg-white/25')}
					aria-label="Κέντρο ελέγχου"
					aria-haspopup="dialog"
					aria-expanded={open === 'control'}
					onclick={() => toggle('control')}
				>
					<SlidersHorizontal class="h-4 w-4" />
				</button>
				{#if open === 'control'}
					<div
						class="absolute top-8 right-0 z-30 w-72 space-y-2 rounded-2xl border border-black/10 bg-neutral-100/95 p-2.5 text-neutral-800 shadow-2xl backdrop-blur [text-shadow:none]"
						role="dialog"
						aria-label="Κέντρο ελέγχου"
						tabindex="-1"
						data-testid="mac-control-center"
					>
						<div class="grid grid-cols-2 gap-2">
							<div class="space-y-1 rounded-xl bg-white p-2 shadow-sm">
								{#snippet ccToggle(
									label: string,
									on: boolean,
									Icon: typeof Wifi,
									click: () => void,
									sub?: string
								)}
									<button
										type="button"
										role="switch"
										aria-checked={on}
										aria-label={label}
										class="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#0a60ff] focus-visible:outline-none"
										onclick={click}
									>
										<span
											class={cn(
												'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
												on ? 'bg-[#0a60ff] text-white' : 'bg-neutral-300 text-neutral-600'
											)}
										>
											<Icon class="h-3.5 w-3.5" />
										</span>
										<span class="min-w-0 flex-1">
											<span class="block text-xs font-semibold">{label}</span>
											{#if sub}<span class="block truncate text-[10px] text-neutral-500">{sub}</span
												>{/if}
										</span>
									</button>
								{/snippet}
								{@render ccToggle(
									'Wi-Fi',
									machine.wifiOn,
									Wifi,
									() => machine.setWifi(!machine.wifiOn),
									machine.wifiOn ? (machine.connectedSsid ?? 'Χωρίς σύνδεση') : 'Κλειστό'
								)}
								{@render ccToggle(
									'Bluetooth',
									machine.bluetoothOn,
									Bluetooth,
									() => (machine.bluetoothOn = !machine.bluetoothOn),
									machine.bluetoothOn ? 'Ενεργό' : 'Κλειστό'
								)}
								{@render ccToggle(
									'AirDrop',
									machine.airdropOn,
									Volume2,
									() => (machine.airdropOn = !machine.airdropOn),
									machine.airdropOn ? 'Μόνο επαφές' : 'Κλειστό'
								)}
							</div>
							<div class="flex flex-col gap-2">
								<button
									type="button"
									role="switch"
									aria-checked={machine.focusOn}
									aria-label="Συγκέντρωση"
									class="flex flex-1 items-center gap-2 rounded-xl bg-white p-2 text-left shadow-sm hover:bg-white/80 focus-visible:ring-2 focus-visible:ring-[#0a60ff] focus-visible:outline-none"
									onclick={() => (machine.focusOn = !machine.focusOn)}
								>
									<span
										class={cn(
											'flex h-7 w-7 items-center justify-center rounded-full',
											machine.focusOn
												? 'bg-indigo-500 text-white'
												: 'bg-neutral-300 text-neutral-600'
										)}><Moon class="h-3.5 w-3.5" /></span
									>
									<span class="text-xs font-semibold"
										>Συγκέντρωση<span class="block text-[10px] font-normal text-neutral-500"
											>{machine.focusOn ? 'Μην ενοχλείτε' : 'Κλειστή'}</span
										></span
									>
								</button>
								<button
									type="button"
									aria-pressed={machine.appearance === 'dark'}
									aria-label="Σκοτεινή εμφάνιση"
									class="flex flex-1 items-center gap-2 rounded-xl bg-white p-2 text-left shadow-sm hover:bg-white/80 focus-visible:ring-2 focus-visible:ring-[#0a60ff] focus-visible:outline-none"
									onclick={() =>
										(machine.appearance = machine.appearance === 'dark' ? 'light' : 'dark')}
								>
									<span
										class={cn(
											'flex h-7 w-7 items-center justify-center rounded-full',
											machine.appearance === 'dark'
												? 'bg-neutral-800 text-white'
												: 'bg-neutral-300 text-neutral-600'
										)}><Sun class="h-3.5 w-3.5" /></span
									>
									<span class="text-xs font-semibold"
										>Εμφάνιση<span class="block text-[10px] font-normal text-neutral-500"
											>{machine.appearance === 'dark' ? 'Σκοτεινή' : 'Φωτεινή'}</span
										></span
									>
								</button>
							</div>
						</div>
						<label class="block rounded-xl bg-white p-2 shadow-sm">
							<span class="flex items-center justify-between text-xs font-semibold"
								><span>Οθόνη</span><span class="text-neutral-500 tabular-nums"
									>{machine.brightness}%</span
								></span
							>
							<input
								type="range"
								min="10"
								max="100"
								value={machine.brightness}
								oninput={(e) => (machine.brightness = Number(e.currentTarget.value))}
								aria-label="Φωτεινότητα οθόνης"
								class="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-[#0a60ff]"
							/>
						</label>
						<label class="block rounded-xl bg-white p-2 shadow-sm">
							<span class="flex items-center justify-between text-xs font-semibold"
								><span>Ήχος</span><span class="text-neutral-500 tabular-nums"
									>{machine.volume}%</span
								></span
							>
							<input
								type="range"
								min="0"
								max="100"
								value={machine.volume}
								oninput={(e) => (machine.volume = Number(e.currentTarget.value))}
								aria-label="Ένταση ήχου"
								class="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-[#0a60ff]"
							/>
						</label>
					</div>
				{/if}
			</div>
		{/if}

		<span class="px-2 text-[13px] tabular-nums" aria-label="Ώρα">{clockText}</span>
	</div>
</div>
