<script lang="ts">
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
	let stage = $state<HTMLElement>();

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
			say(id, () => {});
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
		} else if (next.phase !== 'step') {
			idle.stop();
		}
	}

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
		go(answer(tour, kind));
		if (ids.length) save(Object.fromEntries(ids.map((id) => [id, kind])));
	}

	// Answers go out one after another, in the order given; a failed one is
	// tried once more, then kept for the retry button at the end.
	let queue: Promise<unknown> = Promise.resolve();
	function save(answers: Record<string, Answer>) {
		queue = queue.then(async () => {
			if (await send(answers)) return;
			if (await send(answers)) return;
			unsaved = { ...unsaved, ...answers };
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

	async function finish() {
		finishing = true;
		await queue;
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
			<BrowserApp config={tour.guide.simConfig} onAction={activity} />
			<GuideSpotlight container={stage} target={spotlight} />

			{#if tour.phase === 'start'}
				<div class="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4">
					<div class="max-w-lg rounded-2xl bg-white p-8 text-center shadow-2xl">
						<h2 class="mb-3 text-2xl font-bold">Ένας σύντομος οδηγός</h2>
						<p class="mb-6 text-lg text-slate-700">
							Θα σας δείξω ένα-ένα τα κουμπιά, με φωνή και γραμμένο κείμενο. Ανοίξτε τον ήχο του
							υπολογιστή, αν θέλετε να με ακούτε.
						</p>
						<Button class="min-h-14 px-10 text-xl" onclick={() => tour && go(begin(tour))}>
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
				<h2 class="mb-2 text-2xl font-bold">
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
					{#if Object.keys(unsaved).length}
						<div class="w-full rounded-lg bg-amber-50 p-3 text-lg text-amber-900" role="alert">
							Κάποιες απαντήσεις δεν αποθηκεύτηκαν. Ελέγξτε τη σύνδεση και πατήστε «Ξαναδοκιμάστε».
							<Button variant="outline" class="ml-2 min-h-12" onclick={retryUnsaved}>
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
