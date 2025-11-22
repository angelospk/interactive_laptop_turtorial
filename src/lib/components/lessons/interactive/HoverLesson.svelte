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

	// Parse config
	const config = lesson.config as {
		targetCount: number;
		timeLimit: number;
		shape?: string;
		targetSize?: string;
	};
	const targetCount = config.targetCount || 5;
	const timeLimit = config.timeLimit || 30;

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
				<h2>{m.lesson_instructions?.() || 'Instructions'}</h2>
				<p>{m.hover_instructions?.() || 'Hover over the targets as they appear. Be quick!'}</p>
				<div class="game-info">
					<div class="info-item">
						<span class="label">{m.targets?.() || 'Targets'}:</span>
						<span class="value">{targetCount}</span>
					</div>
					<div class="info-item">
						<span class="label">{m.time_limit?.() || 'Time'}:</span>
						<span class="value">{timeLimit}s</span>
					</div>
				</div>
				<button class="start-button" onclick={startGame}>
					{m.start_lesson?.() || 'Start Lesson'}
				</button>
			</div>
		{:else if isComplete}
			<div class="complete-screen">
				<h2>✓ {m.lesson_complete?.() || 'Complete'}!</h2>
				<p>{m.successful_hovers?.() || 'Successful Hovers'}: {successfulHovers}/{targetCount}</p>
				<p>{m.final_score?.() || 'Final Score'}: {score}</p>
			</div>
		{:else}
			<!-- Game UI -->
			<div class="game-ui">
				<div class="hud">
					<div class="stat">
						<span class="stat-label">{m.progress?.() || 'Progress'}:</span>
						<span class="stat-value">{successfulHovers}/{targetCount}</span>
					</div>
					<div class="stat">
						<span class="stat-label">{m.time?.() || 'Time'}:</span>
						<span class="stat-value">{timeRemaining}s</span>
					</div>
					<div class="stat">
						<span class="stat-label">{m.score?.() || 'Score'}:</span>
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
						<div class="target-inner"></div>
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
	}

	.target {
		position: absolute;
		width: 80px;
		height: 80px;
		transform: translate(-50%, -50%);
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.target:hover {
		transform: translate(-50%, -50%) scale(1.1);
	}

	.target.hovering {
		animation: pulse 0.5s ease;
	}

	.target-inner {
		width: 100%;
		height: 100%;
		background: radial-gradient(circle, #ef4444 0%, #dc2626 50%, #991b1b 100%);
		border-radius: 50%;
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
		border: 4px solid white;
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
