<script lang="ts">
	import {
		Search,
		Power,
		User,
		ChevronRight,
		ChevronLeft,
		FileText,
		Moon,
		RotateCcw,
		Lock
	} from 'lucide-svelte';
	import type { Icon as LucideIcon } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	/**
	 * The Windows 11 Start menu: search on top, the pinned apps grid, a
	 * «Προτεινόμενα» list of recent documents, and the user / power row at the
	 * bottom. «Όλες οι εφαρμογές» switches to the alphabetical list and back.
	 * Power options are shown as on a real PC, but choosing one explains that
	 * the practice computer does not switch off — nothing is ever lost.
	 */
	let {
		isOpen,
		apps = [],
		onAppClick,
		onClose
	} = $props<{
		isOpen: boolean;
		apps: { id: string; name: string; icon: typeof LucideIcon }[];
		onAppClick: (appId: string) => void;
		onClose: () => void;
	}>();

	let searchQuery = $state('');
	let view = $state<'pinned' | 'all'>('pinned');
	let powerOpen = $state(false);
	// Inline explanation for controls that exist on a real PC but do nothing here.
	let notice = $state('');

	/** Lower-case and strip accents, so «Ρυθμίσεις» matches «ρυθμισεις». */
	const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

	// Display-only filter: app ids, labels and onAppClick payloads stay unchanged.
	const filteredApps = $derived(
		searchQuery.trim() === ''
			? apps
			: apps.filter((app: { id: string; name: string; icon: typeof LucideIcon }) =>
					fold(app.name).includes(fold(searchQuery.trim()))
				)
	);
	const sortedApps = $derived([...filteredApps].sort((a, b) => a.name.localeCompare(b.name, 'el')));

	// Tile colours per app so the grid reads like Windows, not a row of grey boxes.
	const TILE: Record<string, string> = {
		explorer: 'bg-amber-400 text-amber-950',
		browser: 'bg-sky-500 text-white',
		email: 'bg-blue-600 text-white',
		excel: 'bg-emerald-600 text-white',
		installer: 'bg-slate-500 text-white',
		settings: 'bg-slate-600 text-white',
		word: 'bg-blue-700 text-white',
		viber: 'bg-purple-600 text-white',
		meeting: 'bg-indigo-500 text-white',
		taskmanager: 'bg-teal-600 text-white'
	};

	const RECENT = [
		{ name: 'Συνταγή Κέικ.txt', when: 'Πριν από 2 ώρες' },
		{ name: 'Λίστα Ψώνια.txt', when: 'Χθες' },
		{ name: 'Διακοπές.jpg', when: 'Την περασμένη εβδομάδα' }
	];

	function power(action: string) {
		powerOpen = false;
		notice = `«${action}»: στην εξάσκηση ο υπολογιστής δεν σβήνει, για να συνεχίσεις το μάθημα.`;
	}

	function launch(appId: string) {
		onAppClick(appId);
		onClose();
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) onClose();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if isOpen}
	<!-- stops click from reaching the backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="absolute bottom-14 left-1/2 z-50 flex h-[min(34rem,calc(100%-4.5rem))] w-[38rem] max-w-[calc(100%-1rem)] -translate-x-1/2 animate-in flex-col overflow-hidden rounded-xl border border-white/10 bg-[#202020]/95 [font-family:Segoe_UI,system-ui,sans-serif] text-white shadow-2xl backdrop-blur-xl duration-200 slide-in-from-bottom-5 fade-in"
		onclick={(e) => e.stopPropagation()}
		role="dialog"
		aria-label="Μενού Έναρξη"
		tabindex="-1"
		data-testid="start-menu"
	>
		<!-- Search Bar -->
		<div class="px-8 pt-7 pb-3">
			<div class="relative">
				<Search class="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
				<input
					type="text"
					placeholder="Αναζήτηση εφαρμογών, ρυθμίσεων και εγγράφων"
					aria-label="Αναζήτηση"
					bind:value={searchQuery}
					class="w-full rounded-full border border-white/10 border-b-sky-400 bg-[#2b2b2b] py-2.5 pr-4 pl-10 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-400"
				/>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto px-8 pb-2">
			{#if view === 'pinned'}
				<div class="mb-3 flex items-center justify-between">
					<h3 class="text-sm font-semibold">Καρφιτσωμένα</h3>
					<button
						type="button"
						class="flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1 text-xs text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
						onclick={() => (view = 'all')}
					>
						Όλες οι εφαρμογές <ChevronRight class="h-3 w-3" />
					</button>
				</div>

				<div class="grid grid-cols-4 gap-1 sm:grid-cols-6">
					{#each filteredApps as app (app.id)}
						<button
							type="button"
							class="flex min-h-[5.25rem] flex-col items-center justify-start gap-2 rounded-md p-2 transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none active:scale-95"
							onclick={() => launch(app.id)}
							title={app.name}
						>
							<span
								class={cn(
									'flex h-10 w-10 items-center justify-center rounded-lg shadow',
									TILE[app.id] ?? 'bg-slate-600 text-white'
								)}
							>
								<app.icon class="h-5 w-5" />
							</span>
							<span class="line-clamp-2 text-center text-[11px] leading-tight font-medium">
								{app.name}
							</span>
						</button>
					{:else}
						<p class="col-span-full py-4 text-center text-xs text-slate-400">
							Δεν βρέθηκαν εφαρμογές για «{searchQuery}».
						</p>
					{/each}
				</div>

				<div class="mt-6 mb-3 flex items-center justify-between">
					<h3 class="text-sm font-semibold">Προτεινόμενα</h3>
					<span class="text-xs text-slate-400">Πρόσφατα αρχεία</span>
				</div>
				<div class="grid gap-1 sm:grid-cols-2">
					{#each RECENT as item (item.name)}
						<button
							type="button"
							class="flex items-center gap-3 rounded-md p-2 text-left hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
							onclick={() => launch('explorer')}
							title="Ανοίγει την Εξερεύνηση αρχείων"
						>
							<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white/10">
								<FileText class="h-4 w-4 text-sky-300" />
							</span>
							<span class="flex min-w-0 flex-col">
								<span class="truncate text-xs font-medium">{item.name}</span>
								<span class="text-[10px] text-slate-400">{item.when}</span>
							</span>
						</button>
					{/each}
				</div>
			{:else}
				<div class="mb-3 flex items-center justify-between">
					<h3 class="text-sm font-semibold">Όλες οι εφαρμογές</h3>
					<button
						type="button"
						class="flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1 text-xs text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
						onclick={() => (view = 'pinned')}
					>
						<ChevronLeft class="h-3 w-3" /> Πίσω
					</button>
				</div>
				<ul class="space-y-0.5">
					{#each sortedApps as app (app.id)}
						<li>
							<button
								type="button"
								class="flex min-h-11 w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
								onclick={() => launch(app.id)}
							>
								<span
									class={cn(
										'flex h-7 w-7 items-center justify-center rounded',
										TILE[app.id] ?? 'bg-slate-600 text-white'
									)}
								>
									<app.icon class="h-4 w-4" />
								</span>
								{app.name}
							</button>
						</li>
					{:else}
						<li class="py-4 text-center text-xs text-slate-400">Δεν βρέθηκαν εφαρμογές.</li>
					{/each}
				</ul>
			{/if}
		</div>

		{#if notice}
			<p
				class="mx-8 mb-2 rounded-md bg-sky-400/15 px-3 py-2 text-xs text-sky-100"
				role="status"
				aria-live="polite"
			>
				{notice}
			</p>
		{/if}

		<!-- Footer: user + power -->
		<div
			class="relative flex items-center justify-between border-t border-white/10 bg-black/20 px-8 py-3"
		>
			<button
				type="button"
				class="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
				onclick={() =>
					(notice =
						'Λογαριασμός χρήστη: εδώ αλλάζεις χρήστη ή κλειδώνεις τον υπολογιστή. Δεν χρειάζεται στο μάθημα.')}
			>
				<span class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600">
					<User class="h-4 w-4 text-slate-200" />
				</span>
				<span class="text-sm font-medium">Μαθητής</span>
			</button>

			<button
				type="button"
				class={cn(
					'flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none',
					powerOpen && 'bg-white/10'
				)}
				onclick={() => (powerOpen = !powerOpen)}
				aria-label="Τροφοδοσία"
				aria-haspopup="menu"
				aria-expanded={powerOpen}
				title="Τροφοδοσία"
			>
				<Power class="h-5 w-5" />
			</button>

			{#if powerOpen}
				<div
					class="absolute right-6 bottom-14 w-52 rounded-lg border border-white/10 bg-[#2b2b2b] p-1 text-sm shadow-xl"
					role="menu"
					aria-label="Επιλογές τροφοδοσίας"
				>
					{#each [{ label: 'Κλείδωμα', icon: Lock }, { label: 'Αναστολή λειτουργίας', icon: Moon }, { label: 'Τερματισμός λειτουργίας', icon: Power }, { label: 'Επανεκκίνηση', icon: RotateCcw }] as item (item.label)}
						<button
							type="button"
							role="menuitem"
							class="flex w-full items-center gap-3 rounded px-3 py-2 text-left hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
							onclick={() => power(item.label)}
						>
							<item.icon class="h-4 w-4 text-slate-300" />
							{item.label}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}
