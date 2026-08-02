<script lang="ts">
	import type { Lesson } from '$lib/db/schema';
	import { onDestroy } from 'svelte';
	import LessonTemplate from '../LessonTemplate.svelte';
	import GovGrApp from '$lib/components/apps/GovGrApp.svelte';
	import { checkGoalMatch } from '$lib/lessons/goalHandlers';
	import { isValidGoalId, type GoalId } from '$lib/lessons/goals';
	import { parseGovSimConfig } from '$lib/lessons/govSim';

	/**
	 * Goal-driven gov.gr simulation (gov.gr track, issue B1). Sibling of
	 * MacSimLesson: a single semantic-event dispatcher feeds `checkGoalMatch`, with
	 * gentle scoring, an aria-live status line and a hint after two wrong tries.
	 * Each lesson opens on one screen (config.startScreen) and teaches one task.
	 */
	interface Props {
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}

	let { lesson, onComplete, onBack }: Props = $props();

	const config = parseGovSimConfig(lesson.config);
	const goalConfig = config as unknown as Record<string, unknown>;

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

	/** Single entry point for every event GovGrApp emits. */
	function dispatch(action: string, data: Record<string, unknown> = {}) {
		if (done) return;

		// The goal is registered separately (goals.ts). Guard so a not-yet-wired
		// goal fails loud in the console instead of silently never completing.
		if (!isValidGoalId(config.goal)) {
			console.warn(`[GovLesson] goal "${config.goal}" is not registered — skipping check`);
		} else if (checkGoalMatch(config.goal as GoalId, action, data, goalConfig)) {
			succeed();
			return;
		}

		// Contextual, gentle misses per screen.
		if (action === 'gov-login' && !data.success) {
			miss('Συμπληρώστε και τα δύο πεδία (Όνομα χρήστη και Κωδικός) και πατήστε «Σύνδεση».');
		} else if (action === 'gov-service-selected') {
			miss('Δεν είναι αυτή η υπηρεσία. Δείτε ξανά τον τίτλο και διαλέξτε τη σωστή.');
		} else if (action === 'gov-authorize') {
			miss('Σχεδόν! Ελέγξτε ότι συμπληρώσατε σωστά το Ονοματεπώνυμο και το ΑΦΜ.');
		}
	}
</script>

<LessonTemplate {lesson} {onBack}>
	<div class="flex flex-col items-center gap-4 py-4">
		<p class="max-w-xl text-center text-lg font-semibold text-foreground">{config.prompt}</p>

		<div class="w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 shadow-sm">
			<div class="h-[560px]">
				<GovGrApp {config} onEvent={dispatch} {done} />
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
