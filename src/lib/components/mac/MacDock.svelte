<script lang="ts">
	import type { MacSimApp } from '$lib/lessons/macSim';
	import { cn } from '$lib/utils';

	/**
	 * The macOS Dock. A small dot under an icon means the app is RUNNING — it stays
	 * there after the window is closed (red button) and disappears only on Quit.
	 * That contrast is the visual anchor for the close ≠ quit lesson.
	 */
	let {
		apps,
		dockAppIds,
		runningAppIds = [],
		highlightAppId = null,
		disabled = false,
		onOpen
	} = $props<{
		apps: MacSimApp[];
		dockAppIds: string[];
		runningAppIds?: string[];
		highlightAppId?: string | null;
		disabled?: boolean;
		onOpen: (appId: string) => void;
	}>();

	const dockApps = $derived(
		dockAppIds
			.map((id: string) => apps.find((a: MacSimApp) => a.id === id))
			.filter((a: MacSimApp | undefined): a is MacSimApp => Boolean(a))
	);
</script>

<div
	class="absolute inset-x-0 bottom-2 flex justify-center"
	role="toolbar"
	aria-label="Dock, γραμμή εφαρμογών"
>
	<div
		class="flex items-end gap-2 rounded-2xl border border-white/40 bg-white/30 px-3 py-2 shadow-lg backdrop-blur-md"
	>
		{#each dockApps as app (app.id)}
			{@const running = runningAppIds.includes(app.id)}
			<div class="flex flex-col items-center">
				<button
					type="button"
					{disabled}
					aria-label={running ? `${app.label} (ανοιχτό)` : app.label}
					title={app.label}
					class={cn(
						'flex h-14 w-14 items-center justify-center rounded-xl bg-white/80 text-3xl shadow-sm transition hover:-translate-y-1 hover:scale-110 disabled:cursor-not-allowed',
						highlightAppId === app.id &&
							'ring-4 ring-blue-500 ring-offset-2 ring-offset-transparent motion-safe:animate-pulse'
					)}
					onclick={() => onOpen(app.id)}
				>
					<span aria-hidden="true">{app.icon}</span>
				</button>
				<span
					class={cn(
						'mt-1 h-1.5 w-1.5 rounded-full transition',
						running ? 'bg-neutral-700' : 'bg-transparent'
					)}
					aria-hidden="true"
				></span>
			</div>
		{/each}
	</div>
</div>
