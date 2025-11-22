<script lang="ts">
	import { onMount } from 'svelte';
	import type { Lesson } from '$lib/db/schema';
	import LessonTemplate from '../LessonTemplate.svelte';
    import * as m from '$lib/paraglide/messages';

	interface Props {
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}

	let { lesson, onComplete, onBack }: Props = $props();

    const config = lesson.config as {
		scrollDistance: number;
		timeLimit: number;
        gameMode?: boolean;
        instructions?: string;
	};

    const targetDistance = config.scrollDistance || 1000;
    const timeLimit = config.timeLimit || 40;

	let scrollY = $state(0);
    let progress = $derived(Math.min(100, (scrollY / targetDistance) * 100));
    let timeRemaining = $state(timeLimit);
    let gameStarted = $state(false);
    let isComplete = $state(false);
    let intervalId: number | null = null;

    function startGame() {
        gameStarted = true;
        intervalId = window.setInterval(() => {
            timeRemaining--;
            if (timeRemaining <= 0) {
                // Fail or end? Let's just end with partial score
                endGame();
            }
        }, 1000);
    }

    function handleScroll(e: UIEvent) {
        const target = e.target as HTMLElement;
        scrollY = target.scrollTop;

        if (scrollY >= targetDistance && !isComplete) {
             endGame();
        }
    }

    function endGame() {
        if(intervalId) clearInterval(intervalId);
        isComplete = true;
        const success = scrollY >= targetDistance;
        const score = success ? Math.min(100, 80 + Math.round((timeRemaining/timeLimit)*20)) : Math.round(progress);

        setTimeout(() => {
            onComplete(score);
        }, 2000);
    }

    onMount(() => {
        return () => { if(intervalId) clearInterval(intervalId); }
    });
</script>

<LessonTemplate {lesson} {onBack}>
	<div class="scroll-lesson h-full flex flex-col">
        {#if !gameStarted}
			<div class="start-screen flex-1 flex flex-col items-center justify-center bg-white rounded-lg p-8">
				<h2 class="mb-4 text-2xl font-bold">{m.lesson_instructions?.() || 'Οδηγίες'}</h2>
				<p class="mb-6 text-slate-600">{config.instructions || 'Κυλήστε μέχρι το τέλος της σελίδας.'}</p>
				<button class="start-button" onclick={startGame}>{m.start_lesson?.() || 'Έναρξη'}</button>
			</div>
        {:else if isComplete}
             <div class="complete-screen flex-1 flex flex-col items-center justify-center bg-white rounded-lg p-8">
				<h2 class="mb-2 text-3xl font-bold text-green-600">✓ {m.lesson_complete?.() || 'Ολοκληρώθηκε'}!</h2>
                <p class="text-lg text-slate-500">Score: {scrollY >= targetDistance ? Math.min(100, 80 + Math.round((timeRemaining/timeLimit)*20)) : Math.round(progress)}</p>
			</div>
        {:else}
            <div class="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg shrink-0">
                <div class="font-bold">Goal: {Math.round(progress)}%</div>
                <div class="font-mono">Time: {timeRemaining}s</div>
            </div>

            <!-- Scroll Container -->
            <div class="flex-1 overflow-y-auto bg-slate-100 relative scroll-smooth" onscroll={handleScroll}>
                <div class="p-8 space-y-8">
                    <div class="text-center py-12">
                        <div class="text-6xl mb-4">⬇️</div>
                        <h3 class="text-2xl font-bold text-slate-700">Start Scrolling!</h3>
                    </div>

                    {#each Array(10) as _, i}
                        <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mx-auto max-w-2xl">
                            <div class="h-4 w-3/4 bg-slate-200 rounded mb-4"></div>
                            <div class="space-y-2">
                                <div class="h-3 w-full bg-slate-100 rounded"></div>
                                <div class="h-3 w-full bg-slate-100 rounded"></div>
                                <div class="h-3 w-5/6 bg-slate-100 rounded"></div>
                            </div>
                             <div class="mt-8 flex justify-center text-slate-300 text-4xl">
                                 {i % 2 === 0 ? '🌳' : '🌲'}
                             </div>
                        </div>
                    {/each}

                    <!-- Goal Line -->
                    <div class="border-t-4 border-dashed border-green-500 py-12 text-center mt-24 relative" style="margin-top: {targetDistance/2}px">
                         <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-100 text-green-700 px-4 py-1 rounded-full font-bold border border-green-300">
                             FINISH LINE
                         </div>
                         <div class="text-6xl animate-bounce">🏆</div>
                         <h2 class="text-3xl font-bold text-green-700 mt-4">You made it!</h2>
                    </div>

                     <!-- Extra space to ensure scrolling past goal -->
                    <div class="h-[300px]"></div>
                </div>
            </div>
        {/if}
    </div>
</LessonTemplate>

<style>
	.start-button {
		padding: 1rem 2rem;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1.1rem;
		cursor: pointer;
	}
</style>
