<script lang="ts">
	import { gameState } from '$lib/gameStore.svelte';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { CheckCircle, XCircle } from '@lucide/svelte';

	type Challenge = {
		id: number;
		title: string;
		instruction: string;
		target: string;
		completed: boolean;
		progressValue: number;
		validateFn?: (input: string) => boolean;
	};

	let challenges = $state<Challenge[]>([
		{
			id: 1,
			title: 'Το Όνομά μου',
			instruction: "Γράψε τη λέξη 'καλημέρα'",
			target: 'καλημέρα',
			completed: false,
			progressValue: 15
		},
		{
			id: 2,
			title: 'Φώναξέ το',
			instruction: "Γράψε τη λέξη 'ΕΛΛΑΔΑ' με κεφαλαία",
			target: 'ΕΛΛΑΔΑ',
			completed: false,
			progressValue: 30
		},
		{
			id: 3,
			title: 'Αθήνα (Shift)',
			instruction: "Γράψε τη λέξη 'Αθήνα' (Shift + 'α')",
			target: 'Αθήνα',
			completed: false,
			progressValue: 40
		},
		{
			id: 4,
			title: 'Ο Τονισμός',
			instruction: "Γράψε τη λέξη 'παιδί' (πάτα πρώτα τον τόνο ';', μετά το 'ι')",
			target: 'παιδί',
			completed: false,
			progressValue: 60
		},
		{
			id: 5,
			title: 'Ο Διορθωτής',
			instruction: "Διόρθωσε τη λέξη 'Καλημέρραα' σε 'Καλημέρα'",
			target: 'Καλημέρα',
			completed: false,
			progressValue: 75,
			validateFn: (input) => input === 'Καλημέρα'
		},
		{
			id: 6,
			title: 'Ο Δίγλωσσος',
			instruction: "Γράψε 'Hello' (ίσως χρειαστεί να αλλάξεις γλώσσα με Alt+Shift)",
			target: 'Hello',
			completed: false,
			progressValue: 90
		},
		{
			id: 7,
			title: 'Το Παπάκι',
			instruction: "Γράψε το email 'test@example.com' (Shift + 2 για το '@')",
			target: 'test@example.com',
			completed: false,
			progressValue: 100
		}
	]);

	let currentChallengeIndex = $state(0);
	let inputValue = $state('');
	let initialValueForCorrection = $state('');

	let currentChallenge = $derived(challenges[currentChallengeIndex]);
	let isCorrect = $derived(inputValue === currentChallenge.target);

	function setupCurrentChallenge() {
		inputValue = '';
		if (currentChallenge.id === 5) {
			// Correction challenge
			initialValueForCorrection = 'Καλημέρραα';
			inputValue = initialValueForCorrection;
		}
	}

	function checkAnswer() {
		let isValid = false;
		if (currentChallenge.validateFn) {
			isValid = currentChallenge.validateFn(inputValue);
		} else {
			isValid = isCorrect;
		}

		if (isValid) {
			currentChallenge.completed = true;
			toast.success(`Άσκηση ${currentChallenge.id}: Επιτυχία!`);
			gameState.updateProgress('module2', currentChallenge.progressValue);

			if (currentChallengeIndex < challenges.length - 1) {
				currentChallengeIndex++;
				setupCurrentChallenge();
			} else {
				toast.info('Ολοκλήρωσες όλες τις ασκήσεις πληκτρολογίου!');
			}
		} else {
			toast.error('Δεν είναι σωστό. Προσπάθησε ξανά!');
		}
	}

	$effect(setupCurrentChallenge);
</script>

<Card class="mx-auto max-w-xl">
	<CardHeader>
		<CardTitle>{currentChallenge.id}. {currentChallenge.title}</CardTitle>
		<CardDescription>{currentChallenge.instruction}</CardDescription>
	</CardHeader>
	<CardContent>
		<div class="relative">
			<Input
				type="text"
				bind:value={inputValue}
				onkeydown={(e) => {
					if (e.key === 'Enter') checkAnswer();
				}}
				class={`p-6 text-xl ${isCorrect ? 'border-green-500' : ''} ${!isCorrect && inputValue.length > 0 ? 'border-red-500' : ''}`}
				placeholder="Γράψε εδώ..."
				autocomplete="off"
				autocorrect="off"
				autocapitalize="off"
			/>
			<div class="absolute top-1/2 right-4 -translate-y-1/2">
				{#if isCorrect}
					<CheckCircle class="text-green-500" />
				{:else if inputValue.length > 0}
					<XCircle class="text-red-500" />
				{/if}
			</div>
		</div>

		<div class="mt-4 flex items-center justify-between">
			<div class="flex gap-1">
				{#each challenges as challenge, i}
					<button
						class="h-4 w-4 rounded-full transition-colors"
						class:bg-green-500={challenge.completed}
						class:bg-blue-500={!challenge.completed && i === currentChallengeIndex}
						class:bg-slate-300={!challenge.completed && i !== currentChallengeIndex}
						onclick={() => {
							currentChallengeIndex = i;
							setupCurrentChallenge();
						}}
						title={challenge.title}
					></button>
				{/each}
			</div>
			<Button onclick={checkAnswer} disabled={!isCorrect}>Επόμενο</Button>
		</div>
	</CardContent>
</Card>
