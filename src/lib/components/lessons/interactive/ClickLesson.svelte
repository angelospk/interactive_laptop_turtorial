<script lang="ts">
	import { onMount } from 'svelte';
	import type { Lesson } from '$lib/db/schema';
	import LessonTemplate from '../LessonTemplate.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { toast } from 'svelte-sonner';
	import { coerceVariant, CLICK_THEMES, type ClickTheme } from '$lib/lessons/gameConfig';

	interface Props {
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}

	let { lesson, onComplete, onBack }: Props = $props();

	const config = lesson.config as {
		targetCount: number;
		timeLimit: number;
		targetSize?: string;
		theme?: string;
		instructions?: string;
	};
	const targetCount = config.targetCount || 10;
	const theme = coerceVariant(config.theme, CLICK_THEMES, 'default');

	// Theme assets/styles
	const themes: Record<ClickTheme, any> = {
		default: {
			targetClass: 'bg-red-500 border-4 border-white rounded-full shadow-lg',
			content: 'CLICK',
			bgClass: 'bg-white/50',
			type: 'click'
		},
		balloons: {
			targetClass: 'bg-transparent border-none shadow-none',
			content: '🎈',
			bgClass: 'bg-sky-100',
			targetStyle:
				'font-size: 70px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); animation: float 3s ease-in-out infinite;',
			type: 'click'
		},
		moles: {
			targetClass: 'bg-amber-700 border-4 border-amber-900 rounded-full shadow-inner',
			content: '🐹',
			bgClass: 'bg-green-50',
			targetStyle: 'font-size: 50px; box-shadow: inset 0 0 20px rgba(0,0,0,0.3);',
			type: 'click'
		},
		bugs: {
			targetClass: 'bg-transparent border-none shadow-none',
			content: '🐞',
			bgClass: 'bg-green-50',
			targetStyle:
				'font-size: 50px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); transform: rotate(45deg);',
			type: 'click'
		},
		flies: {
			targetClass: 'bg-transparent border-none shadow-none',
			content: '🪰',
			bgClass: 'bg-slate-50',
			targetStyle: 'font-size: 40px; animation: jitter 0.5s infinite;',
			size: '40px', // Tighter hitbox
			type: 'click'
		},
		mixed: {
			// Placeholder, logic handled in derived/state
			isMixed: true
		}
	} satisfies Record<ClickTheme, unknown>;

	// State for mixed mode
	let mixedType = $state<'click' | 'double-click' | 'right-click'>('click');

	let currentTheme = $derived.by(() => {
		if (theme === 'mixed') {
			// Return dynamic theme based on mixedType
			if (mixedType === 'double-click')
				return {
					...themes.default,
					content: '2x CLICK',
					targetClass: 'bg-blue-500 border-4 border-white rounded-full shadow-lg',
					type: 'double-click'
				};
			if (mixedType === 'right-click')
				return {
					...themes.default,
					content: 'RIGHT',
					targetClass: 'bg-purple-500 border-4 border-white rounded-lg shadow-lg',
					type: 'right-click'
				};
			return { ...themes.default, content: 'CLICK', type: 'click' };
		}
		return themes[theme] || themes.default;
	});

	let successfulClicks = $state(0);
	let wrongClicks = $state(0);
	// One 0-100 number, derived rather than accumulated: a penalty subtracted from
	// a running total got clamped away when the total was still 0, so the learner
	// watched 10 points come off and still scored 100.
	let score = $derived(
		Math.max(0, Math.round((successfulClicks / targetCount) * 100) - wrongClicks * 10)
	);
	let isComplete = $state(false);
	// The exercise is live from the moment it opens. The old "Έναρξη" gate was a
	// button an elderly learner had to find before anything responded, and it sat
	// below the fold on a laptop screen. `timeLimit` stays in the config contract
	// for the 218 seeded lessons but no longer runs a clock, scores, or ends a
	// lesson — being slow is not failing.
	let targetX = $state(50);
	let targetY = $state(50);

	// Get error message for wrong click type
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

	// A double-click arrives as click, click, dblclick. On a double-click target a
	// single click is only a mistake once no second click has followed; judging
	// each click straight away scolded the learner for the very thing asked.
	const DOUBLE_CLICK_WAIT = 600;
	let pendingSingleClick: number | null = null;

	function cancelPendingSingleClick() {
		if (pendingSingleClick === null) return;
		clearTimeout(pendingSingleClick);
		timers = timers.filter((t) => t !== pendingSingleClick);
		pendingSingleClick = null;
	}

	function clearTimers() {
		for (const id of timers) clearTimeout(id);
		timers = [];
	}

	function getWrongClickMessage(): string {
		switch (currentTheme.type) {
			case 'click':
				return m.wrong_click_need_single?.() || 'Χρειάζεται απλό κλικ!';
			case 'double-click':
				return m.wrong_click_need_double?.() || 'Χρειάζεται διπλό κλικ!';
			case 'right-click':
				return m.wrong_click_need_right?.() || 'Χρειάζεται δεξί κλικ!';
			default:
				return '';
		}
	}

	// Handle wrong click type in mixed mode
	function handleWrongClick() {
		if (isComplete) return;
		toast.error(getWrongClickMessage());
		wrongClicks++; // Costs 10 points, via `score` above.
	}

	function generateRandomPosition() {
		targetX = Math.random() * 80 + 10;
		targetY = Math.random() * 80 + 10;

		if (theme === 'mixed') {
			const types = ['click', 'double-click', 'right-click'];
			mixedType = types[Math.floor(Math.random() * types.length)] as any;
		}
	}

	function handleTargetClick() {
		if (isComplete) return;

		// Play sound effect (optional, placeholder for now)
		// new Audio('/pop.mp3').play().catch(() => {});

		// Accuracy only, on the same 0-100 scale the learner sees: taking your time
		// scores the same as rushing.
		successfulClicks++;

		if (successfulClicks >= targetCount) {
			endGame();
		} else {
			generateRandomPosition();
		}
	}

	function endGame() {
		isComplete = true;

		// The number submitted is the number in the HUD, penalties included.
		const finalScore = score;

		later(() => {
			onComplete(finalScore);
		}, 2000);
	}

	onMount(() => {
		generateRandomPosition();
		return clearTimers;
	});
