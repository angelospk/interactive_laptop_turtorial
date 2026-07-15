<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';

	/**
	 * Official app-store mini-app (Play Store / App Store) for the "update an app"
	 * lesson (CURRICULUM_PLAN §4γ). The header stresses that updates come from the
	 * OFFICIAL store — the anti-scam framing. Semantic event:
	 *   mobile-app-updated { appId }
	 */
	export interface StoreAppItem {
		id: string;
		label: string;
		icon: string;
		hasUpdate?: boolean;
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
	</header>
	<ul class="flex-1 divide-y divide-slate-100 overflow-y-auto">
		{#each items as app (app.id)}
			{@const isUpdated = updated.includes(app.id)}
			<li class="flex items-center gap-3 px-4 py-3">
				<span
					aria-hidden="true"
					class="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-2xl"
				>
					{app.icon}
				</span>
				<span class="flex-1 text-base font-medium text-slate-900">{app.label}</span>
				{#if isUpdated}
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
		{/each}
	</ul>
</div>
