<script lang="ts">
	import Wifi from '@lucide/svelte/icons/wifi';
	import Bluetooth from '@lucide/svelte/icons/bluetooth';
	import Flashlight from '@lucide/svelte/icons/flashlight';
	import Plane from '@lucide/svelte/icons/plane';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Leaf from '@lucide/svelte/icons/leaf';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import Settings from '@lucide/svelte/icons/settings';
	import Power from '@lucide/svelte/icons/power';
	import Pencil from '@lucide/svelte/icons/pencil';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { cn } from '$lib/utils';
	import { PhoneState } from './phoneState.svelte';

	/**
	 * Pull-down «Γρήγορες ρυθμίσεις» (Android) / «Κέντρο ελέγχου» (iPhone) — the
	 * tiles the theory lists (esm001-c2-s6). Opened from the status bar in
	 * MobileFrame. Semantic event: mobile-quick-toggle { tile, on }.
	 *
	 * Tiles write the host-owned phone state, so Wi-Fi switched off here is off
	 * in Settings and gone from the status bar; brightness dims the screen.
	 */
	let {
		variant = 'android',
		phone = new PhoneState(),
		onToggle,
		onClose
	}: {
		variant?: 'android' | 'ios';
		phone?: PhoneState;
		onToggle: (tile: string, on: boolean) => void;
		onClose: () => void;
	} = $props();

	const isIos = $derived(variant === 'ios');

	const TILES = [
		{
			id: 'wifi',
			label: 'Wi-Fi',
			icon: Wifi,
			on: () => phone.wifiOn,
			sub: () => (phone.wifiOn ? (phone.connectedSsid ?? 'Ενεργό') : 'Κλειστό')
		},
		{
			id: 'bluetooth',
			label: 'Bluetooth',
			icon: Bluetooth,
			on: () => phone.bluetoothOn,
			sub: () => (phone.bluetoothOn ? 'Ενεργό' : 'Κλειστό')
		},
		{
			id: 'torch',
			label: 'Φακός',
			icon: Flashlight,
			on: () => phone.torchOn,
			sub: () => (phone.torchOn ? 'Αναμμένος' : 'Σβηστός')
		},
		{
			id: 'airplane',
			label: 'Λειτουργία πτήσης',
			icon: Plane,
			on: () => phone.airplaneMode,
			sub: () => (phone.airplaneMode ? 'Ενεργή' : 'Κλειστή')
		},
		{
			id: 'rotation',
			label: 'Αυτόματη περιστροφή',
			icon: RotateCcw,
			on: () => !phone.rotationLock,
			sub: () => (phone.rotationLock ? 'Κλειδωμένη' : 'Ενεργή')
		},
		{
			id: 'saver',
			label: 'Εξοικονόμηση μπαταρίας',
			icon: Leaf,
			on: () => phone.batterySaver,
			sub: () => (phone.batterySaver ? 'Ενεργή' : 'Κλειστή')
		}
	] as const;

	function toggle(id: string) {
		const on = phone.toggleTile(id);
		onToggle(id, id === 'rotation' ? !on : on);
	}

	let notice = $state('');
</script>

