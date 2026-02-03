<script lang="ts">
	import type { Lesson } from '$lib/db/schema';
	import LessonTemplate from '../LessonTemplate.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { CheckCircle, Copy, Scissors, Clipboard } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import * as m from '$lib/paraglide/messages.js';

	interface Props {
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}

	let { lesson, onComplete, onBack }: Props = $props();

	// Parse config
	const config = lesson.config as {
		action: 'copy-paste' | 'cut-paste';
		sampleText?: string;
		sourceText?: string;
		targetField?: string;
	};

	let sourceValue = $state(config.sampleText || config.sourceText || 'Κείμενο για αντιγραφή');
	let targetValue = $state('');
	let completed = $state(false);

	const isCopy = $derived(config.action === 'copy-paste');
	const isCorrect = $derived(
		isCopy
			? targetValue === sourceValue
			: targetValue === (config.sampleText || config.sourceText || 'Κείμενο για αντιγραφή') &&
					sourceValue === ''
	);

	function checkAnswer() {
		if (isCorrect) {
			completed = true;
			toast.success(m.perfect ? m.perfect() : 'Perfect!');
			setTimeout(() => {
				onComplete(100);
			}, 1500);
		} else {
			if (isCopy) {
				toast.error('Το κείμενο στο δεύτερο πεδίο πρέπει να είναι ίδιο με το πρώτο.');
			} else {
				toast.error('Πρέπει να κάνεις αποκοπή από το πρώτο πεδίο και επικόλληση στο δεύτερο.');
			}
		}
	}
</script>

<LessonTemplate {lesson} {onBack}>
	<div class="copy-paste-lesson mx-auto max-w-2xl">
		<div class="instruction-card mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
			<h3 class="mb-2 flex items-center gap-2 text-lg font-medium text-slate-900">
				{#if isCopy}
					<Copy class="h-5 w-5 text-blue-500" />
					Αντιγραφή & Επικόλληση
				{:else}
					<Scissors class="h-5 w-5 text-red-500" />
					Αποκοπή & Επικόλληση
				{/if}
			</h3>
			<p class="text-slate-600">
				{#if isCopy}
					Επέλεξε το κείμενο στο πρώτο πεδίο, πάτα <span class="font-bold">Ctrl+C</span> για
					αντιγραφή και μετά πάτα στο δεύτερο πεδίο και πάτα <span class="font-bold">Ctrl+V</span> για
					επικόλληση.
				{:else}
					Επέλεξε το κείμενο στο πρώτο πεδίο, πάτα <span class="font-bold">Ctrl+X</span> για αποκοπή
					και μετά πάτα στο δεύτερο πεδίο και πάτα <span class="font-bold">Ctrl+V</span> για επικόλληση.
				{/if}
			</p>
		</div>

		<div class="space-y-6">
			<div class="field-group">
				<label class="mb-2 block text-sm font-medium text-slate-500">1. Πηγή (Source)</label>
				<Input
					type="text"
					value={sourceValue}
					oninput={(e) => (sourceValue = e.currentTarget.value)}
					readonly={isCopy}
					class="h-14 bg-slate-50 p-4 font-mono text-xl"
				/>
			</div>

			<div class="flex justify-center py-2">
				<div class="relative h-8 w-px bg-slate-200">
					<div
						class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-1"
					>
						<Clipboard class="h-4 w-4 text-slate-400" />
					</div>
				</div>
			</div>

			<div class="field-group">
				<label class="mb-2 block text-sm font-medium text-slate-500">2. Προορισμός (Target)</label>
				<Input
					type="text"
					bind:value={targetValue}
					onkeydown={(e) => {
						if (e.key === 'Enter') checkAnswer();
					}}
					class={`h-14 p-4 font-mono text-xl ${isCorrect ? 'border-green-500 ring-2 ring-green-100' : ''}`}
					placeholder="Επικόλλησε εδώ..."
				/>
			</div>
		</div>

		<div class="mt-8 flex justify-center">
			<Button size="lg" onclick={checkAnswer} disabled={!isCorrect} class="gap-2">
				{#if completed}
					<CheckCircle class="h-5 w-5" />
					Ολοκληρώθηκε
				{:else}
					Επόμενο
				{/if}
			</Button>
		</div>
	</div>
</LessonTemplate>

<style>
	.copy-paste-lesson {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: 50vh;
	}
</style>
