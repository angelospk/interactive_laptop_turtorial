<script lang="ts">
	import { resolve } from '$app/paths';
	import TextSizeToggle from '$lib/components/TextSizeToggle.svelte';
	import { tick } from 'svelte';
	import ScamSpotterLesson from '$lib/components/lessons/interactive/ScamSpotterLesson.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ShieldAlert, Mail, MessageSquare, MessageCircle, Phone } from 'lucide-svelte';

	let { data } = $props();

	// null = δείξε τη λίστα· αλλιώς ο δείκτης του τρέχοντος exercise
	let selected = $state<number | null>(null);
	let lastScore = $state<number | null>(null);

	const exercises = $derived(data.exercises);

	function start(i: number) {
		lastScore = null;
		selected = i;
	}

	// The drill keeps its result on screen; the learner leaves it when done
	// reading, and the list then remembers the score.
	function handleComplete(score: number) {
		lastScore = score;
	}

	// Back on the list, the keyboard lands on the exercise they came from rather
	// than at the top of a page that was rebuilt under them.
	// Pre-filled with null: `bind:ref` refuses an undefined slot.
	let startButtons = $state<(HTMLElement | null)[]>(data.exercises.map(() => null));
	async function handleBack() {
		const from = selected;
		selected = null;
		await tick();
		if (from !== null) startButtons[from]?.focus();
	}

	const channelIcons = { email: Mail, sms: MessageSquare, viber: MessageCircle, phone: Phone };
	const channelTitles = {
		email: 'Απάτες σε Email',
		sms: 'Απάτες σε SMS & μηνύματα',
		viber: 'Απάτες σε Viber & μηνύματα',
		phone: 'Απάτες σε τηλεφωνικές κλήσεις'
	};

	function channelOf(ex: (typeof exercises)[number]) {
		return (ex.config?.cards?.[0]?.channel ?? 'email') as keyof typeof channelIcons;
	}
	function iconFor(ex: (typeof exercises)[number]) {
		return channelIcons[channelOf(ex)] ?? Mail;
	}
	function titleFor(ex: (typeof exercises)[number]) {
		return channelTitles[channelOf(ex)] ?? 'Απάτες';
	}
</script>

<svelte:head>
	<title>Απάτη ή Όχι; — Δωρεάν εξάσκηση</title>
	<meta
		name="description"
		content="Εξασκηθείτε να ξεχωρίζετε τις απάτες (phishing) σε email και SMS. Χωρίς λογαριασμό, δωρεάν."
	/>
</svelte:head>

{#if selected !== null}
	{#key selected}
		<ScamSpotterLesson
			lesson={exercises[selected]}
			onComplete={handleComplete}
			onBack={handleBack}
		/>
	{/key}
{:else}
	<div class="mx-auto max-w-2xl px-4 py-8 sm:px-6">
		<div class="mb-4 flex justify-end"><TextSizeToggle /></div>
		<div class="mb-6 flex items-center gap-3">
			<ShieldAlert class="h-9 w-9 text-indigo-700" />
			<h1 class="text-3xl font-bold">Απάτη ή Όχι;</h1>
		</div>

		<p class="mb-6 text-lg leading-relaxed text-muted-foreground">
			Κάθε μέρα φτάνουν ψεύτικα μηνύματα που προσπαθούν να σας ξεγελάσουν. Εδώ εξασκείστε να τα
			ξεχωρίζετε — <strong>δωρεάν και χωρίς λογαριασμό</strong>. Διαβάστε κάθε μήνυμα και
			αποφασίστε: είναι απάτη ή νόμιμο;
		</p>

		{#if lastScore !== null}
			<div
				class="mb-6 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-green-800"
				role="status"
			>
				Μπράβο! Ολοκληρώσατε με σκορ <strong>{lastScore}%</strong>. Δοκιμάστε ξανά ή κάντε την άλλη
				άσκηση.
			</div>
		{/if}

		<div class="grid gap-4 sm:grid-cols-2">
			{#each exercises as ex, i (ex.id)}
				{@const Icon = iconFor(ex)}
				<Card class="transition-shadow hover:shadow-md">
					<CardHeader>
						<CardTitle class="flex items-center gap-2 text-xl">
							<Icon class="h-5 w-5 text-indigo-700" />
							{titleFor(ex)}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="mb-4 text-sm text-muted-foreground">
							{ex.config?.cards?.length ?? 0} μηνύματα για εξάσκηση.
						</p>
						<Button bind:ref={startButtons[i]} class="h-12 w-full text-lg" onclick={() => start(i)}
							>Ξεκινήστε</Button
						>
					</CardContent>
				</Card>
			{/each}
		</div>

		<p class="mt-8 text-center text-base text-muted-foreground">
			Θέλετε περισσότερο υλικό; Δείτε τη
			<a class="inline-block py-2 text-primary underline" href={resolve('/library')}
				>Βιβλιοθήκη Θεωρίας</a
			>.
		</p>
	</div>
{/if}
