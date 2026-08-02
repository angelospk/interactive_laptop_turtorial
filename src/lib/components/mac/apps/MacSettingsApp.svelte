<script lang="ts">
	/**
	 * Minimal macOS System Settings: accessibility "text size" and "pointer size"
	 * controls. Picking a size emits `mac-size-changed{setting:'text'|'pointer', size}`.
	 * Each control is a separate fieldset so the goal stays unambiguous.
	 */
	let { onEvent } = $props<{
		onEvent: (action: string, data?: Record<string, unknown>) => void;
	}>();

	const SIZES = [
		{ id: 'small', label: 'Μικρά', px: 'text-sm' },
		{ id: 'medium', label: 'Κανονικά', px: 'text-base' },
		{ id: 'large', label: 'Μεγάλα', px: 'text-2xl' }
	];

	const POINTER_SIZES = [
		{ id: 'small', label: 'Μικρός', px: 20 },
		{ id: 'medium', label: 'Κανονικός', px: 28 },
		{ id: 'large', label: 'Μεγάλος', px: 44 }
	];

	let selected = $state('medium');
	let pointerSelected = $state('medium');

	function pick(size: string) {
		selected = size;
		onEvent('mac-size-changed', { setting: 'text', size });
	}

	function pickPointer(size: string) {
		pointerSelected = size;
		onEvent('mac-size-changed', { setting: 'pointer', size });
	}

	const pointerPx = $derived(POINTER_SIZES.find((s) => s.id === pointerSelected)?.px ?? 28);
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

	<h3
		class="flex items-center gap-2 border-t border-neutral-200 pt-5 text-lg font-semibold text-neutral-800"
	>
		<span aria-hidden="true">🖱️</span> Προσβασιμότητα · Μέγεθος δείκτη (ποντικιού)
	</h3>
	<p class="text-sm text-neutral-500">Διάλεξε πόσο μεγάλο θα είναι το βελάκι του ποντικιού.</p>

	<fieldset class="space-y-3">
		<legend class="sr-only">Μέγεθος δείκτη ποντικιού</legend>
		{#each POINTER_SIZES as size (size.id)}
			<button
				type="button"
				class="flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition"
				class:border-blue-500={pointerSelected === size.id}
				class:bg-blue-50={pointerSelected === size.id}
				class:border-neutral-200={pointerSelected !== size.id}
				aria-pressed={pointerSelected === size.id}
				onclick={() => pickPointer(size.id)}
			>
				<span class="flex items-center gap-3 font-medium text-neutral-800">
					<svg
						viewBox="0 0 24 24"
						width={size.px}
						height={size.px}
						aria-hidden="true"
						class="shrink-0"
					>
						<path
							d="M5 3l14 10-6 1 3 6-3 1.5-3-6-5 4z"
							fill="white"
							stroke="black"
							stroke-width="1.5"
							stroke-linejoin="round"
						/>
					</svg>
					{size.label}
				</span>
				{#if pointerSelected === size.id}
					<span class="text-blue-600" aria-hidden="true">✓</span>
				{/if}
			</button>
		{/each}
	</fieldset>

	<div class="flex items-center gap-3 rounded-lg bg-neutral-100 p-3 text-neutral-700">
		<svg
			viewBox="0 0 24 24"
			width={pointerPx}
			height={pointerPx}
			aria-hidden="true"
			class="shrink-0 transition-all"
		>
			<path
				d="M5 3l14 10-6 1 3 6-3 1.5-3-6-5 4z"
				fill="white"
				stroke="black"
				stroke-width="1.5"
				stroke-linejoin="round"
			/>
		</svg>
		<span>Έτσι θα φαίνεται ο δείκτης του ποντικιού.</span>
	</div>
</div>
