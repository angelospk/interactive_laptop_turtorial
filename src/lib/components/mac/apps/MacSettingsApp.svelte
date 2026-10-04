<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import Check from '@lucide/svelte/icons/check';
	import { cn } from '$lib/utils';
	import { MacState, type MacSize } from '../macState.svelte';

	/**
	 * macOS System Settings: the sidebar of panes on the left, the selected pane
	 * on the right. Accessibility (the pane the lessons use) has the text-size and
	 * pointer-size controls; picking a size emits
	 * `mac-size-changed{setting:'text'|'pointer', size}` — the only lesson event
	 * here. Wi-Fi, Bluetooth, Displays, Appearance and Sound change the same
	 * machine state the menu bar's Control Center shows. The remaining panes
	 * explain that they are not part of the exercise.
	 */
	let { onEvent, machine = new MacState() } = $props<{
		onEvent: (action: string, data?: Record<string, unknown>) => void;
		machine?: MacState;
	}>();

	const SIZES: { id: MacSize; label: string; px: string }[] = [
		{ id: 'small', label: 'Μικρά', px: 'text-sm' },
		{ id: 'medium', label: 'Κανονικά', px: 'text-base' },
		{ id: 'large', label: 'Μεγάλα', px: 'text-2xl' }
	];

	const POINTER_SIZES: { id: MacSize; label: string; px: number }[] = [
		{ id: 'small', label: 'Μικρός', px: 20 },
		{ id: 'medium', label: 'Κανονικός', px: 28 },
		{ id: 'large', label: 'Μεγάλος', px: 44 }
	];

	function pick(size: MacSize) {
		machine.textSize = size;
		onEvent('mac-size-changed', { setting: 'text', size });
	}

	function pickPointer(size: MacSize) {
		machine.pointerSize = size;
		onEvent('mac-size-changed', { setting: 'pointer', size });
	}

	const pointerPx = $derived(POINTER_SIZES.find((s) => s.id === machine.pointerSize)?.px ?? 28);

	// Sidebar in the real order (abridged). `live` panes work; the rest explain.
	const PANES: { id: string; label: string; icon: string; tint: string; live?: boolean }[] = [
		{ id: 'wifi', label: 'Wi-Fi', icon: '📶', tint: 'bg-blue-500', live: true },
		{ id: 'bluetooth', label: 'Bluetooth', icon: '🔵', tint: 'bg-blue-500', live: true },
		{ id: 'network', label: 'Δίκτυο', icon: '🌐', tint: 'bg-blue-500' },
		{ id: 'notifications', label: 'Γνωστοποιήσεις', icon: '🔔', tint: 'bg-red-500' },
		{ id: 'sound', label: 'Ήχος', icon: '🔊', tint: 'bg-red-500', live: true },
		{ id: 'general', label: 'Γενικά', icon: '⚙️', tint: 'bg-neutral-500' },
		{ id: 'appearance', label: 'Εμφάνιση', icon: '🎨', tint: 'bg-neutral-800', live: true },
		{ id: 'accessibility', label: 'Προσβασιμότητα', icon: '♿', tint: 'bg-blue-600', live: true },
		{ id: 'displays', label: 'Οθόνες', icon: '🖥️', tint: 'bg-sky-500', live: true },
		{ id: 'wallpaper', label: 'Ταπετσαρία', icon: '🌄', tint: 'bg-cyan-500' },
		{ id: 'privacy', label: 'Απόρρητο & Ασφάλεια', icon: '🤚', tint: 'bg-blue-600' }
	];

	let query = $state('');
	const fold = (t: string) => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
	const visiblePanes = $derived(
		query.trim() ? PANES.filter((p) => fold(p.label).includes(fold(query.trim()))) : PANES
	);
	const current = $derived(PANES.find((p) => p.id === machine.settingsSection) ?? PANES[7]);

	const row =
		'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0a60ff]';
	const switchClass = (on: boolean) =>
		cn(
			'relative h-6 w-10 shrink-0 rounded-full transition-colors',
			on ? 'bg-[#34c759]' : 'bg-neutral-300'
		);
	const knob = (on: boolean) =>
		cn(
			'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
			on ? 'left-[18px]' : 'left-0.5'
		);
