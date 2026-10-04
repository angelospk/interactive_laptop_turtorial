<script lang="ts">
	import { Minus, Square, X, Copy } from 'lucide-svelte';
	import type { Icon as LucideIcon } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	/**
	 * A Windows 11 application window: 32px title bar with the app icon and
	 * name on the left, the three caption buttons on the right (minimise,
	 * maximise/restore, close — close turns red on hover, exactly like Windows),
	 * rounded corners and a soft shadow. Dragging the title bar moves it;
	 * double-clicking the title bar toggles maximise, as on a real PC.
	 */
	let {
		title,
		icon: Icon,
		isOpen = false,
		isMinimized = false,
		isMaximized = false,
		active = true,
		initialX = 50,
		initialY = 50,
		initialWidth = 600,
		initialHeight = 400,
		onMinimize,
		onMaximize,
		onClose,
		onFocus,
		children,
		class: className
	} = $props<{
		title: string;
		icon: typeof LucideIcon | undefined;
		isOpen: boolean;
		isMinimized: boolean;
		isMaximized: boolean;
		/** The frontmost window has a bright title; the others fade, like Windows. */
		active?: boolean;
		initialX?: number;
		initialY?: number;
		initialWidth?: number;
		initialHeight?: number;
		onMinimize: () => void;
		onMaximize: () => void;
		onClose: () => void;
		onFocus?: () => void;
		children?: Snippet;
		class?: string;
	}>();

	let x = $state(initialX);
	let y = $state(initialY);
	let isDragging = false;
	let dragOffset = { x: 0, y: 0 };

	function startDrag(e: MouseEvent) {
		onFocus?.();
		if (isMaximized) return;
		isDragging = true;
		// Calculate offset relative to the window's top-left corner
		dragOffset.x = e.clientX - x;
		dragOffset.y = e.clientY - y;

		window.addEventListener('mousemove', onDrag);
		window.addEventListener('mouseup', stopDrag);
	}

	function onDrag(e: MouseEvent) {
		if (!isDragging) return;
		x = Math.max(0, e.clientX - dragOffset.x);
		y = Math.max(0, e.clientY - dragOffset.y);
	}

	function stopDrag() {
		isDragging = false;
		window.removeEventListener('mousemove', onDrag);
		window.removeEventListener('mouseup', stopDrag);
	}

	// Caption buttons: Windows 11 draws them 46×32; here they are 48×44 so an
	// unsteady hand can hit them (the project's 44px minimum target size).
	const captionButton =
		'flex h-11 w-12 items-center justify-center text-neutral-700 transition-colors hover:bg-black/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500';
</script>

<!-- Maximized stops at the taskbar (h-12 = 3rem) like the real thing: running
     to the bottom put the end of every page, and the download lesson's "Λήψη"
     button, behind it. -->
{#if isOpen && !isMinimized}
	<!-- simulated surface / mouse-skill drill: the mouse gesture is the lesson -->
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
	<div
		class={cn(
			'absolute flex flex-col overflow-hidden bg-white [font-family:Segoe_UI,system-ui,sans-serif] transition-[left,top,width,height] duration-100',
			isMaximized
				? 'rounded-none border-0 shadow-none'
				: 'rounded-lg border border-black/15 shadow-[0_8px_32px_rgba(0,0,0,0.28),0_1px_3px_rgba(0,0,0,0.2)]',
			className
		)}
		style="
			left: {isMaximized ? 0 : x}px;
			top: {isMaximized ? 0 : y}px;
			width: {isMaximized ? '100%' : `${initialWidth}px`};
			height: {isMaximized ? 'calc(100% - 3rem)' : `${initialHeight}px`};
			z-index: {isMaximized ? 10 : 1};
		"
		onclick={(e) => e.stopPropagation()}
		onmousedown={() => onFocus?.()}
		role="application"
		aria-label={title}
		data-window
		data-active={active ? 'true' : 'false'}
	>
		<!-- Title Bar -->
		<!-- simulated surface / mouse-skill drill: the mouse gesture is the lesson -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class={cn(
				'flex h-11 shrink-0 items-center justify-between border-b border-black/5 pl-3 select-none',
				isMaximized ? '' : 'cursor-move',
				active ? 'bg-[#f3f3f3]' : 'bg-[#ebebeb]'
			)}
			onmousedown={startDrag}
			ondblclick={() => onMaximize()}
			role="group"
			aria-label="Γραμμή τίτλου"
			data-titlebar
		>
			<div
				class={cn(
					'flex min-w-0 items-center text-[13px] leading-none',
					active ? 'text-neutral-900' : 'text-neutral-500'
				)}
			>
				{#if Icon}
					<Icon class="mr-2 h-4 w-4 shrink-0" />
				{/if}
				<span class="truncate">{title}</span>
			</div>
			<div class="flex h-full items-stretch">
				<button
					type="button"
					class={captionButton}
					aria-label="Ελαχιστοποίηση"
					title="Ελαχιστοποίηση"
					onmousedown={(e) => e.stopPropagation()}
					ondblclick={(e) => e.stopPropagation()}
					onclick={(e) => {
						e.stopPropagation();
						onMinimize();
					}}
				>
					<Minus class="h-4 w-4" strokeWidth={1.25} />
				</button>
				<button
					type="button"
					class={captionButton}
					aria-label={isMaximized ? 'Επαναφορά μεγέθους' : 'Μεγιστοποίηση'}
					title={isMaximized ? 'Επαναφορά μεγέθους' : 'Μεγιστοποίηση'}
					onmousedown={(e) => e.stopPropagation()}
					ondblclick={(e) => e.stopPropagation()}
					onclick={(e) => {
						e.stopPropagation();
						onMaximize();
					}}
				>
					{#if isMaximized}
						<Copy class="h-3.5 w-3.5 -scale-x-100" strokeWidth={1.25} />
					{:else}
						<Square class="h-3.5 w-3.5" strokeWidth={1.25} />
					{/if}
				</button>
				<button
					type="button"
					class={cn(captionButton, 'hover:bg-[#c42b1c] hover:text-white')}
					aria-label="Κλείσιμο παραθύρου"
					title="Κλείσιμο"
					onmousedown={(e) => e.stopPropagation()}
					ondblclick={(e) => e.stopPropagation()}
					onclick={(e) => {
						e.stopPropagation();
						onClose();
					}}
				>
					<X class="h-4 w-4" strokeWidth={1.25} />
				</button>
			</div>
		</div>

		<!-- Content -->
		<div class="relative flex-1 overflow-hidden bg-white">
			{@render children?.()}
		</div>
	</div>
{/if}
