<script lang="ts">
	/**
	 * Minimal macOS System Settings: an accessibility "text size" control. Picking
	 * a size emits `mac-size-changed{setting:'text', size}`. Kept to one setting so
	 * the goal is unambiguous (codex plan review).
	 */
	let { onEvent } = $props<{
		onEvent: (action: string, data?: Record<string, unknown>) => void;
	}>();

	const SIZES = [
		{ id: 'small', label: 'Μικρά', px: 'text-sm' },
		{ id: 'medium', label: 'Κανονικά', px: 'text-base' },
		{ id: 'large', label: 'Μεγάλα', px: 'text-2xl' }
	];

	let selected = $state('medium');

	function pick(size: string) {
		selected = size;
		onEvent('mac-size-changed', { setting: 'text', size });
	}
</script>

<div class="min-h-64 space-y-5 p-5 [font-family:-apple-system,system-ui,sans-serif]">
	<h3 class="flex items-center gap-2 text-lg font-semibold text-neutral-800">
		<span aria-hidden="true">👁️</span> Προσβασιμότητα · Μέγεθος κειμένου
	</h3>
	<p class="text-sm text-neutral-500">Διάλεξε πόσο μεγάλα θα φαίνονται τα γράμματα.</p>

	<fieldset class="space-y-3">
		<legend class="sr-only">Μέγεθος κειμένου</legend>
		{#each SIZES as size (size.id)}
			<button
				type="button"
				class="flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition"
				class:border-blue-500={selected === size.id}
				class:bg-blue-50={selected === size.id}
				class:border-neutral-200={selected !== size.id}
				aria-pressed={selected === size.id}
				onclick={() => pick(size.id)}
			>
				<span class={size.px + ' font-medium text-neutral-800'}>{size.label}</span>
				{#if selected === size.id}
					<span class="text-blue-600" aria-hidden="true">✓</span>
				{/if}
			</button>
		{/each}
	</fieldset>

	<p
		class="rounded-lg bg-neutral-100 p-3 {SIZES.find((s) => s.id === selected)
			?.px} text-neutral-700"
	>
		Παράδειγμα: Καλημέρα! Έτσι θα φαίνονται τα γράμματα.
	</p>
</div>
