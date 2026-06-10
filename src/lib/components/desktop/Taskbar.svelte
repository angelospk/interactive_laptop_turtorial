<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Wifi, Volume2, Battery, LayoutGrid } from 'lucide-svelte';
	import QuickSettings from './QuickSettings.svelte';

	let {
		apps = [],
		openAppIds = [],
		onAppClick,
		onStartClick,
		onOpenSettings,
		onQuickSettingsClick,
		onTaskViewClick
	} = $props<{
		apps: { id: string; name: string; icon: any }[];
		openAppIds: string[];
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
		{#each apps as app}
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
