<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { cn } from '$lib/utils';
	import type { MobileSimApp } from '$lib/lessons/mobileSim';

	/**
	 * "Recent apps" system layer — the card carousel a learner opens to close an
	 * app that has frozen (CURRICULUM_PLAN §4γ «Όταν κάτι κόλλησε»). Semantic
	 * event (the one place an appId is carried, by design):
	 *   mobile-app-force-closed { appId }
	 *
	 * Dismissal works two ways that emit the SAME event: an accessible «Κλείσιμο»
	 * button (primary, senior-friendly) and swiping the card upward.
	 */
	let {
		apps,
		recentAppIds,
		frozenAppId = null,
		onDismiss,
		onClose
	}: {
		apps: MobileSimApp[];
		recentAppIds: string[];
		/** App shown as «Δεν ανταποκρίνεται» (the one to close). */
		frozenAppId?: string | null;
		onDismiss: (appId: string) => void;
		onClose: () => void;
	} = $props();

	// Cards still on screen (dismissing removes locally so the UI reacts).
	let visibleIds = $state<string[]>([...recentAppIds]);
	const cards = $derived(
		visibleIds
			.map((id) => apps.find((a) => a.id === id))
			.filter((a): a is MobileSimApp => Boolean(a))
	);

	// Swipe-up tracking per card. Deliberately NO pointer capture — capturing
	// the pointer on the card swallows the «Κλείσιμο» button's click.
	let dragId: string | null = $state(null);
	let startY = $state(0);
	let dragDy = $state(0);
	const SWIPE_THRESHOLD = 60;

	function dismiss(appId: string) {
		visibleIds = visibleIds.filter((id) => id !== appId);
		onDismiss(appId);
	}

	function pointerDown(appId: string, e: PointerEvent) {
		dragId = appId;
		startY = e.clientY;
		dragDy = 0;
	}
	function pointerMove(e: PointerEvent) {
		if (dragId === null) return;
		dragDy = e.clientY - startY;
	}
	function pointerCancel() {
		// Gesture interrupted (e.g. system scroll takeover): reset, never dismiss.
		dragId = null;
		dragDy = 0;
	}
	function pointerUp(appId: string) {
		if (dragId === appId && dragDy < -SWIPE_THRESHOLD) dismiss(appId);
		dragId = null;
		dragDy = 0;
	}
</script>

<div
	data-testid="recent-apps"
	class="absolute inset-0 z-10 flex flex-col bg-slate-900/95 px-4 pt-6 pb-4 backdrop-blur-sm"
>
	<div class="flex items-center justify-between text-white">
		<span class="text-sm font-semibold">Πρόσφατες εφαρμογές</span>
		<button
			type="button"
			onclick={onClose}
			aria-label="Κλείσιμο πρόσφατων"
			class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
		>
			<X class="h-5 w-5" aria-hidden="true" />
		</button>
	</div>

	<div class="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto">
		{#if cards.length === 0}
			<p class="mt-8 text-center text-sm text-slate-300">Καμία πρόσφατη εφαρμογή.</p>
		{:else}
			{#each cards as app (app.id)}
				{@const frozen = app.id === frozenAppId}
				<div
					data-testid={`recent-card-${app.id}`}
					class={cn(
						'rounded-2xl bg-white p-4 shadow-lg transition',
						dragId === app.id && 'opacity-70'
					)}
					style={dragId === app.id ? `transform: translateY(${Math.min(dragDy, 0)}px)` : ''}
					onpointerdown={(e) => pointerDown(app.id, e)}
					onpointermove={pointerMove}
					onpointerup={() => pointerUp(app.id)}
					onpointercancel={pointerCancel}
				>
					<div class="flex items-center gap-3">
						<span
							aria-hidden="true"
							class={cn(
								'flex h-11 w-11 items-center justify-center rounded-xl text-2xl',
								app.color ?? 'bg-slate-100'
							)}
						>
							{app.icon}
						</span>
						<div class="flex-1">
							<p class="text-base font-semibold text-slate-900">{app.label}</p>
							{#if frozen}
								<p class="text-sm font-medium text-red-600">Δεν ανταποκρίνεται</p>
							{/if}
						</div>
					</div>
					<button
						type="button"
						onclick={() => dismiss(app.id)}
						aria-label={`Κλείσιμο ${app.label}`}
						class="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-slate-100 text-base font-medium text-slate-700 transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none active:bg-slate-200"
					>
						<X class="h-5 w-5" aria-hidden="true" /> Κλείσιμο
					</button>
				</div>
			{/each}
		{/if}
	</div>
	<p class="mt-3 text-center text-xs text-slate-400">
		Σύρε μια κάρτα προς τα πάνω ή πάτησε «Κλείσιμο».
	</p>
</div>
