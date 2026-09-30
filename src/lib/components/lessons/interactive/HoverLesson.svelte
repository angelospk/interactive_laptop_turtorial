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

	function handlePathMove(event: PointerEvent) {
		if (isComplete || !playArea) return;
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
	let isComplete = $state(false);
	// The exercise is live from the moment it opens. The old "Έναρξη" gate was a
	// button an elderly learner had to find before anything responded, and it sat
	// below the fold on a laptop screen. `timeLimit` stays in the config contract
	// for the 218 seeded lessons but no longer runs a clock, scores, or ends a
	// lesson — being slow is not failing.

	// Target state
	let targetX = $state(50);
	let targetY = $state(50);
	let isHovering = $state(false);

	// Generate random position for target
	function generateRandomPosition() {
		// Keep target within safe bounds (10% to 90%)
		targetX = Math.random() * 80 + 10;
		targetY = Math.random() * 80 + 10;
	}

	function startGame() {
		run = createPathRun(path);
		if (theme !== 'shape-path') generateRandomPosition();
	}

	function handleTargetHover() {
		if (isComplete || isHovering) return;

		isHovering = true;
		successfulHovers++;

		// Accuracy only, on the same 0-100 scale the learner sees.
		score = Math.min(100, Math.round(score + 100 / targetCount));

		// Audio feedback would be nice here

		// Generate new target after short delay
		later(() => {
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
		isComplete = true;

		if (theme === 'shape-path') {
			const pathScore = pathRunScore(run, path);
			later(() => onComplete(pathScore), 2000);
			return;
		}

		// Calculate final score (0-100)
		const finalScore = Math.min(100, Math.round((successfulHovers / targetCount) * 100));
		score = finalScore;

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
	<div class="hover-lesson">
		{#if configError}
			<div class="start-screen">
				<h2>Το μάθημα δεν είναι διαθέσιμο</h2>
				<p>Χρειάζεται ενημέρωση του περιεχομένου. Δοκιμάστε ένα άλλο μάθημα.</p>
				<button class="back-button" onclick={onBack}>Πίσω</button>
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
				<p class="play-instructions">
					{config.instructions ||
						m.hover_instructions?.() ||
						'Μετακινήστε το ποντίκι πάνω από τους στόχους.'}
				</p>
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
						<span class="stat-label">
							{theme === 'shape-path' ? 'Εκτροπές' : m.score?.() || 'Σκορ'}:
						</span>
						<span class="stat-value">{theme === 'shape-path' ? run.slips : score}</span>
					</div>
				</div>

				{#if theme === 'shape-path'}
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

	.back-button {
		min-height: 48px;
		padding: 0 1.5rem;
		border: none;
		border-radius: 0.5rem;
		background: #4f46e5;
		color: white;
		font-size: 1.05rem;
		font-weight: 600;
		cursor: pointer;
	}

	.back-button:focus-visible {
		outline: 3px solid #f59e0b;
		outline-offset: 2px;
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

	.game-ui {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.play-instructions {
		text-align: center;
		font-size: 1.05rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 0.5rem;
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
