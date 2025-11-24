<script lang="ts">
	import { onMount } from 'svelte';
	import type { Lesson } from '$lib/db/schema';
	import LessonTemplate from '../LessonTemplate.svelte';
	import * as m from '$lib/paraglide/messages.js';

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
		if (intervalId) clearInterval(intervalId);
		isComplete = true;
		const success = scrollY >= targetDistance;
		const score = success
			? Math.min(100, 80 + Math.round((timeRemaining / timeLimit) * 20))
			: Math.round(progress);

		setTimeout(() => {
			onComplete(score);
		}, 2000);
	}

	onMount(() => {
		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	});
</script>

<LessonTemplate {lesson} {onBack}>
	<div class="scroll-lesson flex h-full flex-col">
		{#if !gameStarted}
			<div
				class="start-screen flex flex-1 flex-col items-center justify-center rounded-lg bg-white p-8"
			>
				<h2 class="mb-4 text-2xl font-bold">{m.lesson_instructions?.() || 'Οδηγίες'}</h2>
				<p class="mb-6 text-slate-600">
					{config.instructions || 'Κυλήστε μέχρι το τέλος της σελίδας.'}
				</p>
				<button class="start-button" onclick={startGame}>{m.start_lesson?.() || 'Έναρξη'}</button>
			</div>
		{:else if isComplete}
			<div
				class="complete-screen flex flex-1 flex-col items-center justify-center rounded-lg bg-white p-8"
			>
				<h2 class="mb-2 text-3xl font-bold text-green-600">
					✓ {m.lesson_complete?.() || 'Ολοκληρώθηκε'}!
				</h2>
				<p class="text-lg text-slate-500">
					Score: {scrollY >= targetDistance
						? Math.min(100, 80 + Math.round((timeRemaining / timeLimit) * 20))
						: Math.round(progress)}
				</p>
			</div>
		{:else}
			<div
				class="flex shrink-0 items-center justify-between rounded-t-lg bg-blue-600 p-4 text-white"
			>
				<div class="font-bold">Goal: {Math.round(progress)}%</div>
				<div class="font-mono">Time: {timeRemaining}s</div>
			</div>

			<!-- Scroll Container -->
			<div
				class="relative flex-1 overflow-y-auto scroll-smooth bg-slate-100"
				onscroll={handleScroll}
			>
				<div class="space-y-8 p-8">
					<div class="py-12 text-center">
						<div class="mb-4 text-6xl">⬇️</div>
						<h3 class="text-2xl font-bold text-slate-700">Start Scrolling!</h3>
					</div>

					{#each Array(10) as _, i}
						<div
							class="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
						>
							<div class="mb-4 h-4 w-3/4 rounded bg-slate-200"></div>
							<div class="space-y-2">
								<div class="h-3 w-full rounded bg-slate-100"></div>
								<div class="h-3 w-full rounded bg-slate-100"></div>
								<div class="h-3 w-5/6 rounded bg-slate-100"></div>
							</div>
							<div class="mt-8 flex justify-center text-4xl text-slate-300">
								{i % 2 === 0 ? '🌳' : '🌲'}
							</div>
						</div>
					{/each}

					<!-- Goal Line -->
					<div
						class="relative mt-24 border-t-4 border-dashed border-green-500 py-12 text-center"
						style="margin-top: {targetDistance / 2}px"
					>
						<div
							class="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full border border-green-300 bg-green-100 px-4 py-1 font-bold text-green-700"
						>
							FINISH LINE
						</div>
						<div class="animate-bounce text-6xl">🏆</div>
						<h2 class="mt-4 text-3xl font-bold text-green-700">You made it!</h2>
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
