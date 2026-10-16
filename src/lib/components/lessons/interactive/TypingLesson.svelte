<script lang="ts">
	import type { Lesson } from '$lib/db/schema';
	import LessonTemplate from '../LessonTemplate.svelte';
	import { Input } from '$lib/components/ui/input';
	import { CheckCircle, XCircle, MousePointerClick, CornerDownLeft } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}

	let { lesson, onComplete, onBack }: Props = $props();

	// Parse config
	const config = lesson.config as {
		text: string;
		timeLimit?: number;
		minWPM?: number;
		minAccuracy?: number;
	};

	// Challenge definitions
	const challenges: Record<string, { target: string; instruction: string; initial?: string }> = {
		simple: {
			target: 'καλημέρα',
			instruction: 'Γράψε τη λέξη "καλημέρα"'
		},
		capitals: {
			target: 'ΕΛΛΑΔΑ',
			instruction: 'Γράψε τη λέξη "ΕΛΛΑΔΑ" με κεφαλαία (Caps Lock ή Shift)'
		},
		'mixed-case': {
			target: 'Αθήνα',
			instruction: 'Γράψε τη λέξη "Αθήνα" (Shift + Α)'
		},
		accents: {
			target: 'παιδί',
			instruction: 'Γράψε τη λέξη "παιδί" (πάτα πρώτα τον τόνο ";", μετά το "ι")'
		},
		'with-errors': {
			target: 'Καλημέρα',
			instruction: 'Διόρθωσε τη λέξη "Καλημέρραα" σε "Καλημέρα"',
			initial: 'Καλημέρραα'
		},
		'special-chars': {
			target: 'test@example.com',
			instruction: 'Γράψε το email "test@example.com" (Shift + 2 για το @)'
		},
		paragraph: {
			target: 'Ο καιρός είναι ωραίος σήμερα.',
			instruction: 'Γράψε την πρόταση: "Ο καιρός είναι ωραίος σήμερα."'
		},
		'full-test': {
			target: 'Η γρήγορη καφέ αλεπού πηδάει πάνω από το τεμπέλικο σκυλί.',
			instruction: 'Γράψε την πρόταση: "Η γρήγορη καφέ αλεπού πηδάει πάνω από το τεμπέλικο σκυλί."'
		}
	};

	// Get challenge data based on config
	const challenge = $derived(
		challenges[config.text] || {
			target: 'Error',
			instruction: 'Challenge not found'
		}
	);

	let inputValue = $state('');
	let isCorrect = $derived(inputValue === challenge.target);
	let startTime = $state<number | null>(null);

	// Initialize with correction text if needed
	$effect(() => {
		if (challenge.initial && !inputValue) {
			inputValue = challenge.initial;
		}
	});

	let inputEl = $state<HTMLInputElement | null>(null);
	let focused = $state(false);

	// The learner sees where they are: click into the box, type, press Enter.
	const step = $derived(!focused ? 'click' : isCorrect ? 'enter' : 'type');
	const typeLabel = $derived(
		challenge.target.includes(' ') ? 'Γράψτε την πρόταση' : 'Γράψτε τη λέξη'
	);

	// Put the cursor in the box on start, so the first key press already types.
	$effect(() => {
		inputEl?.focus();
	});

	function focusBox() {
		inputEl?.focus();
	}

	function handleInput() {
		if (!startTime) {
			startTime = Date.now();
		}
	}

	function checkAnswer() {
		if (isCorrect) {
			// completed = true; // No need to set completed state for UI, just finish
			const timeTaken = startTime ? (Date.now() - startTime) / 1000 : 0;

			// Calculate score
			// Base score 60, plus speed bonus up to 40
			// Assume 2 chars per second is "good" speed for beginners
			const charsPerSec = challenge.target.length / Math.max(timeTaken, 1);
			const speedBonus = Math.min(40, Math.round(charsPerSec * 10));
			const finalScore = 60 + speedBonus;

			toast.success(m.very_good ? m.very_good() : 'Very good!');

			// Immediately complete
			onComplete(finalScore);
		} else {
			toast.error(m.try_again ? m.try_again() : 'Try again');
			focusBox();
		}
	}
</script>

