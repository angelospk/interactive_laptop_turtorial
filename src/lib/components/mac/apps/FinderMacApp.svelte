<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import List from '@lucide/svelte/icons/list';
	import Search from '@lucide/svelte/icons/search';
	import type { MacSimFolder, MacSimFolderItem } from '$lib/lessons/macSim';
	import type { MacState } from '../macState.svelte';
	import { cn } from '$lib/utils';

	/**
	 * Finder: toolbar (back/forward, view switcher, search), the «Αγαπημένα»
	 * sidebar with the lesson's folders, a list or icon view of the folder's
	 * contents with Name / Date modified / Size columns, and the path bar at the
	 * bottom. Opening a folder from the sidebar emits `mac-folder-opened{folderId}`
	 * — the mac equivalent of navigating in File Explorer. Which folder is open
	 * (and the view) lives in the host-owned machine state, so it survives
	 * switching to another app and back.
	 */
	let {
		folders = [],
		machine,
		onEvent
	} = $props<{
		folders?: MacSimFolder[];
		machine?: MacState;
		onEvent: (action: string, data?: Record<string, unknown>) => void;
	}>();

	// Without a host state (older callers/tests) keep the selection locally.
	let localFolderId = $state<string | null>(null);
	let localView = $state<'list' | 'icons'>('list');
	const openFolderId = $derived(machine ? machine.finderFolderId : localFolderId);
	const view = $derived(machine ? machine.finderView : localView);
	function setFolder(id: string | null) {
		if (machine) machine.finderFolderId = id;
		else localFolderId = id;
	}
	function setView(v: 'list' | 'icons') {
		if (machine) machine.finderView = v;
		else localView = v;
	}

	const openFolder = $derived(folders.find((f: MacSimFolder) => f.id === openFolderId) ?? null);

	// Back/forward history over sidebar picks (null = the start page). Seeded
	// once from whatever folder was open when the window (re)appeared.
	let history = $state<(string | null)[]>([machine ? machine.finderFolderId : null]);
	let cursor = $state(0);
	const canBack = $derived(cursor > 0);
	const canForward = $derived(cursor < history.length - 1);

	let query = $state('');
	const fold = (t: string) => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

	/** Default contents per well-known folder name, so a folder is never a blank pane. */
	function defaultItems(folder: MacSimFolder): MacSimFolderItem[] {
		const n = fold(folder.name);
		if (n.includes('εγγραφα') || n.includes('documents'))
			return [
				{ name: 'Συνταγή Κέικ.pages', kind: 'document', modified: 'Χθες, 18:40', size: '24 KB' },
				{ name: 'Λογαριασμός ΔΕΗ.pdf', kind: 'pdf', modified: '28 Σεπ 2026', size: '310 KB' },
				{ name: 'Έξοδα 2026.numbers', kind: 'sheet', modified: '15 Σεπ 2026', size: '58 KB' },
				{ name: 'Φάκελος φωτογραφιών', kind: 'folder', modified: '2 Σεπ 2026' }
			];
		if (n.includes('ληψεις') || n.includes('downloads'))
			return [
				{ name: 'Βεβαίωση gov.gr.pdf', kind: 'pdf', modified: 'Σήμερα, 09:12', size: '142 KB' },
				{ name: 'Οδηγίες εκτυπωτή.pdf', kind: 'pdf', modified: '20 Σεπ 2026', size: '1,2 MB' },
				{ name: 'Αρχείο.zip', kind: 'archive', modified: '11 Σεπ 2026', size: '4,8 MB' }
			];
		if (n.includes('εικονες') || n.includes('φωτογραφ') || n.includes('pictures'))
			return [
				{ name: 'Διακοπές.jpg', kind: 'image', modified: '12 Αυγ 2026', size: '2,1 MB' },
				{ name: 'Εγγόνια.jpg', kind: 'image', modified: '3 Αυγ 2026', size: '1,7 MB' }
			];
		if (n.includes('επιφανεια') || n.includes('desktop'))
			return [
				{ name: 'Σημείωμα.txt', kind: 'document', modified: 'Σήμερα, 08:05', size: '1 KB' },
				{
					name: 'Στιγμιότυπο 2026-10-01.png',
					kind: 'image',
					modified: '1 Οκτ 2026',
					size: '640 KB'
				}
			];
		return [
			{ name: 'Έγγραφο.txt', kind: 'document', modified: 'Χθες, 12:00', size: '2 KB' },
			{ name: 'Φωτογραφία.jpg', kind: 'image', modified: '10 Σεπ 2026', size: '1,3 MB' }
		];
	}

	const items = $derived.by((): MacSimFolderItem[] => {
		if (!openFolder) return [];
		const all: MacSimFolderItem[] = openFolder.items ?? defaultItems(openFolder);
		const q = fold(query.trim());
		return q ? all.filter((i) => fold(i.name).includes(q)) : all;
	});

	const KIND_ICON: Record<MacSimFolderItem['kind'], string> = {
		folder: '📁',
		document: '📄',
		image: '🖼️',
		pdf: '📕',
		sheet: '📊',
		archive: '🗜️'
	};
	const KIND_LABEL: Record<MacSimFolderItem['kind'], string> = {
		folder: 'Φάκελος',
		document: 'Έγγραφο',
		image: 'Εικόνα',
		pdf: 'Έγγραφο PDF',
		sheet: 'Υπολογιστικό φύλλο',
		archive: 'Συμπιεσμένο αρχείο'
	};

	let selected = $state<string | null>(null);
	let itemNotice = $state('');

	function go(id: string | null, emit: boolean) {
		setFolder(id);
		selected = null;
		query = '';
		itemNotice = '';
		if (emit && id) onEvent('mac-folder-opened', { folderId: id });
	}

	function open(id: string) {
		history = [...history.slice(0, cursor + 1), id];
		cursor = history.length - 1;
		go(id, true);
	}

	function back() {
		if (!canBack) return;
		cursor -= 1;
		go(history[cursor], false);
	}
	function forward() {
		if (!canForward) return;
		cursor += 1;
		go(history[cursor], false);
	}

	function openItem(item: MacSimFolderItem) {
		selected = item.name;
		itemNotice =
			item.kind === 'folder'
				? `«${item.name}»: υποφάκελος. Σε αυτή την άσκηση ανοίγουν μόνο οι φάκελοι της πλαϊνής στήλης.`
				: `«${item.name}» (${KIND_LABEL[item.kind]}): θα άνοιγε στο αντίστοιχο πρόγραμμα. Δεν χρειάζεται στο μάθημα.`;
	}

	const toolBtn =
		'flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a60ff] disabled:opacity-30 disabled:hover:bg-transparent';
