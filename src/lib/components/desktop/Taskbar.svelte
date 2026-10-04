<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Wifi, Volume2, Battery, LayoutGrid } from 'lucide-svelte';
	import type { Icon as LucideIcon } from 'lucide-svelte';
	import QuickSettings from './QuickSettings.svelte';

	let {
		apps = [],
		openAppIds = [],
		onAppClick,
		onStartClick,
		onOpenSettings,
		onQuickSettingsClick,
		onTaskViewClick,
		onOpenTaskManager
	} = $props<{
		apps: { id: string; name: string; icon: typeof LucideIcon }[];
		openAppIds: string[];
		onAppClick: (appId: string) => void;
		onStartClick: () => void;
		onOpenSettings: (page: string) => void;
		onQuickSettingsClick?: () => void;
		onTaskViewClick?: () => void;
		onOpenTaskManager?: () => void;
	}>();

	// Right-click on the taskbar → «Διαχείριση εργασιών», as in Windows 11.
	let menuOpen = $state(false);

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
	data-testid="taskbar"
	class="absolute right-0 bottom-0 left-0 z-50 flex h-12 items-center bg-slate-900/85 px-2 [font-family:Segoe_UI,system-ui,sans-serif] backdrop-blur-xl"
	onclick={(e) => {
		e.stopPropagation();
		menuOpen = false;
	}}
	oncontextmenu={(e) => {
		if (!onOpenTaskManager) return;
		e.preventDefault();
		menuOpen = true;
	}}
>
	{#if menuOpen}
		<div
			role="menu"
			class="absolute bottom-14 left-1/2 w-56 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-1 text-sm text-slate-900 shadow-xl"
		>
			<button
				type="button"
				role="menuitem"
				class="w-full rounded px-3 py-2 text-left hover:bg-slate-100"
				onclick={(e) => {
					e.stopPropagation();
					menuOpen = false;
					onOpenTaskManager?.();
				}}
			>
				Διαχείριση εργασιών
			</button>
		</div>
	{/if}
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
			<div class="group relative">
				<Button
					variant="ghost"
					class={isOpen
						? 'rounded-md bg-white/10 text-white hover:bg-white/20'
						: 'rounded-md text-slate-300 hover:bg-white/10 hover:text-white'}
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
