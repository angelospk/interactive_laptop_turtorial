<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { X } from 'lucide-svelte';

	let {
		isOpen = false,
		openApps = [],
		availableApps = [],
		onClose,
		onAppClick
	} = $props<{
		isOpen: boolean;
		openApps: { id: string; appId: string; minimized: boolean; maximized: boolean }[];
		availableApps: { id: string; name: string; icon: any }[];
		onClose: () => void;
		onAppClick: (instanceId: string) => void;
	}>();

	function handleAppClick(instanceId: string) {
		onAppClick(instanceId);
		onClose();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}
</script>

{#if isOpen}
	<div
		class="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		onclick={handleBackdropClick}
		role="button"
		tabindex="-1"
	>
		<div class="relative w-full max-w-4xl rounded-xl bg-slate-800/90 p-8 shadow-2xl backdrop-blur [font-family:Segoe_UI,system-ui,sans-serif]">
			<!-- Header -->
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-2xl font-semibold text-white">Προβολή Εργασιών</h2>
				<Button variant="ghost" size="icon" class="text-white hover:bg-slate-700" onclick={onClose}>
					<X class="h-5 w-5" />
				</Button>
			</div>

			<!-- Windows Grid -->
			{#if openApps.length === 0}
				<div class="py-12 text-center">
					<p class="text-slate-400">Δεν υπάρχουν ανοιχτά παράθυρα</p>
				</div>
			{:else}
				<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
					{#each openApps as app (app.id)}
						{@const appDef = availableApps.find(
							(a: { id: string; name: string; icon: any }) => a.id === app.appId
						)}
						{#if appDef}
							<button
								class="group flex flex-col items-center gap-3 rounded-xl bg-slate-700/50 p-6 transition-all hover:scale-105 hover:bg-slate-600/50 hover:ring-2 hover:ring-sky-400/70"
								onclick={() => handleAppClick(app.id)}
							>
								<!-- App Icon -->
								<div
									class="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-600 text-white transition-colors group-hover:bg-slate-500"
								>
									<svelte:component this={appDef.icon} class="h-8 w-8" />
								</div>

								<!-- App Name -->
								<span class="text-sm font-medium text-white">{appDef.name}</span>

								<!-- Status Badge -->
								{#if app.minimized}
									<span class="text-xs text-slate-400">Ελαχιστοποιημένο</span>
								{:else if app.maximized}
									<span class="text-xs text-slate-400">Μεγιστοποιημένο</span>
								{/if}
							</button>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}