</script>

<div class="flex h-full min-h-64 flex-col text-[13px]">
	<div class="flex min-h-0 flex-1">
		<!-- Sidebar -->
		<nav
			class="w-44 shrink-0 space-y-3 overflow-y-auto border-r border-black/10 bg-[#f1f0f0]/90 p-2"
			aria-label="Πλαϊνή στήλη Finder"
		>
			<div>
				<p class="px-2 py-1 text-[11px] font-semibold text-neutral-400">Αγαπημένα</p>
				{#each folders as folder (folder.id)}
					<button
						type="button"
						class={cn(
							'flex min-h-9 w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-[#0a60ff] focus-visible:outline-none',
							openFolderId === folder.id && 'bg-neutral-300/70 font-medium hover:bg-neutral-300/70'
						)}
						aria-current={openFolderId === folder.id ? 'true' : undefined}
						onclick={() => open(folder.id)}
					>
						<span class="text-base" aria-hidden="true">{folder.icon ?? '📁'}</span>
						<span class="truncate">{folder.name}</span>
					</button>
				{/each}
			</div>
			<div aria-label="iCloud">
				<p class="px-2 py-1 text-[11px] font-semibold text-neutral-400">iCloud</p>
				<p
					class="flex items-center gap-2 px-2 py-1.5 text-neutral-400"
					title="Αρχεία στο cloud της Apple — δεν χρειάζονται στο μάθημα"
				>
					<span aria-hidden="true">☁️</span> iCloud Drive
				</p>
			</div>
			<div aria-label="Θέσεις">
				<p class="px-2 py-1 text-[11px] font-semibold text-neutral-400">Θέσεις</p>
				<p
					class="flex items-center gap-2 px-2 py-1.5 text-neutral-400"
					title="Ο δίσκος του υπολογιστή — δεν χρειάζεται στο μάθημα"
				>
					<span aria-hidden="true">💻</span> Macintosh HD
				</p>
			</div>
		</nav>

		<div class="flex min-w-0 flex-1 flex-col">
			<!-- Toolbar -->
			<div
				class="flex shrink-0 items-center gap-1 border-b border-black/10 bg-[#f6f6f6] px-2 py-1.5"
			>
				<button type="button" class={toolBtn} onclick={back} disabled={!canBack} aria-label="Πίσω"
					><ChevronLeft class="h-4 w-4" /></button
				>
				<button
					type="button"
					class={toolBtn}
					onclick={forward}
					disabled={!canForward}
					aria-label="Μπροστά"><ChevronRight class="h-4 w-4" /></button
				>
				<span class="ml-2 truncate font-semibold text-neutral-700"
					>{openFolder?.name ?? 'Finder'}</span
				>
				<div
					class="ml-auto flex items-center rounded-md bg-black/5 p-0.5"
					role="group"
					aria-label="Προβολή"
				>
					<button
						type="button"
						class={cn(toolBtn, 'h-7 w-8', view === 'icons' && 'bg-white shadow-sm')}
						aria-pressed={view === 'icons'}
						aria-label="Προβολή ως εικονίδια"
						onclick={() => setView('icons')}><LayoutGrid class="h-4 w-4" /></button
					>
					<button
						type="button"
						class={cn(toolBtn, 'h-7 w-8', view === 'list' && 'bg-white shadow-sm')}
						aria-pressed={view === 'list'}
						aria-label="Προβολή ως λίστα"
						onclick={() => setView('list')}><List class="h-4 w-4" /></button
					>
				</div>
				<label
					class="ml-1 flex h-8 w-36 items-center gap-1.5 rounded-md border border-black/10 bg-white px-2 focus-within:ring-2 focus-within:ring-[#0a60ff]"
				>
					<Search class="h-3.5 w-3.5 shrink-0 text-neutral-400" aria-hidden="true" />
					<input
						type="search"
						bind:value={query}
						placeholder="Αναζήτηση"
						aria-label="Αναζήτηση στον φάκελο"
						disabled={!openFolder}
						class="w-full min-w-0 bg-transparent outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed"
					/>
				</label>
			</div>

			<!-- Content pane -->
			<div class="min-h-0 flex-1 overflow-auto bg-white">
				{#if !openFolder}
					<div
						class="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-neutral-400"
					>
						<span class="text-5xl" aria-hidden="true">🗂️</span>
						<p>Διάλεξε έναν φάκελο από τα «Αγαπημένα» στα αριστερά.</p>
					</div>
				{:else if items.length === 0}
					<p class="p-6 text-center text-neutral-400">
						{query.trim()
							? `Τίποτα για «${query.trim()}» σε αυτόν τον φάκελο.`
							: 'Ο φάκελος είναι άδειος.'}
					</p>
				{:else if view === 'list'}
					<table class="w-full border-collapse text-left">
						<thead class="sticky top-0 bg-white text-[11px] text-neutral-500">
							<tr class="border-b border-black/10">
								<th class="px-3 py-1.5 font-medium">Όνομα</th>
								<th class="hidden px-3 py-1.5 font-medium sm:table-cell">Ημερομηνία τροποποίησης</th
								>
								<th class="px-3 py-1.5 font-medium">Μέγεθος</th>
							</tr>
						</thead>
						<tbody>
							{#each items as item, i (item.name)}
								<tr
									class={cn(
										'cursor-default',
										selected === item.name
											? 'bg-[#0a60ff] text-white'
											: i % 2
												? 'bg-neutral-50'
												: 'bg-white'
									)}
								>
									<td class="px-3 py-1">
										<button
											type="button"
											class="flex w-full items-center gap-2 text-left focus-visible:ring-2 focus-visible:ring-[#0a60ff] focus-visible:outline-none"
											onclick={() => (selected = item.name)}
											ondblclick={() => openItem(item)}
											aria-label={`${item.name}, ${KIND_LABEL[item.kind]}`}
										>
											<span aria-hidden="true">{KIND_ICON[item.kind]}</span><span class="truncate"
												>{item.name}</span
											>
										</button>
									</td>
									<td
										class="hidden px-3 py-1 sm:table-cell {selected === item.name
											? 'text-white/80'
											: 'text-neutral-500'}">{item.modified ?? '--'}</td
									>
									<td
										class="px-3 py-1 tabular-nums {selected === item.name
											? 'text-white/80'
											: 'text-neutral-500'}"
										>{item.kind === 'folder' ? '--' : (item.size ?? '--')}</td
									>
								</tr>
							{/each}
						</tbody>
					</table>
				{:else}
					<div class="grid grid-cols-3 gap-3 p-4 sm:grid-cols-4">
						{#each items as item (item.name)}
							<button
								type="button"
								class={cn(
									'flex flex-col items-center gap-1 rounded-lg p-2 text-center focus-visible:ring-2 focus-visible:ring-[#0a60ff] focus-visible:outline-none',
									selected === item.name ? 'bg-neutral-200' : 'hover:bg-neutral-100'
								)}
								onclick={() => (selected = item.name)}
								ondblclick={() => openItem(item)}
								aria-label={`${item.name}, ${KIND_LABEL[item.kind]}`}
							>
								<span class="text-4xl" aria-hidden="true">{KIND_ICON[item.kind]}</span>
								<span class="line-clamp-2 text-xs break-all text-neutral-700">{item.name}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Path bar + notices -->
			<div
				class="flex shrink-0 items-center gap-1 border-t border-black/10 bg-[#f6f6f6] px-3 py-1 text-[11px] text-neutral-500"
			>
				<span aria-hidden="true">💻</span><span>Macintosh HD</span>
				<span aria-hidden="true">›</span><span>Χρήστες</span>
				<span aria-hidden="true">›</span><span>Μαθητής</span>
				{#if openFolder}
					<span aria-hidden="true">›</span><span class="font-medium text-neutral-700"
						>{openFolder.name}</span
					>
					<span class="ml-auto tabular-nums"
						>{items.length} {items.length === 1 ? 'στοιχείο' : 'στοιχεία'}</span
					>
				{/if}
			</div>
			{#if itemNotice}
				<p
					class="shrink-0 border-t border-black/10 bg-sky-50 px-3 py-1.5 text-xs text-sky-900"
					role="status"
					aria-live="polite"
				>
					{itemNotice}
				</p>
			{/if}
		</div>
	</div>
</div>
