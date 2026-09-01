<script lang="ts">
	import { onMount } from 'svelte';
	import type { Lesson } from '$lib/db/schema';
	import LessonTemplate from '../LessonTemplate.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import {
		parseHoverConfig,
		pathFor,
		type HoverConfig,
		type HoverTheme
	} from '$lib/lessons/hoverConfig';
	import { createPathRun, advancePathRun, pathRunScore, type Point } from '$lib/lessons/shapePath';

	interface Props {
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}

	let { lesson, onComplete, onBack }: Props = $props();

	// Validated by the shared contract, so an unimplemented theme can never reach
	// the renderer (bd-5t4). `THEME_LABELS` is keyed by HoverTheme, so adding a
	// theme to the contract without handling it here fails to compile.
	// A live database can still hold a row seeded before the contract existed, so
	// an invalid config degrades to a readable message rather than throwing
	// through the renderer and blanking the page for the learner.
	let configError = $state<string | null>(null);
	let parsed: HoverConfig;
	try {
		parsed = parseHoverConfig(lesson.config);
	} catch (e) {
		configError = (e as Error).message;
		parsed = parseHoverConfig({ theme: 'balloons' });
	}
	const config = parsed;
	const targetCount = config.targetCount;
	const timeLimit = config.timeLimit;
	const theme = config.theme;

	const THEME_LABELS = {
		balloons: 'Σκάστε τα μπαλόνια',
		'shape-path': 'Ακολουθήστε τη διαδρομή'
	} satisfies Record<HoverTheme, string>;

	// ── shape-path state ────────────────────────────────────────────────────
	const path = pathFor(config);
	let run = $state(createPathRun(path));
	let playArea = $state<HTMLElement | null>(null);
	let pointer = $state<Point | null>(null);

	const pathD = path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

	function handlePathMove(event: PointerEvent) {
		if (!gameStarted || isComplete || !playArea) return;
		const box = playArea.getBoundingClientRect();
		if (box.width === 0 || box.height === 0) return;
		const at: Point = {
			x: ((event.clientX - box.left) / box.width) * 100,
			y: ((event.clientY - box.top) / box.height) * 100
		};
		pointer = at;
		run = advancePathRun(run, path, at, config.tolerance);
		if (run.complete) endGame();
	}

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
		run = createPathRun(path);
		if (theme !== 'shape-path') generateRandomPosition();

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

		if (theme === 'shape-path') {
			const pathScore = pathRunScore(run, path);
			setTimeout(() => onComplete(pathScore), 2000);
			return;
		}

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
		{#if configError}
			<div class="start-screen">
				<h2>Το μάθημα δεν είναι διαθέσιμο</h2>
				<p>Χρειάζεται ενημέρωση του περιεχομένου. Δοκιμάστε ένα άλλο μάθημα.</p>
				<button class="start-button" onclick={onBack}>Πίσω</button>
			</div>
		{:else if !gameStarted}
			<div class="start-screen">
				<h2>{m.lesson_instructions?.() || 'Οδηγίες'}</h2>
				<p>
					{config.instructions ||
						m.hover_instructions?.() ||
						'Μετακινήστε το ποντίκι πάνω από τους στόχους.'}
				</p>
				<div class="game-info">
					<div class="info-item">
						<span class="label">
							{theme === 'shape-path' ? 'Σημεία' : m.targets?.() || 'Στόχοι'}
						</span>
						<span class="value">{theme === 'shape-path' ? path.length : targetCount}</span>
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
				{#if theme === 'shape-path'}
					<p>Φτάσατε στο τέλος της διαδρομής.</p>
					<p>Εκτροπές: {run.slips}</p>
				{:else}
					<p>{m.successful_hovers?.() || 'Επιτυχίες'}: {successfulHovers}/{targetCount}</p>
					<p>{m.final_score?.() || 'Βαθμολογία'}: {score}</p>
				{/if}
			</div>
		{:else}
			<!-- Game UI -->
			<div class="game-ui">
				<div class="hud">
					<div class="stat">
						<span class="stat-label">{m.progress?.() || 'Πρόοδος'}:</span>
						<span class="stat-value">
							{#if theme === 'shape-path'}
								{run.reached}/{path.length - 1}
							{:else}
								{successfulHovers}/{targetCount}
							{/if}
						</span>
					</div>
					<div class="stat">
						<span class="stat-label">{m.time?.() || 'Χρόνος'}:</span>
						<span class="stat-value">{timeRemaining}s</span>
					</div>
					<div class="stat">
						<span class="stat-label">
							{theme === 'shape-path' ? 'Εκτροπές' : m.score?.() || 'Σκορ'}:
						</span>
						<span class="stat-value">{theme === 'shape-path' ? run.slips : score}</span>
					</div>
				</div>

				{#if theme === 'shape-path'}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="game-area"
						bind:this={playArea}
						onpointermove={handlePathMove}
						aria-label={THEME_LABELS['shape-path']}
					>
						<svg class="path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
							<path d={pathD} class="path-corridor" style="stroke-width: {config.tolerance * 2}" />
							<path d={pathD} class="path-line" />
						</svg>
						{#each path as point, i (i)}
							<div
								class="waypoint"
								class:done={i <= run.reached}
								class:next={i === run.reached + 1}
								style="left: {point.x}%; top: {point.y}%;"
							>
								{i <= run.reached ? '✓' : i + 1}
							</div>
						{/each}
						{#if pointer && run.outside}
							<div class="off-path-hint" style="left: {pointer.x}%; top: {pointer.y}%;">
								Επιστρέψτε στη γραμμή
							</div>
						{/if}
					</div>
				{:else}
					<div class="game-area">
						<!-- Target -->
						<div
							class="target"
							class:hovering={isHovering}
							style="left: {targetX}%; top: {targetY}%;"
							onmouseenter={handleTargetHover}
							onmouseleave={handleTargetLeave}
							role="button"
							tabindex="0"
							aria-label={THEME_LABELS.balloons}
						>
							<!-- Balloon Visual -->
							<div class="balloon-wrapper">
								<div class="balloon {isHovering ? 'popped' : ''}">
									{#if isHovering}
										💥
									{/if}
								</div>
								<div class="string"></div>
							</div>
						</div>
					</div>
				{/if}
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

	/* Shape-path Theme */
	.path-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.path-corridor {
		fill: none;
		stroke: rgba(102, 126, 234, 0.18);
		stroke-linecap: round;
		stroke-linejoin: round;
		vector-effect: non-scaling-stroke;
	}

	.path-line {
		fill: none;
		stroke: #667eea;
		stroke-width: 3;
		stroke-dasharray: 6 5;
		stroke-linecap: round;
		stroke-linejoin: round;
		vector-effect: non-scaling-stroke;
	}

	.waypoint {
		position: absolute;
		transform: translate(-50%, -50%);
		width: 44px;
		height: 44px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.15rem;
		font-weight: 700;
		background: white;
		color: #6b7280;
		border: 3px solid #cbd5e1;
		pointer-events: none;
	}

	.waypoint.done {
		background: #22c55e;
		border-color: #16a34a;
		color: white;
	}

	.waypoint.next {
		border-color: #667eea;
		color: #667eea;
		animation: pulse-waypoint 1.2s ease-in-out infinite;
	}

	.off-path-hint {
		position: absolute;
		transform: translate(-50%, -160%);
		background: #b91c1c;
		color: white;
		padding: 0.35rem 0.75rem;
		border-radius: 6px;
		font-size: 1rem;
		white-space: nowrap;
		pointer-events: none;
	}

	@keyframes pulse-waypoint {
		0%,
		100% {
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			transform: translate(-50%, -50%) scale(1.18);
		}
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
