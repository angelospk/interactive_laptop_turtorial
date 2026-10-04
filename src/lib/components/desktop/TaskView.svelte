<script lang="ts">
	import { X, Plus } from 'lucide-svelte';
	import type { Icon as LucideIcon } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	/**
	 * Windows 11 Task View: every open window as a thumbnail card (title bar with
	 * the app icon and name, a sketch of its content) over a blurred desktop.
	 * Clicking a card brings that window forward; the small × on a card closes
	 * that window — exactly what the real Task View does. The «Νέα επιφάνεια
	 * εργασίας» strip at the bottom is shown as on Windows but explained as
	 * not needed here.
	 */
	let {
		isOpen = false,
		openApps = [],
		availableApps = [],
		onClose,
		onAppClick,
		onCloseApp
	} = $props<{
		isOpen: boolean;
		openApps: { id: string; appId: string; minimized: boolean; maximized: boolean }[];
		availableApps: { id: string; name: string; icon: typeof LucideIcon }[];
		onClose: () => void;
		onAppClick: (instanceId: string) => void;
		/** Optional: close a window straight from its thumbnail. */
		onCloseApp?: (instanceId: string) => void;
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

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) onClose();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if isOpen}
	<!-- click-outside backdrop; the named close button is the keyboard path -->
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		class="absolute inset-0 z-40 flex flex-col bg-black/40 [font-family:Segoe_UI,system-ui,sans-serif] backdrop-blur-md"
		onclick={handleBackdropClick}
		data-testid="task-view"
	>
		<!-- Header -->
		<div class="flex items-center justify-between px-8 pt-6">
			<h2 class="text-lg font-semibold text-white drop-shadow">Προβολή Εργασιών</h2>
			<button
				type="button"
				class="flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none"
				aria-label="Κλείσιμο"
				onclick={onClose}
			>
				<X class="h-5 w-5" />
			</button>
		</div>

		<!-- Windows Grid -->
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div class="flex flex-1 items-center justify-center px-8" onclick={handleBackdropClick}>
			{#if openApps.length === 0}
				<p class="rounded-lg bg-black/30 px-4 py-2 text-slate-200">Δεν υπάρχουν ανοιχτά παράθυρα</p>
			{:else}
				<div class="grid w-full max-w-4xl grid-cols-2 gap-6 md:grid-cols-3">
					{#each openApps as app (app.id)}
						{@const appDef = availableApps.find(
							(a: { id: string; name: string; icon: typeof LucideIcon }) => a.id === app.appId
						)}
						{#if appDef}
							<div class="group relative">
								<!-- Caption above the thumbnail, like Windows -->
								<div class="mb-1.5 flex items-center gap-2 px-1 text-sm text-white drop-shadow">
									<appDef.icon class="h-4 w-4 shrink-0" />
									<span class="truncate">{appDef.name}</span>
									{#if app.minimized}
										<span class="text-xs text-slate-300">(ελαχιστοποιημένο)</span>
									{/if}
									{#if onCloseApp}
										<button
											type="button"
											class="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded text-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#c42b1c] hover:text-white focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none"
											aria-label={`Κλείσιμο ${appDef.name}`}
											onclick={() => onCloseApp?.(app.id)}
										>
											<X class="h-4 w-4" />
										</button>
									{/if}
								</div>
								<button
									type="button"
									class={cn(
										'flex aspect-[16/10] w-full flex-col overflow-hidden rounded-lg border-2 border-transparent bg-white text-left shadow-xl transition-all hover:border-sky-300 hover:shadow-2xl focus-visible:border-sky-300 focus-visible:outline-none',
										app.minimized && 'opacity-80'
									)}
									onclick={() => handleAppClick(app.id)}
									aria-label={`Μετάβαση στο παράθυρο ${appDef.name}`}
								>
									<!-- Thumbnail: a sketch of the window -->
									<span
										class="flex h-6 items-center gap-1.5 border-b border-black/5 bg-[#f3f3f3] px-2"
									>
										<appDef.icon class="h-3 w-3 text-neutral-600" />
										<span class="truncate text-[10px] text-neutral-700">{appDef.name}</span>
										<span class="ml-auto flex gap-1.5 text-neutral-400">
											<span class="h-1.5 w-1.5 rounded-sm bg-current"></span>
											<span class="h-1.5 w-1.5 rounded-sm bg-current"></span>
											<span class="h-1.5 w-1.5 rounded-sm bg-current"></span>
										</span>
									</span>
									<span class="flex flex-1 items-center justify-center bg-slate-50">
										<appDef.icon class="h-10 w-10 text-slate-300" />
									</span>
								</button>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>

		<!-- Virtual desktops strip -->
		<div class="flex items-end justify-center gap-3 px-8 pb-6">
			<div class="flex flex-col items-center gap-1">
				<span
					class="h-16 w-28 rounded-md border-2 border-sky-300 bg-[#0c3f9b] shadow"
					aria-hidden="true"
				></span>
				<span class="text-xs text-white drop-shadow">Επιφάνεια εργασίας 1</span>
			</div>
			<div
				class="flex h-16 w-28 cursor-help items-center justify-center gap-1 rounded-md border border-white/20 bg-white/10 text-xs text-white/80"
				title="Νέα επιφάνεια εργασίας: δεύτερος «χώρος» για παράθυρα. Δεν χρειάζεται σε αυτό το μάθημα."
				aria-hidden="true"
			>
				<Plus class="h-4 w-4" /> Νέα επιφάνεια
			</div>
		</div>
	</div>
{/if}
