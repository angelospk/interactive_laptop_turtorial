<script lang="ts">
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import { cn } from '$lib/utils';

	/**
	 * «Ψηφιακός βοηθός» — an HONEST voice-assistant simulation (CURRICULUM_PLAN
	 * §4γ, decision ε). There is no microphone: the learner practises the real
	 * skill — *how to phrase the request* — by picking the well-formed phrase from
	 * a few chips. Deliberately NOT branded «Hey Google»/Siri, and it never claims
	 * to perform a real system action; it is labelled as an educational practice.
	 *
	 * Semantic event: mobile-assistant-command { intent, phrase, correct }
	 */
	interface AssistantPhrase {
		id: string;
		text: string;
		correct?: boolean;
	}

	let {
		onEvent,
		intent,
		phrases = [],
		greeting = 'Πες μου τι θέλεις να κάνω. Διάλεξε πώς θα το έλεγες:',
		confirm = 'Έγινε! (εκπαιδευτική προσομοίωση)'
	}: {
		onEvent: (action: string, data?: Record<string, unknown>) => void;
		intent: string;
		phrases?: AssistantPhrase[];
		greeting?: string;
		confirm?: string;
	} = $props();

	// The chip the learner picked, and whether the assistant "understood" it.
	let picked: AssistantPhrase | null = $state(null);

	function choose(phrase: AssistantPhrase) {
		picked = phrase;
		onEvent('mobile-assistant-command', { intent, phrase: phrase.text, correct: !!phrase.correct });
	}
</script>

<div data-testid="assistant-app" class="flex h-full flex-col bg-slate-50">
	<header class="shrink-0 bg-indigo-600 px-4 py-3 text-white">
		<p class="flex items-center justify-center gap-2 text-sm font-semibold">
			<Sparkles class="h-4 w-4" aria-hidden="true" /> Ψηφιακός βοηθός
		</p>
		<p class="mt-0.5 text-center text-[11px] text-indigo-200">Εκπαιδευτική προσομοίωση</p>
	</header>

	<div class="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
		<!-- Assistant bubble -->
		<p
			class="max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-base text-slate-800 shadow-sm"
		>
			{greeting}
		</p>

		{#if picked}
			<p
				class="max-w-[85%] self-end rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-3 text-base text-white shadow-sm"
			>
				{picked.text}
			</p>
			<p
				class="max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-base text-slate-800 shadow-sm"
				role="status"
				aria-live="polite"
			>
				{picked.correct ? confirm : 'Δεν το κατάλαβα καλά. Δοκίμασε μια πιο ξεκάθαρη διατύπωση.'}
			</p>
		{/if}
	</div>

	<!-- Phrase chips (the honest stand-in for "speaking") -->
	<div class="shrink-0 space-y-2 border-t border-slate-200 bg-white p-3">
		<p class="text-center text-xs text-slate-500">Πώς θα το έλεγες;</p>
		{#each phrases as phrase (phrase.id)}
			<button
				type="button"
				onclick={() => choose(phrase)}
				class={cn(
					'flex min-h-[52px] w-full items-center justify-center rounded-full border px-4 py-2 text-center text-base font-medium transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none',
					picked?.id === phrase.id
						? 'border-indigo-600 bg-indigo-50 text-indigo-800'
						: 'border-slate-300 bg-white text-slate-800 active:bg-slate-50'
				)}
			>
				«{phrase.text}»
			</button>
		{/each}
	</div>
</div>
