<script lang="ts">
	import { onMount } from 'svelte';
	import type { Lesson } from '$lib/db/schema';
	import LessonTemplate from '../LessonTemplate.svelte';
	import { ContextMenu } from 'bits-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { fly } from 'svelte/transition';

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
	const targetCount = config.targetCount || 6;
	const timeLimit = config.timeLimit || 50;
	const theme = config.theme || 'default';

	const themes: Record<string, any> = {
		default: {
			icon: '📦',
			label: 'Κουτί',
			content: 'Έκπληξη!'
		},
		mystery: {
			icon: '🎁',
			label: 'Δώρο',
			content: '🎉'
		}
	};
	let currentTheme = $derived(themes[theme] || themes.default);

	let score = $state(0);
	let successCount = $state(0);
	let timeRemaining = $state(timeLimit);
	let isComplete = $state(false);
	let gameStarted = $state(false);

	let targets = $state<{ id: number; x: number; y: number; revealed: boolean }[]>([]);
	let intervalId: number | null = null;

	function generateTargets() {
		const newTargets = [];
		for (let i = 0; i < targetCount; i++) {
			newTargets.push({
				id: i,
				x: Math.random() * 80 + 10,
				y: Math.random() * 70 + 10,
				revealed: false
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

	function handleRightClick(e: MouseEvent, id: number) {
		e.preventDefault(); // Prevent browser menu

		const target = targets.find((t) => t.id === id);
		if (target && !target.revealed) {
			target.revealed = true;
			successCount++;
			score += 15;

			if (successCount >= targetCount) {
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
		const finalScore = Math.min(100, score + Math.round((timeRemaining / timeLimit) * 25));

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
	<div class="rc-lesson h-full rounded-lg bg-slate-50 transition-colors duration-500">
		{#if !gameStarted}
			<div class="start-screen">
				<h2 class="mb-4 text-2xl font-bold">{m.lesson_instructions?.() || 'Οδηγίες'}</h2>
				<p class="mb-6 text-slate-600">
					{config.instructions || 'Κάντε δεξί κλικ για να αποκαλύψετε τα αντικείμενα.'}
				</p>
				<button class="start-button" onclick={startGame}>{m.start_lesson?.() || 'Έναρξη'}</button>
			</div>
		{:else if isComplete}
			<div class="complete-screen">
				<h2 class="mb-2 text-3xl font-bold text-green-600">
					✓ {m.lesson_complete?.() || 'Ολοκληρώθηκε'}!
				</h2>
				<p class="mb-2 text-xl">
					{m.successful_hovers?.() || 'Επιτυχίες'}: {successCount}/{targetCount}
				</p>
				<p class="text-lg text-slate-500">{m.final_score?.() || 'Βαθμολογία'}: {score}</p>
			</div>
		{:else}
			<div class="game-ui">
				<div
					class="hud mx-4 mt-4 flex justify-between rounded-lg bg-white/80 p-4 shadow-sm backdrop-blur"
				>
					<div class="font-bold text-slate-700">
						{m.progress?.() || 'Πρόοδος'}: {successCount}/{targetCount}
					</div>
					<div class="font-mono text-blue-600">{m.time?.() || 'Χρόνος'}: {timeRemaining}s</div>
					<div class="font-bold text-green-600">{m.score?.() || 'Σκορ'}: {score}</div>
				</div>
				<div
					class="game-area relative m-4 flex-1 overflow-hidden rounded-lg border-2 border-slate-200/50"
					oncontextmenu={(e) => e.preventDefault()}
				>
					{#each targets as target}
						<div
							class="absolute flex cursor-pointer flex-col items-center gap-2 transition-transform select-none hover:scale-110"
							style="left: {target.x}%; top: {target.y}%;"
							oncontextmenu={(e) => handleRightClick(e, target.id)}
						>
							{#if target.revealed}
								<div class="animate-bounce text-4xl" in:fly={{ y: 10 }}>
									{currentTheme.content}
								</div>
							{:else}
								<div class="text-5xl drop-shadow-md filter">
									{currentTheme.icon}
								</div>
								<span class="rounded bg-white/80 px-2 text-xs font-medium text-slate-700">
									{currentTheme.label}
								</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</LessonTemplate>

<style>
	.rc-lesson {
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
