<script lang="ts">
	import type { Lesson } from '$lib/db/schema';
	import { onDestroy } from 'svelte';
	import LessonTemplate from '../LessonTemplate.svelte';
	import MacDesktop from '$lib/components/mac/MacDesktop.svelte';
	import MacMenuBar from '$lib/components/mac/MacMenuBar.svelte';
	import MacDock from '$lib/components/mac/MacDock.svelte';
	import MacWindow from '$lib/components/mac/MacWindow.svelte';
	import MacSpotlight from '$lib/components/mac/MacSpotlight.svelte';
	import FinderMacApp from '$lib/components/mac/apps/FinderMacApp.svelte';
	import MacSettingsApp from '$lib/components/mac/apps/MacSettingsApp.svelte';
	import { checkGoalMatch } from '$lib/lessons/goalHandlers';
	import { parseMacSimConfig, type MacSimApp } from '$lib/lessons/macSim';
	import { MacState } from '$lib/components/mac/macState.svelte';

	/**
	 * Goal-driven Mac simulation (mac counterpart of MobileSimLesson,
	 * CURRICULUM_PLAN §5). Its reason to exist is the macOS truth that closing a
	 * window (red traffic light) does NOT quit the app — only ⌘Q / menu «Quit»
	 * does. State (codex plan review):
	 *   running[appId]      — app is running (Dock dot); survives window close.
	 *   windowState[appId]  — 'open' | 'closed' | 'minimized' (ONE window per app).
	 *   activeAppId         — frontmost app; owns the menu bar and receives ⌘Q.
	 * Invariants: open|minimized ⇒ running; !running ⇒ closed.
	 */
	interface Props {
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}

	let { lesson, onComplete, onBack }: Props = $props();

	const config = parseMacSimConfig(lesson.config);
	const goalConfig = config as unknown as Record<string, unknown>;
	const targetApp = config.apps.find((a) => a.id === config.targetAppId) ?? null;
	const finderApp = config.apps.find((a) => a.alwaysRunning) ?? null;
	const settingsApp = config.apps.find((a) => a.kind === 'settings') ?? null;

	// One owner for the simulated machine (Wi-Fi, brightness, Finder folder,
	// Settings pane…): the menu bar, Control Center, Finder and System Settings
	// all read and write this instance, so nothing resets when the frontmost app
	// changes. A fresh instance per lesson mount = a clean machine per lesson.
	const machine = new MacState();

	// Initial state: every app closed & not running, except always-running apps
	// (Finder) and any explicit initialRunningAppIds.
	const initiallyRunning = new Set<string>([
		...config.apps.filter((a) => a.alwaysRunning).map((a) => a.id),
		...(config.initialRunningAppIds ?? [])
	]);
	let running = $state<Record<string, boolean>>(
		Object.fromEntries(config.apps.map((a) => [a.id, initiallyRunning.has(a.id)]))
	);
	let windowState = $state<Record<string, 'open' | 'closed' | 'minimized'>>(
		Object.fromEntries(config.apps.map((a) => [a.id, 'closed' as const]))
	);
	let activeAppId = $state<string | null>(null);
	// Green traffic light: zoomed per app; reset when the window closes or the app quits.
	let zoomed = $state<Record<string, boolean>>({});
	let showSpotlight = $state(false);

	let wrongTaps = $state(0);
	let showHint = $state(false);
	let done = $state(false);
	let feedback = $state('');

	let completeTimer: ReturnType<typeof setTimeout> | undefined;
	onDestroy(() => clearTimeout(completeTimer));

	const runningAppIds = $derived(config.apps.filter((a) => running[a.id]).map((a) => a.id));
	// Only the frontmost app's window is drawn (single visible window model).
	const frontAppId = $derived(
		activeAppId && windowState[activeAppId] === 'open' ? activeAppId : null
	);
	const frontApp = $derived(config.apps.find((a) => a.id === frontAppId) ?? null);
	// The menu bar belongs to the active app, or Finder when nothing is focused.
	const menuApp = $derived(
		(activeAppId ? config.apps.find((a) => a.id === activeAppId) : null) ?? finderApp
	);
	const canQuit = $derived(Boolean(activeAppId) && !menuApp?.alwaysRunning);

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
		if (wrongTaps >= 2) showHint = true;
	}

	/** Pick the next frontmost app after `exclude` leaves the foreground. */
	function nextActive(exclude: string): string | null {
		const candidate = config.apps.find((a) => a.id !== exclude && windowState[a.id] === 'open');
		return candidate?.id ?? null;
	}

	/** Single entry point for every semantic event the simulation emits. */
	function dispatch(action: string, data: Record<string, unknown> = {}) {
		if (done) return;
		if (checkGoalMatch(config.goal, action, data, goalConfig)) {
			succeed();
			return;
		}

		if (action === 'mac-app-opened') {
			if (config.goal === 'mac-spotlight-search') {
				miss('Δοκίμασε από το Spotlight (τον μεγεθυντικό φακό πάνω δεξιά) και άνοιξε το σωστό.');
			} else if (config.targetAppId && data.appId !== config.targetAppId) {
				miss(`Όχι αυτό. Ψάξε το «${targetApp?.label ?? ''}».`);
			}
		} else if (action === 'mac-window-closed') {
			// The teachable miss for the quit lesson: closing ≠ quitting.
			miss(
				'Έκλεισες μόνο το παράθυρο, το πρόγραμμα τρέχει ακόμα (δες την τελίτσα στο Dock). Χρησιμοποίησε το μενού «Τερματισμός».'
			);
		} else if (
			action === 'mac-window-control-used' &&
			(config.goal === 'mac-close-window' || config.goal === 'mac-quit-app')
		) {
			miss('Αυτό το κουμπί δεν κλείνει το παράθυρο. Το κόκκινο (αριστερά) είναι το κλείσιμο.');
		} else if (action === 'mac-app-quit') {
			miss('Τερμάτισες άλλο πρόγραμμα. Δοκίμασε ξανά.');
		} else if (action === 'mac-folder-opened') {
			miss('Άλλος φάκελος. Ψάξε αυτόν που ζητά το μάθημα.');
		} else if (action === 'mac-size-changed') {
			miss('Σχεδόν! Διάλεξε το σωστό μέγεθος.');
		}
	}

	// ── Transitions ─────────────────────────────────────────────────────────
	function openApp(appId: string, source: 'dock' | 'spotlight') {
		if (done) return;
		const alreadyFront = activeAppId === appId && windowState[appId] === 'open';
		running[appId] = true;
		windowState[appId] = 'open';
		activeAppId = appId;
		// Re-clicking the already-frontmost app is a focus no-op, not a new open.
		if (!alreadyFront) dispatch('mac-app-opened', { appId, source });
	}

	function closeWindow(appId: string) {
		if (done) return;
		windowState[appId] = 'closed';
		zoomed[appId] = false;
		if (activeAppId === appId) activeAppId = nextActive(appId);
		dispatch('mac-window-closed', { appId });
	}

	function minimizeWindow(appId: string) {
		if (done) return;
		windowState[appId] = 'minimized';
		if (activeAppId === appId) activeAppId = nextActive(appId);
		dispatch('mac-window-control-used', { appId, control: 'minimize' });
	}

	function zoomWindow(appId: string) {
		if (done) return;
		// The window really grows to fill the screen (and back) — it stays open & focused.
		zoomed[appId] = !zoomed[appId];
		dispatch('mac-window-control-used', { appId, control: 'zoom' });
	}

	/** Apple menu → «Ρυθμίσεις συστήματος…»: opens the Settings app without a launch event (not a Dock/Spotlight launch). */
	function openSettingsFromMenu() {
		if (done || !settingsApp) return;
		running[settingsApp.id] = true;
		windowState[settingsApp.id] = 'open';
		activeAppId = settingsApp.id;
	}

	function quitApp(appId: string) {
		if (done) return;
		running[appId] = false;
		windowState[appId] = 'closed';
		zoomed[appId] = false;
		if (activeAppId === appId) activeAppId = nextActive(appId);
		dispatch('mac-app-quit', { appId });
	}

	function quitActive() {
		if (activeAppId && canQuit) quitApp(activeAppId);
	}

	function launchFromSpotlight(appId: string) {
		showSpotlight = false;
		openApp(appId, 'spotlight');
	}

	// ⌘Q as progressive enhancement — the reliable path is the menu (the host
	// browser often owns ⌘Q, codex plan review), so we only preventDefault when we
	// actually have a quittable active app.
	function onKeydown(e: KeyboardEvent) {
		if (done) return;
		if (e.metaKey && (e.key === 'q' || e.key === 'Q')) {
			if (activeAppId && canQuit) {
				e.preventDefault();
				quitActive();
			}
		}
	}

	const highlightDockAppId = $derived(
		showHint && !done && config.targetAppId && config.dockAppIds.includes(config.targetAppId)
			? config.targetAppId
			: null
	);

	function appLabel(id: string | null): string {
		return (id && config.apps.find((a: MacSimApp) => a.id === id)?.label) || 'Finder';
	}
