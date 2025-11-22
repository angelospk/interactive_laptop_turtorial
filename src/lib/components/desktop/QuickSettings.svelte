<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Slider } from '$lib/components/ui/slider';
	import { Wifi, Volume2, Sun, Battery, Bluetooth, Plane, Settings } from 'lucide-svelte';
	import { osState } from '$lib/osState.svelte';
	import { slide } from 'svelte/transition';

	let {
        isOpen,
        onClose,
        onOpenSettings
    } = $props<{
		isOpen: boolean;
		onClose: () => void;
        onOpenSettings: (page: string) => void;
	}>();

	function toggleWifi() {
		osState.toggleWifi(!osState.wifiEnabled);
	}

    function toggleBluetooth() {
        osState.bluetoothEnabled = !osState.bluetoothEnabled;
    }

    function toggleAirplane() {
        osState.airplaneMode = !osState.airplaneMode;
        if(osState.airplaneMode) {
            osState.wifiEnabled = false;
            osState.bluetoothEnabled = false;
        }
    }

</script>

{#if isOpen}
	<div
		class="absolute bottom-14 right-4 z-50 w-80 rounded-xl bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur-md transition-all"
		transition:slide={{ duration: 200, axis: 'y' }}
        onclick={(e) => e.stopPropagation()}
	>
		<!-- Quick Toggles Grid -->
		<div class="mb-6 grid grid-cols-3 gap-4">
			<!-- WiFi -->
			<button
				class="flex flex-col items-center gap-2"
				onclick={toggleWifi}
			>
				<div
					class="flex h-12 w-24 items-center justify-center rounded-full border transition-all
                    {osState.wifiEnabled ? 'bg-blue-500 border-blue-500' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}"
				>
					<Wifi class="h-5 w-5 {osState.wifiEnabled ? 'text-white' : 'text-slate-300'}" />
				</div>
				<span class="text-xs font-medium">
                    {osState.wifiEnabled ? (osState.connectedNetwork || 'Available') : 'Wi-Fi'}
                </span>
			</button>

			<!-- Bluetooth -->
			<button
				class="flex flex-col items-center gap-2"
				onclick={toggleBluetooth}
			>
				<div
					class="flex h-12 w-24 items-center justify-center rounded-full border transition-all
                    {osState.bluetoothEnabled ? 'bg-blue-500 border-blue-500' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}"
				>
					<Bluetooth class="h-5 w-5 {osState.bluetoothEnabled ? 'text-white' : 'text-slate-300'}" />
				</div>
				<span class="text-xs font-medium">Bluetooth</span>
			</button>

            <!-- Airplane Mode -->
			<button
				class="flex flex-col items-center gap-2"
				onclick={toggleAirplane}
			>
				<div
					class="flex h-12 w-24 items-center justify-center rounded-full border transition-all
                    {osState.airplaneMode ? 'bg-blue-500 border-blue-500' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}"
				>
					<Plane class="h-5 w-5 {osState.airplaneMode ? 'text-white' : 'text-slate-300'}" />
				</div>
				<span class="text-xs font-medium">Λειτουργία πτήσης</span>
			</button>
		</div>

		<!-- Sliders -->
		<div class="space-y-6 px-2">
            <!-- Brightness -->
			<div class="flex items-center gap-4">
				<Sun class="h-5 w-5 text-slate-400" />
				<div class="flex-1">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        bind:value={osState.brightness}
                        class="w-full accent-blue-500 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
			</div>

            <!-- Volume -->
			<div class="flex items-center gap-4">
				<Volume2 class="h-5 w-5 text-slate-400" />
				<div class="flex-1">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        bind:value={osState.volume}
                        class="w-full accent-blue-500 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
			</div>
		</div>

		<!-- Footer -->
		<div class="mt-6 flex items-center justify-between border-t border-slate-700 pt-4">
			<div class="flex items-center gap-2 text-xs text-slate-400">
				<Battery class="h-4 w-4" />
				<span>74%</span>
			</div>
			<button
				class="rounded-full p-2 hover:bg-slate-700"
				onclick={() => onOpenSettings('system')}
                title="Όλες οι ρυθμίσεις"
			>
				<Settings class="h-4 w-4 text-slate-300" />
			</button>
		</div>
	</div>
{/if}
