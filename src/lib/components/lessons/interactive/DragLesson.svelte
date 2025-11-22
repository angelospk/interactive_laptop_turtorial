<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { Lesson } from '$lib/db/schema';
	import LessonTemplate from '../LessonTemplate.svelte';
    import * as m from '$lib/paraglide/messages';

	let { lesson, onComplete, onBack } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}>();

	let config = $derived(
		(lesson.config as {
            itemCount: number;
            dropZones: number;
            theme?: string;
            instructions?: string
        }) || { itemCount: 3, dropZones: 3, theme: 'shapes' }
	);

    const theme = config.theme || 'shapes';

    // Theme Configurations
    const themes: Record<string, any> = {
        shapes: {
            items: [
                { id: 'square', name: 'Τετράγωνο', color: 'bg-red-500', shapeClass: 'rounded-md' },
                { id: 'circle', name: 'Κύκλος', color: 'bg-blue-500', shapeClass: 'rounded-full' },
                { id: 'triangle', name: 'Τρίγωνο', color: 'bg-green-500', isTriangle: true }
            ],
            dropZoneLabel: (name: string) => name
        },
        recycle: {
            items: [
                { id: 'paper', name: 'Χαρτί', icon: '📄', color: 'bg-white border', target: 'blue-bin' },
                { id: 'plastic', name: 'Πλαστικό', icon: '🥤', color: 'bg-transparent', target: 'blue-bin' },
                { id: 'glass', name: 'Γυαλί', icon: '🍾', color: 'bg-transparent', target: 'blue-bin' }, // Simplified recycling
                { id: 'banana', name: 'Φλούδα', icon: '🍌', color: 'bg-transparent', target: 'green-bin' },
                { id: 'apple', name: 'Μήλο', icon: '🍎', color: 'bg-transparent', target: 'green-bin' }
            ],
            dropZones: [
                { id: 'blue-bin', name: 'Ανακύκλωση', color: 'bg-blue-100 border-blue-500', icon: '♻️' },
                { id: 'green-bin', name: 'Οργανικά', color: 'bg-green-100 border-green-500', icon: '🗑️' }
            ]
        },
        puzzle: {
             // Simplified puzzle logic
             items: [
                 { id: 'p1', name: '1', icon: '🧩', target: 'z1' },
                 { id: 'p2', name: '2', icon: '🧩', target: 'z2' },
                 { id: 'p3', name: '3', icon: '🧩', target: 'z3' },
                 { id: 'p4', name: '4', icon: '🧩', target: 'z4' }
             ],
             dropZones: [
                 { id: 'z1', name: '1', color: 'bg-slate-100' },
                 { id: 'z2', name: '2', color: 'bg-slate-100' },
                 { id: 'z3', name: '3', color: 'bg-slate-100' },
                 { id: 'z4', name: '4', color: 'bg-slate-100' }
             ]
        }
    };

    let currentTheme = $derived(themes[theme] || themes.shapes);
	let pieces = $state<any[]>([]);
    let zones = $state<any[]>([]);
	let draggingItem: string | null = null;

	function initGame() {
        if (theme === 'recycle') {
            pieces = currentTheme.items.map((i: any) => ({...i, dropped: false}));
            zones = currentTheme.dropZones;
        } else if (theme === 'puzzle') {
            pieces = currentTheme.items.map((i: any) => ({...i, dropped: false}));
            zones = currentTheme.dropZones;
        } else {
             // Default Shapes
             pieces = currentTheme.items.map((s: any) => ({ ...s, dropped: false, target: s.id }));
             zones = currentTheme.items.map((s: any) => ({ id: s.id, name: s.name, shapeClass: s.shapeClass, isTriangle: s.isTriangle }));
        }
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

        const piece = pieces.find((p) => p.id === droppedPieceId);

        if (piece && piece.target === targetId) {
            piece.dropped = true;
            checkCompletion();
        } else {
            toast.error('Λάθος θέση! Προσπάθησε ξανά.');
        }
	}

	function checkCompletion() {
		if (pieces.every((p) => p.dropped)) {
			toast.success('Μπράβο!');
			onComplete(100);
		}
	}
</script>

<LessonTemplate {lesson} {onBack}>
	<div class="flex flex-col gap-8 p-4 min-h-[400px]">

        <div class="text-center mb-4">
            <p class="text-lg text-slate-700">{config.instructions || 'Σύρετε τα αντικείμενα στη σωστή θέση.'}</p>
        </div>

		<div class="flex min-h-[100px] justify-center gap-4 flex-wrap">
			{#each pieces as piece}
				{#if !piece.dropped}
					<div
						draggable="true"
						ondragstart={(e) => handleDragStart(e, piece.id)}
						class="h-20 w-20 {piece.color} flex cursor-grab items-center justify-center font-bold text-white shadow-md transition-transform hover:scale-105 select-none"
						class:rounded-md={piece.shapeClass === 'rounded-md'}
						class:rounded-full={piece.shapeClass === 'rounded-full'}
                        class:text-4xl={!!piece.icon}
                        class:bg-white={!!piece.icon}
                        class:border={!!piece.icon}
						style={piece.isTriangle
							? 'width: 0; height: 0; background-color: transparent; border-left: 40px solid transparent; border-right: 40px solid transparent; border-bottom: 80px solid #22c55e;' // Tailwind green-500
							: ''}
						role="button"
						tabindex="0"
						aria-label={piece.name}
					>
						{piece.isTriangle ? '' : (piece.icon || piece.name)}
					</div>
				{:else}
					<div class="h-20 w-20"></div>
					<!-- Placeholder -->
				{/if}
			{/each}
		</div>

		<div class="flex justify-center gap-8 border-t border-slate-200 pt-12 flex-wrap mt-auto">
			{#each zones as zone}
				<div
					ondragover={handleDragOver}
					ondrop={(e) => handleDrop(e, zone.id)}
					class="flex flex-col items-center justify-center h-32 w-32 border-4 border-dashed transition-colors relative
                    {zone.color || 'border-slate-300'}"
					class:rounded-md={zone.shapeClass === 'rounded-md'}
					class:rounded-full={zone.shapeClass === 'rounded-full'}
                    class:bg-green-50={theme === 'recycle'}
					role="region"
					aria-label="Drop zone for {zone.name}"
				>
                    {#if theme === 'recycle'}
                        <span class="text-4xl mb-2">{zone.icon}</span>
                        <span class="font-bold text-slate-600">{zone.name}</span>
                    {:else if theme === 'puzzle'}
                         <span class="text-slate-300 font-bold text-2xl">{zone.name}</span>
                    {:else}
                        {#if zone.isTriangle}
                             <!-- Triangle Outline using SVG because CSS borders are hard for outlines -->
                             <svg width="80" height="80" viewBox="0 0 100 100">
                                 <polygon points="50,10 10,90 90,90" fill="none" stroke="#cbd5e1" stroke-width="4" stroke-dasharray="10,5" />
                             </svg>
                        {:else}
					        <span class="text-slate-300 font-bold">{zone.name}</span>
                        {/if}
                    {/if}

                    <!-- Show dropped items inside? -->
                    {#each pieces.filter(p => p.dropped && p.target === zone.id) as droppedPiece}
                         <div class="absolute inset-0 flex items-center justify-center bg-green-100/50">
                             <span class="text-3xl">✅</span>
                         </div>
                    {/each}
				</div>
			{/each}
		</div>
	</div>
</LessonTemplate>
