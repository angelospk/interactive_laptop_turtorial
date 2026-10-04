<script lang="ts">
	import {
		Wifi,
		Volume2,
		VolumeX,
		Sun,
		Battery,
		Bluetooth,
		Plane,
		Settings,
		Moon,
		Leaf,
		Accessibility,
		ChevronRight,
		ChevronLeft,
		Check,
		Pencil
	} from 'lucide-svelte';
	import { osState } from '$lib/osState.svelte';
	import { slide } from 'svelte/transition';
	import { cn } from '$lib/utils';

	/**
	 * Windows 11 Quick Settings (the flyout behind the Wi-Fi/sound/battery
	 * tray icons). Every tile changes the shared machine state, and the state is
	 * visible outside the flyout too: the tray icons, the brightness dim and the
	 * night-light tint on the desktop. The Wi-Fi tile has the little arrow that
	 * opens the network list, where picking a network really connects.
	 */
	let {
		isOpen,
		onOpenSettings,
		onAction,
		wifiConfig = {}
	} = $props<{
		isOpen: boolean;
		onClose: () => void;
		onOpenSettings: (page: string) => void;
		/** Semantic events for the lesson host — the same `connect-wifi {ssid}` the Settings app emits. */
		onAction?: (action: string, data?: Record<string, unknown>) => void;
		/** Mirrors the Settings app: these networks ask for a password first. */
		wifiConfig?: { targetSsid?: string; requiredPassword?: string };
	}>();

	// 'tiles' | 'wifi' — the Wi-Fi arrow slides to the network list and back.
	let pane = $state<'tiles' | 'wifi'>('tiles');
	let accessibilityOpen = $state(false);

	// Secured networks (same rule as SettingsApp): a password sheet opens inline.
	const SECURED = ['Home_WiFi', 'OTE_Network'];
	let pendingSsid = $state<string | null>(null);
	let password = $state('');
	let passwordError = $state('');

	function pickNetwork(ssid: string) {
		if (!osState.wifiEnabled) return;
		if (osState.connectedNetwork === ssid) return;
		if (SECURED.includes(ssid) || (wifiConfig.targetSsid && ssid === wifiConfig.targetSsid)) {
			pendingSsid = ssid;
			password = '';
			passwordError = '';
			return;
		}
		connect(ssid);
	}

	function connect(ssid: string) {
		osState.connectWifi(ssid);
		pendingSsid = null;
		onAction?.('connect-wifi', { ssid });
	}

	function submitPassword(e: Event) {
		e.preventDefault();
		if (!pendingSsid) return;
		if (wifiConfig.requiredPassword && password !== wifiConfig.requiredPassword) {
			passwordError = 'Λάθος κωδικός πρόσβασης. Δοκίμασε ξανά.';
			return;
		}
		if (!password.trim()) {
			passwordError = 'Γράψε τον κωδικό του δικτύου.';
			return;
		}
		connect(pendingSsid);
	}

	const tiles = $derived([
		{
			id: 'wifi',
			label: osState.wifiEnabled ? (osState.connectedNetwork ?? 'Διαθέσιμο') : 'Wi-Fi',
			name: 'Wi-Fi',
			icon: Wifi,
			on: osState.wifiEnabled,
			toggle: () => osState.toggleWifi(!osState.wifiEnabled),
			more: () => (pane = 'wifi')
		},
		{
			id: 'bluetooth',
			label: 'Bluetooth',
			name: 'Bluetooth',
			icon: Bluetooth,
			on: osState.bluetoothEnabled,
			toggle: () => (osState.bluetoothEnabled = !osState.bluetoothEnabled)
		},
		{
			id: 'airplane',
			label: 'Λειτουργία πτήσης',
			name: 'Λειτουργία πτήσης',
			icon: Plane,
			on: osState.airplaneMode,
			toggle: () => osState.toggleAirplane(!osState.airplaneMode)
		},
		{
			id: 'saver',
			label: 'Εξοικονόμηση μπαταρίας',
			name: 'Εξοικονόμηση μπαταρίας',
			icon: Leaf,
			on: osState.batterySaver,
			toggle: () => (osState.batterySaver = !osState.batterySaver)
		},
		{
			id: 'night',
			label: 'Νυχτερινός φωτισμός',
			name: 'Νυχτερινός φωτισμός',
			icon: Moon,
			on: osState.nightLight,
			toggle: () => (osState.nightLight = !osState.nightLight)
		},
		{
			id: 'access',
			label: 'Προσβασιμότητα',
			name: 'Προσβασιμότητα',
			icon: Accessibility,
			on: accessibilityOpen,
			toggle: () => (accessibilityOpen = !accessibilityOpen)
		}
	]);

	const tileClass = (on: boolean) =>
		cn(
			'flex h-12 flex-1 items-center justify-center rounded-l-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80',
			on
				? 'border-[#4cc2ff] bg-[#4cc2ff] text-slate-900'
				: 'border-white/10 bg-white/[0.06] text-slate-100 hover:bg-white/10'
		);
