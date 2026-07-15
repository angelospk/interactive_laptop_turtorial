<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Wifi from '@lucide/svelte/icons/wifi';
	import Type from '@lucide/svelte/icons/type';
	import Check from '@lucide/svelte/icons/check';
	import Moon from '@lucide/svelte/icons/moon';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import { cn } from '$lib/utils';

	/**
	 * Settings mini-app: font size + Wi-Fi + night light + find-device (the
	 * highest-value senior settings per the curricula research). Semantic events:
	 *   mobile-font-size-set   { size: 'small'|'medium'|'large' }
	 *   mobile-wifi-connected  { ssid }
	 *   mobile-night-mode-set  { on }
	 *   mobile-find-device-set { on }
	 */
	let {
		onEvent,
		wifiNetworks = []
	}: {
		onEvent: (action: string, data?: Record<string, unknown>) => void;
		wifiNetworks?: string[];
	} = $props();

	type SettingsPage = 'root' | 'font' | 'wifi' | 'night' | 'find';
	let page: SettingsPage = $state('root');
	let fontSize: 'small' | 'medium' | 'large' = $state('medium');
	let connectedSsid: string | null = $state(null);
	let nightOn = $state(false);
	let findOn = $state(false);

	const SIZES = [
		{ id: 'small', label: 'Μικρά', sample: 'text-sm' },
		{ id: 'medium', label: 'Μεσαία', sample: 'text-base' },
		{ id: 'large', label: 'Μεγάλα', sample: 'text-xl' }
	] as const;

	const TITLES: Record<SettingsPage, string> = {
		root: 'Ρυθμίσεις',
		font: 'Μέγεθος γραμμάτων',
		wifi: 'Wi-Fi',
		night: 'Νυχτερινή λειτουργία',
		find: 'Εύρεση συσκευής'
	};

	function setSize(size: 'small' | 'medium' | 'large') {
		fontSize = size;
		onEvent('mobile-font-size-set', { size });
	}

	function connect(ssid: string) {
		connectedSsid = ssid;
		onEvent('mobile-wifi-connected', { ssid });
	}

	function toggleNight() {
		nightOn = !nightOn;
		onEvent('mobile-night-mode-set', { on: nightOn });
	}

	function toggleFind() {
		findOn = !findOn;
		onEvent('mobile-find-device-set', { on: findOn });
	}
</script>