</script>

<svelte:window onkeydown={onKeydown} />

<LessonTemplate {lesson} {onBack}>
	<div class="flex h-full min-h-0 flex-col items-center gap-3 py-2">
		<p class="max-w-xl text-center text-lg font-semibold text-foreground">{config.prompt}</p>

		<MacDesktop
			class="max-w-3xl flex-1"
			brightness={machine.brightness}
			dark={machine.appearance === 'dark'}
		>
			<MacMenuBar
				activeLabel={appLabel(activeAppId ?? finderApp?.id ?? null)}
				{canQuit}
				{machine}
				onQuit={quitActive}
				onSpotlight={() => (showSpotlight = true)}
				onOpenSettings={settingsApp ? openSettingsFromMenu : undefined}
				disabled={done}
			/>

			{#if frontApp}
				<MacWindow
					title={frontApp.label}
					icon={frontApp.icon}
					zoomed={Boolean(zoomed[frontApp.id])}
					onClose={() => closeWindow(frontApp.id)}
					onMinimize={() => minimizeWindow(frontApp.id)}
					onZoom={() => zoomWindow(frontApp.id)}
				>
					{#if frontApp.kind === 'finder'}
						<FinderMacApp folders={config.folders ?? []} {machine} onEvent={dispatch} />
					{:else if frontApp.kind === 'settings'}
						<MacSettingsApp onEvent={dispatch} {machine} />
					{:else}
						<div
							class="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-neutral-500"
						>
							<span class="text-5xl" aria-hidden="true">{frontApp.icon}</span>
							<p class="text-lg font-semibold text-neutral-800">{frontApp.label}</p>
							<p class="text-sm">
								Αυτό το πρόγραμμα είναι απλώς ανοιχτό για την άσκηση. Δοκίμασε τα τρία κουμπάκια
								πάνω αριστερά ή το μενού με το όνομά του.
							</p>
						</div>
					{/if}
				</MacWindow>
			{/if}

			<MacDock
				apps={config.apps}
				dockAppIds={config.dockAppIds}
				{runningAppIds}
				highlightAppId={highlightDockAppId}
				disabled={done}
				onOpen={(id) => openApp(id, 'dock')}
			/>

			{#if showSpotlight}
				<MacSpotlight
					apps={config.apps}
					seed={config.spotlightQuery ?? ''}
					onLaunch={launchFromSpotlight}
					onClose={() => (showSpotlight = false)}
				/>
			{/if}
		</MacDesktop>

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
