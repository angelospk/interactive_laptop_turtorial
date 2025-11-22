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
		targetCount: number;
		timeLimit: number;
		theme?: string;
        instructions?: string;
	};
	const targetCount = config.targetCount || 5;
	const timeLimit = config.timeLimit || 40;
    const theme = config.theme || 'default';

    // Theme assets
    const themes: Record<string, any> = {
        default: {
            icon: '📂',
            label: 'Φάκελος',
            bgClass: 'bg-slate-50'
        },
        chests: {
            icon: '🏴‍☠️', // Or a chest image if available
            label: 'Θησαυρός',
            bgClass: 'bg-yellow-50'
        }
    };
    let currentTheme = $derived(themes[theme] || themes.default);

	let score = $state(0);
	let successfulClicks = $state(0);
	let timeRemaining = $state(timeLimit);
	let isComplete = $state(false);
	let gameStarted = $state(false);

    let targets = $state<{id: number, x: number, y: number, opened: boolean}[]>([]);
	let intervalId: number | null = null;

    function generateTargets() {
        const newTargets = [];
        for(let i=0; i<targetCount; i++) {
            newTargets.push({
                id: i,
                x: Math.random() * 80 + 10,
                y: Math.random() * 70 + 10,
                opened: false
            });
        }
        targets = newTargets;
    }

	function startGame() {
		gameStarted = true;
		generateTargets();

		intervalId = window.setInterval(() => {
			timeRemaining--;
			if (timeRemaining <= 0) {
				endGame();
			}
		}, 1000);
	}

	function handleDoubleClick(id: number) {
		if (!gameStarted || isComplete) return;

        const target = targets.find(t => t.id === id);
        if(target && !target.opened) {
            target.opened = true;
            successfulClicks++;

            // Score calculation
            const efficiency = Math.max(0, 10 - (timeLimit - timeRemaining)/10); // simple efficiency bonus
            score += 20 + Math.round(efficiency);

            if (successfulClicks >= targetCount) {
                endGame();
            }
        }
	}

	function endGame() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}

		isComplete = true;

        const finalScore = Math.min(100, score + Math.round((timeRemaining/timeLimit)*20));

		setTimeout(() => {
			onComplete(finalScore);
		}, 2000);
	}

	onMount(() => {
		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	});
</script>

<LessonTemplate {lesson} {onBack}>
	<div class="dbl-lesson {currentTheme.bgClass} h-full rounded-lg transition-colors duration-500">
		{#if !gameStarted}
			<div class="start-screen">
				<h2 class="mb-4 text-2xl font-bold">{m.lesson_instructions?.() || 'Οδηγίες'}</h2>
				<p class="mb-6 text-slate-600">{config.instructions || 'Κάντε διπλό κλικ για να ανοίξετε τα αντικείμενα.'}</p>
				<button class="start-button" onclick={startGame}>{m.start_lesson?.() || 'Έναρξη'}</button>
			</div>
		{:else if isComplete}
			<div class="complete-screen">
				<h2 class="mb-2 text-3xl font-bold text-green-600">✓ {m.lesson_complete?.() || 'Ολοκληρώθηκε'}!</h2>
				<p class="mb-2 text-xl">{m.successful_hovers?.() || 'Επιτυχίες'}: {successfulClicks}/{targetCount}</p>
				<p class="text-lg text-slate-500">{m.final_score?.() || 'Βαθμολογία'}: {score}</p>
			</div>
		{:else}
			<div class="game-ui">
				<div class="hud mx-4 mt-4 flex justify-between rounded-lg bg-white/80 p-4 shadow-sm backdrop-blur">
					<div class="font-bold text-slate-700">{m.progress?.() || 'Πρόοδος'}: {successfulClicks}/{targetCount}</div>
					<div class="font-mono text-blue-600">{m.time?.() || 'Χρόνος'}: {timeRemaining}s</div>
					<div class="font-bold text-green-600">{m.score?.() || 'Σκορ'}: {score}</div>
				</div>
				<div class="game-area relative m-4 flex-1 overflow-hidden rounded-lg border-2 border-slate-200/50">
					{#each targets as target}
                        <button
                            class="absolute flex flex-col items-center gap-2 transition-transform hover:scale-110 focus:outline-none select-none"
                            style="left: {target.x}%; top: {target.y}%;"
                            ondblclick={() => handleDoubleClick(target.id)}
                        >
                            <div class="text-5xl filter drop-shadow-md transition-all duration-300 {target.opened ? 'opacity-50 scale-90 grayscale' : ''}">
                                {#if target.opened}
                                    {theme === 'chests' ? '💰' : '📂'}
                                {:else}
                                    {theme === 'chests' ? '📦' : '📁'}
                                {/if}
                            </div>
                            <span class="text-xs font-medium bg-white/80 px-2 rounded text-slate-700">
                                {target.opened ? 'Ανοιχτό' : currentTheme.label}
                            </span>
                        </button>
                    {/each}
				</div>
			</div>
		{/if}
	</div>
</LessonTemplate>

<style>
	.dbl-lesson {
		height: 100%;
	}
	.start-screen,
	.complete-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		background: white;
		border-radius: 12px;
		padding: 2rem;
	}
	.start-button {
		padding: 1rem 2rem;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1.1rem;
		cursor: pointer;
	}
	.game-ui {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		height: 100%;
	}
	.hud {
		display: flex;
		justify-content: space-around;
		padding: 1rem;
		background: white;
		border-radius: 8px;
	}
	.game-area {
		flex: 1;
		position: relative;
		background: rgba(255, 255, 255, 0.5);
		border-radius: 8px;
		min-height: 400px;
	}
</style>
