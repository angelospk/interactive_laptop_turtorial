<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Search, Power, Settings, User } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let {
		isOpen,
		apps = [],
		onAppClick,
		onClose
	} = $props<{
		isOpen: boolean;
		apps: { id: string; name: string; icon: any }[];
		onAppClick: (appId: string) => void;
		onClose: () => void;
	}>();

	let searchQuery = $state('');

	// Display-only filter: app ids, labels and onAppClick payloads stay unchanged.
	const filteredApps = $derived(
		searchQuery.trim() === ''
			? apps
			: apps.filter((app: { id: string; name: string; icon: any }) =>
					app.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
				)
	);
</script>

{#if isOpen}
	<div
		class="absolute bottom-14 left-1/2 z-50 flex h-[500px] w-[600px] max-w-[calc(100%-2rem)] -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 text-white shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in duration-200 [font-family:Segoe_UI,system-ui,sans-serif]"
		onclick={(e) => e.stopPropagation()}
	>
		<!-- Search Bar -->
		<div class="p-6 pb-2">
			<div class="relative">
				<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
				<input
					type="text"
					placeholder="Αναζήτηση εφαρμογών, ρυθμίσεων και εγγράφων"
					bind:value={searchQuery}
					class="w-full rounded-full border-none bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
		</div>

		<!-- Pinned Apps -->
		<div class="flex-1 overflow-y-auto p-6 pt-2">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-sm font-semibold text-white">Καρφιτσωμένα</h3>
				<Button variant="link" class="h-auto p-0 text-xs text-white/70 hover:text-white">
					Όλες οι εφαρμογές &gt;
				</Button>
			</div>

			<div class="grid grid-cols-6 gap-4">
				{#each filteredApps as app (app.id)}
					<button
						class="flex flex-col items-center gap-2 rounded-lg p-2 transition-colors hover:bg-white/10"
						onclick={() => {
							onAppClick(app.id);
							onClose();
						}}
					>
						<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 p-2">
							<app.icon class="h-full w-full text-blue-400" />
						</div>
						<span class="truncate text-xs font-medium text-white">{app.name}</span>
					</button>
				{:else}
					<p class="col-span-6 py-4 text-center text-xs text-slate-400">Δεν βρέθηκαν εφαρμογές</p>
				{/each}
			</div>

			<div class="mt-8 mb-4">
				<h3 class="text-sm font-semibold text-white">Προτεινόμενα</h3>
			</div>
			<div class="space-y-2">
				<div class="flex items-center gap-3 rounded-lg p-2 hover:bg-white/10">
					<div class="flex h-8 w-8 items-center justify-center rounded bg-slate-800">
						<span class="text-xs">W</span>
					</div>
					<div class="flex flex-col">
						<span class="text-xs font-medium text-white">Εισαγωγή στα Windows</span>
						<span class="text-[10px] text-slate-400">Πρόσφατο</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div class="flex items-center justify-between border-t border-slate-700 bg-slate-900/50 p-4 px-6">
			<button class="flex items-center gap-2 rounded px-2 py-1 hover:bg-white/10">
				<div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700">
					<User class="h-4 w-4 text-slate-300" />
				</div>
				<span class="text-sm font-medium text-white">User</span>
			</button>

			<button
				class="rounded p-2 hover:bg-white/10"
				onclick={onClose}
			>
				<Power class="h-5 w-5 text-white" />
			</button>
		</div>
	</div>
{/if}
