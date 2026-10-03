<script lang="ts">
	import { tick } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import type { Lesson } from '$lib/db/schema';
	import { Button } from '$lib/components/ui/button';
	import { Volume2, VolumeX, RotateCcw, LogOut } from '@lucide/svelte';
	import BrowserApp from '$lib/components/apps/BrowserApp.svelte';
	import GuideSpotlight from '../GuideSpotlight.svelte';
	import { guides, COMMON_CLIPS, hintClip } from '$lib/guides';
	import { allClips } from '$lib/guides/scripts';
	import {
		createGuide,
		begin,
		proceed,
		answer,
		clipEnded,
		summary,
		type Answer,
		type GuideState
	} from '$lib/guides/machine';
	import { createGuideAudio } from '$lib/guides/audio';
	import { createIdleWatcher } from '$lib/guides/idle';

	let { lesson, onComplete, onBack } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}>();

	// Lesson content is Greek by design, like the scripts it plays.
	const MUTE_KEY = 'guide-muted';
	const clips = allClips();
	// A guide lesson never changes under the component (LessonRenderer keys it by id).
	const lessonId = lesson.id;
	const guide = guides[(lesson.config as { guideId?: string } | null)?.guideId ?? ''];
	// Handed over once: BrowserApp resets its tabs whenever `config` is read anew,
	// so passing `tour.guide.simConfig` would reset the demo on every step.
	const simConfig = guide?.simConfig ?? {};

	let tour = $state.raw<GuideState | null>(guide ? createGuide(guide) : null);
	const startMuted = typeof localStorage !== 'undefined' && localStorage.getItem(MUTE_KEY) === '1';
	let muted = $state(startMuted);
	/** An idle nudge speaking over the current step; null = the guide's own clip. */
	let nudgeClip = $state<string | null>(null);
	let nudges = $state(0);
	/** Last clip with words, so the caption does not go blank between clips. */
	let lastClip = $state<string | null>(null);
	let unsaved = $state<Record<string, Answer>>({});
	let finishing = $state(false);
	let refreshFailed = $state(false);
	let stage = $state<HTMLElement>();
	/** Bumped to put the demo back as it started (see `ensureTarget`). */
	let simEpoch = $state(0);

	const audio = createGuideAudio({ muted: startMuted });
	const idle = createIdleWatcher({
		firstMs: 30_000,
		secondMs: 75_000,
		onNudge(level) {
			if (!tour || tour.phase !== 'step') return;
			const step = tour.guide.steps[tour.stepIndex];
			const id =
				level === 1
					? COMMON_CLIPS.idle[nudges % COMMON_CLIPS.idle.length]
					: hintClip(tour.guide, step);
			nudges++;
			nudgeClip = id;
			// When the nudge is over, the step's own words come back (caption and «Ξανά»).
			say(id, () => {
				if (nudgeClip === id) nudgeClip = null;
			});
		}
	});

	$effect(() => () => {
		audio.stop();
		idle.stop();
	});

	let step = $derived(tour && tour.phase !== 'start' ? tour.guide.steps[tour.stepIndex] : null);
	let shownClip = $derived(nudgeClip ?? tour?.clip ?? lastClip);
	let caption = $derived(shownClip ? (clips.get(shownClip)?.caption ?? '') : '');
	let spotlight = $derived(
		tour && (tour.phase === 'step' || tour.phase === 'feedback') ? (step?.target ?? null) : null
	);
	let hinting = $derived(
		nudgeClip !== null && step !== null && nudgeClip === hintClip(tour!.guide, step)
	);
	let result = $derived(tour ? summary(tour) : { known: 0, total: 0 });

	function say(id: string, onEnd: () => void) {
		lastClip = id;
		audio.play(id, clips.get(id)?.caption ?? '', onEnd);
	}

	/** Every transition goes through here: it plays the new clip and arms the idle help. */
	function go(next: GuideState) {
		const prev = tour;
		if (next === prev) return;
		tour = next;
		nudgeClip = null;
		if (next.clip && next.clip !== prev?.clip) say(next.clip, () => tour && go(clipEnded(tour)));
		if (next.phase === 'step' && (prev?.phase !== 'step' || prev.stepIndex !== next.stepIndex)) {
			nudges = 0;
			idle.reset();
			ensureTarget(next.guide.steps[next.stepIndex].target);
		} else if (next.phase !== 'step') {
			idle.stop();
		}
	}

	// The learner may have clicked away from what this step shows (another tab,
	// another page). Rather than pointing at nothing, put the demo back.
	async function ensureTarget(target: string) {
		await tick();
		if (stage && !stage.querySelector(`[data-guide="${target}"]`)) simEpoch++;
	}

	const focusOnMount = (el: HTMLElement) => el.focus();

	let lastActivity = 0;
	function activity() {
		if (tour?.phase !== 'step') return;
		const now = Date.now();
		if (now - lastActivity < 1000) return;
		lastActivity = now;
		idle.reset();
	}

	function toggleMute() {
		muted = !muted;
		audio.setMuted(muted);
		localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
	}

	function replay() {
		if (!shownClip) return;
		const id = shownClip;
		// Replaying the guide's own clip keeps its ending (feedback still moves on).
		if (id === tour?.clip) say(id, () => tour && go(clipEnded(tour)));
		else say(id, () => {});
	}

	function respond(kind: Answer) {
		if (!tour || tour.phase !== 'step') return;
		const ids = tour.guide.steps[tour.stepIndex].lessonIds;
		for (const id of ids) latest[id] = kind;
		go(answer(tour, kind));
		if (ids.length) save(Object.fromEntries(ids.map((id) => [id, kind])));
	}

	// Answers go out one after another, in the order given; a failed one is
	// tried once more, then kept for the retry at the end. Each request sends
	// only answers that are still the learner's latest, so a retried old answer
	// can never land after a newer one.
	const latest: Record<string, Answer> = {};
	let queue: Promise<unknown> = Promise.resolve();
	function save(answers: Record<string, Answer>) {
		queue = queue.then(async () => {
			const current = Object.fromEntries(
				Object.entries(answers).filter(([id, kind]) => latest[id] === kind)
			);
			if (Object.keys(current).length === 0) return;
			const rest = { ...unsaved };
			for (const id of Object.keys(answers)) delete rest[id];
			if ((await send(current)) || (await send(current))) {
				unsaved = rest;
				return;
			}
			unsaved = { ...rest, ...current };
		});
		return queue;
	}

	async function send(answers: Record<string, Answer>) {
		try {
			const res = await fetch('/api/lessons/guide-answers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ guideLessonId: lessonId, answers })
			});
			return res.ok;
		} catch {
			return false;
		}
	}

	function retryUnsaved() {
		const pending = unsaved;
		unsaved = {};
		save(pending);
	}

	// The guide counts as done only once every answer is stored, and after the
	// page's progress is refreshed: Next must already see the new green lessons.
	async function finish() {
		finishing = true;
		refreshFailed = false;
		await queue;
		if (Object.keys(unsaved).length) {
			retryUnsaved();
			await queue;
		}
		if (Object.keys(unsaved).length) {
			finishing = false;
			return;
		}
		try {
			await invalidateAll();
		} catch {
			refreshFailed = true;
			finishing = false;
			return;
		}
		finishing = false;
		audio.stop();
		onComplete(100);
	}

	function exit() {
		audio.stop();
		idle.stop();
		onBack();
	}
