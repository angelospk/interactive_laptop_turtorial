<script lang="ts">
	import type { Lesson } from '$lib/db/schema';
	import { onDestroy } from 'svelte';
	import LessonTemplate from '../LessonTemplate.svelte';
	import MobileFrame from '$lib/components/mobile/MobileFrame.svelte';
	import MobileHomeScreen from '$lib/components/mobile/MobileHomeScreen.svelte';

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
	// The same home screen the goal-driven lessons use, so lesson 1 looks like
	// lessons 2+. Tile colours per well-known app id (the mobile-tap config has none).
	const TILE_COLOR: Record<string, string> = {
		phone: 'bg-green-500',
		messages: 'bg-blue-500',
		viber: 'bg-purple-500',
		camera: 'bg-slate-600',
		photos: 'bg-amber-400',
		settings: 'bg-slate-400',
		store: 'bg-sky-500',
		browser: 'bg-blue-400',
		facetime: 'bg-emerald-500'
	};
	const homeApps = apps.map((a) => ({ ...a, color: TILE_COLOR[a.id] ?? 'bg-white/90' }));
	const dockAppIds = apps
		.filter((a) => a.id !== config.targetAppId)
		.slice(0, 3)
		.map((a) => a.id);

	let wrongTaps = $state(0);
	let showHint = $state(false);
	let done = $state(false);
	let feedback = $state(''); // announced via aria-live

	// The success delay must not fire after the lesson is left/unmounted, or it
	// would call onComplete on a stale lesson (codex/coderabbit).
	let completeTimer: ReturnType<typeof setTimeout> | undefined;
	onDestroy(() => clearTimeout(completeTimer));

	// Elderly-friendly scoring: full marks first try, gentle penalty otherwise.
	// The hint is shown automatically after 2 misses, so it never costs score.
	function scoreFor(wrong: number): number {
		return wrong === 0 ? 100 : 80;
	}

	function tap(app: App) {
		if (done) return;

		if (app.id === config.targetAppId) {
			done = true;
			feedback = config.successMessage ?? 'Μπράβο! Το βρήκες.';
			// Small pause so the success message is seen before advancing.
			clearTimeout(completeTimer);
			completeTimer = setTimeout(() => onComplete(scoreFor(wrongTaps)), 900);
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
			<MobileHomeScreen
				{variant}
				apps={homeApps}
				{dockAppIds}
				onOpenApp={(id) => {
					const app = apps.find((a) => a.id === id);
					if (app) tap(app);
				}}
				highlightAppId={showHint && !done ? config.targetAppId : null}
				disabled={done}
			/>
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
