<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Wifi from '@lucide/svelte/icons/wifi';
	import Type from '@lucide/svelte/icons/type';
	import Check from '@lucide/svelte/icons/check';
	import Moon from '@lucide/svelte/icons/moon';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Bluetooth from '@lucide/svelte/icons/bluetooth';
	import Bell from '@lucide/svelte/icons/bell';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import Sun from '@lucide/svelte/icons/sun';
	import Search from '@lucide/svelte/icons/search';
	import Lock from '@lucide/svelte/icons/lock';
	import { cn } from '$lib/utils';
	import { PhoneState, type PhoneFontSize } from '../phoneState.svelte';

	/**
	 * Settings mini-app: font size + Wi-Fi + night light + find-device (the
	 * highest-value senior settings per the curricula research), plus the
	 * everyday rows a real Settings app has (Bluetooth, sound, display,
	 * notifications…) so the list looks like the phone in the learner's pocket.
	 * Android: a search bar and a flat list with coloured icons. iPhone: grouped
	 * inset lists. Semantic events (unchanged):
	 *   mobile-font-size-set   { size: 'small'|'medium'|'large' }
	 *   mobile-wifi-connected  { ssid }
	 *   mobile-night-mode-set  { on }
	 *   mobile-find-device-set { on }
	 * Values live in the host-owned phone state so they survive leaving the app.
	 */
	let {
		onEvent,
		wifiNetworks = [],
		variant = 'android',
		phone = new PhoneState()
	}: {
		onEvent: (action: string, data?: Record<string, unknown>) => void;
		wifiNetworks?: string[];
		variant?: 'android' | 'ios';
		phone?: PhoneState;
	} = $props();

	const isIos = $derived(variant === 'ios');

	type SettingsPage =
		| 'root'
		| 'font'
		| 'wifi'
		| 'night'
		| 'find'
		| 'bluetooth'
		| 'sound'
		| 'display'
		| 'other';
	let page = $state<SettingsPage>('root');
	let otherTitle = $state('');

	const SIZES: { id: PhoneFontSize; label: string; sample: string }[] = [
		{ id: 'small', label: 'Μικρά', sample: 'text-sm' },
		{ id: 'medium', label: 'Μεσαία', sample: 'text-base' },
		{ id: 'large', label: 'Μεγάλα', sample: 'text-xl' }
	];

	const TITLES: Record<SettingsPage, string> = {
		root: 'Ρυθμίσεις',
		font: 'Μέγεθος γραμμάτων',
		wifi: 'Wi-Fi',
		night: 'Νυχτερινή λειτουργία',
		find: 'Εύρεση συσκευής',
		bluetooth: 'Bluetooth',
		sound: 'Ήχος και δόνηση',
		display: 'Οθόνη',
		other: ''
	};
	const title = $derived(page === 'other' ? otherTitle : TITLES[page]);

	function setSize(size: PhoneFontSize) {
		phone.fontSize = size;
		onEvent('mobile-font-size-set', { size });
	}

	function connect(ssid: string) {
		phone.connect(ssid);
		onEvent('mobile-wifi-connected', { ssid });
	}

	function toggleNight() {
		phone.nightMode = !phone.nightMode;
		onEvent('mobile-night-mode-set', { on: phone.nightMode });
	}

	function toggleFind() {
		phone.findDevice = !phone.findDevice;
		onEvent('mobile-find-device-set', { on: phone.findDevice });
	}

	function openOther(label: string) {
		otherTitle = label;
		page = 'other';
	}

	// Rows in the order a real phone lists them; `live` rows open a working page.
	const ROWS = $derived([
		{
			id: 'wifi',
			label: 'Wi-Fi',
			icon: Wifi,
			tint: 'bg-blue-500',
			value: phone.wifiOn ? (phone.connectedSsid ?? 'Χωρίς σύνδεση') : 'Κλειστό',
			go: () => (page = 'wifi')
		},
		{
			id: 'bluetooth',
			label: 'Bluetooth',
			icon: Bluetooth,
			tint: 'bg-blue-600',
			value: phone.bluetoothOn ? 'Ενεργό' : 'Κλειστό',
			go: () => (page = 'bluetooth')
		},
		{
			id: 'sound',
			label: 'Ήχος και δόνηση',
			icon: Volume2,
			tint: 'bg-rose-500',
			value: `${phone.volume}%`,
			go: () => (page = 'sound')
		},
		{
			id: 'display',
			label: 'Οθόνη',
			icon: Sun,
			tint: 'bg-sky-500',
			value: `${phone.brightness}%`,
			go: () => (page = 'display')
		},
		{
			id: 'font',
			label: 'Μέγεθος γραμμάτων',
			icon: Type,
			tint: 'bg-indigo-500',
			value: SIZES.find((s) => s.id === phone.fontSize)?.label ?? '',
			go: () => (page = 'font')
		},
		{
			id: 'night',
			label: 'Νυχτερινή λειτουργία',
			icon: Moon,
			tint: 'bg-violet-600',
			value: phone.nightMode ? 'Ανοιχτή' : 'Κλειστή',
			go: () => (page = 'night')
		},
		{
			id: 'find',
			label: 'Εύρεση συσκευής',
			icon: MapPin,
			tint: 'bg-emerald-600',
			value: phone.findDevice ? 'Ενεργή' : 'Ανενεργή',
			go: () => (page = 'find')
		},
		{
			id: 'notifications',
			label: 'Ειδοποιήσεις',
			icon: Bell,
			tint: 'bg-red-500',
			value: '',
			go: () => openOther('Ειδοποιήσεις')
		},
		{
			id: 'security',
			label: 'Ασφάλεια και απόρρητο',
			icon: Lock,
			tint: 'bg-slate-600',
			value: '',
			go: () => openOther('Ασφάλεια και απόρρητο')
		}
	]);

	let query = $state('');
	const fold = (t: string) => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
	const visibleRows = $derived(
		query.trim() ? ROWS.filter((r) => fold(r.label).includes(fold(query.trim()))) : ROWS
	);

	const rowClass =
		'flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none active:bg-slate-50';
	const switchClass = (on: boolean) =>
		cn(
			'relative h-8 w-14 shrink-0 rounded-full transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none',
			on ? (isIos ? 'bg-[#34c759]' : 'bg-[#0b57d0]') : 'bg-slate-300'
		);
	const knob = (on: boolean) =>
		cn(
			'absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all',
			on ? 'left-7' : 'left-1'
		);