</script>

<svelte:window onpointerdown={activity} onpointermove={activity} onkeydown={activity} />

{#if !guide || !tour}
	<div class="p-8 text-center" role="alert">
		<p class="text-lg">Αυτός ο οδηγός δεν βρέθηκε.</p>
		<Button class="mt-4" onclick={onBack}>Πίσω στα μαθήματα</Button>
	</div>
{:else}
	{#snippet soundControls()}
		<Button
			variant="outline"
			class="min-h-12 gap-2 px-4 text-base"
			onclick={toggleMute}
			aria-pressed={muted}
		>
			{#if muted}
				<VolumeX class="h-6 w-6" /> Άνοιγμα φωνής
			{:else}
				<Volume2 class="h-6 w-6" /> Σίγαση
			{/if}
		</Button>
		<Button
			variant="outline"
			class="min-h-12 gap-2 px-4 text-base"
			onclick={replay}
			disabled={!shownClip || tour?.phase === 'start'}
		>
			<RotateCcw class="h-6 w-6" /> Ξανά
		</Button>
	{/snippet}

	<div class="mx-auto flex w-full max-w-6xl flex-col gap-3 p-3">
		<div
			bind:this={stage}
			class="relative h-[min(50vh,520px)] min-h-[340px] overflow-hidden rounded-xl border-2 border-slate-300 shadow-sm"
		>
			<div class="h-full" inert={tour.phase === 'start'}>
				{#key simEpoch}
					<BrowserApp config={simConfig} onAction={activity} />
				{/key}
			</div>
			<GuideSpotlight container={stage} target={spotlight} />

			{#if tour.phase === 'start'}
				<div class="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4">
					<div class="max-w-lg rounded-2xl bg-white p-8 text-center shadow-2xl">
						<h2 class="mb-3 text-2xl font-bold">Ένας σύντομος οδηγός</h2>
						<p class="mb-6 text-lg text-slate-700">
							Θα σας δείξω ένα-ένα τα κουμπιά, με φωνή και γραμμένο κείμενο. Ανοίξτε τον ήχο του
							υπολογιστή, αν θέλετε να με ακούτε.
						</p>
						<Button
							class="min-h-14 px-10 text-xl"
							onclick={() => tour && go(begin(tour))}
							{@attach focusOnMount}
						>
							Ξεκινάμε
						</Button>
					</div>
				</div>
			{/if}
		</div>

		<!-- The card holds everything the learner needs, sound controls and the
		     way out included, and stays on screen while the page scrolls. -->
		<div class="sticky bottom-2 z-40 rounded-2xl border-2 border-brand/30 bg-white p-5 shadow-md">
			<div class="mb-2 flex flex-wrap items-center justify-between gap-2">
				<p class="text-sm font-semibold text-muted-foreground">
					{#if step && (tour.phase === 'step' || tour.phase === 'feedback')}
						Βήμα {tour.stepIndex + 1} από {tour.guide.steps.length}
					{/if}
				</p>
				<div class="flex gap-2">{@render soundControls()}</div>
			</div>
			{#if tour.phase === 'done'}
				<!-- The answer buttons it replaces had the focus; it moves here, not to <body>. -->
				<h2 class="mb-2 text-2xl font-bold" tabindex="-1" {@attach focusOnMount}>
					Ξέρατε {result.known} από τα {result.total}
				</h2>
			{/if}
			<p class="text-xl leading-relaxed" aria-live="polite" data-testid="guide-caption">
				{caption}
			</p>

			<div class="mt-5 flex flex-wrap items-center gap-3">
				{#if tour.phase === 'intro'}
					<Button class="min-h-14 px-10 text-xl" onclick={() => tour && go(proceed(tour))}>
						Πάμε!
					</Button>
				{:else if tour.phase === 'step' || tour.phase === 'feedback'}
					<Button
						class={[
							'min-h-14 flex-1 bg-green-600 px-8 text-xl text-white hover:bg-green-700',
							hinting && 'motion-safe:animate-pulse'
						]}
						disabled={tour.phase !== 'step'}
						onclick={() => respond('known')}
					>
						Το ξέρω ✓
					</Button>
					<Button
						variant="outline"
						class={[
							'min-h-14 flex-1 border-2 px-8 text-xl',
							hinting && 'motion-safe:animate-pulse'
						]}
						disabled={tour.phase !== 'step'}
						onclick={() => respond('unknown')}
					>
						Δεν το ξέρω
					</Button>
				{:else if tour.phase === 'done'}
					{#if refreshFailed}
						<div class="w-full rounded-lg bg-amber-50 p-3 text-lg text-amber-900" role="alert">
							Η πρόοδός σας αποθηκεύτηκε, αλλά η σελίδα δεν ανανεώθηκε. Πατήστε «Συνέχεια» ξανά.
						</div>
					{/if}
					{#if Object.keys(unsaved).length}
						<div class="w-full rounded-lg bg-amber-50 p-3 text-lg text-amber-900" role="alert">
							Κάποιες απαντήσεις δεν αποθηκεύτηκαν. Ελέγξτε τη σύνδεση και πατήστε «Ξαναδοκιμάστε».
							<Button
								variant="outline"
								class="ml-2 min-h-12"
								onclick={retryUnsaved}
								disabled={finishing}
							>
								Ξαναδοκιμάστε
							</Button>
						</div>
					{/if}
					<Button class="min-h-14 px-10 text-xl" onclick={finish} disabled={finishing}>
						Συνέχεια
					</Button>
				{/if}
				<Button variant="ghost" class="ml-auto min-h-12 gap-2 px-4 text-base" onclick={exit}>
					<LogOut class="h-5 w-5" /> Έξοδος
				</Button>
			</div>
		</div>
	</div>
{/if}
