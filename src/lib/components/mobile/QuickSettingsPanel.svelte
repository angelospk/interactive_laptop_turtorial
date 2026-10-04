<script lang="ts">
	/**
	 * Pull-down «Γρήγορες ρυθμίσεις» (Android) / Κέντρο ελέγχου (iPhone) — the
	 * tiles the theory lists (esm001-c2-s6). Opened from the status bar in
	 * MobileFrame. Semantic event: mobile-quick-toggle { tile, on }.
	 */
	const QUICK_TILES = [
		{ id: 'wifi', label: 'Wi-Fi', icon: '📶' },
		{ id: 'bluetooth', label: 'Bluetooth', icon: '🔵' },
		{ id: 'torch', label: 'Φακός', icon: '🔦' },
		{ id: 'airplane', label: 'Λειτουργία πτήσης', icon: '✈️' }
	] as const;

	let {
		onToggle,
		onClose
	}: {
		onToggle: (tile: string, on: boolean) => void;
		onClose: () => void;
	} = $props();

	// Wi-Fi starts on, like a real phone at home.
	let on = $state<Record<string, boolean>>({ wifi: true });

	function toggle(id: string) {
		on[id] = !on[id];
		onToggle(id, on[id]);
	}
</script>

<div
	data-testid="quick-settings"
	class="absolute inset-x-0 top-0 z-30 rounded-b-3xl bg-slate-800 p-4 text-white shadow-2xl"
>
	<p class="mb-3 text-sm font-semibold text-slate-300">Γρήγορες ρυθμίσεις</p>
	<div class="grid grid-cols-2 gap-3">
		{#each QUICK_TILES as tile (tile.id)}
			<button
				type="button"
				role="switch"
				aria-checked={on[tile.id] ?? false}
				aria-label={tile.label}
				onclick={() => toggle(tile.id)}
				class="flex min-h-[56px] items-center gap-2 rounded-2xl px-3 text-left text-sm font-medium transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none {on[
					tile.id
				]
					? 'bg-blue-500 text-white'
					: 'bg-slate-700 text-slate-200'}"
			>
				<span aria-hidden="true" class="text-xl">{tile.icon}</span>
				{tile.label}
			</button>
		{/each}
	</div>
	<button
		type="button"
		onclick={onClose}
		class="mx-auto mt-4 block rounded-full bg-slate-700 px-6 py-2 text-sm"
	>
		Κλείσιμο
	</button>
</div>
