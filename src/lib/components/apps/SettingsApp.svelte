<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Wifi, Printer, Volume2, Monitor, Battery, Moon, Globe, AppWindow, Trash2, Box } from 'lucide-svelte';
	import { Switch } from '$lib/components/ui/switch';
	import { toast } from 'svelte-sonner';
    import { osState } from '$lib/osState.svelte';

	let {
		config = {},
		onAction
	} = $props<{
		config?: any;
		onAction: (action: string, data?: any) => void;
	}>();

	let activeSection = $state(config?.initialPage || 'system');

	// Sync with Global OS State
    $effect(() => {
        if(config?.initialPage) {
            activeSection = config.initialPage;
        }
    });

	let printerConnected = $state(false);
	let darkMode = $state(false);

    // Mock Installed Apps
    let installedApps = $state([
        { id: 'chrome', name: 'Google Chrome', size: '450 MB', version: '120.0.3' },
        { id: 'vlc', name: 'VLC Media Player', size: '120 MB', version: '3.0.18' },
        { id: 'spotify', name: 'Spotify', size: '800 MB', version: '1.2.10' },
        { id: 'adobe', name: 'Adobe Acrobat Reader', size: '350 MB', version: '2023.1' },
    ]);

	function connectWifi(ssid: string) {
		if (!osState.wifiEnabled) return;
		toast.loading('Σύνδεση...');
		setTimeout(() => {
			osState.connectWifi(ssid);
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
        osState.toggleWifi(checked);
		onAction('toggle-wifi', { enabled: checked });
	}

    function uninstallApp(appId: string) {
        toast.loading('Απεγκατάσταση...');
        setTimeout(() => {
            const appName = installedApps.find(a => a.id === appId)?.name;
            installedApps = installedApps.filter(a => a.id !== appId);
            toast.success(`${appName} απεγκαταστάθηκε επιτυχώς`);
            onAction('uninstall-app', { appId });
        }, 2000);
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
            <button
				class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium {activeSection === 'apps' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'}"
				onclick={() => (activeSection = 'apps')}
			>
				<AppWindow class="h-4 w-4" /> Εφαρμογές
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
					<input
                        type="range"
                        min="0"
                        max="100"
                        bind:value={osState.volume}
                        class="w-full"
                        oninput={() => onAction('change-volume', { value: osState.volume })}
                    />
					<div class="text-right text-sm text-slate-500">{osState.volume}%</div>
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
									{osState.wifiEnabled ? (osState.connectedNetwork ? `Συνδεδεμένο: ${osState.connectedNetwork}` : 'Διαθέσιμα δίκτυα') : 'Απενεργοποιημένο'}
								</div>
							</div>
						</div>
						<Switch checked={osState.wifiEnabled} onCheckedChange={toggleWifi} />
					</div>

					{#if osState.wifiEnabled}
						<div class="mt-4 border-t pt-4 space-y-2">
							{#each osState.availableNetworks as net}
								<div class="flex items-center justify-between rounded p-2 hover:bg-slate-50">
									<span class="flex items-center gap-2">
										<Wifi class="h-4 w-4 text-slate-400" />
										{net}
									</span>
									{#if osState.connectedNetwork === net}
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
        {:else if activeSection === 'apps'}
            <div class="space-y-6">
                <h3 class="text-xl font-semibold">Εφαρμογές & Δυνατότητες</h3>

                <div class="space-y-2">
                    {#each installedApps as app}
                        <div class="rounded-lg border bg-white p-4 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="h-10 w-10 bg-blue-100 rounded flex items-center justify-center text-blue-600">
                                    <Box class="h-6 w-6" />
                                </div>
                                <div>
                                    <div class="font-medium">{app.name}</div>
                                    <div class="text-xs text-slate-500">{app.version} • {app.size}</div>
                                </div>
                            </div>
                            <Button variant="outline" class="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onclick={() => uninstallApp(app.id)}>
                                <Trash2 class="h-4 w-4 mr-2" />
                                Απεγκατάσταση
                            </Button>
                        </div>
                    {/each}
                </div>
            </div>
		{/if}
	</div>
</div>