</script>

<div
	class="flex h-full min-h-64 [font-family:-apple-system,system-ui,sans-serif] text-[13px]"
	data-testid="mac-settings"
>
	<!-- Sidebar -->
	<nav
		class="flex w-48 shrink-0 flex-col border-r border-black/10 bg-[#f1f0f0]/90"
		aria-label="Κατηγορίες ρυθμίσεων"
	>
		<label
			class="m-2 flex h-8 items-center gap-1.5 rounded-md border border-black/10 bg-white px-2 focus-within:ring-2 focus-within:ring-[#0a60ff]"
		>
			<Search class="h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
			<input
				type="search"
				bind:value={query}
				placeholder="Αναζήτηση"
				aria-label="Αναζήτηση ρυθμίσεων"
				class="w-full min-w-0 bg-transparent outline-none placeholder:text-neutral-400"
			/>
		</label>
		<div class="flex items-center gap-2 px-3 py-2">
			<span
				class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-sky-300 to-indigo-400 text-lg"
				aria-hidden="true">🙂</span
			>
			<span class="min-w-0"
				><span class="block truncate font-semibold">Μαθητής</span><span
					class="block text-[11px] text-neutral-500">Λογαριασμός Apple</span
				></span
			>
		</div>
		<ul class="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
			{#each visiblePanes as pane (pane.id)}
				<li>
					<button
						type="button"
						class={cn(
							'flex min-h-8 w-full items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#0a60ff] focus-visible:outline-none',
							machine.settingsSection === pane.id && 'bg-[#0a60ff] text-white hover:bg-[#0a60ff]'
						)}
						aria-current={machine.settingsSection === pane.id ? 'page' : undefined}
						onclick={() => (machine.settingsSection = pane.id)}
					>
						<span
							class={cn(
								'flex h-6 w-6 items-center justify-center rounded-md text-xs text-white',
								pane.tint
							)}
							aria-hidden="true">{pane.icon}</span
						>
						<span class="truncate">{pane.label}</span>
					</button>
				</li>
			{:else}
				<li class="px-2 py-3 text-xs text-neutral-500">Καμία ρύθμιση για «{query.trim()}».</li>
			{/each}
		</ul>
	</nav>

	<!-- Pane -->
	<section class="min-w-0 flex-1 overflow-y-auto bg-[#f6f6f6]" aria-labelledby="mac-pane-title">
		<h3 id="mac-pane-title" class="px-6 pt-5 pb-3 text-lg font-bold text-neutral-800">
			{current.label}
		</h3>

		{#if current.id === 'accessibility'}
			<div class="space-y-4 px-6 pb-6">
				<div class="rounded-xl border border-black/10 bg-white">
					<p class="px-4 pt-3 text-[11px] font-semibold text-neutral-500">
						Οθόνη · Μέγεθος κειμένου
					</p>
					<p class="px-4 pb-1 text-xs text-neutral-500">
						Διάλεξε πόσο μεγάλα θα φαίνονται τα γράμματα.
					</p>
					<fieldset class="divide-y divide-black/5">
						<legend class="sr-only">Μέγεθος κειμένου</legend>
						{#each SIZES as size (size.id)}
							<button
								type="button"
								class={row}
								aria-pressed={machine.textSize === size.id}
								onclick={() => pick(size.id)}
							>
								<span class={cn(size.px, 'font-medium text-neutral-800')}>{size.label}</span>
								{#if machine.textSize === size.id}<Check
										class="h-4 w-4 text-[#0a60ff]"
										aria-hidden="true"
									/>{/if}
							</button>
						{/each}
					</fieldset>
					<p
						class={cn(
							'm-4 rounded-lg bg-neutral-100 p-3 text-neutral-700',
							SIZES.find((s) => s.id === machine.textSize)?.px
						)}
					>
						Παράδειγμα: Καλημέρα! Έτσι θα φαίνονται τα γράμματα.
					</p>
				</div>

				<div class="rounded-xl border border-black/10 bg-white">
					<p class="px-4 pt-3 text-[11px] font-semibold text-neutral-500">
						Δείκτης · Μέγεθος δείκτη (ποντικιού)
					</p>
					<p class="px-4 pb-1 text-xs text-neutral-500">
						Διάλεξε πόσο μεγάλο θα είναι το βελάκι του ποντικιού.
					</p>
					<fieldset class="divide-y divide-black/5">
						<legend class="sr-only">Μέγεθος δείκτη ποντικιού</legend>
						{#each POINTER_SIZES as size (size.id)}
							<button
								type="button"
								class={row}
								aria-pressed={machine.pointerSize === size.id}
								onclick={() => pickPointer(size.id)}
							>
								<span class="flex items-center gap-3 font-medium text-neutral-800">
									<svg
										viewBox="0 0 24 24"
										width={size.px}
										height={size.px}
										aria-hidden="true"
										class="shrink-0"
									>
										<path
											d="M5 3l14 10-6 1 3 6-3 1.5-3-6-5 4z"
											fill="white"
											stroke="black"
											stroke-width="1.5"
											stroke-linejoin="round"
										/>
									</svg>
									{size.label}
								</span>
								{#if machine.pointerSize === size.id}<Check
										class="h-4 w-4 text-[#0a60ff]"
										aria-hidden="true"
									/>{/if}
							</button>
						{/each}
					</fieldset>
					<div class="m-4 flex items-center gap-3 rounded-lg bg-neutral-100 p-3 text-neutral-700">
						<svg
							viewBox="0 0 24 24"
							width={pointerPx}
							height={pointerPx}
							aria-hidden="true"
							class="shrink-0 transition-all"
						>
							<path
								d="M5 3l14 10-6 1 3 6-3 1.5-3-6-5 4z"
								fill="white"
								stroke="black"
								stroke-width="1.5"
								stroke-linejoin="round"
							/>
						</svg>
						<span>Έτσι θα φαίνεται ο δείκτης του ποντικιού.</span>
					</div>
				</div>
			</div>
		{:else if current.id === 'wifi'}
			<div class="space-y-4 px-6 pb-6">
				<div class="rounded-xl border border-black/10 bg-white">
					<div class={row}>
						<span class="font-medium">Wi-Fi</span>
						<button
							type="button"
							role="switch"
							aria-checked={machine.wifiOn}
							aria-label="Wi-Fi ενεργό"
							class={switchClass(machine.wifiOn)}
							onclick={() => machine.setWifi(!machine.wifiOn)}
							><span class={knob(machine.wifiOn)}></span></button
						>
					</div>
				</div>
				{#if machine.wifiOn}
					<div class="rounded-xl border border-black/10 bg-white">
						<p class="px-4 pt-3 text-[11px] font-semibold text-neutral-500">Γνωστά δίκτυα</p>
						<ul class="divide-y divide-black/5">
							{#each machine.networks as ssid (ssid)}
								{@const on = machine.connectedSsid === ssid}
								<li>
									<button
										type="button"
										class={row}
										onclick={() => machine.connect(ssid)}
										aria-label={on ? `${ssid} (συνδεδεμένο)` : `Σύνδεση στο δίκτυο ${ssid}`}
									>
										<span class="flex items-center gap-2"
											><span aria-hidden="true">📶</span>{ssid}</span
										>
										{#if on}<span class="flex items-center gap-1 text-xs text-[#0a60ff]"
												><Check class="h-4 w-4" aria-hidden="true" /> Συνδεδεμένο</span
											>{/if}
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{:else}
					<p class="text-xs text-neutral-500">
						Το Wi-Fi είναι κλειστό. Άνοιξέ το για να δεις τα δίκτυα.
					</p>
				{/if}
			</div>
		{:else if current.id === 'bluetooth'}
			<div class="px-6 pb-6">
				<div class="rounded-xl border border-black/10 bg-white">
					<div class={row}>
						<span
							><span class="block font-medium">Bluetooth</span><span
								class="block text-xs text-neutral-500"
								>{machine.bluetoothOn ? 'Ενεργό · Ορατό ως «Mac Μαθητή»' : 'Κλειστό'}</span
							></span
						>
						<button
							type="button"
							role="switch"
							aria-checked={machine.bluetoothOn}
							aria-label="Bluetooth"
							class={switchClass(machine.bluetoothOn)}
							onclick={() => (machine.bluetoothOn = !machine.bluetoothOn)}
							><span class={knob(machine.bluetoothOn)}></span></button
						>
					</div>
				</div>
			</div>
		{:else if current.id === 'displays'}
			<div class="px-6 pb-6">
				<label class="block rounded-xl border border-black/10 bg-white px-4 py-3">
					<span class="flex items-center justify-between font-medium"
						><span>Φωτεινότητα</span><span class="text-neutral-500 tabular-nums"
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
						class="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-[#0a60ff]"
					/>
					<span class="mt-1 block text-xs text-neutral-500"
						>Η οθόνη σκουραίνει όσο κατεβάζεις τον διακόπτη.</span
					>
				</label>
			</div>
		{:else if current.id === 'sound'}
			<div class="px-6 pb-6">
				<label class="block rounded-xl border border-black/10 bg-white px-4 py-3">
					<span class="flex items-center justify-between font-medium"
						><span>Ένταση εξόδου</span><span class="text-neutral-500 tabular-nums"
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
						class="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-[#0a60ff]"
					/>
				</label>
			</div>
		{:else if current.id === 'appearance'}
			<div class="px-6 pb-6">
				<div class="rounded-xl border border-black/10 bg-white p-4">
					<p class="mb-3 font-medium">Εμφάνιση</p>
					<div class="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Εμφάνιση">
						{#each [{ id: 'light', label: 'Φωτεινή', bg: 'bg-white' }, { id: 'dark', label: 'Σκοτεινή', bg: 'bg-neutral-800' }] as opt (opt.id)}
							<button
								type="button"
								role="radio"
								aria-checked={machine.appearance === opt.id}
								class={cn(
									'flex flex-col items-center gap-2 rounded-lg border-2 p-3 focus-visible:ring-2 focus-visible:ring-[#0a60ff] focus-visible:outline-none',
									machine.appearance === opt.id ? 'border-[#0a60ff]' : 'border-black/10'
								)}
								onclick={() => (machine.appearance = opt.id as 'light' | 'dark')}
							>
								<span
									class={cn('h-12 w-20 rounded-md border border-black/10', opt.bg)}
									aria-hidden="true"
								></span>
								<span class="text-xs">{opt.label}</span>
							</button>
						{/each}
					</div>
					<p class="mt-3 text-xs text-neutral-500">Η επιφάνεια εργασίας αλλάζει αμέσως χρώμα.</p>
				</div>
			</div>
		{:else}
			<div class="px-6 pb-6">
				<div class="rounded-xl border border-black/10 bg-white p-4 text-neutral-600">
					<p class="font-medium text-neutral-800">{current.label}</p>
					<p class="mt-1 text-xs">
						Αυτή η κατηγορία υπάρχει σε κάθε Mac, αλλά δεν περιλαμβάνεται σε αυτή την άσκηση.
						Διάλεξε «Προσβασιμότητα» για το μάθημα.
					</p>
				</div>
			</div>
		{/if}
	</section>
</div>
