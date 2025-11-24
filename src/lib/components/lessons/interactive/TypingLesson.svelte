<script lang="ts">
	import type { Lesson } from '$lib/db/schema';
	import LessonTemplate from '../LessonTemplate.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { CheckCircle, XCircle } from '@lucide/svelte';
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
	let completed = $state(false);

	// Initialize with correction text if needed
	$effect(() => {
		if (challenge.initial && !inputValue) {
			inputValue = challenge.initial;
		}
	});

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

		<div class="input-area relative">
			<Input
				type="text"
				bind:value={inputValue}
				oninput={handleInput}
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
</style>
