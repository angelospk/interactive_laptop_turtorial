<script lang="ts">
	import { parseInstructionSteps } from '$lib/lessons/instructionSteps';

	let { text }: { text: string } = $props();

	const parsed = $derived(parseInstructionSteps(text));
</script>

{#if parsed.intro}
	<p class="whitespace-pre-line">{parsed.intro}</p>
{/if}
{#if parsed.steps.length}
	<ol class="list-decimal space-y-1 ps-6 {parsed.intro ? 'mt-1' : ''}">
		{#each parsed.steps as step, i (i)}
			<li>{step}</li>
		{/each}
	</ol>
{/if}
