<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Wifi, Volume2, Battery } from 'lucide-svelte';
    import QuickSettings from './QuickSettings.svelte';

	let {
		apps = [],
		openAppIds = [],
		onAppClick,
		onStartClick,
		onOpenSettings
	} = $props<{
		apps: { id: string; name: string; icon: any }[];
		openAppIds: string[];
		onAppClick: (appId: string) => void;
		onStartClick: () => void;
        onOpenSettings: (page: string) => void;
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
    }

    // Close QuickSettings when clicking elsewhere (implemented via Desktop wrapper mostly, but good to have API)
</script>

<div
	class="absolute right-0 bottom-0 left-0 z-50 flex h-12 items-center justify-between bg-slate-900/90 px-4 backdrop-blur"
	onclick={(e) => e.stopPropagation()}
>
    <!-- Quick Settings Popup -->
    <QuickSettings
        isOpen={showQuickSettings}
        onClose={() => showQuickSettings = false}
        onOpenSettings={(page) => {
            showQuickSettings = false;
            onOpenSettings(page);
        }}
    />

	<!-- Start & Apps -->
	<div class="flex items-center gap-2">
		<Button
			variant="secondary"
			class="rounded-sm bg-blue-600 text-white hover:bg-blue-500"
			onclick={() => { showQuickSettings = false; onStartClick(); }}
			title="Start"
		>
			<div class="grid grid-cols-2 gap-[2px]">
				<div class="h-1.5 w-1.5 bg-white"></div>
				<div class="h-1.5 w-1.5 bg-white"></div>
				<div class="h-1.5 w-1.5 bg-white"></div>
				<div class="h-1.5 w-1.5 bg-white"></div>
			</div>
		</Button>

		<!-- Taskbar Items -->
		{#each apps as app}
			{@const isOpen = openAppIds.includes(app.id)}
			<div class="group relative">
				<Button
					variant="ghost"
					class={isOpen ? "bg-slate-700 text-white hover:bg-slate-600" : "text-slate-400 hover:bg-slate-800 hover:text-white"}
					onclick={() => { showQuickSettings = false; onAppClick(app.id); }}
					title={app.name}
				>
					<app.icon class="h-5 w-5" />
				</Button>
				{#if isOpen}
					<div class="absolute bottom-0 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-blue-400"></div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- System Tray -->
	<div class="flex h-full items-center gap-2">
		<button
			class="flex h-full items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-slate-700 {showQuickSettings ? 'bg-slate-700' : ''}"
			onclick={toggleQuickSettings}
		>
			<Wifi class="h-4 w-4 text-white" />
			<Volume2 class="h-4 w-4 text-white" />
			<Battery class="h-4 w-4 text-white" />
		</button>
		<div
			class="flex h-full cursor-default flex-col items-end justify-center rounded px-2 text-xs text-white hover:bg-slate-700"
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
