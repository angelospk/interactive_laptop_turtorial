<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import Mic from '@lucide/svelte/icons/mic';
	import { cn } from '$lib/utils';
	import { AppIcon } from '$lib/components/ui/app-icon';
	import type { MobileSimApp } from '$lib/lessons/mobileSim';

	/**
	 * Phone home screen rendered inside MobileFrame. Android: the big clock and
	 * «at a glance» date, a 4-column grid of round icons, a Google-style search
	 * pill and the dock. iPhone: squircle icons on a 4-column grid, page dots and
	 * the frosted dock. Icons come from AppIcon: vector glyphs in native colours
	 * for the known apps, the config emoji otherwise — recognisable placement, no
	 * brand assets (CURRICULUM_PLAN §4). Tapping an icon is the only lesson event; the search pill explains
	 * itself inline.
	 */
	let {
		variant = 'android',
		apps,
		dockAppIds = [],
		onOpenApp,
		highlightAppId = null,
		disabled = false
	}: {
		variant?: 'android' | 'ios';
		apps: MobileSimApp[];
		dockAppIds?: string[];
		onOpenApp: (appId: string) => void;
		/** App to visually hint at (after repeated wrong taps). */
		highlightAppId?: string | null;
		disabled?: boolean;
	} = $props();

	const isIos = $derived(variant === 'ios');
	const dockApps = $derived(apps.filter((a) => dockAppIds.includes(a.id)));
	const gridApps = $derived(apps.filter((a) => !dockAppIds.includes(a.id)));

	const now = new Date();
	const clock = now.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
	const date = now.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' });

	let searchNotice = $state('');
</script>

{#snippet appIcon(app: MobileSimApp, inDock = false)}
	{@const isTarget = highlightAppId === app.id}
	<button
		type="button"
		onclick={() => onOpenApp(app.id)}
		{disabled}
		aria-label={`Άνοιγμα ${app.label}`}
		class="flex min-h-[76px] flex-col items-center justify-start gap-1 p-1 transition focus-visible:ring-4 focus-visible:ring-white/80 focus-visible:outline-none active:scale-95 disabled:opacity-60"
	>
		<AppIcon
			id={app.id}
			kind={app.kind}
			emoji={app.icon}
			platform={variant}
			fallbackClass={app.color ?? 'bg-white/90'}
			class={cn(
				'h-14 w-14 text-[28px] shadow-[0_2px_6px_rgba(0,0,0,0.25)]',
				isIos ? 'rounded-[16px]' : 'rounded-full',
				isTarget && 'animate-pulse ring-4 ring-emerald-400'
			)}
		/>
		{#if !inDock || !isIos}
			<span
				class="max-w-[5.25rem] truncate text-center text-[11px] font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]"
			>
				{app.label}
			</span>
		{/if}
	</button>
{/snippet}

<div
	data-testid="mobile-homescreen"
	data-variant={variant}
	class={cn(
		'flex h-full min-h-full flex-col justify-between px-3 pt-3 pb-2',
		isIos
			? 'bg-[radial-gradient(ellipse_at_top,#7dd3fc_0%,#6366f1_45%,#312e81_100%)]'
			: 'bg-[radial-gradient(ellipse_at_top_left,#a7f3d0_0%,#0d9488_40%,#134e4a_100%)]'
	)}
>
	<div>
		{#if !isIos}
			<!-- Android: clock widget + «at a glance» -->
			<div class="mb-3 px-2 text-white">
				<p
					class="text-[44px] leading-none font-light tabular-nums [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]"
				>
					{clock}
				</p>
				<p class="mt-1 text-sm capitalize [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">{date} · 21°</p>
			</div>
		{:else}
			<div class="mb-2 h-6"></div>
		{/if}

		<div class="grid grid-cols-4 gap-x-1 gap-y-2">
			{#each gridApps as app (app.id)}
				{@render appIcon(app)}
			{/each}
		</div>
	</div>

	<div class="space-y-2">
		{#if isIos}
			<!-- Page dots -->
			<div class="flex justify-center gap-1.5" aria-hidden="true">
				<span class="h-1.5 w-1.5 rounded-full bg-white"></span>
				<span class="h-1.5 w-1.5 rounded-full bg-white/40"></span>
			</div>
		{:else}
			<!-- Google-style search pill -->
			<button
				type="button"
				{disabled}
				onclick={() =>
					(searchNotice =
						'Η αναζήτηση Google: γράφεις ή λες τι ψάχνεις. Δεν χρειάζεται σε αυτό το μάθημα.')}
				aria-label="Αναζήτηση Google"
				class="mx-1 flex h-12 w-[calc(100%-0.5rem)] items-center gap-3 rounded-full bg-white px-4 text-sm text-slate-500 shadow-md focus-visible:ring-4 focus-visible:ring-white/80 focus-visible:outline-none"
			>
				<span class="text-base font-bold text-[#4285f4]" aria-hidden="true">G</span>
				<Search class="h-4 w-4" aria-hidden="true" />
				<span class="flex-1 text-left">Αναζήτηση</span>
				<Mic class="h-4 w-4 text-[#ea4335]" aria-hidden="true" />
			</button>
			{#if searchNotice}
				<p
					class="mx-2 rounded-lg bg-black/40 px-3 py-1.5 text-xs text-white"
					role="status"
					aria-live="polite"
				>
					{searchNotice}
				</p>
			{/if}
		{/if}

		{#if dockApps.length}
			<div
				data-testid="mobile-dock"
				class={cn(
					'grid gap-1 p-1.5',
					isIos ? 'rounded-[28px] bg-white/25 backdrop-blur-md' : 'rounded-3xl bg-black/10'
				)}
				style:grid-template-columns={`repeat(${Math.min(dockApps.length, 4)}, minmax(0, 1fr))`}
			>
				{#each dockApps as app (app.id)}
					{@render appIcon(app, true)}
				{/each}
			</div>
		{/if}
	</div>
</div>
