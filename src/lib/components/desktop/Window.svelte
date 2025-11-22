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
		children?: Snippet;
		class?: string;
	}>();

	let x = $state(initialX);
	let y = $state(initialY);
	let isDragging = false;
	let dragOffset = { x: 0, y: 0 };

	function startDrag(e: MouseEvent) {
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
			"absolute flex flex-col overflow-hidden rounded-lg bg-white shadow-xl transition-all duration-100",
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
	>
		<!-- Title Bar -->
		<div
			class="flex h-10 cursor-move items-center justify-between border-b bg-slate-100 px-2 select-none"
			onmousedown={startDrag}
			role="group"
		>
			<div class="flex items-center text-sm text-slate-600">
				{#if Icon}
					<Icon class="mr-2 h-4 w-4" />
				{/if}
				{title}
			</div>
			<div class="flex gap-1">
				<Button
					variant="ghost"
					size="icon"
					class="h-8 w-8 hover:bg-slate-200"
					onclick={(e) => { e.stopPropagation(); onMinimize(); }}
				>
					<Minus class="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					class="h-8 w-8 hover:bg-slate-200"
					onclick={(e) => { e.stopPropagation(); onMaximize(); }}
				>
					<Square class="h-4 w-4" />
				</Button>
				<Button
					variant="destructive"
					size="icon"
					class="h-8 w-8"
					onclick={(e) => { e.stopPropagation(); onClose(); }}
				>
					<X class="h-4 w-4" />
				</Button>
			</div>
		</div>

		<!-- Content -->
		<div class="flex-1 overflow-hidden bg-white relative">
			{@render children?.()}
		</div>
	</div>
{/if}
