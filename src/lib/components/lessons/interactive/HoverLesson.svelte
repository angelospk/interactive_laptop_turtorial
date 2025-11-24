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

	// Parse config
	const config = lesson.config as {
		targetCount: number;
		timeLimit: number;
		shape?: string;
		targetSize?: string;
		theme?: 'balloons' | 'moles' | 'simple';
		gameMode?: boolean;
		instructions?: string;
	};
	const targetCount = config.targetCount || 5;
	const timeLimit = config.timeLimit || 30;
	const theme = config.theme || 'simple';

	// Game state
	let score = $state(0);
	let successfulHovers = $state(0);
	let timeRemaining = $state(timeLimit);
	let isComplete = $state(false);
	let gameStarted = $state(false);

	// Target state
	let targetX = $state(50);
	let targetY = $state(50);
	let isHovering = $state(false);
	let currentTargetIndex = $state(0);

	let intervalId: number | null = null;

	// Generate random position for target
	function generateRandomPosition() {
		// Keep target within safe bounds (10% to 90%)
		targetX = Math.random() * 80 + 10;
		targetY = Math.random() * 80 + 10;
	}

	function startGame() {
		gameStarted = true;
		generateRandomPosition();

		// Timer
		intervalId = window.setInterval(() => {
			timeRemaining--;

			if (timeRemaining <= 0) {
				endGame();
			}
		}, 1000);
	}

	function handleTargetHover() {
		if (!gameStarted || isComplete || isHovering) return;

		isHovering = true;
		successfulHovers++;
		currentTargetIndex++;

		// Calculate score based on remaining time (faster = better score)
		const timeTaken = timeLimit - timeRemaining;
		const efficiency = Math.max(0, 100 - timeTaken * 2);
		score += Math.round(efficiency);

		// Audio feedback would be nice here

		// Generate new target after short delay
		setTimeout(() => {
			if (successfulHovers >= targetCount) {
				endGame();
			} else {
				isHovering = false;
				generateRandomPosition();
			}
		}, 500);
	}

	function handleTargetLeave() {
		isHovering = false;
	}

	function endGame() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}

		isComplete = true;

		// Calculate final score (0-100)
		const completionBonus = (successfulHovers / targetCount) * 50;
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
	<div class="hover-lesson">
		{#if !gameStarted}
			<div class="start-screen">
				<h2>{m.lesson_instructions?.() || 'Οδηγίες'}</h2>
				<p>
					{config.instructions ||
						m.hover_instructions?.() ||
						'Μετακινήστε το ποντίκι πάνω από τους στόχους.'}
				</p>
				<div class="game-info">
					<div class="info-item">
						<span class="label">{m.targets?.() || 'Στόχοι'}:</span>
						<span class="value">{targetCount}</span>
					</div>
					<div class="info-item">
						<span class="label">{m.time_limit?.() || 'Χρόνος'}:</span>
						<span class="value">{timeLimit}s</span>
					</div>
				</div>
				<button class="start-button" onclick={startGame}>
					{m.start_lesson?.() || 'Έναρξη'}
				</button>
			</div>
		{:else if isComplete}
			<div class="complete-screen">
				<h2>✓ {m.lesson_complete?.() || 'Ολοκληρώθηκε'}!</h2>
				<p>{m.successful_hovers?.() || 'Επιτυχίες'}: {successfulHovers}/{targetCount}</p>
				<p>{m.final_score?.() || 'Βαθμολογία'}: {score}</p>
			</div>
		{:else}
			<!-- Game UI -->
			<div class="game-ui">
				<div class="hud">
					<div class="stat">
						<span class="stat-label">{m.progress?.() || 'Πρόοδος'}:</span>
						<span class="stat-value">{successfulHovers}/{targetCount}</span>
					</div>
					<div class="stat">
						<span class="stat-label">{m.time?.() || 'Χρόνος'}:</span>
						<span class="stat-value">{timeRemaining}s</span>
					</div>
					<div class="stat">
						<span class="stat-label">{m.score?.() || 'Σκορ'}:</span>
						<span class="stat-value">{score}</span>
					</div>
				</div>

				<div class="game-area">
					<!-- Target -->
					<div
						class="target"
						class:hovering={isHovering}
						style="left: {targetX}%; top: {targetY}%;"
						onmouseenter={handleTargetHover}
						onmouseleave={handleTargetLeave}
					>
						{#if theme === 'balloons'}
							<!-- Balloon Visual -->
							<div class="balloon-wrapper">
								<div class="balloon {isHovering ? 'popped' : ''}">
									{#if isHovering}
										💥
									{/if}
								</div>
								<div class="string"></div>
							</div>
						{:else}
							<div class="target-inner"></div>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
</LessonTemplate>

<style>
	.hover-lesson {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.start-screen,
	.complete-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 12px;
		padding: 3rem;
		text-align: center;
	}

	.start-screen h2,
	.complete-screen h2 {
		font-size: 2rem;
		margin-bottom: 1rem;
		color: #1f2937;
	}

	.start-screen p,
	.complete-screen p {
		font-size: 1.1rem;
		color: #6b7280;
		margin-bottom: 0.5rem;
	}

	.game-info {
		display: flex;
		gap: 2rem;
		margin: 2rem 0;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.info-item .label {
		font-size: 0.9rem;
		color: #9ca3af;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.info-item .value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #667eea;
	}

	.start-button {
		margin-top: 1rem;
		padding: 1rem 3rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.start-button:hover {
		transform: scale(1.05);
	}

	.game-ui {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.hud {
		display: flex;
		justify-content: space-around;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 8px;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.stat-label {
		font-size: 0.85rem;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #667eea;
	}

	.game-area {
		flex: 1;
		position: relative;
		background: rgba(255, 255, 255, 0.5);
		border-radius: 8px;
		min-height: 400px;
		overflow: hidden;
	}

	.target {
		position: absolute;
		width: 80px;
		height: 100px; /* Adjusted for balloon */
		transform: translate(-50%, -50%);
		cursor: pointer;
		transition: transform 0.3s ease;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.target:hover {
		transform: translate(-50%, -50%) scale(1.1);
	}

	.target.hovering {
		animation: pulse 0.5s ease;
	}

	.target-inner {
		width: 80px;
		height: 80px;
		background: radial-gradient(circle, #ef4444 0%, #dc2626 50%, #991b1b 100%);
		border-radius: 50%;
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
		border: 4px solid white;
	}

	/* Balloon Theme */
	.balloon-wrapper {
		position: relative;
		width: 60px;
		height: 80px;
	}

	.balloon {
		width: 60px;
		height: 70px;
		background: radial-gradient(circle at 20% 20%, #60a5fa, #2563eb);
		border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
		position: relative;
		box-shadow: inset -5px -5px 10px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
	}

	.balloon.popped {
		background: transparent;
		box-shadow: none;
	}

	.balloon::before {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 5px solid transparent;
		border-right: 5px solid transparent;
		border-top: 8px solid #2563eb;
	}

	.string {
		position: absolute;
		bottom: -20px;
		left: 50%;
		width: 2px;
		height: 20px;
		background: rgba(0, 0, 0, 0.3);
		transform: translateX(-50%);
	}

	@keyframes pulse {
		0% {
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			transform: translate(-50%, -50%) scale(1.3);
		}
		100% {
			transform: translate(-50%, -50%) scale(1);
		}
	}
</style>
