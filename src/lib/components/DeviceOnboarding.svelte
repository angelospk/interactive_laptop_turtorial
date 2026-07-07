<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Monitor from '@lucide/svelte/icons/monitor';
	import Laptop from '@lucide/svelte/icons/laptop';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import TabletSmartphone from '@lucide/svelte/icons/tablet-smartphone';
	import { detectDevice, type Device } from '$lib/utils/deviceDetect';
	import { invalidateAll } from '$app/navigation';

	type ChoosableDevice = Exclude<Device, 'unknown'>;

	// Shown once, after login, while the user has not picked a learning device.
	// Auto-detect is only a HINT here — the user confirms (elderly-UX, ROADMAP §3).
	let open = $state(true);
	let saving = $state<ChoosableDevice | null>(null);
	let error = $state<string | null>(null);
	let guess = $state<Device>('unknown');

	$effect(() => {
		guess = detectDevice().device;
	});

	const OPTIONS: { device: ChoosableDevice; label: string; icon: typeof Monitor }[] = [
		{ device: 'windows', label: 'Υπολογιστής Windows', icon: Monitor },
		{ device: 'android', label: 'Κινητό Android', icon: Smartphone },
		{ device: 'iphone', label: 'iPhone', icon: TabletSmartphone },
		{ device: 'mac', label: 'Υπολογιστής Mac', icon: Laptop }
	];

	async function choose(device: ChoosableDevice) {
		saving = device;
		error = null;
		try {
			const res = await fetch('/api/user/device', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ device })
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error ?? 'Κάτι πήγε στραβά');
			}
			open = false;
			await invalidateAll();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Κάτι πήγε στραβά';
			saving = null;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="max-w-2xl"
		interactOutsideBehavior="ignore"
		escapeKeydownBehavior="ignore"
		showCloseButton={false}
	>
		<Dialog.Header>
			<Dialog.Title class="text-2xl">Τι θέλεις να μάθεις να χρησιμοποιείς;</Dialog.Title>
			<Dialog.Description class="text-base">
				Διάλεξε τη συσκευή για την οποία θέλεις μαθήματα. Μπορείς να την αλλάξεις όποτε
				θέλεις αργότερα.
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
			{#each OPTIONS as opt (opt.device)}
				<button
					type="button"
					onclick={() => choose(opt.device)}
					disabled={saving !== null}
					class="relative flex flex-col items-center gap-3 rounded-2xl border-2 border-gray-200 p-6 text-center transition hover:border-blue-500 hover:bg-blue-50 focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:outline-none disabled:opacity-50"
					class:border-blue-500={guess === opt.device}
					class:bg-blue-50={guess === opt.device}
				>
					{#if guess === opt.device}
						<span
							class="absolute -top-3 rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white"
						>
							Μάλλον αυτό
						</span>
					{/if}
					<opt.icon class="size-14 text-blue-700" aria-hidden="true" />
					<span class="text-lg font-semibold text-gray-900">{opt.label}</span>
					{#if saving === opt.device}
						<span class="text-sm text-blue-600">Αποθήκευση…</span>
					{/if}
				</button>
			{/each}
		</div>

		{#if error}
			<p class="text-center text-sm font-medium text-red-600" role="alert">{error}</p>
		{/if}
	</Dialog.Content>
</Dialog.Root>
