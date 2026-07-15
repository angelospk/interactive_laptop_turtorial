<script lang="ts">
	import { cn } from '$lib/utils';
	import type { MobileSimApp } from '$lib/lessons/mobileSim';

	/**
	 * Realistic phone home screen rendered inside MobileFrame: wallpaper,
	 * app grid, dock row — Android gets a clock widget + circular icons,
	 * iOS a plain grid + squircle icons (CURRICULUM_PLAN §4, low-to-medium
	 * fidelity: recognisable placement, no brand assets).
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
</script>

{#snippet appIcon(app: MobileSimApp)}
	{@const isTarget = highlightAppId === app.id}
	<button
		type="button"
		onclick={() => onOpenApp(app.id)}
		{disabled}
		aria-label={`Άνοιγμα ${app.label}`}
		class="flex min-h-[76px] flex-col items-center justify-center gap-1 p-1 transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none disabled:opacity-60"
	>
		<span
			aria-hidden="true"
			class={cn(
				'flex h-14 w-14 items-center justify-center text-3xl leading-none shadow-md',
				isIos ? 'rounded-2xl' : 'rounded-full',
				app.color ?? 'bg-white/90',
				isTarget && 'ring-4 ring-emerald-400 animate-pulse'
			)}
		>
			{app.icon}
		</span>
		<span class="max-w-[5.5rem] truncate text-center text-xs font-medium text-white drop-shadow">
			{app.label}
		</span>
	</button>
{/snippet}

<div
	data-testid="mobile-homescreen"
	data-variant={variant}
	class={cn(
		'flex h-full min-h-full flex-col justify-between px-4 pt-4 pb-2',
		isIos
			? 'bg-gradient-to-b from-sky-500 via-indigo-500 to-indigo-700'
			: 'bg-gradient-to-b from-emerald-600 via-teal-600 to-slate-800'
	)}
>
	<div>
		{#if !isIos}
			<!-- Android clock widget -->
			<div class="mb-4 text-center text-white">
				<p class="text-4xl font-light tabular-nums drop-shadow">{clock}</p>
				<p class="mt-1 text-sm capitalize opacity-90">{date}</p>
			</div>
		{/if}

		<div class="grid grid-cols-3 gap-2">
			{#each gridApps as app (app.id)}
				{@render appIcon(app)}
			{/each}
		</div>
	</div>

	{#if dockApps.length}
		<div
			data-testid="mobile-dock"
			class={cn(
				'mt-3 grid gap-2 rounded-3xl p-2',
				'bg-white/20 backdrop-blur-sm'
			)}
			style:grid-template-columns={`repeat(${Math.min(dockApps.length, 4)}, minmax(0, 1fr))`}
		>
			{#each dockApps as app (app.id)}
				{@render appIcon(app)}
			{/each}
		</div>
	{/if}
</div>