</script>

<div
	data-testid="mobile-settings-app"
	data-variant={variant}
	class={cn('flex h-full flex-col', isIos ? 'bg-[#f2f2f7]' : 'bg-[#f7f9fc]')}
>
	<header
		class={cn(
			'flex shrink-0 items-center gap-1 px-2 py-2 text-sm font-semibold',
			isIos ? 'bg-[#f2f2f7] text-slate-900' : 'bg-[#f7f9fc] text-slate-800'
		)}
	>
		{#if page !== 'root'}
			<button
				type="button"
				onclick={() => (page = 'root')}
				aria-label="Πίσω στις Ρυθμίσεις"
				class={cn(
					'flex h-9 items-center justify-center rounded-full focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none',
					isIos ? 'gap-0.5 pr-2 text-[#0a84ff]' : 'w-9'
				)}
			>
				<ChevronLeft class="h-5 w-5" aria-hidden="true" />
				{#if isIos}<span class="text-base font-normal">Ρυθμίσεις</span>{/if}
			</button>
		{/if}
		<span
			class={cn(
				'flex-1',
				isIos
					? page === 'root'
						? 'px-2 pt-6 text-3xl font-bold'
						: 'text-center'
					: page === 'root'
						? 'px-2 pt-4 text-2xl font-normal'
						: 'text-center'
			)}>{title}</span
		>
		{#if page !== 'root'}<span class="w-9"></span>{/if}
	</header>

	{#if page === 'root'}
		<div class="min-h-0 flex-1 overflow-y-auto">
			<label
				class={cn(
					'mx-4 my-2 flex h-11 items-center gap-2 px-4',
					isIos ? 'rounded-xl bg-[#e3e3e8]' : 'rounded-full bg-[#e9eef6]'
				)}
			>
				<Search class="h-4 w-4 text-slate-500" aria-hidden="true" />
				<input
					type="search"
					bind:value={query}
					placeholder="Αναζήτηση ρυθμίσεων"
					aria-label="Αναζήτηση ρυθμίσεων"
					class="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-500"
				/>
			</label>
			<ul
				class={cn(
					'divide-y divide-slate-200 bg-white',
					isIos ? 'mx-4 overflow-hidden rounded-xl' : 'mt-1'
				)}
			>
				{#each visibleRows as r (r.id)}
					<li>
						<button type="button" onclick={r.go} class={rowClass}>
							<span
								class={cn(
									'flex h-9 w-9 items-center justify-center text-white',
									r.tint,
									isIos ? 'rounded-lg' : 'rounded-full'
								)}
							>
								<r.icon class="h-5 w-5" aria-hidden="true" />
							</span>
							<span class="flex-1 text-base font-medium text-slate-900">{r.label}</span>
							{#if r.value}<span class="text-sm text-slate-500">{r.value}</span>{/if}
							<ChevronRight class="h-5 w-5 text-slate-400" aria-hidden="true" />
						</button>
					</li>
				{:else}
					<li class="px-4 py-6 text-center text-sm text-slate-500">
						Καμία ρύθμιση για «{query.trim()}».
					</li>
				{/each}
			</ul>
		</div>
	{:else if page === 'font'}
		<div class={cn('mt-2 space-y-2 bg-white p-4', isIos && 'mx-4 rounded-xl')}>
			<p
				class={cn(
					'rounded-lg bg-slate-100 p-3 text-slate-700',
					SIZES.find((s) => s.id === phone.fontSize)?.sample
				)}
			>
				Έτσι θα φαίνονται τα γράμματα.
			</p>
			{#each SIZES as size (size.id)}
				<button
					type="button"
					onclick={() => setSize(size.id)}
					aria-pressed={phone.fontSize === size.id}
					class={cn(
						'flex min-h-[52px] w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none',
						phone.fontSize === size.id
							? 'border-blue-600 bg-blue-50 text-blue-800'
							: 'border-slate-200 bg-white text-slate-900'
					)}
				>
					<span class={cn('font-medium', size.sample)}>{size.label}</span>
					{#if phone.fontSize === size.id}<Check
							class="h-5 w-5 text-blue-700"
							aria-hidden="true"
						/>{/if}
				</button>
			{/each}
		</div>
	{:else if page === 'wifi'}
		<div class={cn('mt-2 space-y-2', isIos && 'mx-4')}>
			<div
				class={cn('flex items-center justify-between bg-white px-4 py-3', isIos && 'rounded-xl')}
			>
				<span class="text-base font-medium text-slate-900">Wi-Fi</span>
				<button
					type="button"
					role="switch"
					aria-checked={phone.wifiOn}
					aria-label="Wi-Fi ενεργό"
					onclick={() => phone.setWifi(!phone.wifiOn)}
					class={switchClass(phone.wifiOn)}><span class={knob(phone.wifiOn)}></span></button
				>
			</div>
			{#if phone.wifiOn}
				<p class="px-4 pt-1 text-xs font-semibold text-slate-500 uppercase">Διαθέσιμα δίκτυα</p>
				<ul class={cn('divide-y divide-slate-200 bg-white', isIos && 'overflow-hidden rounded-xl')}>
					{#each wifiNetworks as ssid (ssid)}
						<li>
							<button
								type="button"
								onclick={() => connect(ssid)}
								aria-label={`Σύνδεση στο δίκτυο ${ssid}`}
								class="flex min-h-[52px] w-full items-center gap-3 px-4 py-3 text-left transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none active:bg-slate-50"
							>
								{#if phone.connectedSsid === ssid}<Check
										class="h-5 w-5 text-[#0a84ff]"
										aria-hidden="true"
									/>{:else}<span class="w-5"></span>{/if}
								<span class="flex-1 text-base font-medium text-slate-900">{ssid}</span>
								<Lock class="h-4 w-4 text-slate-400" aria-hidden="true" />
								<Wifi class="h-5 w-5 text-slate-500" aria-hidden="true" />
								{#if phone.connectedSsid === ssid}
									<span class="sr-only">Συνδέθηκε</span>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
				{#if phone.connectedSsid}
					<p class="px-4 text-sm text-emerald-700" role="status">
						Συνδέθηκε στο «{phone.connectedSsid}».
					</p>
				{/if}
			{:else}
				<p class="px-4 text-sm text-slate-500">
					Το Wi-Fi είναι κλειστό. Άνοιξε τον διακόπτη για να δεις τα δίκτυα.
				</p>
			{/if}
		</div>
	{:else if page === 'night'}
		{@render togglePage(
			'Νυχτερινή λειτουργία',
			'Ζεσταίνει τα χρώματα το βράδυ για να ξεκουράζονται τα μάτια σου.',
			phone.nightMode,
			toggleNight
		)}
	{:else if page === 'find'}
		{@render togglePage(
			'Εύρεση συσκευής',
			'Αν χαθεί το κινητό, μπορείς να το βρεις από άλλη συσκευή. Καλό είναι να είναι ενεργή.',
			phone.findDevice,
			toggleFind
		)}
	{:else if page === 'bluetooth'}
		{@render togglePage(
			'Bluetooth',
			'Συνδέει ασύρματα ακουστικά, ηχεία και το αυτοκίνητο. Δεν χρειάζεται σε αυτό το μάθημα.',
			phone.bluetoothOn,
			() => (phone.bluetoothOn = !phone.bluetoothOn)
		)}
	{:else if page === 'sound'}
		{@render sliderPage('Ένταση ήχου', phone.volume, (v) => (phone.volume = v), 0)}
	{:else if page === 'display'}
		{@render sliderPage('Φωτεινότητα', phone.brightness, (v) => (phone.brightness = v), 10)}
	{:else}
		<div class={cn('mt-2 bg-white p-4 text-slate-600', isIos && 'mx-4 rounded-xl')}>
			<p class="text-base font-medium text-slate-900">{otherTitle}</p>
			<p class="mt-1 text-sm">
				Αυτή η ρύθμιση υπάρχει σε κάθε κινητό, αλλά δεν χρειάζεται σε αυτό το μάθημα.
			</p>
		</div>
	{/if}
</div>

{#snippet togglePage(label: string, desc: string, on: boolean, toggle: () => void)}
	<div class={cn('mt-2 space-y-4 bg-white p-4', isIos && 'mx-4 rounded-xl')}>
		<div class="flex items-center justify-between rounded-xl border border-slate-200 p-4">
			<span class="text-base font-medium text-slate-900">{label}</span>
			<button
				type="button"
				role="switch"
				aria-checked={on}
				aria-label={label}
				onclick={toggle}
				class={switchClass(on)}
			>
				<span class={knob(on)}></span>
			</button>
		</div>
		<p class="text-sm text-slate-600">{desc}</p>
	</div>
{/snippet}

{#snippet sliderPage(label: string, value: number, set: (v: number) => void, min: number)}
	<div class={cn('mt-2 space-y-3 bg-white p-4', isIos && 'mx-4 rounded-xl')}>
		<label class="block">
			<span class="flex items-center justify-between text-base font-medium text-slate-900"
				><span>{label}</span><span class="text-slate-500 tabular-nums">{value}%</span></span
			>
			<input
				type="range"
				{min}
				max="100"
				{value}
				oninput={(e) => set(Number(e.currentTarget.value))}
				aria-label={label}
				class="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#0a84ff]"
			/>
		</label>
		<p class="text-sm text-slate-600">
			Σύρε τον διακόπτη δεξιά-αριστερά. Η αλλαγή φαίνεται αμέσως.
		</p>
	</div>
{/snippet}
