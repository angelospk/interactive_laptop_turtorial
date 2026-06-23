<script lang="ts">
	import ScamSpotterLesson from '$lib/components/lessons/interactive/ScamSpotterLesson.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ShieldAlert, Mail, MessageSquare } from 'lucide-svelte';

	let { data } = $props();

	// null = δείξε τη λίστα· αλλιώς ο δείκτης του τρέχοντος exercise
	let selected = $state<number | null>(null);
	let lastScore = $state<number | null>(null);

	const exercises = data.exercises;

	function start(i: number) {
		lastScore = null;
		selected = i;
	}

	function handleComplete(score: number) {
		lastScore = score;
		selected = null;
	}

	function handleBack() {
		selected = null;
	}

	function iconFor(ex: (typeof exercises)[number]) {
		return ex.config?.cards?.[0]?.channel === 'sms' ? MessageSquare : Mail;
	}

	function titleFor(ex: (typeof exercises)[number]) {
		return ex.config?.cards?.[0]?.channel === 'sms'
			? 'Απάτες σε SMS & μηνύματα'
			: 'Απάτες σε Email';
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
		<div class="mb-6 flex items-center gap-3">
			<ShieldAlert class="h-9 w-9 text-indigo-700" />
			<h1 class="text-3xl font-bold">Απάτη ή Όχι;</h1>
		</div>

		<p class="text-muted-foreground mb-6 text-lg leading-relaxed">
			Κάθε μέρα φτάνουν ψεύτικα μηνύματα που προσπαθούν να σας ξεγελάσουν. Εδώ εξασκείστε να τα
			ξεχωρίζετε — <strong>δωρεάν και χωρίς λογαριασμό</strong>. Διαβάστε κάθε μήνυμα και αποφασίστε:
			είναι απάτη ή νόμιμο;
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
						<p class="text-muted-foreground mb-4 text-sm">
							{ex.config?.cards?.length ?? 0} μηνύματα για εξάσκηση.
						</p>
						<Button class="w-full" onclick={() => start(i)}>Ξεκινήστε</Button>
					</CardContent>
				</Card>
			{/each}
		</div>

		<p class="text-muted-foreground mt-8 text-center text-sm">
			Θέλετε περισσότερο υλικό; Δείτε τη
			<a class="text-primary underline" href="/library">Βιβλιοθήκη Θεωρίας</a>.
		</p>
	</div>
{/if}
