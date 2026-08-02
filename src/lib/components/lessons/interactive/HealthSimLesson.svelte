<script lang="ts">
	import type { Lesson } from '$lib/db/schema';
	import { onDestroy } from 'svelte';
	import LessonTemplate from '../LessonTemplate.svelte';
	import HealthApp from '$lib/components/apps/HealthApp.svelte';
	import { parseHealthSimConfig, matchHealthGoal } from '$lib/lessons/healthSim';

	/**
	 * Goal-driven health-services simulation (issue B2). Self-contained: the goal
	 * matcher lives in `healthSim.ts`, so this wrapper does not depend on the
	 * shared goalHandlers registry having been wired. Mirrors MacSimLesson's
	 * gentle-scoring UX: 100 with no wrong taps, 80 otherwise, hint after 2 misses.
	 */
	interface Props {
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}

	let { lesson, onComplete, onBack }: Props = $props();

	const config = parseHealthSimConfig(lesson.config);

	let wrongTaps = $state(0);
	let showHint = $state(false);
	let done = $state(false);
	let feedback = $state('');

	let completeTimer: ReturnType<typeof setTimeout> | undefined;
	onDestroy(() => clearTimeout(completeTimer));

	function scoreFor(wrong: number): number {
		return wrong === 0 ? 100 : 80;
	}

	function succeed() {
		done = true;
		feedback = config.successMessage ?? 'Μπράβο! Τα καταφέρατε.';
		clearTimeout(completeTimer);
		completeTimer = setTimeout(() => onComplete(scoreFor(wrongTaps)), 900);
	}

	function miss(message: string) {
		wrongTaps += 1;
		feedback = message;
		if (wrongTaps >= 2) showHint = true;
	}

	/** Single entry point for every semantic event HealthApp emits. */
	function dispatch(action: string, data: Record<string, unknown> = {}) {
		if (done) return;
		if (matchHealthGoal(config, action, data)) {
			succeed();
			return;
		}

		if (action === 'health-wrong-message') {
			miss('Αυτό είναι μήνυμα από φίλη. Ανοίξτε το επίσημο μήνυμα με τον κωδικό της συνταγής.');
		} else if (action === 'health-wrong-section') {
			miss('Όχι εδώ. Πατήστε «Οι συνταγές μου» για να δείτε τα φάρμακά σας.');
		} else if (action === 'health-appointment-booked') {
			// Only fires here when a targetSlotId is set and the wrong slot was picked.
			miss('Διαλέξτε την ώρα που ζητά το μάθημα και πατήστε ξανά «Κλείσε ραντεβού».');
		}
	}
</script>

<LessonTemplate {lesson} {onBack}>
	<div class="flex flex-col items-center gap-4 py-4">
		<p class="max-w-xl text-center text-lg font-semibold text-foreground">{config.prompt}</p>

		<div class="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
			<div class="h-[520px]">
				<HealthApp {config} onAction={dispatch} disabled={done} />
			</div>
		</div>

		<p
			class="min-h-[1.75rem] max-w-xl text-center text-base font-medium"
			class:text-emerald-600={done}
			class:text-amber-700={!done && feedback}
			role="status"
			aria-live="polite"
		>
			{feedback}
		</p>

		{#if showHint && !done && config.hint}
			<p class="max-w-xl text-center text-sm text-muted-foreground">{config.hint}</p>
		{/if}
	</div>
</LessonTemplate>
