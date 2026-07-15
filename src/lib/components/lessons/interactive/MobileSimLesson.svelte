<script lang="ts">
	import type { Lesson } from '$lib/db/schema';
	import { onDestroy } from 'svelte';
	import LessonTemplate from '../LessonTemplate.svelte';
	import MobileFrame from '$lib/components/mobile/MobileFrame.svelte';
	import MobileHomeScreen from '$lib/components/mobile/MobileHomeScreen.svelte';
	import PhoneApp from '$lib/components/mobile/apps/PhoneApp.svelte';
	import MessagingApp from '$lib/components/mobile/apps/MessagingApp.svelte';
	import MobileSettingsApp from '$lib/components/mobile/apps/MobileSettingsApp.svelte';
	import RecentApps from '$lib/components/mobile/RecentApps.svelte';
	import CameraApp from '$lib/components/mobile/apps/CameraApp.svelte';
	import { checkGoalMatch } from '$lib/lessons/goalHandlers';
	import { parseMobileSimConfig, mobilePlatformCapabilities } from '$lib/lessons/mobileSim';

	/**
	 * Goal-driven phone simulation (mobile counterpart of DesktopLesson,
	 * CURRICULUM_PLAN B2). The home screen and mini-apps emit semantic events
	 * (`mobile-app-opened`, `mobile-call-placed`, …); lesson scoring listens to
	 * those events only — never to component internals.
	 */
	interface Props {
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}

	let { lesson, onComplete, onBack }: Props = $props();

	const config = parseMobileSimConfig(lesson.config);
	const goalConfig = config as unknown as Record<string, unknown>;
	const targetApp = config.apps.find((a) => a.id === config.targetAppId);

	let currentAppId: string | null = $state(null);
	const currentApp = $derived(config.apps.find((a) => a.id === currentAppId) ?? null);

	let wrongTaps = $state(0);
	let showHint = $state(false);
	let done = $state(false);
	let feedback = $state(''); // announced via aria-live

	// The success delay must not fire after the lesson is left/unmounted
	// (same guard as MobileTapLesson).
	let completeTimer: ReturnType<typeof setTimeout> | undefined;
	onDestroy(() => clearTimeout(completeTimer));

	// Elderly-friendly scoring: full marks first try, gentle penalty otherwise.
	// The hint appears AUTOMATICALLY after 2 misses — it is guidance we chose to
	// give, not something the learner "paid" for, so it never lowers the score
	// further (codex review: auto-help must not be a severe penalty).
	function scoreFor(wrong: number): number {
		return wrong === 0 ? 100 : 80;
	}

	function succeed() {
		done = true;
		feedback = config.successMessage ?? 'Μπράβο! Τα κατάφερες.';
		clearTimeout(completeTimer);
		completeTimer = setTimeout(() => onComplete(scoreFor(wrongTaps)), 900);
	}

	function miss(message: string) {
		wrongTaps += 1;
		feedback = message;
		// After a couple of misses, highlight the right path (guide, never punish).
		if (wrongTaps >= 2) showHint = true;
	}

	/** Single entry point for every semantic event the simulation emits. */
	function dispatch(action: string, data: Record<string, unknown> = {}) {
		if (done) return;

		if (action === 'mobile-app-opened') {
			currentAppId = data.appId as string;
		}

		if (checkGoalMatch(config.goal, action, data, goalConfig)) {
			succeed();
			return;
		}

		if (action === 'mobile-app-opened' && data.appId !== config.targetAppId) {
			miss(`Όχι αυτό. Ψάξε το «${targetApp?.label ?? ''}».`);
		} else if (action === 'mobile-call-placed') {
			// A call happened but didn't satisfy the goal (wrong number/contact).
			miss(
				data.contactId
					? 'Κάλεσες άλλη επαφή. Δοκίμασε ξανά.'
					: 'Κάλεσες λάθος αριθμό. Σβήσε τον και δοκίμασε ξανά.'
			);
		} else if (action === 'mobile-videocall-started') {
			miss('Ξεκίνησες βιντεοκλήση με άλλη επαφή. Κλείσε την και δοκίμασε ξανά.');
		} else if (action === 'mobile-message-sent') {
			miss('Το μήνυμα δεν πήγε εκεί που έπρεπε. Δοκίμασε άλλη συνομιλία.');
		} else if (action === 'mobile-font-size-set') {
			miss('Σχεδόν! Δοκίμασε άλλο μέγεθος.');
		} else if (action === 'mobile-wifi-connected') {
			miss('Συνδέθηκες σε άλλο δίκτυο. Δοκίμασε ξανά.');
		} else if (action === 'mobile-qr-link-opened') {
			// The link was opened but its host is not the official domain.
			miss('Προσοχή: αυτή η διεύθυνση δεν είναι το επίσημο gov.gr. Καλύτερα μην την ανοίξεις.');
		}
	}

	function goHome() {
		currentAppId = null;
	}

	// Screenshot lesson: show the physical bezel buttons and turn the correct
	// platform chord into the semantic event. The truthful combination lives in
	// the capability profile, not in the lesson config (codex plan review).
	const isScreenshotLesson = config.goal === 'mobile-screenshot';
	const screenshotChord = mobilePlatformCapabilities[config.variant].screenshotChord;

	function handleSystemChord(chord: string) {
		if (done) return;
		if (chord === screenshotChord) {
			dispatch('mobile-screenshot-taken', { chord });
		} else {
			miss('Άλλος συνδυασμός κουμπιών. Δοκίμασε ξανά τα δύο σωστά κουμπιά μαζί.');
		}
	}

	// Recent-apps layer (force-close lesson): the learner opens recents and
	// dismisses the frozen app card. The event carries the appId (by design).
	const isForceCloseLesson = config.goal === 'mobile-force-close';
	let showRecents = $state(false);

	function dismissRecent(appId: string) {
		if (done) return;
		dispatch('mobile-app-force-closed', { appId });
		if (appId === config.targetAppId) {
			showRecents = false; // frozen app closed → back to a responsive phone
		} else {
			miss('Έκλεισες άλλη εφαρμογή. Ψάξε αυτή που «κόλλησε».');
		}
	}
