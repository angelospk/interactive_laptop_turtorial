<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	/**
	 * A single macOS window with the three "traffic light" controls. Close (red)
	 * only closes the WINDOW — quitting is a separate action owned by the menu bar
	 * / ⌘Q, which is the whole teaching point of the Mac track (CURRICULUM_PLAN §5).
	 */
	let {
		title,
		icon,
		onClose,
		onMinimize,
		onZoom,
		children,
		class: className
	} = $props<{
		title: string;
		icon?: string;
		onClose: () => void;
		onMinimize: () => void;
		onZoom: () => void;
		children?: Snippet;
		class?: string;
	}>();
</script>

<div
	class={cn(
		'absolute inset-x-6 top-12 bottom-24 flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white [font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif] shadow-2xl',
		className
	)}
>
	<!-- Title bar with traffic lights -->
	<div class="flex h-11 shrink-0 items-center gap-2 border-b border-black/5 bg-neutral-100 px-4">
		<div class="flex items-center gap-2">
			<button
				type="button"
				aria-label="Κλείσιμο παραθύρου"
				title="Κλείσιμο παραθύρου (το πρόγραμμα μένει ανοιχτό)"
				class="group flex h-4 w-4 items-center justify-center rounded-full bg-[#ff5f57] ring-1 ring-black/10 transition ring-inset hover:brightness-95"
				onclick={(e) => {
					e.stopPropagation();
					onClose();
				}}
			>
				<span
					class="text-[9px] leading-none font-bold text-black/60 opacity-0 group-hover:opacity-100"
					aria-hidden="true">✕</span
				>
			</button>
			<button
				type="button"
				aria-label="Ελαχιστοποίηση παραθύρου"
				title="Ελαχιστοποίηση"
				class="group flex h-4 w-4 items-center justify-center rounded-full bg-[#febc2e] ring-1 ring-black/10 transition ring-inset hover:brightness-95"
				onclick={(e) => {
					e.stopPropagation();
					onMinimize();
				}}
			>
				<span
					class="text-[9px] leading-none font-bold text-black/60 opacity-0 group-hover:opacity-100"
					aria-hidden="true">–</span
				>
			</button>
			<button
				type="button"
				aria-label="Μεγιστοποίηση παραθύρου"
				title="Μεγιστοποίηση"
				class="group flex h-4 w-4 items-center justify-center rounded-full bg-[#28c840] ring-1 ring-black/10 transition ring-inset hover:brightness-95"
				onclick={(e) => {
					e.stopPropagation();
					onZoom();
				}}
			>
				<span
					class="text-[8px] leading-none font-bold text-black/60 opacity-0 group-hover:opacity-100"
					aria-hidden="true">+</span
				>
			</button>
		</div>
		<div class="flex flex-1 items-center justify-center gap-2 text-sm font-medium text-neutral-700">
			{#if icon}<span aria-hidden="true">{icon}</span>{/if}
			<span>{title}</span>
		</div>
		<div class="w-16" aria-hidden="true"></div>
	</div>

	<!-- Content -->
	<div class="relative flex-1 overflow-auto bg-white">
		{@render children?.()}
	</div>
</div>