<div data-testid="mobile-settings-app" class="flex h-full flex-col bg-slate-50">
	<header
		class="flex shrink-0 items-center gap-1 bg-slate-100 px-2 py-2 text-sm font-semibold text-slate-700"
	>
		{#if page !== 'root'}
			<button
				type="button"
				onclick={() => (page = 'root')}
				aria-label="Πίσω στις Ρυθμίσεις"
				class="flex h-9 w-9 items-center justify-center rounded-full focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
			>
				<ChevronLeft class="h-5 w-5" aria-hidden="true" />
			</button>
		{/if}
		<span class="flex-1 text-center">{TITLES[page]}</span>
		{#if page !== 'root'}<span class="w-9"></span>{/if}
	</header>

	{#if page === 'root'}
		<ul class="mt-2 divide-y divide-slate-200 bg-white">
			<li>
				<button
					type="button"
					onclick={() => (page = 'font')}
					class="flex w-full min-h-[56px] items-center gap-3 px-4 py-3 text-left transition active:bg-slate-50 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
				>
					<span class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
						<Type class="h-5 w-5" aria-hidden="true" />
					</span>
					<span class="flex-1 text-base font-medium text-slate-900">Μέγεθος γραμμάτων</span>
					<ChevronRight class="h-5 w-5 text-slate-400" aria-hidden="true" />
				</button>
			</li>
			<li>
				<button
					type="button"
					onclick={() => (page = 'wifi')}
					class="flex w-full min-h-[56px] items-center gap-3 px-4 py-3 text-left transition active:bg-slate-50 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
				>
					<span
						class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"
					>
						<Wifi class="h-5 w-5" aria-hidden="true" />
					</span>
					<span class="flex-1 text-base font-medium text-slate-900">Wi-Fi</span>
					<span class="text-sm text-slate-500">{connectedSsid ?? 'Χωρίς σύνδεση'}</span>
					<ChevronRight class="h-5 w-5 text-slate-400" aria-hidden="true" />
				</button>
			</li>
			<li>
				<button
					type="button"
					onclick={() => (page = 'night')}
					class="flex w-full min-h-[56px] items-center gap-3 px-4 py-3 text-left transition active:bg-slate-50 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
				>
					<span class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
						<Moon class="h-5 w-5" aria-hidden="true" />
					</span>
					<span class="flex-1 text-base font-medium text-slate-900">Νυχτερινή λειτουργία</span>
					<span class="text-sm text-slate-500">{nightOn ? 'Ανοιχτή' : 'Κλειστή'}</span>
					<ChevronRight class="h-5 w-5 text-slate-400" aria-hidden="true" />
				</button>
			</li>
			<li>
				<button
					type="button"
					onclick={() => (page = 'find')}
					class="flex w-full min-h-[56px] items-center gap-3 px-4 py-3 text-left transition active:bg-slate-50 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
				>
					<span class="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
						<MapPin class="h-5 w-5" aria-hidden="true" />
					</span>
					<span class="flex-1 text-base font-medium text-slate-900">Εύρεση συσκευής</span>
					<span class="text-sm text-slate-500">{findOn ? 'Ενεργή' : 'Ανενεργή'}</span>
					<ChevronRight class="h-5 w-5 text-slate-400" aria-hidden="true" />
				</button>
			</li>
		</ul>
	{:else if page === 'font'}
		<div class="mt-2 space-y-2 bg-white p-4">
			<p class={cn('rounded-lg bg-slate-100 p-3 text-slate-700', SIZES.find((s) => s.id === fontSize)?.sample)}>
				Έτσι θα φαίνονται τα γράμματα.
			</p>
			{#each SIZES as size (size.id)}
				<button
					type="button"
					onclick={() => setSize(size.id)}
					aria-pressed={fontSize === size.id}
					class={cn(
						'flex w-full min-h-[52px] items-center justify-between rounded-xl border px-4 py-3 text-left transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none',
						fontSize === size.id
							? 'border-blue-600 bg-blue-50 text-blue-800'
							: 'border-slate-200 bg-white text-slate-900'
					)}
				>
					<span class={cn('font-medium', size.sample)}>{size.label}</span>
					{#if fontSize === size.id}
						<Check class="h-5 w-5 text-blue-700" aria-hidden="true" />
					{/if}
				</button>
			{/each}
		</div>
	{:else if page === 'wifi'}
		<ul class="mt-2 divide-y divide-slate-200 bg-white">
			{#each wifiNetworks as ssid (ssid)}
				<li>
					<button
						type="button"
						onclick={() => connect(ssid)}
						aria-label={`Σύνδεση στο δίκτυο ${ssid}`}
						class="flex w-full min-h-[52px] items-center gap-3 px-4 py-3 text-left transition active:bg-slate-50 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
					>
						<Wifi class="h-5 w-5 text-slate-500" aria-hidden="true" />
						<span class="flex-1 text-base font-medium text-slate-900">{ssid}</span>
						{#if connectedSsid === ssid}
							<span class="flex items-center gap-1 text-sm font-medium text-emerald-700">
								<Check class="h-4 w-4" aria-hidden="true" /> Συνδέθηκε
							</span>
						{/if}
					</button>
				</li>
			{/each}
		</ul>
	{:else if page === 'night'}
		{@render togglePage(
			'Νυχτερινή λειτουργία',
			'Ζεσταίνει τα χρώματα το βράδυ για να ξεκουράζονται τα μάτια σου.',
			nightOn,
			toggleNight
		)}
	{:else}
		{@render togglePage(
			'Εύρεση συσκευής',
			'Αν χαθεί το κινητό, μπορείς να το βρεις από άλλη συσκευή. Καλό είναι να είναι ενεργή.',
			findOn,
			toggleFind
		)}
	{/if}
</div>

{#snippet togglePage(label: string, desc: string, on: boolean, toggle: () => void)}
	<div class="mt-2 space-y-4 bg-white p-4">
		<div class="flex items-center justify-between rounded-xl border border-slate-200 p-4">
			<span class="text-base font-medium text-slate-900">{label}</span>
			<button
				type="button"
				role="switch"
				aria-checked={on}
				aria-label={label}
				onclick={toggle}
				class={cn(
					'relative h-8 w-14 rounded-full transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none',
					on ? 'bg-emerald-500' : 'bg-slate-300'
				)}
			>
				<span
					class={cn(
						'absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all',
						on ? 'left-7' : 'left-1'
					)}
				></span>
			</button>
		</div>
		<p class="text-sm text-slate-600">{desc}</p>
	</div>
{/snippet}
