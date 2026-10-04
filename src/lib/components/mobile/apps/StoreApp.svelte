<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Search from '@lucide/svelte/icons/search';
	import { cn } from '$lib/utils';
	import { onDestroy } from 'svelte';

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
		storeName = 'Play Store',
		variant = 'android'
	}: {
		onEvent: (action: string, data?: Record<string, unknown>) => void;
		items?: StoreAppItem[];
		storeName?: string;
		variant?: 'android' | 'ios';
	} = $props();

	const isIos = $derived(variant === 'ios');
	// Progress feel: an update/install takes a moment, like the real store.
	let busy = $state<string[]>([]);
	const BUSY_MS = 900;
	// Never fire into an unmounted lesson.
	const timers: ReturnType<typeof setTimeout>[] = [];
	onDestroy(() => timers.forEach((t) => clearTimeout(t)));
	function later(fn: () => void) {
		const t = setTimeout(() => {
			fn();
		}, BUSY_MS);
		timers.push(t);
	}
	let notice = $state('');
	const RATING = (id: string) => (4 + (id.length % 10) / 10).toFixed(1);

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
		if (installedNow.includes(id) || busy.includes(id)) return;
		busy = [...busy, id];
		later(() => {
			busy = busy.filter((b) => b !== id);
			installedNow = [...installedNow, id];
			onEvent('mobile-app-installed', { appId: id });
		});
	}

	function update(id: string) {
		if (updated.includes(id) || busy.includes(id)) return;
		busy = [...busy, id];
		later(() => {
			busy = busy.filter((b) => b !== id);
			updated = [...updated, id];
			onEvent('mobile-app-updated', { appId: id });
		});
	}
</script>

<div data-testid="store-app" data-variant={variant} class="flex h-full flex-col bg-white">
	<header class={cn('shrink-0 px-4 pt-3 pb-2', isIos ? 'bg-white' : 'bg-white shadow-sm')}>
		<div class="flex items-center justify-between">
			<p class={cn('font-semibold text-slate-900', isIos ? 'text-3xl font-bold' : 'text-xl')}>
				{#if !isIos}<span
						class="mr-1.5 inline-block h-5 w-5 bg-gradient-to-br from-[#00d7fe] via-[#00f076] to-[#ffce00] align-[-3px] [clip-path:polygon(0_0,100%_50%,0_100%)]"
						aria-hidden="true"
					></span>{/if}{storeName}
			</p>
			<span
				class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-sky-300 to-indigo-400 text-base"
				aria-label="Λογαριασμός"
				role="img">🙂</span
			>
		</div>
		<p class="mt-1 flex items-center gap-1 text-xs text-emerald-700">
			<ShieldCheck class="h-3.5 w-3.5" aria-hidden="true" /> Επίσημο κατάστημα εφαρμογών
		</p>
		<label
			class={cn(
				'mt-3 flex min-h-11 items-center gap-2 px-4 py-2',
				isIos ? 'rounded-xl bg-[#e3e3e8]' : 'rounded-full bg-[#eef1f6]'
			)}
		>
			<Search class="h-4 w-4 text-slate-500" aria-hidden="true" />
			<input
				bind:value={query}
				aria-label="Αναζήτηση εφαρμογών"
				placeholder={isIos
					? 'Παιχνίδια, εφαρμογές, ιστορίες…'
					: 'Αναζήτηση εφαρμογών και παιχνιδιών'}
				class="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-slate-500"
			/>
		</label>
	</header>
	<p class="px-4 pt-3 pb-1 text-sm font-semibold text-slate-700">
		{query.trim() ? `Αποτελέσματα για «${query.trim()}»` : 'Οι εφαρμογές σου'}
	</p>
	<ul class="flex-1 divide-y divide-slate-100 overflow-y-auto">
		{#each visible as app (app.id)}
			{@const isUpdated = updated.includes(app.id)}
			{@const notInstalled = app.installed === false && !installedNow.includes(app.id)}
			{@const isBusy = busy.includes(app.id)}
			<li class="flex items-center gap-3 px-4 py-3">
				<span
					aria-hidden="true"
					class={cn(
						'flex h-12 w-12 items-center justify-center text-2xl shadow-sm',
						isIos ? 'rounded-[12px] bg-slate-100' : 'rounded-xl bg-slate-100'
					)}
				>
					{app.icon}
				</span>
				<span class="flex min-w-0 flex-1 flex-col">
					<span class="truncate text-base font-medium text-slate-900">{app.label}</span>
					{#if app.developer}
						<span class="truncate text-xs text-slate-500">{app.developer}</span>
					{/if}
					<span class="text-[11px] text-slate-400"
						>★ {RATING(app.id)} · {app.installed === false ? '12 MB' : 'Εγκατεστημένη'}</span
					>
				</span>
				{#if isBusy}
					<span
						class="flex min-h-[40px] items-center gap-2 text-sm text-slate-500"
						role="status"
						aria-live="polite"
					>
						<span
							class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600"
							aria-hidden="true"
						></span>
						{notInstalled ? 'Εγκατάσταση…' : 'Ενημέρωση…'}
					</span>
				{:else if notInstalled}
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
					<button
						type="button"
						onclick={() =>
							(notice = `«${app.label}» είναι ήδη στην τελευταία έκδοση. Πατώντας «Άνοιγμα» θα άνοιγε η εφαρμογή.`)}
						class="min-h-[40px] rounded-full bg-slate-100 px-4 text-sm font-semibold text-emerald-700 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
						>Άνοιγμα</button
					>
				{/if}
			</li>
		{:else}
			<li class="px-4 py-6 text-center text-sm text-slate-500">
				Δεν βρέθηκε εφαρμογή για «{query.trim()}».
			</li>
		{/each}
	</ul>
	{#if notice}
		<p
			class="shrink-0 bg-slate-900/85 px-3 py-1.5 text-center text-xs text-white"
			role="status"
			aria-live="polite"
		>
			{notice}
		</p>
	{/if}
</div>