</script>

<LessonTemplate {lesson} {onBack}>
	<div class="flex flex-col items-center gap-4 py-4">
		<p class="max-w-md text-center text-lg font-semibold text-foreground">{config.prompt}</p>

		<MobileFrame
			variant={config.variant === 'ios' ? 'ios' : 'android'}
			onHome={goHome}
			onRecents={isForceCloseLesson && !done ? () => (showRecents = true) : undefined}
			showSystemButtons={isScreenshotLesson}
			onSystemChord={handleSystemChord}
			class="my-2"
		>
			{#if showRecents}
				<RecentApps
					apps={config.apps}
					recentAppIds={config.recentAppIds ?? []}
					frozenAppId={config.targetAppId ?? null}
					onDismiss={dismissRecent}
					onClose={() => (showRecents = false)}
				/>
			{/if}
			{#if currentApp === null}
				<MobileHomeScreen
					variant={config.variant === 'ios' ? 'ios' : 'android'}
					apps={config.apps}
					dockAppIds={config.dockAppIds ?? []}
					onOpenApp={(appId) => dispatch('mobile-app-opened', { appId })}
					highlightAppId={showHint && !done ? (config.targetAppId ?? null) : null}
					disabled={done}
				/>
			{:else if currentApp.kind === 'phone'}
				<PhoneApp onEvent={dispatch} contacts={config.contacts ?? []} />
			{:else if currentApp.kind === 'messages' || currentApp.kind === 'viber'}
				<MessagingApp
					onEvent={dispatch}
					conversations={config.conversations ?? []}
					channel={currentApp.kind === 'viber' ? 'viber' : 'sms'}
					title={currentApp.label}
				/>
			{:else if currentApp.kind === 'settings'}
				<MobileSettingsApp onEvent={dispatch} wifiNetworks={config.wifiNetworks ?? []} />
			{:else if currentApp.kind === 'camera'}
				<CameraApp onEvent={dispatch} qrUrl={config.qrUrl ?? ''} />
			{:else}
				<!-- Inert placeholder for apps that are scenery in this lesson -->
				<div class="flex h-full flex-col items-center justify-center gap-3 bg-white px-6 text-center">
					<span class="text-5xl" aria-hidden="true">{currentApp.icon}</span>
					<p class="text-lg font-semibold text-slate-800">{currentApp.label}</p>
					<p class="text-sm text-muted-foreground">
						Αυτή η εφαρμογή δεν χρειάζεται σε αυτό το μάθημα. Πάτησε τη γραμμή κάτω για να
						γυρίσεις στην αρχική οθόνη.
					</p>
				</div>
			{/if}
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
