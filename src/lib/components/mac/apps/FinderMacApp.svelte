<script lang="ts">
	import type { MacSimFolder } from '$lib/lessons/macSim';

	/**
	 * A minimal Finder: a sidebar of folders. Opening one emits
	 * `mac-folder-opened{folderId}` — the mac equivalent of navigating in File
	 * Explorer, but with the macOS look (sidebar + column of items).
	 */
	let { folders = [], onEvent } = $props<{
		folders?: MacSimFolder[];
		onEvent: (action: string, data?: Record<string, unknown>) => void;
	}>();

	let openFolderId = $state<string | null>(null);
	const openFolder = $derived(folders.find((f: MacSimFolder) => f.id === openFolderId) ?? null);

	function open(id: string) {
		openFolderId = id;
		onEvent('mac-folder-opened', { folderId: id });
	}
</script>

<div class="flex h-full min-h-64 [font-family:-apple-system,system-ui,sans-serif]">
	<!-- Sidebar -->
	<nav
		class="w-44 shrink-0 space-y-1 border-r border-black/10 bg-neutral-50 p-2"
		aria-label="Αγαπημένα Finder"
	>
		<p class="px-2 py-1 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
			Αγαπημένα
		</p>
		{#each folders as folder (folder.id)}
			<button
				type="button"
				class="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-blue-500 hover:text-white"
				class:bg-blue-500={openFolderId === folder.id}
				class:text-white={openFolderId === folder.id}
				aria-current={openFolderId === folder.id ? 'true' : undefined}
				onclick={() => open(folder.id)}
			>
				<span class="text-lg" aria-hidden="true">{folder.icon ?? '📁'}</span>
				<span class="font-medium">{folder.name}</span>
			</button>
		{/each}
	</nav>

	<!-- Content pane -->
	<div class="flex-1 p-4">
		{#if openFolder}
			<h3 class="mb-3 flex items-center gap-2 text-lg font-semibold text-neutral-800">
				<span aria-hidden="true">{openFolder.icon ?? '📁'}</span>
				{openFolder.name}
			</h3>
			<div class="grid grid-cols-3 gap-4 text-center text-sm text-neutral-600">
				<div class="flex flex-col items-center gap-1">
					<span class="text-4xl" aria-hidden="true">📄</span> Έγγραφο.txt
				</div>
				<div class="flex flex-col items-center gap-1">
					<span class="text-4xl" aria-hidden="true">🖼️</span> Φωτογραφία.jpg
				</div>
			</div>
		{:else}
			<div class="flex h-full items-center justify-center text-center text-neutral-400">
				<p>Διάλεξε έναν φάκελο από τα «Αγαπημένα» στα αριστερά.</p>
			</div>
		{/if}
	</div>
</div>
