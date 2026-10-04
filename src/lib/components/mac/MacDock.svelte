<script lang="ts">
	import type { MacSimApp } from '$lib/lessons/macSim';
	import { cn } from '$lib/utils';
	import { AppIcon } from '$lib/components/ui/app-icon';

	/**
	 * The macOS Dock. A small dot under an icon means the app is RUNNING — it stays
	 * there after the window is closed (red button) and disappears only on Quit.
	 * That contrast is the visual anchor for the close ≠ quit lesson.
	 *
	 * Icons are squircle tiles drawn by AppIcon (vector glyphs for the known apps,
	 * the config emoji on a kind-coloured tile otherwise), grow a little on hover,
	 * show their name in a tooltip, and the Trash sits past the separator as on a
	 * real Mac.
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

	const TILE: Record<string, string> = {
		finder: 'bg-gradient-to-b from-[#4fb2ff] to-[#1a73e8]',
		settings: 'bg-gradient-to-b from-[#8e8e93] to-[#5c5c61]',
		browser: 'bg-gradient-to-b from-[#56c0ff] to-[#1877f2]',
		notes: 'bg-gradient-to-b from-[#fff4a3] to-[#f6d35c]',
		placeholder: 'bg-gradient-to-b from-white to-neutral-200'
	};

	let trashNotice = $state('');
</script>

<div
	class="absolute inset-x-0 bottom-1.5 flex flex-col items-center gap-1"
	role="toolbar"
	aria-label="Dock, γραμμή εφαρμογών"
>
	{#if trashNotice}
		<p class="rounded-md bg-black/60 px-3 py-1 text-xs text-white" role="status" aria-live="polite">
			{trashNotice}
		</p>
	{/if}
	<div
		class="flex items-end gap-1.5 rounded-2xl border border-white/40 bg-white/35 px-2 pt-1.5 pb-1 shadow-xl backdrop-blur-xl"
		data-mac-dock
	>
		{#each dockApps as app (app.id)}
			{@const running = runningAppIds.includes(app.id)}
			<div class="group relative flex flex-col items-center">
				<!-- Name tooltip, like the Dock shows on hover -->
				<span
					class="pointer-events-none absolute -top-9 rounded-md bg-neutral-800/90 px-2 py-0.5 text-xs whitespace-nowrap text-white opacity-0 shadow transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
					aria-hidden="true"
				>
					{app.label}
				</span>
				<button
					type="button"
					{disabled}
					aria-label={running ? `${app.label} (ανοιχτό)` : app.label}
					title={app.label}
					class={cn(
						'flex rounded-[14px] shadow-md transition-transform duration-150 hover:-translate-y-2 hover:scale-125 focus-visible:ring-4 focus-visible:ring-[#0a60ff] focus-visible:outline-none disabled:cursor-not-allowed motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100',
						highlightAppId === app.id &&
							'ring-4 ring-[#0a60ff] ring-offset-2 ring-offset-transparent motion-safe:animate-pulse'
					)}
					onclick={() => onOpen(app.id)}
				>
					<AppIcon
						id={app.id}
						kind={app.kind}
						emoji={app.icon}
						platform="mac"
						fallbackClass={TILE[app.kind ?? 'placeholder'] ?? TILE.placeholder}
						class="h-12 w-12 rounded-[14px] text-2xl ring-1 ring-black/10 ring-inset"
					/>
				</button>
				<span
					class={cn(
						'mt-1 h-1 w-1 rounded-full transition',
						running ? 'bg-neutral-800' : 'bg-transparent'
					)}
					aria-hidden="true"
				></span>
			</div>
		{/each}

		<!-- Separator + Trash -->
		<div class="mx-1 mb-2 h-10 w-px self-center bg-black/20" aria-hidden="true"></div>
		<div class="flex flex-col items-center">
			<button
				type="button"
				{disabled}
				aria-label="Κάδος"
				title="Κάδος"
				class="flex rounded-[14px] transition-transform duration-150 hover:-translate-y-2 hover:scale-125 focus-visible:ring-4 focus-visible:ring-[#0a60ff] focus-visible:outline-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
				onclick={() =>
					(trashNotice =
						'Ο Κάδος είναι άδειος. Εδώ πάνε τα αρχεία που σβήνεις, μέχρι να τον αδειάσεις.')}
			>
				<AppIcon id="trash" emoji="🗑️" platform="mac" class="h-12 w-12 rounded-[14px]" />
			</button>
			<span class="mt-1 h-1 w-1" aria-hidden="true"></span>
		</div>
	</div>
</div>
