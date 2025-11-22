<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { Lesson } from '$lib/db/schema';
	import { Input } from '$lib/components/ui/input';

	let { lesson, onComplete } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
	}>();

	let config = $derived(
		(lesson.config as { text: string; timeLimit: number }) || { text: 'simple', timeLimit: 60 }
	);

	let targetText = $state('');
	let userInput = $state('');

	// Simple text mapping for demo purposes
	const textMap: Record<string, string> = {
		simple: 'hello world',
		capitals: 'Hello World',
		'mixed-case': 'Svelte is Awesome',
		accents: 'καλημέρα',
		'with-errors': 'Please fix this tpo', // Intentionally misspelled if we wanted correction logic, but for now simple match
		'special-chars': 'user@example.com',
		paragraph: 'The quick brown fox jumps over the lazy dog.',
		'full-test': 'Programming is fun and rewarding.'
	};

	$effect(() => {
		targetText = textMap[config.text] || config.text || 'hello';
		userInput = '';
	});

	function handleInput() {
		if (userInput === targetText) {
			toast.success('Lesson Completed!');
			onComplete(100);
		}
	}
</script>

<div class="flex flex-col gap-6 rounded-md border border-slate-200 bg-slate-50 p-8">
	<div class="text-center">
		<p class="mb-2 text-sm text-slate-500">Type the following text:</p>
		<p
			class="inline-block rounded border border-slate-200 bg-white p-4 font-mono text-2xl font-bold text-slate-800 select-none"
		>
			{targetText}
		</p>
	</div>

	<div class="mx-auto w-full max-w-md">
		<Input
			bind:value={userInput}
			oninput={handleInput}
			placeholder="Type here..."
			class="text-center text-lg"
			autofocus
		/>
	</div>

	<div class="h-6 text-center text-sm text-slate-400">
		{#if userInput === targetText}
			<span class="animate-in font-bold text-green-600 fade-in">Perfect match!</span>
		{:else if userInput.length > 0}
			{#if targetText.startsWith(userInput)}
				<span class="text-blue-600">Keep going...</span>
			{:else}
				<span class="text-red-500">Typing error</span>
			{/if}
		{/if}
	</div>
</div>
