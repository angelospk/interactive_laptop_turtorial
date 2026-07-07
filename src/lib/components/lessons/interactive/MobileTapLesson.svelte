<script lang="ts">
	import type { Lesson } from '$lib/db/schema';
	import LessonTemplate from '../LessonTemplate.svelte';
	import MobileFrame from '$lib/components/mobile/MobileFrame.svelte';

	interface App {
		id: string;
		label: string;
		icon: string; // emoji, rendered large
	}
	interface MobileTapConfig {
		prompt: string;
		apps: App[];
		targetAppId: string;
		successMessage?: string;
		hint?: string;
		variant?: 'android' | 'ios';
	}

	interface Props {
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}

	let { lesson, onComplete, onBack }: Props = $props();

	const config = lesson.config as unknown as MobileTapConfig;
	const apps = config.apps ?? [];
	const target = $derived(apps.find((a) => a.id === config.targetAppId));
	const variant = config.variant ?? 'android';

	let wrongTaps = $state(0);
	let showHint = $state(false);
	let done = $state(false);
	let feedback = $state(''); // announced via aria-live

	// Elderly-friendly scoring (codex): full marks first try, gentle penalties.
	function scoreFor(wrong: number, hinted: boolean): number {
		if (hinted) return 60;
		return wrong === 0 ? 100 : 80;
	}

	function tap(app: App) {
		if (done) return;

		if (app.id === config.targetAppId) {
			done = true;
			feedback = config.successMessage ?? 'Μπράβο! Το βρήκες.';
			// Small pause so the success message is seen before advancing.
			setTimeout(() => onComplete(scoreFor(wrongTaps, showHint)), 900);
			return;
		}

		wrongTaps += 1;
		feedback = `Όχι αυτό. Ψάξε το «${target?.label ?? ''}».`;
		// After a couple of misses, highlight the correct icon (never punish, guide).
		if (wrongTaps >= 2) showHint = true;
	}
</script>

<LessonTemplate {lesson} {onBack}>
	<div class="flex flex-col items-center gap-4 py-4">
		<p class="max-w-md text-center text-lg font-semibold text-foreground">{config.prompt}</p>

		<MobileFrame {variant} class="my-2">
			<div class="grid grid-cols-3 gap-4 p-5">
				{#each apps as app (app.id)}
					{@const isTarget = app.id === config.targetAppId}
					<button
						type="button"
						onclick={() => tap(app)}
						disabled={done}
						aria-label={`Άνοιγμα ${app.label}`}
						class="flex min-h-[84px] flex-col items-center justify-center gap-1 rounded-2xl p-2 transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none disabled:opacity-60"
						class:ring-4={showHint && isTarget}
						class:ring-emerald-400={showHint && isTarget}
						class:animate-pulse={showHint && isTarget}
					>
						<span class="text-4xl leading-none" aria-hidden="true">{app.icon}</span>
						<span class="text-center text-xs font-medium text-slate-800">{app.label}</span>
					</button>
				{/each}
			</div>
		</MobileFrame>

		<!-- Calm, non-blocking feedback (aria-live so it is announced) -->
		<p
			class="min-h-[1.75rem] text-center text-base font-medium"
			class:text-emerald-600={done}
			class:text-amber-700={!done && feedback}
			role="status"
			aria-live="polite"
		>
			{feedback}
		</p>

		{#if showHint && !done && config.hint}
			<p class="text-center text-sm text-muted-foreground">{config.hint}</p>
		{/if}
	</div>
</LessonTemplate>
