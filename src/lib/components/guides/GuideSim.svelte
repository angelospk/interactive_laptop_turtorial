<script lang="ts">
	/**
	 * The demo a guide walks through. Every simulation reports what the learner
	 * does as a `GuideEvent`, so a practical step can wait for it.
	 */
	import BrowserApp from '$lib/components/apps/BrowserApp.svelte';
	import DesktopLesson from '$lib/components/lessons/interactive/DesktopLesson.svelte';
	import MacSimLesson from '$lib/components/lessons/interactive/MacSimLesson.svelte';
	import MobileSimLesson from '$lib/components/lessons/interactive/MobileSimLesson.svelte';
	import type { Lesson } from '$lib/db/schema';
	import GovGuideSim from './GovGuideSim.svelte';
	import HealthGuideSim from './HealthGuideSim.svelte';
	import MousePad from './MousePad.svelte';
	import KeyboardPad from './KeyboardPad.svelte';
	import type { GuideEvent, GuideSim } from '$lib/guides';

	let { sim, config, target, onEvent } = $props<{
		sim: GuideSim;
		config: Record<string, unknown>;
		/** The current step's target: a sim with screens can show the right one. */
		target?: string | null;
		onEvent: (event: GuideEvent) => void;
	}>();

	const report = (type: string, data?: Record<string, unknown>) => onEvent({ ...data, type });

	// The desktop, the phone and the Mac are lesson components: embedded, they never complete.
	const asLesson = (lessonType: string) =>
		({
			id: `guide-${lessonType}`,
			moduleId: '',
			lessonKey: 'guide-sim',
			titleKey: '',
			descriptionKey: null,
			difficulty: 'beginner',
			orderIndex: 0,
			lessonType,
			config,
			enabled: true,
			requiredLessonId: null
		}) as unknown as Lesson;
	const noop = () => {};
</script>

{#if sim === 'browser'}
	<BrowserApp {config} onAction={report} />
{:else if sim === 'desktop'}
	<DesktopLesson
		lesson={asLesson('desktop-simulation')}
		embedded
		onEvent={report}
		onComplete={noop}
		onBack={noop}
	/>
{:else if sim === 'phone'}
	<MobileSimLesson
		lesson={asLesson('mobile-sim')}
		embedded
		onEvent={report}
		onComplete={noop}
		onBack={noop}
	/>
{:else if sim === 'mac'}
	<MacSimLesson
		lesson={asLesson('mac-simulation')}
		embedded
		onEvent={report}
		onComplete={noop}
		onBack={noop}
	/>
{:else if sim === 'gov'}
	<GovGuideSim {config} {target} onEvent={report} />
{:else if sim === 'health'}
	<HealthGuideSim {config} {target} onEvent={report} />
{:else if sim === 'mouse-pad'}
	<MousePad {onEvent} />
{:else if sim === 'keyboard-pad'}
	<KeyboardPad {onEvent} />
{/if}