<LessonTemplate {lesson} {onBack}>
	<div class="typing-lesson mx-auto max-w-2xl">
		<div class="instruction-card mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
			<h3 class="mb-2 text-lg font-medium text-slate-900">
				{m.lesson_instructions ? m.lesson_instructions() : 'Instructions'}
			</h3>
			<p class="text-lg text-slate-600">{challenge.instruction}</p>
		</div>

		<div
			class="target-display mb-8 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center"
		>
			<span class="font-mono text-3xl font-bold tracking-wide text-slate-700"
				>{challenge.target}</span
			>
		</div>

		<!-- One white card: text straight on the purple gradient reads poorly. -->
		<div class="practice-card rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
			<ol class="typing-steps" aria-label="Βήματα">
				<li
					class:current={step === 'click'}
					class:done={step !== 'click'}
					aria-current={step === 'click' ? 'step' : undefined}
				>
					<span class="step-num">{step !== 'click' ? '✓' : 1}</span><span>Κλικ μέσα στο κουτί</span>
				</li>
				<li
					class:current={step === 'type'}
					class:done={step === 'enter'}
					aria-current={step === 'type' ? 'step' : undefined}
				>
					<span class="step-num">{step === 'enter' ? '✓' : 2}</span><span>{typeLabel}</span>
				</li>
				<li class:current={step === 'enter'} aria-current={step === 'enter' ? 'step' : undefined}>
					<span class="step-num">3</span><span>Πατήστε Enter</span>
				</li>
			</ol>

			<!-- Fixed height, so the box does not move when the message changes. -->
			<div class="cursor-status" aria-live="polite">
				{#if !focused}
					<button type="button" class="click-hint" onclick={focusBox}>
						<MousePointerClick class="h-6 w-6 shrink-0" aria-hidden="true" />
						Πατήστε μέσα στο κουτί για να γράψετε
					</button>
				{:else if !isCorrect}
					<p class="cursor-note">
						✓ Η γραμμή που αναβοσβήνει μέσα στο κουτί είναι ο κέρσορας. Ό,τι γράψετε μπαίνει εκεί.
					</p>
				{:else}
					<p class="cursor-note">✓ Σωστά! Τώρα πατήστε το πλήκτρο Enter.</p>
				{/if}
			</div>

			<div class="input-area relative" class:needs-click={!focused}>
				<Input
					type="text"
					bind:ref={inputEl}
					bind:value={inputValue}
					oninput={handleInput}
					onfocus={() => (focused = true)}
					onblur={() => (focused = false)}
					onkeydown={(e) => {
						if (e.key === 'Enter') checkAnswer();
					}}
					class={`h-16 p-6 text-center font-mono text-2xl ${isCorrect ? 'border-green-500 ring-2 ring-green-200' : ''} ${!isCorrect && inputValue.length > 0 ? 'border-red-300' : ''}`}
					placeholder="Γράψε εδώ..."
					autocomplete="off"
					autocorrect="off"
					autocapitalize="off"
					spellcheck="false"
				/>

				<div class="absolute top-1/2 right-4 -translate-y-1/2">
					{#if isCorrect}
						<CheckCircle class="h-8 w-8 text-green-500" />
					{:else if inputValue.length > 0}
						<XCircle class="h-8 w-8 text-red-400" />
					{/if}
				</div>
			</div>

			<!-- mousedown is cancelled so the cursor stays in the box while clicking. -->
			<button
				type="button"
				class="enter-key"
				class:ready={isCorrect}
				onmousedown={(e) => e.preventDefault()}
				onclick={checkAnswer}
			>
				<span class="keycap"
					>Enter <CornerDownLeft class="inline h-5 w-5" aria-hidden="true" /></span
				>
				<span
					>{isCorrect ? 'Πατήστε Enter για να τελειώσετε' : 'Όταν τελειώσετε, πατήστε Enter'}</span
				>
			</button>
		</div>

		<!-- Button removed as requested for auto-completion -->
	</div>
</LessonTemplate>

<style>
	.typing-lesson {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: 60vh;
	}

	.typing-steps {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		margin: 0 0 1rem;
		padding: 0;
		list-style: none;
	}

	.typing-steps li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.9rem;
		border: 2px solid #e2e8f0;
		border-radius: 999px;
		background: #fff;
		color: #64748b;
		font-size: 1rem;
	}

	.typing-steps li.current {
		border-color: #4f46e5;
		background: #eef2ff;
		color: #1e1b4b;
		font-weight: 700;
	}

	.typing-steps li.done {
		border-color: #86efac;
		background: #f0fdf4;
		color: #166534;
	}

	.step-num {
		display: inline-grid;
		place-items: center;
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 999px;
		background: #e2e8f0;
		color: #334155;
		font-size: 0.9rem;
	}

	.typing-steps li.done .step-num {
		background: #16a34a;
		color: #fff;
	}

	.typing-steps li.current .step-num {
		background: #4f46e5;
		color: #fff;
	}

	.cursor-status {
		min-height: 3.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 0.5rem;
	}

	.click-hint {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		min-height: 3rem;
		padding: 0.5rem 1.1rem;
		border: 2px solid #f59e0b;
		border-radius: 0.75rem;
		background: #fffbeb;
		color: #78350f;
		font-size: 1.05rem;
		font-weight: 700;
		cursor: pointer;
	}

	.cursor-note {
		margin: 0;
		color: #166534;
		font-size: 1rem;
		text-align: center;
	}

	.needs-click :global(input) {
		border-color: #f59e0b;
		box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.3);
	}

	.enter-key {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin-top: 1rem;
		min-height: 3.5rem;
		padding: 0.5rem 1rem;
		border: 2px solid #cbd5e1;
		border-radius: 0.75rem;
		background: #f8fafc;
		color: #334155;
		font-size: 1.05rem;
		cursor: pointer;
	}

	.enter-key.ready {
		border-color: #16a34a;
		background: #16a34a;
		color: #fff;
		font-weight: 700;
	}

	.keycap {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.25rem 0.7rem;
		border: 1px solid #94a3b8;
		border-bottom-width: 3px;
		border-radius: 0.4rem;
		background: #fff;
		color: #0f172a;
		font-family: ui-monospace, monospace;
		font-weight: 700;
	}

	@media (prefers-reduced-motion: no-preference) {
		.needs-click :global(input),
		.enter-key.ready {
			animation: typing-pulse 1.6s ease-in-out infinite;
		}
	}

	@keyframes typing-pulse {
		50% {
			box-shadow: 0 0 0 8px rgba(79, 70, 229, 0.15);
		}
	}
</style>
