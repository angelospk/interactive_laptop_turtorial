<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
	import { Label } from '$lib/components/ui/label';
	import { CheckCircle2, XCircle, HelpCircle } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { Lesson } from '$lib/db/schema';
	import * as m from '$lib/paraglide/messages.js';

	let { lesson, onComplete, onBack } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}>();

	// Config: { questions: [{id: "q1", text: "...", options: [...]}, ...] }
	const config = lesson.config as any;
	const questions = config.questions || [config]; // Fallback for single question config

	let currentQuestionIndex = $state(0);
	let selectedOption = $state<string | null>(null);
	let submitted = $state(false);
	let isCorrect = $state(false);
	let score = $state(0);
	let quizComplete = $state(false);

	let currentQuestion = $derived(questions[currentQuestionIndex]);

	function t(key: string) {
		// @ts-ignore
		return m[key]?.() || key;
	}

	function handleSubmit() {
		if (!selectedOption) return;

		const option = currentQuestion.options.find((o: any) => o.id === selectedOption);
		submitted = true;
		isCorrect = !!option?.correct;

		if (isCorrect) {
			toast.success(t('very_good') || 'Correct!');
			score++;
		} else {
			toast.error(t('wrong_answer') || 'Incorrect');
		}
	}

	function handleNext() {
		if (currentQuestionIndex < questions.length - 1) {
			currentQuestionIndex++;
			selectedOption = null;
			submitted = false;
			isCorrect = false;
		} else {
			finishQuiz();
		}
	}

	function finishQuiz() {
		quizComplete = true;
		const finalScore = Math.round((score / questions.length) * 100);
		setTimeout(() => {
			onComplete(finalScore);
		}, 1500);
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
				{#if questions.length > 1}
					<span class="ml-auto text-sm opacity-80">
						{currentQuestionIndex + 1} / {questions.length}
					</span>
				{/if}
			</CardTitle>
		</CardHeader>
		<CardContent class="space-y-8 p-8">
			{#if !quizComplete}
				<div class="text-xl font-medium text-slate-800">
					{t(currentQuestion.text || currentQuestion.question)}
				</div>

				<RadioGroup bind:value={selectedOption} class="space-y-4" disabled={submitted}>
					{#each currentQuestion.options as option (option.id)}
						<div
							class="flex items-center space-x-2 rounded-lg border p-4 transition-colors hover:bg-slate-50
                            {submitted && option.id === selectedOption
								? option.correct
									? 'border-green-500 bg-green-50'
									: 'border-red-500 bg-red-50'
								: ''}
                            {selectedOption === option.id
								? 'border-blue-500 ring-1 ring-blue-500'
								: 'border-slate-200'}
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
						{#if currentQuestion.explanation}
							<p>{t(currentQuestion.explanation || '')}</p>
						{/if}
					</div>
				{/if}
			{:else}
				<div class="text-center">
					<h2 class="mb-4 text-2xl font-bold text-slate-800">Quiz Completed!</h2>
					<p class="text-xl">Score: {score} / {questions.length}</p>
				</div>
			{/if}
		</CardContent>
		<CardFooter class="flex justify-between rounded-b-lg border-t bg-slate-50 p-6">
			<Button variant="ghost" onclick={onBack}>
				{t('back') || 'Back'}
			</Button>

			{#if !quizComplete}
				{#if !submitted}
					<Button size="lg" onclick={handleSubmit} disabled={!selectedOption}>
						{t('submit_answer') || 'Submit Answer'}
					</Button>
				{:else if isCorrect}
					<Button size="lg" onclick={handleNext}>
						{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish'}
					</Button>
				{:else}
					<Button size="lg" variant="secondary" onclick={handleRetry}>
						{t('try_again') || 'Try Again'}
					</Button>
				{/if}
			{/if}
		</CardFooter>
	</Card>
</div>
