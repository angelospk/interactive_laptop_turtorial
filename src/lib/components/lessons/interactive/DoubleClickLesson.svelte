<script lang="ts">
	import { onMount } from 'svelte';
	import type { Lesson } from '$lib/db/schema';
	import LessonTemplate from '../LessonTemplate.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import {
		coerceVariant,
		DOUBLE_CLICK_THEMES,
		type DoubleClickTheme
	} from '$lib/lessons/gameConfig';

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
	const theme = coerceVariant(config.theme, DOUBLE_CLICK_THEMES, 'default');

	// Theme assets
	const themes: Record<DoubleClickTheme, any> = {
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
	} satisfies Record<DoubleClickTheme, unknown>;
	let currentTheme = $derived(themes[theme] || themes.default);

	let score = $state(0);
	let successfulClicks = $state(0);

	let isComplete = $state(false);
	// The exercise is live from the moment it opens. The old "Έναρξη" gate was a
	// button an elderly learner had to find before anything responded, and it sat
	// below the fold on a laptop screen. `timeLimit` stays in the config contract
	// for the 218 seeded lessons but no longer runs a clock, scores, or ends a
	// lesson — being slow is not failing.

	let targets = $state<{ id: number; x: number; y: number; opened: boolean }[]>([]);

	// Every deferred callback is tracked so leaving the lesson cancels it. An
	// uncancelled one fires from a destroyed component into the runner, which
	// reads whatever lesson is on screen *now* and marks that one complete.
	let timers: number[] = [];

	function later(fn: () => void, ms: number) {
		const id = window.setTimeout(() => {
			timers = timers.filter((t) => t !== id);
			fn();
		}, ms);
		timers.push(id);
		return id;
	}

	function clearTimers() {
		for (const id of timers) clearTimeout(id);
		timers = [];
	}

	function generateTargets() {
		const newTargets = [];
		for (let i = 0; i < targetCount; i++) {
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
		generateTargets();
	}

	function handleDoubleClick(id: number) {
		if (isComplete) return;

		const target = targets.find((t) => t.id === id);
		if (target && !target.opened) {
			target.opened = true;
			successfulClicks++;

			// Accuracy only, on the same 0-100 scale the learner sees. Adding a
			// rounded slice per target drifted off 100 for counts like 3.
			score = Math.round((successfulClicks / targetCount) * 100);

			if (successfulClicks >= targetCount) {
				endGame();
			}
		}
	}

	function endGame() {
		isComplete = true;

		const finalScore = Math.min(100, Math.round((successfulClicks / targetCount) * 100));

		later(() => {
			onComplete(finalScore);
		}, 2000);
	}

	onMount(() => {
		startGame();
		return clearTimers;
	});
</script>

<LessonTemplate {lesson} {onBack}>
	<div class="dbl-lesson {currentTheme.bgClass} h-full rounded-lg transition-colors duration-500">
		{#if isComplete}
			<div class="complete-screen">
				<h2 class="mb-2 text-3xl font-bold text-green-600">
					✓ {m.lesson_complete?.() || 'Ολοκληρώθηκε'}!
				</h2>
				<p class="mb-2 text-xl">
					{m.successful_hovers?.() || 'Επιτυχίες'}: {successfulClicks}/{targetCount}
				</p>
				<p class="text-lg text-slate-500">{m.final_score?.() || 'Βαθμολογία'}: {score}</p>
			</div>
		{:else}
			<div class="game-ui">
				<p class="mx-4 mt-4 text-center text-lg font-semibold text-slate-700">
					{config.instructions || 'Κάντε διπλό κλικ για να ανοίξετε τα αντικείμενα.'}
				</p>
				<div
					class="hud mx-4 mt-4 flex justify-between rounded-lg bg-white/80 p-4 shadow-sm backdrop-blur"
				>
					<div class="font-bold text-slate-700">
						{m.progress?.() || 'Πρόοδος'}: {successfulClicks}/{targetCount}
					</div>
					<div class="font-bold text-green-600">{m.score?.() || 'Σκορ'}: {score}</div>
				</div>
				<div
					class="game-area relative m-4 flex-1 overflow-hidden rounded-lg border-2 border-slate-200/50"
				>
					{#each targets as target}
						<button
							class="absolute flex flex-col items-center gap-2 transition-transform select-none hover:scale-110 focus:outline-none"
							style="left: {target.x}%; top: {target.y}%;"
							ondblclick={() => handleDoubleClick(target.id)}
						>
							<div
								class="text-5xl drop-shadow-md filter transition-all duration-300 {target.opened
									? 'scale-90 opacity-50 grayscale'
									: ''}"
							>
								{#if target.opened}
									{theme === 'chests' ? '💰' : '📂'}
								{:else}
									{theme === 'chests' ? '📦' : '📁'}
								{/if}
							</div>
							<span class="rounded bg-white/80 px-2 text-xs font-medium text-slate-700">
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
