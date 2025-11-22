<script lang="ts">
    import { onMount } from 'svelte';
    import { toast } from 'svelte-sonner';
    import type { Lesson } from '$lib/db/schema';

    let { lesson, onComplete } = $props<{ 
        lesson: Lesson, 
        onComplete: (score: number) => void 
    }>();

    let config = $derived(lesson.config as { targetCount: number, timeLimit: number } || { targetCount: 5, timeLimit: 30 });
    
    let bubbles = $state<{id: string, x: number, y: number, hovered: boolean}[]>([]);

    function initGame() {
        bubbles = Array(config.targetCount).fill(0).map(() => ({
            id: crypto.randomUUID(),
            x: Math.random() * 90,
            y: Math.random() * 80,
            hovered: false
        }));
    }

    onMount(initGame);

    function handleBubbleHover(id: string) {
        const bubble = bubbles.find(b => b.id === id);
        if (bubble && !bubble.hovered) {
            bubble.hovered = true;
            checkCompletion();
        }
    }

    function checkCompletion() {
        if (bubbles.every(b => b.hovered)) {
            toast.success('Lesson Completed!');
            onComplete(100);
        }
    }
</script>

<div class="relative h-64 w-full rounded-md bg-slate-100 border-2 border-slate-200 overflow-hidden">
    {#each bubbles as bubble}
        <div
            class="absolute h-12 w-12 rounded-full transition-all duration-300 flex items-center justify-center shadow-sm"
            class:bg-blue-500={!bubble.hovered}
            class:bg-green-500={bubble.hovered}
            class:scale-110={!bubble.hovered}
            class:scale-100={bubble.hovered}
            style="left: {bubble.x}%; top: {bubble.y}%"
            onmouseenter={() => handleBubbleHover(bubble.id)}
            role="img"
            aria-label="Target Bubble"
        >
            {#if bubble.hovered}
                <span class="text-white text-xl">✓</span>
            {/if}
        </div>
    {/each}
</div>

<div class="mt-4 flex justify-between items-center text-sm text-slate-600">
    <span>Progress: {bubbles.filter(b => b.hovered).length} / {bubbles.length}</span>
    <span>Hover over all bubbles to complete!</span>
</div>
