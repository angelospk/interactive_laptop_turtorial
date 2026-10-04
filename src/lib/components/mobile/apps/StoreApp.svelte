<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Search from '@lucide/svelte/icons/search';

	/**
	 * Official app-store mini-app (Play Store / App Store) for the "update an app"
	 * lesson (CURRICULUM_PLAN §4γ). The header stresses that updates come from the
	 * OFFICIAL store — the anti-scam framing. Semantic events:
	 *   mobile-app-updated { appId }
	 *   mobile-app-installed { appId }   (install-app lesson)
	 * Apps you don't have yet (`installed: false`) only appear when you search,
	 * like in the real stores.
	 */
	export interface StoreAppItem {
		id: string;
		label: string;
		icon: string;
		hasUpdate?: boolean;
		installed?: boolean;
		developer?: string;
	}

	let {
		onEvent,
		items = [],
		storeName = 'Play Store'
	}: {
		onEvent: (action: string, data?: Record<string, unknown>) => void;
		items?: StoreAppItem[];
		storeName?: string;
	} = $props();

	let updated = $state<string[]>([]);
	let installedNow = $state<string[]>([]);
	let query = $state('');

	const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
	const visible = $derived(
		query.trim()
			? items.filter((app) => fold(app.label).includes(fold(query.trim())))
			: items.filter((app) => app.installed !== false || installedNow.includes(app.id))
	);

	function install(id: string) {
		if (installedNow.includes(id)) return;
		installedNow = [...installedNow, id];
		onEvent('mobile-app-installed', { appId: id });
	}

	function update(id: string) {
		if (updated.includes(id)) return;
		updated = [...updated, id];
		onEvent('mobile-app-updated', { appId: id });
	}
</script>

<div data-testid="store-app" class="flex h-full flex-col bg-white">
	<header class="shrink-0 bg-slate-100 px-4 py-3">
		<p class="text-center text-sm font-semibold text-slate-700">{storeName}</p>
		<p class="mt-1 flex items-center justify-center gap-1 text-xs text-emerald-700">
			<ShieldCheck class="h-3.5 w-3.5" aria-hidden="true" /> Επίσημο κατάστημα εφαρμογών
		</p>
		<label class="mt-3 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
			<Search class="h-4 w-4 text-slate-500" aria-hidden="true" />
			<input
				bind:value={query}
				aria-label="Αναζήτηση εφαρμογών"
				placeholder="Αναζήτηση εφαρμογών"
				class="min-w-0 flex-1 bg-transparent text-base outline-none"
			/>
		</label>
	</header>
	<ul class="flex-1 divide-y divide-slate-100 overflow-y-auto">
		{#each visible as app (app.id)}
			{@const isUpdated = updated.includes(app.id)}
			{@const notInstalled = app.installed === false && !installedNow.includes(app.id)}
			<li class="flex items-center gap-3 px-4 py-3">
				<span
					aria-hidden="true"
					class="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-2xl"
				>
					{app.icon}
				</span>
				<span class="flex flex-1 flex-col">
					<span class="text-base font-medium text-slate-900">{app.label}</span>
					{#if app.developer}
						<span class="text-xs text-slate-500">{app.developer}</span>
					{/if}
				</span>
				{#if notInstalled}
					<button
						type="button"
						onclick={() => install(app.id)}
						aria-label={`Εγκατάσταση ${app.label}`}
						class="min-h-[40px] rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none active:bg-emerald-700"
					>
						Εγκατάσταση
					</button>
				{:else if app.installed === false}
					<span class="flex items-center gap-1 text-sm font-medium text-emerald-700">
						<Check class="h-4 w-4" aria-hidden="true" /> Εγκαταστάθηκε
					</span>
				{:else if isUpdated}
					<span class="flex items-center gap-1 text-sm font-medium text-emerald-700">
						<Check class="h-4 w-4" aria-hidden="true" /> Ενημερώθηκε
					</span>
				{:else if app.hasUpdate}
					<button
						type="button"
						onclick={() => update(app.id)}
						aria-label={`Ενημέρωση ${app.label}`}
						class="min-h-[40px] rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none active:bg-emerald-700"
					>
						Ενημέρωση
					</button>
				{:else}
					<span class="text-sm text-slate-400">Ενημερωμένη</span>
				{/if}
			</li>
		{:else}
			<li class="px-4 py-6 text-center text-sm text-slate-500">Δεν βρέθηκε εφαρμογή</li>
		{/each}
	</ul>
</div>