</script>

{#if isOpen}
	<!-- stops click from reaching the backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="absolute right-2 bottom-14 z-50 w-[22rem] max-w-[calc(100%-1rem)] rounded-xl border border-white/10 bg-[#2b2b2b]/95 p-4 [font-family:Segoe_UI,system-ui,sans-serif] text-white shadow-2xl backdrop-blur-xl"
		transition:slide={{ duration: 200, axis: 'y' }}
		onclick={(e) => e.stopPropagation()}
		role="dialog"
		aria-label="Γρήγορες ρυθμίσεις"
		tabindex="-1"
		data-testid="quick-settings"
	>
		{#if pane === 'wifi'}
			<!-- Network list, as behind the Wi-Fi arrow on Windows -->
			<div class="mb-3 flex items-center gap-2">
				<button
					type="button"
					class="flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none"
					onclick={() => (pane = 'tiles')}
					aria-label="Πίσω"
				>
					<ChevronLeft class="h-5 w-5" />
				</button>
				<span class="font-semibold">Wi-Fi</span>
				<button
					type="button"
					role="switch"
					aria-checked={osState.wifiEnabled}
					aria-label="Wi-Fi ενεργό"
					class={cn(
						'relative ml-auto h-5 w-10 rounded-full transition-colors',
						osState.wifiEnabled ? 'bg-[#4cc2ff]' : 'bg-white/20'
					)}
					onclick={() => osState.toggleWifi(!osState.wifiEnabled)}
				>
					<span
						class={cn(
							'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
							osState.wifiEnabled ? 'left-5' : 'left-0.5'
						)}
					></span>
				</button>
			</div>
			{#if osState.wifiEnabled}
				<ul class="space-y-1" aria-label="Διαθέσιμα δίκτυα">
					{#each osState.availableNetworks as ssid (ssid)}
						{@const connected = osState.connectedNetwork === ssid}
						<li>
							<button
								type="button"
								class={cn(
									'flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none',
									(connected || pendingSsid === ssid) && 'bg-white/10'
								)}
								onclick={() => pickNetwork(ssid)}
								aria-label={connected ? `${ssid} (συνδεδεμένο)` : `Σύνδεση στο δίκτυο ${ssid}`}
							>
								<Wifi class="h-4 w-4" />
								<span class="flex-1">
									{ssid}
									<span class="block text-xs text-slate-400">
										{connected ? 'Συνδεδεμένο, ασφαλές' : 'Ασφαλές'}
									</span>
								</span>
								{#if connected}<Check class="h-4 w-4 text-[#4cc2ff]" />{/if}
							</button>
							{#if pendingSsid === ssid}
								<form class="mt-1 space-y-2 rounded-md bg-white/5 p-3" onsubmit={submitPassword}>
									<label class="block text-xs text-slate-300" for="qs-wifi-password">
										Κωδικός δικτύου «{ssid}»
									</label>
									<!-- svelte-ignore a11y_autofocus -->
									<input
										id="qs-wifi-password"
										type="password"
										bind:value={password}
										autofocus
										class="w-full rounded-md border border-white/20 bg-[#1f1f1f] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-[#4cc2ff]"
									/>
									{#if passwordError}
										<p class="text-xs text-red-300" role="alert">{passwordError}</p>
									{/if}
									<div class="flex justify-end gap-2">
										<button
											type="button"
											class="rounded-md px-3 py-1.5 text-sm hover:bg-white/10"
											onclick={() => (pendingSsid = null)}
										>
											Άκυρο
										</button>
										<button
											type="submit"
											class="rounded-md bg-[#4cc2ff] px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-[#6dd0ff]"
										>
											Σύνδεση
										</button>
									</div>
								</form>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="rounded-md bg-white/5 p-3 text-sm text-slate-300">
					Το Wi-Fi είναι κλειστό. Άνοιξε τον διακόπτη για να δεις τα δίκτυα.
				</p>
			{/if}
			<button
				type="button"
				class="mt-3 w-full rounded-md px-3 py-2 text-left text-sm text-[#4cc2ff] hover:bg-white/10"
				onclick={() => onOpenSettings('network')}
			>
				Περισσότερες ρυθμίσεις Wi-Fi
			</button>
		{:else}
			<!-- Quick Toggles Grid: 3 × 2 like Windows 11 -->
			<div class="mb-5 grid grid-cols-3 gap-x-3 gap-y-4">
				{#each tiles as tile (tile.id)}
					<div class="flex flex-col items-start gap-1.5">
						<div class="flex w-full">
							<button
								type="button"
								role="switch"
								aria-checked={tile.on}
								aria-label={tile.name}
								class={cn(tileClass(tile.on), !tile.more && 'rounded-r-md')}
								onclick={tile.toggle}
							>
								<tile.icon class="h-5 w-5" />
							</button>
							{#if tile.more}
								<button
									type="button"
									class={cn(
										'flex h-12 w-8 items-center justify-center rounded-r-md border border-l-0 transition-colors focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none',
										tile.on
											? 'border-[#4cc2ff] bg-[#3db3f0] text-slate-900 hover:bg-[#2fa6e4]'
											: 'border-white/10 bg-white/[0.06] text-slate-100 hover:bg-white/10'
									)}
									onclick={tile.more}
									aria-label="Διαθέσιμα δίκτυα Wi-Fi"
									title="Διαθέσιμα δίκτυα"
								>
									<ChevronRight class="h-4 w-4" />
								</button>
							{/if}
						</div>
						<span class="w-full truncate text-xs text-slate-200">{tile.label}</span>
					</div>
				{/each}
			</div>

			{#if accessibilityOpen}
				<p class="mb-4 rounded-md bg-white/5 p-3 text-xs text-slate-300">
					Μεγεθυντής, Αφηγητής, Υψηλή αντίθεση: ρυθμίζονται στις Ρυθμίσεις → Προσβασιμότητα.
					<button
						type="button"
						class="ml-1 text-[#4cc2ff] underline-offset-2 hover:underline"
						onclick={() => onOpenSettings('accessibility')}
					>
						Άνοιγμα
					</button>
				</p>
			{/if}

			<!-- Sliders -->
			<div class="space-y-4 px-1">
				<!-- Brightness -->
				<div class="flex items-center gap-3">
					<Sun class="h-5 w-5 shrink-0 text-slate-200" aria-hidden="true" />
					<input
						type="range"
						min="10"
						max="100"
						value={osState.brightness}
						oninput={(e) => osState.setBrightness(Number(e.currentTarget.value))}
						aria-label="Φωτεινότητα"
						class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-[#4cc2ff]"
					/>
					<span class="w-9 text-right text-xs text-slate-300 tabular-nums"
						>{osState.brightness}%</span
					>
				</div>

				<!-- Volume -->
				<div class="flex items-center gap-3">
					<button
						type="button"
						class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none"
						onclick={() => (osState.muted = !osState.muted)}
						aria-pressed={osState.muted}
						aria-label="Σίγαση"
						title={osState.muted ? 'Κατάργηση σίγασης' : 'Σίγαση'}
					>
						{#if osState.muted}
							<VolumeX class="h-5 w-5 text-slate-400" />
						{:else}
							<Volume2 class="h-5 w-5 text-slate-200" />
						{/if}
					</button>
					<input
						type="range"
						min="0"
						max="100"
						value={osState.muted ? 0 : osState.volume}
						oninput={(e) => osState.setVolume(Number(e.currentTarget.value))}
						aria-label="Ένταση ήχου"
						class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-[#4cc2ff]"
					/>
					<span class="w-9 text-right text-xs text-slate-300 tabular-nums">
						{osState.muted ? '0%' : `${osState.volume}%`}
					</span>
				</div>
			</div>
		{/if}

		<!-- Footer -->
		<div class="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
			<div class="flex items-center gap-2 text-xs text-slate-300">
				<Battery class="h-4 w-4" />
				<span>{osState.batteryPercent}%</span>
			</div>
			<div class="flex items-center gap-1">
				<span
					class="flex h-8 w-8 items-center justify-center rounded-md text-slate-500"
					title="Επεξεργασία πλακιδίων (δεν χρειάζεται στο μάθημα)"
					aria-hidden="true"
				>
					<Pencil class="h-4 w-4" />
				</span>
				<button
					type="button"
					class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none"
					onclick={() => onOpenSettings('system')}
					title="Όλες οι ρυθμίσεις"
					aria-label="Όλες οι ρυθμίσεις"
				>
					<Settings class="h-4 w-4 text-slate-200" />
				</button>
			</div>
		</div>
	</div>
{/if}