</script>

<LessonTemplate {lesson} {onBack}>
	<div class="click-lesson {currentTheme.bgClass} h-full rounded-lg transition-colors duration-500">
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
					{config.instructions || 'Κάντε κλικ στους στόχους.'}
				</p>
				<div
					class="hud mx-4 mt-2 flex justify-between rounded-lg bg-white/80 p-4 shadow-sm backdrop-blur"
				>
					<div class="font-bold text-slate-700">
						{m.progress?.() || 'Πρόοδος'}: {successfulClicks}/{targetCount}
					</div>
					<div class="font-bold text-green-600">{m.score?.() || 'Σκορ'}: {score}</div>
				</div>
				<div
					class="game-area relative m-4 flex-1 overflow-hidden rounded-lg border-2 border-slate-200/50"
				>
					<button
						class="target absolute flex items-center justify-center transition-all duration-100 active:scale-90 {currentTheme.targetClass}"
						style="left: {targetX}%; top: {targetY}%; {currentTheme.targetStyle ||
							''} width: {currentTheme.size || '80px'}; height: {currentTheme.size || '80px'};"
						onclick={(e) => {
							// In mixed mode, validate click type; in other modes, accept any click
							if (theme !== 'mixed' || currentTheme.type === 'click') {
								handleTargetClick();
							} else if (currentTheme.type === 'double-click') {
								pendingSingleClick ??= later(() => {
									pendingSingleClick = null;
									handleWrongClick();
								}, DOUBLE_CLICK_WAIT);
							} else {
								handleWrongClick();
							}
						}}
						oncontextmenu={(e) => {
							e.preventDefault();
							if (theme !== 'mixed' || currentTheme.type === 'right-click') {
								handleTargetClick();
							} else {
								handleWrongClick();
							}
						}}
						ondblclick={() => {
							cancelPendingSingleClick();
							if (theme !== 'mixed' || currentTheme.type === 'double-click') {
								handleTargetClick();
							} else {
								handleWrongClick();
							}
						}}
					>
						{currentTheme.content}
					</button>
				</div>
			</div>
		{/if}
	</div>
</LessonTemplate>

<style>
	/* Similar styling to HoverLesson */
	.click-lesson {
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
		/* For moles theme, maybe add grass/dirt bg */
	}
	.target {
		position: absolute;
		width: 80px;
		height: 80px;
		transform: translate(-50%, -50%);
		/* background: #ef4444;  Handled by theme class */
		/* border: 4px solid white; Handled by theme class */
		/* border-radius: 50%; Handled by theme class */
		color: white;
		font-weight: bold;
		cursor: pointer;
		user-select: none;
	}

	@keyframes float {
		0%,
		100% {
			transform: translate(-50%, -50%);
		}
		50% {
			transform: translate(-50%, -55%);
		}
	}

	@keyframes jitter {
		0% {
			transform: translate(-50%, -50%) rotate(0deg);
		}
		25% {
			transform: translate(-48%, -48%) rotate(5deg);
		}
		50% {
			transform: translate(-50%, -50%) rotate(0deg);
		}
		75% {
			transform: translate(-52%, -52%) rotate(-5deg);
		}
		100% {
			transform: translate(-50%, -50%) rotate(0deg);
		}
	}
</style>
