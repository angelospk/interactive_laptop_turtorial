<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import {
		ShieldAlert,
		CheckCircle2,
		XCircle,
		Mail,
		MessageSquare,
		Link as LinkIcon,
		Lightbulb
	} from 'lucide-svelte';
	import type { Lesson } from '$lib/db/schema';

	let { lesson, onComplete, onBack } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}>();

	interface ScamCard {
		id: string;
		channel: 'email' | 'sms';
		from: string;
		fromAddress?: string;
		subject?: string;
		body: string;
		link?: string;
		isScam: boolean;
		redFlags: string[];
		explanation: string;
		takeaway?: string;
	}

	const config = $derived(lesson.config as { instructions?: string; cards?: ScamCard[] });
	const cards = $derived(Array.isArray(config?.cards) ? config.cards : []);
	const total = $derived(cards.length);

	let index = $state(0);
	let correctCount = $state(0);
	// null = not answered yet; otherwise the user's verdict (true = "scam")
	let answer = $state<boolean | null>(null);
	let finished = $state(false);
	let completed = $state(false); // guards against double onComplete

	const card = $derived(cards[index] as ScamCard | undefined);
	const wasCorrect = $derived(answer !== null && card ? answer === card.isScam : false);
	const isLast = $derived(index >= total - 1);

	function choose(verdict: boolean) {
		if (answer !== null || !card) return; // already answered
		answer = verdict;
		if (verdict === card.isScam) correctCount++;
	}

	function next() {
		if (answer === null) return;
		if (isLast) {
			finish();
			return;
		}
		index++;
		answer = null;
	}

	function finish() {
		if (completed) return;
		completed = true;
		finished = true;
		const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
		setTimeout(() => onComplete(score), 1400);
	}
</script>