{#if isIos}
	<!-- iOS Control Center: translucent modules on a blurred wallpaper -->
	<div
		data-testid="quick-settings"
		data-variant="ios"
		class="absolute inset-0 z-30 flex flex-col gap-3 bg-slate-900/70 px-4 pt-14 pb-6 text-white backdrop-blur-xl"
		role="dialog"
		aria-label="Κέντρο ελέγχου"
		tabindex="-1"
	>
		<div class="grid grid-cols-2 gap-3">
			<div class="grid grid-cols-2 gap-2 rounded-3xl bg-white/15 p-3">
				{#each [TILES[0], TILES[1], TILES[3]] as tile (tile.id)}
					<button
						type="button"
						role="switch"
						aria-checked={tile.on()}
						aria-label={tile.label}
						onclick={() => toggle(tile.id)}
						class={cn(
							'flex h-12 w-12 items-center justify-center rounded-full transition focus-visible:ring-4 focus-visible:ring-white/80 focus-visible:outline-none',
							tile.on()
								? tile.id === 'airplane'
									? 'bg-orange-500'
									: 'bg-[#0a84ff]'
								: 'bg-white/25'
						)}
					>
						<tile.icon class="h-5 w-5" aria-hidden="true" />
					</button>
				{/each}
				<button
					type="button"
					aria-label="Δεδομένα κινητής"
					aria-pressed="true"
					onclick={() =>
						(notice =
							'Δεδομένα κινητής: το ίντερνετ μέσω της κάρτας SIM. Μένει ανοιχτό στο μάθημα.')}
					class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 focus-visible:ring-4 focus-visible:ring-white/80 focus-visible:outline-none"
				>
					<span class="text-xs font-bold" aria-hidden="true">5G</span>
				</button>
			</div>
			<div class="flex flex-col gap-3">
				<button
					type="button"
					role="switch"
					aria-checked={phone.doNotDisturb}
					aria-label="Συγκέντρωση"
					onclick={() => toggle('dnd')}
					class={cn(
						'flex flex-1 items-center gap-2 rounded-3xl px-4 text-left text-sm font-semibold focus-visible:ring-4 focus-visible:ring-white/80 focus-visible:outline-none',
						phone.doNotDisturb ? 'bg-indigo-500' : 'bg-white/15'
					)}
				>
					<Moon class="h-5 w-5" aria-hidden="true" /> Συγκέντρωση
				</button>
				<button
					type="button"
					role="switch"
					aria-checked={!phone.rotationLock}
					aria-label="Αυτόματη περιστροφή"
					onclick={() => toggle('rotation')}
					class={cn(
						'flex flex-1 items-center gap-2 rounded-3xl px-4 text-left text-sm font-semibold focus-visible:ring-4 focus-visible:ring-white/80 focus-visible:outline-none',
						phone.rotationLock ? 'bg-white/15' : 'bg-[#0a84ff]'
					)}
				>
					<RotateCcw class="h-5 w-5" aria-hidden="true" /> Περιστροφή
				</button>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-3">
			<label class="flex h-40 flex-col justify-end rounded-3xl bg-white/15 p-3">
				<span class="sr-only">Φωτεινότητα</span>
				<input
					type="range"
					min="10"
					max="100"
					value={phone.brightness}
					oninput={(e) => (phone.brightness = Number(e.currentTarget.value))}
					aria-label="Φωτεινότητα"
					class="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/30 accent-white"
				/>
				<span class="mt-2 flex items-center justify-between text-xs"
					><Sun class="h-4 w-4" aria-hidden="true" /><span class="tabular-nums"
						>{phone.brightness}%</span
					></span
				>
			</label>
			<label class="flex h-40 flex-col justify-end rounded-3xl bg-white/15 p-3">
				<span class="sr-only">Ένταση ήχου</span>
				<input
					type="range"
					min="0"
					max="100"
					value={phone.volume}
					oninput={(e) => (phone.volume = Number(e.currentTarget.value))}
					aria-label="Ένταση ήχου"
					class="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/30 accent-white"
				/>
				<span class="mt-2 flex items-center justify-between text-xs"
					><Volume2 class="h-4 w-4" aria-hidden="true" /><span class="tabular-nums"
						>{phone.volume}%</span
					></span
				>
			</label>
		</div>

		<div class="grid grid-cols-4 gap-3">
			<button
				type="button"
				role="switch"
				aria-checked={phone.torchOn}
				aria-label="Φακός"
				onclick={() => toggle('torch')}
				class={cn(
					'flex h-16 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] focus-visible:ring-4 focus-visible:ring-white/80 focus-visible:outline-none',
					phone.torchOn ? 'bg-white text-slate-900' : 'bg-white/15'
				)}
			>
				<Flashlight class="h-5 w-5" aria-hidden="true" /> Φακός
			</button>
			<button
				type="button"
				role="switch"
				aria-checked={phone.batterySaver}
				aria-label="Εξοικονόμηση μπαταρίας"
				onclick={() => toggle('saver')}
				class={cn(
					'flex h-16 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] focus-visible:ring-4 focus-visible:ring-white/80 focus-visible:outline-none',
					phone.batterySaver ? 'bg-amber-400 text-slate-900' : 'bg-white/15'
				)}
			>
				<Leaf class="h-5 w-5" aria-hidden="true" /> Μπαταρία
			</button>
		</div>

		{#if notice}
			<p class="rounded-xl bg-black/40 px-3 py-2 text-xs" role="status" aria-live="polite">
				{notice}
			</p>
		{/if}

		<button
			type="button"
			onclick={onClose}
			class="mx-auto mt-auto flex min-h-11 items-center gap-1 rounded-full bg-white/20 px-6 text-sm focus-visible:ring-4 focus-visible:ring-white/80 focus-visible:outline-none"
		>
			<ChevronDown class="h-4 w-4" aria-hidden="true" /> Κλείσιμο
		</button>
	</div>
{:else}
	<!-- Android quick settings: pill tiles, brightness, footer -->
	<div
		data-testid="quick-settings"
		data-variant="android"
		class="absolute inset-x-0 top-0 z-30 flex flex-col gap-3 rounded-b-[2rem] bg-[#1c1c1e] px-4 pt-3 pb-4 text-white shadow-2xl"
		role="dialog"
		aria-label="Γρήγορες ρυθμίσεις"
		tabindex="-1"
	>
		<div class="flex items-center justify-between text-xs text-slate-300">
			<span class="tabular-nums">{phone.batteryPercent}% μπαταρία</span>
			<span>Γρήγορες ρυθμίσεις</span>
		</div>
		<label class="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2">
			<Sun class="h-4 w-4 shrink-0" aria-hidden="true" />
			<input
				type="range"
				min="10"
				max="100"
				value={phone.brightness}
				oninput={(e) => (phone.brightness = Number(e.currentTarget.value))}
				aria-label="Φωτεινότητα"
				class="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-[#a8c7fa]"
			/>
			<span class="w-9 text-right text-xs tabular-nums">{phone.brightness}%</span>
		</label>
		<div class="grid grid-cols-2 gap-2">
			{#each TILES as tile (tile.id)}
				{@const on = tile.on()}
				<button
					type="button"
					role="switch"
					aria-checked={on}
					aria-label={tile.label}
					onclick={() => toggle(tile.id)}
					class={cn(
						'flex min-h-[60px] items-center gap-3 rounded-full px-4 text-left transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none',
						on ? 'bg-[#a8c7fa] text-[#062e6f]' : 'bg-white/10 text-slate-100'
					)}
				>
					<tile.icon class="h-5 w-5 shrink-0" aria-hidden="true" />
					<span class="min-w-0">
						<span class="block truncate text-sm font-medium">{tile.label}</span>
						<span class="block truncate text-[11px] opacity-80">{tile.sub()}</span>
					</span>
				</button>
			{/each}
		</div>
		{#if notice}
			<p class="rounded-xl bg-white/10 px-3 py-2 text-xs" role="status" aria-live="polite">
				{notice}
			</p>
		{/if}
		<div class="flex items-center justify-between pt-1">
			<button
				type="button"
				aria-label="Επεξεργασία πλακιδίων"
				onclick={() =>
					(notice = 'Επεξεργασία: αλλάζεις τη σειρά των πλακιδίων. Δεν χρειάζεται στο μάθημα.')}
				class="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
			>
				<Pencil class="h-4 w-4" aria-hidden="true" />
			</button>
			<button
				type="button"
				onclick={onClose}
				class="flex min-h-11 items-center gap-1 rounded-full bg-white/15 px-6 text-sm focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
			>
				<ChevronDown class="h-4 w-4" aria-hidden="true" /> Κλείσιμο
			</button>
			<div class="flex gap-1">
				<button
					type="button"
					aria-label="Κουμπί λειτουργίας"
					onclick={() =>
						(notice = 'Από εδώ σβήνει ή επανεκκινεί το κινητό. Στην εξάσκηση μένει ανοιχτό.')}
					class="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
				>
					<Power class="h-4 w-4" aria-hidden="true" />
				</button>
				<button
					type="button"
					aria-label="Όλες οι ρυθμίσεις"
					onclick={() =>
						(notice =
							'Το γρανάζι ανοίγει τις πλήρεις Ρυθμίσεις — τις βρίσκεις και στην αρχική οθόνη.')}
					class="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
				>
					<Settings class="h-4 w-4" aria-hidden="true" />
				</button>
			</div>
		</div>
	</div>
{/if}
