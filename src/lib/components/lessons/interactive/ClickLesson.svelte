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
		targetCount: number;
		timeLimit: number;
		targetSize?: string;
		theme?: string;
		instructions?: string;
	};
	const targetCount = config.targetCount || 10;
	const timeLimit = config.timeLimit || 45;
	const theme = config.theme || 'default';

	// Theme assets/styles
	const themes: Record<string, any> = {
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
	};

    // State for mixed mode
    let mixedType = $state<'click' | 'double-click' | 'right-click'>('click');
    
	let currentTheme = $derived.by(() => {
        if (theme === 'mixed') {
             // Return dynamic theme based on mixedType
             if (mixedType === 'double-click') return { ...themes.default, content: '2x CLICK', targetClass: 'bg-blue-500 border-4 border-white rounded-full shadow-lg', type: 'double-click' };
             if (mixedType === 'right-click') return { ...themes.default, content: 'RIGHT', targetClass: 'bg-purple-500 border-4 border-white rounded-lg shadow-lg', type: 'right-click' };
             return { ...themes.default, content: 'CLICK', type: 'click' };
        }
        return themes[theme] || themes.default;
    });

	let score = $state(0);
	let successfulClicks = $state(0);
	let timeRemaining = $state(timeLimit);
	let isComplete = $state(false);
	let gameStarted = $state(false);
	let targetX = $state(50);
	let targetY = $state(50);
	let intervalId: number | null = null;

	function generateRandomPosition() {
		targetX = Math.random() * 80 + 10;
		targetY = Math.random() * 80 + 10;
        
        if (theme === 'mixed') {
            const types = ['click', 'double-click', 'right-click'];
            mixedType = types[Math.floor(Math.random() * types.length)] as any;
        }
	}

	function startGame() {
		gameStarted = true;
		generateRandomPosition();

		intervalId = window.setInterval(() => {
			timeRemaining--;
			if (timeRemaining <= 0) {
				endGame();
			}
		}, 1000);
	}

	function handleTargetClick() {
		if (!gameStarted || isComplete) return;

		// Play sound effect (optional, placeholder for now)
		// new Audio('/pop.mp3').play().catch(() => {});

		successfulClicks++;
		const timeTaken = timeLimit - timeRemaining;
		const efficiency = Math.max(0, 100 - timeTaken * 2);
		score += Math.round(efficiency);

		if (successfulClicks >= targetCount) {
			endGame();
		} else {
			generateRandomPosition();
		}
	}

	function endGame() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}

		isComplete = true;

		const completionBonus = (successfulClicks / targetCount) * 50;
		const timeBonus = (timeRemaining / timeLimit) * 30;
		const accuracyScore = score / targetCount;
		const finalScore = Math.min(100, Math.round(completionBonus + timeBonus + accuracyScore * 0.2));

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
	<div class="click-lesson {currentTheme.bgClass} h-full rounded-lg transition-colors duration-500">
		{#if !gameStarted}
			<div class="start-screen">
				<h2 class="mb-4 text-2xl font-bold">{m.lesson_instructions?.() || 'Οδηγίες'}</h2>
				<p class="mb-6 text-slate-600">
					{config.instructions || 'Κάντε κλικ στους στόχους όσο πιο γρήγορα μπορείτε!'}
				</p>
				<button class="start-button" onclick={startGame}>{m.start_lesson?.() || 'Έναρξη'}</button>
			</div>
		{:else if isComplete}
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
				<div
					class="hud mx-4 mt-4 flex justify-between rounded-lg bg-white/80 p-4 shadow-sm backdrop-blur"
				>
					<div class="font-bold text-slate-700">
						{m.progress?.() || 'Πρόοδος'}: {successfulClicks}/{targetCount}
					</div>
					<div class="font-mono text-blue-600">{m.time?.() || 'Χρόνος'}: {timeRemaining}s</div>
					<div class="font-bold text-green-600">{m.score?.() || 'Σκορ'}: {score}</div>
				</div>
				<div
					class="game-area relative m-4 flex-1 overflow-hidden rounded-lg border-2 border-slate-200/50"
				>
						class="target absolute flex items-center justify-center transition-all duration-100 active:scale-90 {currentTheme.targetClass}"
						style="left: {targetX}%; top: {targetY}%; {currentTheme.targetStyle || ''} width: {currentTheme.size || '80px'}; height: {currentTheme.size || '80px'};"
						onclick={handleTargetClick}
                        oncontextmenu={(e) => {
                            if (currentTheme.type === 'right-click') {
                                e.preventDefault();
                                handleTargetClick();
                            }
                        }}
                        ondblclick={() => {
                            if (currentTheme.type === 'double-click') {
                                handleTargetClick();
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
