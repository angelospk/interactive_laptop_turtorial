<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
	import { Label } from '$lib/components/ui/label';
	import { CheckCircle2, XCircle, HelpCircle } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { Lesson } from '$lib/db/schema';
	import * as m from '$lib/paraglide/messages';

	let { lesson, onComplete, onBack } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}>();

	// Config: { question: "key_or_text", options: [{id: "a", text: "key_or_text", correct: true}, ...], explanation: "key_or_text" }
	const config = lesson.config as any;

	let selectedOption = $state<string | null>(null);
	let submitted = $state(false);
	let isCorrect = $state(false);

	function t(key: string) {
		// @ts-ignore
		return m[key]?.() || key;
	}

	function handleSubmit() {
		if (!selectedOption) return;

		const option = config.options.find((o: any) => o.id === selectedOption);
		submitted = true;
		isCorrect = !!option?.correct;

		if (isCorrect) {
			toast.success(t('very_good') || 'Correct!');
			setTimeout(() => {
				onComplete(100);
			}, 2000);
		} else {
			toast.error(t('try_again') || 'Try again');
		}
	}

	function handleRetry() {
		submitted = false;
		selectedOption = null;
		isCorrect = false;
	}
</script>

<div class="flex min-h-[600px] w-full items-center justify-center bg-slate-50 p-4">
	<Card class="w-full max-w-2xl shadow-lg">
		<CardHeader class="rounded-t-lg bg-blue-600 text-white">
			<CardTitle class="flex items-center gap-2 text-2xl">
				<HelpCircle class="h-6 w-6" />
				{t('quiz_title') || 'Quiz'}
			</CardTitle>
		</CardHeader>
		<CardContent class="space-y-8 p-8">
			<div class="text-xl font-medium text-slate-800">
				{t(config.question)}
			</div>

			<RadioGroup bind:value={selectedOption} class="space-y-4" disabled={submitted && isCorrect}>
				{#each config.options as option (option.id)}
					<div
						class="flex items-center space-x-2 rounded-lg border p-4 transition-colors hover:bg-slate-50
						{submitted && option.id === selectedOption
							? option.correct
								? 'border-green-500 bg-green-50'
								: 'border-red-500 bg-red-50'
							: ''}
						{selectedOption === option.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'}
					"
					>
						<RadioGroupItem value={option.id} id={option.id} />
						<Label for={option.id} class="flex-1 cursor-pointer text-lg font-normal">
							{t(option.text)}
						</Label>
						{#if submitted && option.id === selectedOption}
							{#if option.correct}
								<CheckCircle2 class="h-6 w-6 text-green-600" />
							{:else}
								<XCircle class="h-6 w-6 text-red-600" />
							{/if}
						{/if}
					</div>
				{/each}
			</RadioGroup>

			{#if submitted}
				<div
					class="rounded-lg p-4 {isCorrect
						? 'bg-green-100 text-green-800'
						: 'bg-red-100 text-red-800'} animate-in fade-in slide-in-from-top-2"
				>
					<p class="mb-1 font-bold">
						{isCorrect ? t('correct_answer') || 'Correct!' : t('wrong_answer') || 'Incorrect'}
					</p>
					<p>{t(config.explanation)}</p>
				</div>
			{/if}
		</CardContent>
		<CardFooter class="flex justify-between rounded-b-lg border-t bg-slate-50 p-6">
			<Button variant="ghost" onclick={onBack}>
				{t('back') || 'Back'}
			</Button>

			{#if !submitted || !isCorrect}
				<Button
					size="lg"
					onclick={submitted ? handleRetry : handleSubmit}
					disabled={!selectedOption}
					variant={submitted ? 'secondary' : 'default'}
				>
					{submitted ? t('try_again') || 'Try Again' : t('submit_answer') || 'Submit Answer'}
				</Button>
			{/if}
		</CardFooter>
	</Card>
</div>
