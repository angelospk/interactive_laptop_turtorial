<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	/**
	 * A single macOS window with the three "traffic light" controls. Close (red)
	 * only closes the WINDOW — quitting is a separate action owned by the menu bar
	 * / ⌘Q, which is the whole teaching point of the Mac track (CURRICULUM_PLAN §5).
	 * The green button zooms: the window fills the space between the menu bar and
	 * the Dock, and shrinks back on the next click.
	 *
	 * The dots are drawn at macOS size (14px) but each button's hit area is 36px,
	 * so an unsteady hand still lands on the right one.
	 */
	let {
		title,
		icon,
		zoomed = false,
		onClose,
		onMinimize,
		onZoom,
		children,
		class: className
	} = $props<{
		title: string;
		icon?: string;
		zoomed?: boolean;
		onClose: () => void;
		onMinimize: () => void;
		onZoom: () => void;
		children?: Snippet;
		class?: string;
	}>();

	const light =
		'group flex h-9 w-9 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a60ff]';
	const dot =
		'flex h-3.5 w-3.5 items-center justify-center rounded-full ring-1 ring-black/15 ring-inset transition group-hover:brightness-95 text-[9px] leading-none font-bold text-black/60';
</script>

<div
	class={cn(
		'absolute flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition-[inset] duration-150',
		zoomed ? 'inset-x-1 top-9 bottom-[5.25rem]' : 'inset-x-6 top-12 bottom-24 sm:inset-x-10',
		className
	)}
	role="application"
	aria-label={title}
	data-mac-window
	data-zoomed={zoomed ? 'true' : 'false'}
>
	<!-- Title bar with traffic lights. Double-click zooms, as on a Mac; the green button is the keyboard path. -->
	<div
		class="flex h-11 shrink-0 items-center gap-0 border-b border-black/10 bg-[#ececec] pr-4 pl-2"
		ondblclick={onZoom}
		role="group"
		aria-label="Γραμμή τίτλου"
	>
		<div class="flex items-center">
			<button
				type="button"
				aria-label="Κλείσιμο παραθύρου"
				title="Κλείσιμο παραθύρου (το πρόγραμμα μένει ανοιχτό)"
				class={light}
				onclick={(e) => {
					e.stopPropagation();
					onClose();
				}}
				ondblclick={(e) => e.stopPropagation()}
			>
				<span class={cn(dot, 'bg-[#ff5f57]')}>
					<span
						class="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
						aria-hidden="true">✕</span
					>
				</span>
			</button>
			<button
				type="button"
				aria-label="Ελαχιστοποίηση παραθύρου"
				title="Ελαχιστοποίηση (το παράθυρο κρύβεται στο Dock)"
				class={light}
				onclick={(e) => {
					e.stopPropagation();
					onMinimize();
				}}
				ondblclick={(e) => e.stopPropagation()}
			>
				<span class={cn(dot, 'bg-[#febc2e]')}>
					<span
						class="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
						aria-hidden="true">–</span
					>
				</span>
			</button>
			<button
				type="button"
				aria-label={zoomed ? 'Επαναφορά μεγέθους παραθύρου' : 'Μεγιστοποίηση παραθύρου'}
				title={zoomed ? 'Επαναφορά μεγέθους' : 'Μεγιστοποίηση'}
				class={light}
				onclick={(e) => {
					e.stopPropagation();
					onZoom();
				}}
				ondblclick={(e) => e.stopPropagation()}
			>
				<span class={cn(dot, 'bg-[#28c840]')}>
					<span
						class="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
						aria-hidden="true">{zoomed ? '−' : '+'}</span
					>
				</span>
			</button>
		</div>
		<div
			class="flex flex-1 items-center justify-center gap-1.5 text-[13px] font-semibold text-neutral-700"
		>
			{#if icon}<span aria-hidden="true">{icon}</span>{/if}
			<span>{title}</span>
		</div>
		<div class="w-[6.75rem]" aria-hidden="true"></div>
	</div>

	<!-- Content -->
	<div class="relative flex-1 overflow-auto bg-white">
		{@render children?.()}
	</div>
</div>
