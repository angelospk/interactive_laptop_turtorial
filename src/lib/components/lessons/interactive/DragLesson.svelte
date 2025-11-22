<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { Lesson } from '$lib/db/schema';
	import LessonTemplate from '../LessonTemplate.svelte';

	let { lesson, onComplete, onBack } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}>();

	let config = $derived(
		(lesson.config as { itemCount: number; dropZones: number }) || { itemCount: 3, dropZones: 3 }
	);

	let pieces = $state<{ id: string; name: string; color: string; dropped: boolean }[]>([]);
	let draggingItem: string | null = null;

	function initGame() {
		// Simple shapes for now
		const shapes = [
			{ id: 'square', name: 'Square', color: 'bg-red-500' },
			{ id: 'circle', name: 'Circle', color: 'bg-blue-500' },
			{ id: 'triangle', name: 'Triangle', color: 'bg-green-500' }
		];

		// Use config to limit or repeat shapes if needed, for now just use the 3 basic ones
		pieces = shapes.map((s) => ({ ...s, dropped: false }));
	}

	onMount(initGame);

	function handleDragStart(e: DragEvent, pieceId: string) {
		draggingItem = pieceId;
		if (e.dataTransfer) {
			e.dataTransfer.setData('text/plain', pieceId);
			e.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDrop(e: DragEvent, targetId: string) {
		e.preventDefault();
		const droppedPieceId = draggingItem;
		draggingItem = null;

		if (droppedPieceId === targetId) {
			const piece = pieces.find((p) => p.id === droppedPieceId);
			if (piece) {
				piece.dropped = true;
				checkCompletion();
			}
		} else {
			toast.error('Wrong shape! Try again.');
		}
	}

	function checkCompletion() {
		if (pieces.every((p) => p.dropped)) {
			toast.success('Lesson Completed!');
			onComplete(100);
		}
	}
</script>

<LessonTemplate {lesson} {onBack}>
	<div class="flex flex-col gap-8 p-4">
		<div class="flex min-h-[100px] justify-center gap-4">
			{#each pieces as piece}
				{#if !piece.dropped}
					<div
						draggable="true"
						ondragstart={(e) => handleDragStart(e, piece.id)}
						class="h-20 w-20 {piece.color} flex cursor-grab items-center justify-center font-bold text-white shadow-md transition-transform hover:scale-105"
						class:rounded-md={piece.id === 'square'}
						class:rounded-full={piece.id === 'circle'}
						style={piece.id === 'triangle'
							? 'width: 0; height: 0; background-color: transparent; border-left: 40px solid transparent; border-right: 40px solid transparent; border-bottom: 80px solid #22c55e;' // Tailwind green-500
							: ''}
						role="button"
						tabindex="0"
						aria-label={piece.name}
					>
						{piece.id !== 'triangle' ? piece.name : ''}
					</div>
				{:else}
					<div class="h-20 w-20"></div>
					<!-- Placeholder -->
				{/if}
			{/each}
		</div>

		<div class="flex justify-center gap-4 border-t border-slate-200 pt-8">
			{#each pieces as piece}
				<div
					ondragover={handleDragOver}
					ondrop={(e) => handleDrop(e, piece.id)}
					class="flex h-24 w-24 items-center justify-center border-2 border-dashed text-slate-400 transition-colors"
					class:rounded-md={piece.id === 'square'}
					class:rounded-full={piece.id === 'circle'}
					class:bg-green-100={piece.dropped}
					class:border-green-500={piece.dropped}
					class:border-slate-300={!piece.dropped}
					role="region"
					aria-label="Drop zone for {piece.name}"
				>
					{piece.dropped ? '✅' : piece.name}
				</div>
			{/each}
		</div>
	</div>

	<div class="mt-4 text-center text-sm text-slate-600">
		Drag the shapes from the top to their matching outlines below.
	</div>
</LessonTemplate>
