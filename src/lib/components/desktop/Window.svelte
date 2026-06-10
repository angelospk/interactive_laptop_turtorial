<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Minus, Square, X, GripHorizontal } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	let {
		title,
		icon: Icon,
		isOpen = false,
		isMinimized = false,
		isMaximized = false,
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
		icon: any;
		isOpen: boolean;
		isMinimized: boolean;
		isMaximized: boolean;
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
		// We need to account for the parent container in a real scenario,
		// but for now we assume the mouse event clientX/Y minus current x/y works
		// if we are careful about the context.
		// Better approach for a contained drag:
		dragOffset.x = e.clientX - x;
		dragOffset.y = e.clientY - y;

		window.addEventListener('mousemove', onDrag);
		window.addEventListener('mouseup', stopDrag);
	}

	function onDrag(e: MouseEvent) {
		if (!isDragging) return;
		x = e.clientX - dragOffset.x;
		y = e.clientY - dragOffset.y;
	}

	function stopDrag() {
		isDragging = false;
		window.removeEventListener('mousemove', onDrag);
		window.removeEventListener('mouseup', stopDrag);
	}
</script>

{#if isOpen && !isMinimized}
	<div
		class={cn(
			'absolute flex flex-col overflow-hidden rounded-lg border border-black/10 bg-white shadow-2xl transition-all duration-100 [font-family:Segoe_UI,system-ui,sans-serif]',
			className
		)}
		style="
			left: {isMaximized ? 0 : x}px;
			top: {isMaximized ? 0 : y}px;
			width: {isMaximized ? '100%' : `${initialWidth}px`};
			height: {isMaximized ? '100%' : `${initialHeight}px`};
			z-index: {isMaximized ? 10 : 1};
		"
		onclick={(e) => e.stopPropagation()}
		onmousedown={() => onFocus?.()}
		role="application"
	>
		<!-- Title Bar -->
		<div
			class="flex h-9 cursor-move items-center justify-between border-b border-black/5 bg-neutral-100 pl-3 select-none"
			onmousedown={startDrag}
			role="group"
		>
			<div class="flex items-center text-[13px] leading-none text-neutral-700">
				{#if Icon}
					<Icon class="mr-2 h-4 w-4" />
				{/if}
				{title}
			</div>
			<div class="flex h-full items-stretch">
				<Button
					variant="ghost"
					size="icon"
					class="h-full w-11 rounded-none text-neutral-600 hover:bg-black/5 hover:text-neutral-800"
					onclick={(e) => {
						e.stopPropagation();
						onMinimize();
					}}
				>
					<Minus class="h-4 w-4" strokeWidth={1.5} />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					class="h-full w-11 rounded-none text-neutral-600 hover:bg-black/5 hover:text-neutral-800"
					onclick={(e) => {
						e.stopPropagation();
						onMaximize();
					}}
				>
					<Square class="h-3.5 w-3.5" strokeWidth={1.5} />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					class="h-full w-11 rounded-none text-neutral-600 hover:bg-[#c42b1c] hover:text-white"
					onclick={(e) => {
						e.stopPropagation();
						onClose();
					}}
				>
					<X class="h-4 w-4" strokeWidth={1.5} />
				</Button>
			</div>
		</div>

		<!-- Content -->
		<div class="relative flex-1 overflow-hidden bg-white">
			{@render children?.()}
		</div>
	</div>
{/if}