<div class="flex min-h-[600px] w-full items-center justify-center bg-slate-100 p-4">
	<Card class="w-full max-w-2xl shadow-lg">
		<CardHeader class="rounded-t-lg bg-indigo-700 text-white">
			<CardTitle class="flex items-center gap-2 text-2xl">
				<ShieldAlert class="h-6 w-6" />
				Απάτη ή Όχι;
				{#if total > 1}
					<span class="ml-auto text-sm opacity-80">{Math.min(index + 1, total)} / {total}</span>
				{/if}
			</CardTitle>
		</CardHeader>

		<CardContent class="space-y-6 p-6 sm:p-8">
			{#if total === 0}
				<p class="text-center text-slate-600">Δεν υπάρχει διαθέσιμο περιεχόμενο.</p>
			{:else if finished}
				<div class="py-8 text-center">
					<CheckCircle2 class="mx-auto mb-4 h-14 w-14 text-green-600" />
					<h2 class="mb-2 text-2xl font-bold text-slate-800">Ολοκληρώθηκε!</h2>
					<p class="text-xl text-slate-700">Σωστές απαντήσεις: {correctCount} / {total}</p>
				</div>
			{:else if card}
				{#if config.instructions}
					<p class="text-center text-base text-slate-600">{config.instructions}</p>
				{/if}

				<!-- Message card -->
				<div class="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
					{#if card.channel === 'email'}
						<div class="flex items-start gap-3 border-b border-slate-200 bg-slate-50 p-4">
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700"
								aria-hidden="true"
							>
								<Mail class="h-5 w-5" />
							</div>
							<div class="min-w-0 flex-1">
								<p class="font-semibold text-slate-900">{card.from}</p>
								{#if card.fromAddress}
									<p class="truncate text-sm text-slate-500">
										<span class="sr-only">Διεύθυνση αποστολέα: </span>{card.fromAddress}
									</p>
								{/if}
							</div>
						</div>
						<div class="space-y-3 p-4">
							{#if card.subject}
								<p class="text-lg font-semibold text-slate-900">{card.subject}</p>
							{/if}
							<p class="whitespace-pre-line leading-relaxed text-slate-700">{card.body}</p>
							{#if card.link}
								<p
									class="flex items-center gap-2 break-all rounded-md bg-slate-100 p-2 font-mono text-sm text-blue-700"
								>
									<LinkIcon class="h-4 w-4 shrink-0" aria-hidden="true" />
									<span><span class="sr-only">Σύνδεσμος: </span>{card.link}</span>
								</p>
							{/if}
						</div>
					{:else}
						<!-- SMS bubble -->
						<div class="flex items-center gap-2 border-b border-slate-200 bg-slate-50 p-3">
							<MessageSquare class="h-5 w-5 text-slate-500" aria-hidden="true" />
							<p class="font-semibold text-slate-900">
								<span class="sr-only">Αποστολέας: </span>{card.from}
							</p>
						</div>
						<div class="p-4">
							<div class="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 p-3">
								<p class="whitespace-pre-line leading-relaxed text-slate-800">{card.body}</p>
								{#if card.link}
									<p class="mt-1 break-all font-mono text-sm text-blue-700">
										<span class="sr-only">Σύνδεσμος: </span>{card.link}
									</p>
								{/if}
							</div>
						</div>
					{/if}
				</div>

				<!-- Verdict buttons -->
				{#if answer === null}
					<div class="flex flex-col gap-3 sm:flex-row">
						<button
							type="button"
							onclick={() => choose(true)}
							class="flex-1 rounded-lg border-2 border-red-300 bg-red-50 px-4 py-4 text-lg font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
						>
							🚩 Απάτη
						</button>
						<button
							type="button"
							onclick={() => choose(false)}
							class="flex-1 rounded-lg border-2 border-green-300 bg-green-50 px-4 py-4 text-lg font-semibold text-green-700 transition-colors hover:bg-green-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
						>
							✓ Νόμιμο
						</button>
					</div>
				{:else}
					<!-- Feedback / reveal -->
					<div aria-live="polite" class="space-y-4">
						<div
							class="flex items-center gap-2 rounded-lg p-3 font-bold {wasCorrect
								? 'bg-green-100 text-green-800'
								: 'bg-red-100 text-red-800'}"
						>
							{#if wasCorrect}
								<CheckCircle2 class="h-6 w-6" aria-hidden="true" /> Σωστά!
							{:else}
								<XCircle class="h-6 w-6" aria-hidden="true" /> Λάθος.
							{/if}
							<span class="font-medium">
								Αυτό το μήνυμα είναι {card.isScam ? 'ΑΠΑΤΗ' : 'ΝΟΜΙΜΟ'}.
							</span>
						</div>

						<div class="rounded-lg border border-slate-200 bg-white p-4">
							<p class="mb-2 font-semibold text-slate-800">
								{card.isScam ? 'Σημάδια που το προδίδουν:' : 'Γιατί είναι ασφαλές:'}
							</p>
							<ul class="space-y-1.5">
								{#each card.redFlags as flag (flag)}
									<li class="flex gap-2 text-slate-700">
										<span class="mt-1 shrink-0 text-slate-400" aria-hidden="true">•</span>
										<span>{flag}</span>
									</li>
								{/each}
							</ul>
							<p class="mt-3 leading-relaxed text-slate-600">{card.explanation}</p>
							{#if card.takeaway}
								<p
									class="mt-3 flex gap-2 rounded-md bg-amber-50 p-3 text-amber-900"
								>
									<Lightbulb class="h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
									<span class="font-medium">{card.takeaway}</span>
								</p>
							{/if}
						</div>
					</div>
				{/if}
			{/if}
		</CardContent>

		<CardFooter class="flex justify-between rounded-b-lg border-t bg-slate-50 p-6">
			<Button variant="ghost" onclick={onBack}>Πίσω</Button>
			{#if !finished && card && answer !== null}
				<Button size="lg" onclick={next}>
					{isLast ? 'Ολοκλήρωση' : 'Επόμενο'}
				</Button>
			{/if}
		</CardFooter>
	</Card>
</div>
