<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Wifi, Volume2, Battery, LayoutGrid } from 'lucide-svelte';
	import type { Icon as LucideIcon } from 'lucide-svelte';
	import QuickSettings from './QuickSettings.svelte';

	let {
		apps = [],
		openAppIds = [],
		highlightAppIds = [],
		onAppClick,
		onStartClick,
		onOpenSettings,
		onQuickSettingsClick,
		onTaskViewClick
	} = $props<{
		apps: { id: string; name: string; icon: typeof LucideIcon }[];
		openAppIds: string[];
		/** Apps the lesson points at, e.g. the minimised window to bring back. */
		highlightAppIds?: string[];
		onAppClick: (appId: string) => void;
		onStartClick: () => void;
		onOpenSettings: (page: string) => void;
		onQuickSettingsClick?: () => void;
		onTaskViewClick?: () => void;
	}>();

	let time = $state(new Date());
	let showQuickSettings = $state(false);

	$effect(() => {
		const timer = setInterval(() => {
			time = new Date();
		}, 60000); // Update every minute
		return () => clearInterval(timer);
	});

	function toggleQuickSettings() {
		showQuickSettings = !showQuickSettings;
		if (showQuickSettings && onQuickSettingsClick) {
			onQuickSettingsClick();
		}
	}

	// Close QuickSettings when clicking elsewhere (implemented via Desktop wrapper mostly, but good to have API)
</script>

<!-- stops click from reaching the backdrop -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	class="absolute right-0 bottom-0 left-0 z-50 flex h-12 items-center bg-slate-900/85 px-2 backdrop-blur-xl [font-family:Segoe_UI,system-ui,sans-serif]"
	onclick={(e) => e.stopPropagation()}
>
	<!-- Quick Settings Popup -->
	<QuickSettings
		isOpen={showQuickSettings}
		onClose={() => (showQuickSettings = false)}
		onOpenSettings={(page) => {
			showQuickSettings = false;
			onOpenSettings(page);
		}}
	/>

	<!-- Start & Apps (centered, Win11 style) -->
	<div class="absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
		<Button
			variant="ghost"
			class="rounded-md hover:bg-white/10"
			onclick={() => {
				showQuickSettings = false;
				onStartClick();
			}}
			title="Start"
		>
			<div class="grid grid-cols-2 gap-[2px]">
				<div class="h-2 w-2 rounded-[1px] bg-sky-400"></div>
				<div class="h-2 w-2 rounded-[1px] bg-sky-400"></div>
				<div class="h-2 w-2 rounded-[1px] bg-sky-400"></div>
				<div class="h-2 w-2 rounded-[1px] bg-sky-400"></div>
			</div>
		</Button>

		<!-- Task View Button -->
		{#if onTaskViewClick}
			<Button
				variant="ghost"
				class="rounded-md text-slate-300 hover:bg-white/10 hover:text-white"
				onclick={() => {
					showQuickSettings = false;
					onTaskViewClick();
				}}
				title="Προβολή Εργασιών"
			>
				<LayoutGrid class="h-5 w-5" />
			</Button>
		{/if}

		<!-- Taskbar Items -->
		{#each apps as app (app.id)}
			{@const isOpen = openAppIds.includes(app.id)}
			{@const highlighted = highlightAppIds.includes(app.id)}
			<div class="group relative">
				{#if highlighted}
					<div
						class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-lg bg-amber-400 px-3 py-1 text-sm font-semibold whitespace-nowrap text-slate-900 shadow-lg motion-safe:animate-bounce"
					>
						Πατήστε εδώ
						<span
							class="absolute top-full left-1/2 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-amber-400"
						></span>
					</div>
				{/if}
				<Button
					variant="ghost"
					data-highlight={highlighted ? 'true' : undefined}
					class="{isOpen
						? 'rounded-md bg-white/10 text-white hover:bg-white/20'
						: 'rounded-md text-slate-300 hover:bg-white/10 hover:text-white'} {highlighted
						? 'ring-2 ring-amber-400 motion-safe:animate-pulse'
						: ''}"
					onclick={() => {
						showQuickSettings = false;
						onAppClick(app.id);
					}}
					title={app.name}
				>
					<app.icon class="h-5 w-5" />
				</Button>
				{#if isOpen}
					<div
						class="absolute bottom-0.5 left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full bg-sky-400"
					></div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- System Tray (right-aligned) -->
	<div class="ml-auto flex h-full items-center gap-1 py-1">
		<button
			class="flex h-full items-center gap-2 rounded-md px-2 transition-colors hover:bg-white/10 {showQuickSettings
				? 'bg-white/10'
				: ''}"
			onclick={toggleQuickSettings}
		>
			<Wifi class="h-4 w-4 text-white" />
			<Volume2 class="h-4 w-4 text-white" />
			<Battery class="h-4 w-4 text-white" />
		</button>
		<div
			class="flex h-full cursor-default flex-col items-end justify-center rounded-md px-2 text-xs leading-tight text-white hover:bg-white/10"
		>
			<span
				>{time.toLocaleTimeString('el-GR', {
					hour: '2-digit',
					minute: '2-digit'
				})}</span
			>
			<span
				>{time.toLocaleDateString('el-GR', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric'
				})}</span
			>
		</div>
	</div>
</div>
