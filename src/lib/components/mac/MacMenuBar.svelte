<script lang="ts">
	/**
	 * The macOS menu bar (top strip). The frontmost app's name owns the menu — its
	 * «Τερματισμός» (Quit) item is the reliable way to fully quit an app (⌘Q is
	 * often intercepted by the host browser, codex plan review). The magnifier on
	 * the right opens Spotlight.
	 */
	let {
		activeLabel,
		canQuit = false,
		onQuit,
		onSpotlight,
		clock = '10:09',
		disabled = false
	} = $props<{
		activeLabel: string;
		canQuit?: boolean;
		onQuit: () => void;
		onSpotlight: () => void;
		clock?: string;
		disabled?: boolean;
	}>();

	let menuOpen = $state(false);

	function quit() {
		menuOpen = false;
		onQuit();
	}
</script>

<div
	class="absolute inset-x-0 top-0 z-20 flex h-8 items-center justify-between bg-black/40 px-3 [font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif] text-sm text-white backdrop-blur-md"
	role="menubar"
	aria-label="Γραμμή μενού"
>
	<div class="flex items-center gap-3">
		<span class="text-base leading-none" aria-hidden="true">🍎</span>
		<div class="relative">
			<button
				type="button"
				{disabled}
				class="rounded px-1 font-semibold hover:bg-white/20 disabled:opacity-60"
				aria-haspopup="menu"
				aria-expanded={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}
			>
				{activeLabel}
			</button>
			{#if menuOpen}
				<div
					class="absolute top-7 left-0 min-w-52 rounded-lg border border-black/10 bg-white/95 py-1 text-neutral-800 shadow-xl backdrop-blur"
					role="menu"
				>
					<button
						type="button"
						role="menuitem"
						disabled={!canQuit}
						class="flex w-full items-center justify-between gap-6 px-3 py-2 text-left hover:bg-blue-500 hover:text-white disabled:cursor-not-allowed disabled:text-neutral-400 disabled:hover:bg-transparent"
						onclick={quit}
					>
						<span>Τερματισμός «{activeLabel}»</span>
						<span class="text-xs opacity-70" aria-hidden="true">⌘Q</span>
					</button>
				</div>
			{/if}
		</div>
	</div>

	<div class="flex items-center gap-3">
		<button
			type="button"
			{disabled}
			aria-label="Spotlight αναζήτηση"
			title="Spotlight (αναζήτηση)"
			class="rounded px-1 text-base hover:bg-white/20 disabled:opacity-60"
			onclick={onSpotlight}
		>
			<span aria-hidden="true">🔍</span>
		</button>
		<span aria-hidden="true">🔋</span>
		<span aria-hidden="true">📶</span>
		<span class="tabular-nums">{clock}</span>
	</div>
</div>
