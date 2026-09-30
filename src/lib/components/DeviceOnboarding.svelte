<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import Monitor from '@lucide/svelte/icons/monitor';
	import Laptop from '@lucide/svelte/icons/laptop';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import TabletSmartphone from '@lucide/svelte/icons/tablet-smartphone';
	import HelpCircle from '@lucide/svelte/icons/circle-help';
	import { detectDevice, type Device } from '$lib/utils/deviceDetect';
	import { invalidateAll } from '$app/navigation';

	type ChoosableDevice = Exclude<Device, 'unknown'>;

	// Two modes:
	//  • First-time onboarding (layout): open defaults true, not dismissable —
	//    the user must confirm a device before continuing.
	//  • Change-later (header chip): parent binds `open`, passes the current
	//    device and `dismissable` so the modal can be closed without choosing.
	// Auto-detect is only a HINT here — the user confirms (elderly-UX, ROADMAP §3).
	let {
		open = $bindable(true),
		currentDevice = null,
		dismissable = false
	}: {
		open?: boolean;
		currentDevice?: ChoosableDevice | null;
		dismissable?: boolean;
	} = $props();

	let helpOpen = $state(false);
	let saving = $state<ChoosableDevice | null>(null);
	let error = $state<string | null>(null);
	// Deliberately $state + $effect (not $derived): detection must wait until after
	// hydration so the client's first render matches the server's ('unknown').
	// eslint-disable-next-line svelte/prefer-writable-derived -- avoid SSR/hydration mismatch
	let guess = $state<Device>('unknown');

	$effect(() => {
		guess = detectDevice().device;
	});

	// Which option to highlight: the already-chosen device wins over the guess.
	const highlighted = $derived<Device>(currentDevice ?? guess);

	// Written as things to look at, not as jargon: a learner who knows the word
	// "macOS" does not need this panel.
	const DEVICE_CLUES = [
		{
			label: 'Υπολογιστής Mac',
			hint: 'Πάνω αριστερά στην οθόνη υπάρχει ένα μαύρο μήλο. Στο πληκτρολόγιο, δίπλα στο κενό, υπάρχει πλήκτρο ⌘ (Command).'
		},
		{
			label: 'Υπολογιστής Windows',
			hint: 'Στη γραμμή στο κάτω μέρος της οθόνης υπάρχει το λογότυπο των Windows (τέσσερα τετραγωνάκια, σαν παραθυράκι) — στα Windows 11 βρίσκεται στο κέντρο, σε παλιότερες εκδόσεις αριστερά. Το ίδιο σχήμα υπάρχει και σε πλήκτρο δίπλα στο κενό.'
		},
		{
			label: 'iPhone',
			hint: 'Κινητό της Apple. Στο πίσω μέρος έχει το μήλο και οι εφαρμογές ανοίγουν από το App Store.'
		},
		{
			label: 'Κινητό Android',
			hint: 'Κάθε άλλο κινητό (Samsung, Xiaomi, Huawei, Motorola…). Οι εφαρμογές κατεβαίνουν από το Play Store.'
		}
	];

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
		interactOutsideBehavior={dismissable ? 'close' : 'ignore'}
		escapeKeydownBehavior={dismissable ? 'close' : 'ignore'}
		showCloseButton={dismissable}
	>
		<Dialog.Header>
			<Dialog.Title class="text-2xl">
				{currentDevice ? 'Άλλαξε συσκευή μαθημάτων' : 'Τι θέλεις να μάθεις να χρησιμοποιείς;'}
			</Dialog.Title>
			<Dialog.Description class="text-base">
				Διάλεξε τη συσκευή για την οποία θέλεις μαθήματα. Μπορείς να την αλλάξεις όποτε θέλεις
				αργότερα.
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
			{#each OPTIONS as opt (opt.device)}
				{@const isCurrent = currentDevice === opt.device}
				{@const isHint = !currentDevice && guess === opt.device}
				<button
					type="button"
					onclick={() => choose(opt.device)}
					disabled={saving !== null}
					class="relative flex flex-col items-center gap-3 rounded-2xl border-2 border-gray-200 p-6 text-center transition hover:border-blue-500 hover:bg-blue-50 focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:outline-none disabled:opacity-50"
					class:border-blue-500={highlighted === opt.device}
					class:bg-blue-50={highlighted === opt.device}
				>
					{#if isCurrent}
						<span
							class="absolute -top-3 rounded-full bg-emerald-600 px-3 py-1 text-sm font-semibold text-white"
						>
							Η συσκευή σου
						</span>
					{:else if isHint}
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

		<!--
			Auto-detection is a hint, never the answer, and a learner who cannot name
			their device cannot confirm a hint either. These are the clues they can
			check on the machine in front of them.
		-->
		<div class="rounded-xl bg-gray-50 p-4">
			<button
				type="button"
				onclick={() => (helpOpen = !helpOpen)}
				aria-expanded={helpOpen}
				aria-controls="device-help"
				class="flex min-h-12 w-full items-center justify-between gap-2 rounded-lg px-2 text-left text-base font-semibold text-blue-800 hover:bg-blue-50 focus-visible:ring-4 focus-visible:ring-blue-300 focus-visible:outline-none"
			>
				<span class="inline-flex items-center gap-2">
					<HelpCircle class="size-5 shrink-0" aria-hidden="true" />
					Δεν ξέρω τι συσκευή έχω
				</span>
				<span aria-hidden="true">{helpOpen ? '▲' : '▼'}</span>
			</button>

			{#if helpOpen}
				<ul id="device-help" class="mt-3 grid gap-3 px-2 text-base text-gray-800">
					{#each DEVICE_CLUES as clue (clue.label)}
						<li>
							<strong class="font-semibold">{clue.label}:</strong>
							{clue.hint}
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		{#if error}
			<p class="text-center text-sm font-medium text-red-600" role="alert">{error}</p>
		{/if}
	</Dialog.Content>
</Dialog.Root>
