<script lang="ts">
	import type { MacSimApp } from '$lib/lessons/macSim';

	/**
	 * Spotlight search overlay. Typing filters the apps; the goal completes only
	 * when the learner ACTIVATES a result (opens it), which the parent turns into a
	 * `mac-app-opened{source:'spotlight'}` event (codex plan review).
	 */
	let {
		apps,
		seed = '',
		onLaunch,
		onClose
	} = $props<{
		apps: MacSimApp[];
		seed?: string;
		onLaunch: (appId: string) => void;
		onClose: () => void;
	}>();

	let query = $state(seed);

	const results = $derived(
		query.trim()
			? apps.filter((a: MacSimApp) => a.label.toLowerCase().includes(query.trim().toLowerCase()))
			: apps
	);
</script>

<div
	class="absolute inset-0 z-30 flex justify-center bg-black/30 pt-16 backdrop-blur-sm"
	role="dialog"
	aria-modal="true"
	aria-label="Spotlight"
>
	<!-- Backdrop click closes -->
	<button
		type="button"
		class="absolute inset-0 cursor-default"
		aria-label="Κλείσιμο"
		onclick={onClose}
	></button>

	<div
		class="relative z-10 flex max-h-[70%] w-[80%] max-w-md flex-col overflow-hidden rounded-xl border border-white/30 bg-white/95 shadow-2xl backdrop-blur"
	>
		<div class="flex items-center gap-2 border-b border-black/10 px-3 py-2">
			<span class="text-lg" aria-hidden="true">🔍</span>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				type="text"
				bind:value={query}
				placeholder="Αναζήτηση Spotlight"
				aria-label="Πεδίο αναζήτησης Spotlight"
				autofocus
				class="w-full bg-transparent text-lg text-neutral-800 outline-none placeholder:text-neutral-400"
			/>
		</div>
		<div class="overflow-auto py-1">
			{#if results.length === 0}
				<p class="px-3 py-3 text-sm text-neutral-500">Κανένα αποτέλεσμα.</p>
			{:else}
				{#each results as app (app.id)}
					<button
						type="button"
						class="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-blue-500 hover:text-white"
						onclick={() => onLaunch(app.id)}
					>
						<span class="text-2xl" aria-hidden="true">{app.icon}</span>
						<span class="text-base font-medium">{app.label}</span>
					</button>
				{/each}
			{/if}
		</div>
	</div>
</div>
