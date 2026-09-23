<script lang="ts">
	import { onMount } from 'svelte';
	import type { Lesson } from '$lib/db/schema';
	import LessonTemplate from '../LessonTemplate.svelte';
	import { ContextMenu } from 'bits-ui';
	import * as m from '$lib/paraglide/messages.js';
	import { fly } from 'svelte/transition';
	import { coerceVariant, RIGHT_CLICK_THEMES, type RightClickTheme } from '$lib/lessons/gameConfig';

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
	const theme = coerceVariant(config.theme, RIGHT_CLICK_THEMES, 'default');

	const themes: Record<RightClickTheme, any> = {
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
	} satisfies Record<RightClickTheme, unknown>;
	let currentTheme = $derived(themes[theme] || themes.default);

	let score = $state(0);
	let successCount = $state(0);
	let isComplete = $state(false);
	// The exercise is live from the moment it opens. The old "Έναρξη" gate was a
	// button an elderly learner had to find before anything responded, and it sat
	// below the fold on a laptop screen. `timeLimit` stays in the config contract
	// for the 218 seeded lessons but no longer runs a clock, scores, or ends a
	// lesson — being slow is not failing.

	let targets = $state<{ id: number; x: number; y: number; revealed: boolean }[]>([]);

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
				revealed: false
			});
		}
		targets = newTargets;
	}

	function startGame() {
		generateTargets();
	}

	function handleRightClick(e: MouseEvent, id: number) {
		e.preventDefault(); // Prevent browser menu

		const target = targets.find((t) => t.id === id);
		if (target && !target.revealed) {
			target.revealed = true;
			successCount++;
			// Same 0-100 scale the learner sees in the HUD and at the end.
			score = Math.round((successCount / targetCount) * 100);

			if (successCount >= targetCount) {
				endGame();
			}
		}
	}

	function endGame() {
		isComplete = true;
		// Accuracy only — being slow is not failing.
		const finalScore = Math.min(100, Math.round((successCount / targetCount) * 100));

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
	<div class="rc-lesson h-full rounded-lg bg-slate-50 transition-colors duration-500">
		{#if isComplete}
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
				<p class="mx-4 mt-4 text-center text-lg font-semibold text-slate-700">
					{config.instructions || 'Κάντε δεξί κλικ για να αποκαλύψετε τα αντικείμενα.'}
				</p>
				<div
					class="hud mx-4 mt-4 flex justify-between rounded-lg bg-white/80 p-4 shadow-sm backdrop-blur"
				>
					<div class="font-bold text-slate-700">
						{m.progress?.() || 'Πρόοδος'}: {successCount}/{targetCount}
					</div>
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
