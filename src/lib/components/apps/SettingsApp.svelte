<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Wifi, Printer, Volume2, Monitor, Battery, Moon, Globe } from 'lucide-svelte';
	import { Switch } from '$lib/components/ui/switch';
	import { toast } from 'svelte-sonner';

	let {
		config = {},
		onAction
	} = $props<{
		config?: any;
		onAction: (action: string, data?: any) => void;
	}>();

	let activeSection = $state('system');

	// Settings State
	let wifiEnabled = $state(true);
	let connectedNetwork = $state<string | null>(null);
	let volume = $state(80);
	let printerConnected = $state(false);
	let darkMode = $state(false);

	const networks = ['Home_WiFi', 'OTE_Network', 'Public_WiFi_Free'];

	function connectWifi(ssid: string) {
		if (!wifiEnabled) return;
		toast.loading('Σύνδεση...');
		setTimeout(() => {
			connectedNetwork = ssid;
			toast.success(`Συνδέθηκε στο ${ssid}`);
			onAction('connect-wifi', { ssid });
		}, 1500);
	}

	function addPrinter() {
		toast.loading('Αναζήτηση εκτυπωτών...');
		setTimeout(() => {
			printerConnected = true;
			toast.success('Ο εκτυπωτής HP LaserJet προστέθηκε!');
			onAction('add-printer', { model: 'HP LaserJet' });
		}, 2000);
	}

	function toggleWifi(checked: boolean) {
		wifiEnabled = checked;
		if (!checked) connectedNetwork = null;
		onAction('toggle-wifi', { enabled: checked });
	}
</script>

<div class="flex h-full overflow-hidden bg-slate-50">
	<!-- Sidebar -->
	<div class="w-64 border-r bg-white p-4">
		<div class="mb-6 px-2">
			<h2 class="text-lg font-bold">Ρυθμίσεις</h2>
		</div>
		<nav class="space-y-1">
			<button
				class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium {activeSection === 'system' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'}"
				onclick={() => (activeSection = 'system')}
			>
				<Monitor class="h-4 w-4" /> Σύστημα
			</button>
			<button
				class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium {activeSection === 'network' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'}"
				onclick={() => (activeSection = 'network')}
			>
				<Globe class="h-4 w-4" /> Δίκτυο & Internet
			</button>
			<button
				class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium {activeSection === 'devices' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'}"
				onclick={() => (activeSection = 'devices')}
			>
				<Printer class="h-4 w-4" /> Συσκευές
			</button>
		</nav>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-y-auto p-8">
		{#if activeSection === 'system'}
			<div class="space-y-6">
				<h3 class="text-xl font-semibold">Οθόνη & Ήχος</h3>

				<div class="rounded-lg border bg-white p-4">
					<div class="mb-4 flex items-center justify-between">
						<div class="flex items-center gap-3">
							<Moon class="h-5 w-5 text-slate-500" />
							<span>Σκοτεινή λειτουργία</span>
						</div>
						<Switch checked={darkMode} onCheckedChange={(v) => darkMode = v} />
					</div>
				</div>

				<div class="rounded-lg border bg-white p-4">
					<div class="mb-2 flex items-center gap-3">
						<Volume2 class="h-5 w-5 text-slate-500" />
						<span>Ένταση ήχου</span>
					</div>
					<input type="range" min="0" max="100" bind:value={volume} class="w-full" />
					<div class="text-right text-sm text-slate-500">{volume}%</div>
				</div>
			</div>
		{:else if activeSection === 'network'}
			<div class="space-y-6">
				<h3 class="text-xl font-semibold">Wi-Fi</h3>

				<div class="rounded-lg border bg-white p-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<Wifi class="h-5 w-5 text-slate-500" />
							<div>
								<div class="font-medium">Wi-Fi</div>
								<div class="text-sm text-slate-500">
									{wifiEnabled ? (connectedNetwork ? `Συνδεδεμένο: ${connectedNetwork}` : 'Διαθέσιμα δίκτυα') : 'Απενεργοποιημένο'}
								</div>
							</div>
						</div>
						<Switch checked={wifiEnabled} onCheckedChange={toggleWifi} />
					</div>

					{#if wifiEnabled}
						<div class="mt-4 border-t pt-4 space-y-2">
							{#each networks as net}
								<div class="flex items-center justify-between rounded p-2 hover:bg-slate-50">
									<span class="flex items-center gap-2">
										<Wifi class="h-4 w-4 text-slate-400" />
										{net}
									</span>
									{#if connectedNetwork === net}
										<span class="text-xs font-medium text-green-600">Συνδέθηκε</span>
									{:else}
										<Button size="sm" variant="outline" onclick={() => connectWifi(net)}>Σύνδεση</Button>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{:else if activeSection === 'devices'}
			<div class="space-y-6">
				<h3 class="text-xl font-semibold">Εκτυπωτές & Scanners</h3>

				<div class="rounded-lg border bg-white p-4">
					<Button class="w-full gap-2" variant="outline" onclick={addPrinter} disabled={printerConnected}>
						<Printer class="h-4 w-4" />
						{printerConnected ? 'Ο εκτυπωτής προστέθηκε' : 'Προσθήκη εκτυπωτή'}
					</Button>

					{#if printerConnected}
						<div class="mt-4 flex items-center justify-between rounded border bg-slate-50 p-3">
							<div class="flex items-center gap-3">
								<Printer class="h-5 w-5 text-blue-600" />
								<div>
									<div class="font-medium">HP LaserJet Pro</div>
									<div class="text-xs text-green-600">Ετοιμότητα</div>
								</div>
							</div>
							<Button size="sm" variant="ghost">Διαχείριση</Button>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
