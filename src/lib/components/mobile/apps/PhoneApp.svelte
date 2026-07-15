<script lang="ts">
	import Phone from '@lucide/svelte/icons/phone';
	import Delete from '@lucide/svelte/icons/delete';

	/**
	 * Dialer mini-app for the mobile simulation. Purely presentational state;
	 * lesson logic listens to the semantic events it emits:
	 *   mobile-digit-typed  { number }   — after every keypad tap
	 *   mobile-call-placed  { number }   — green call button (non-empty number)
	 */
	let {
		onEvent
	}: {
		onEvent: (action: string, data?: Record<string, unknown>) => void;
	} = $props();

	let number = $state('');

	const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

	function press(key: string) {
		number += key;
		onEvent('mobile-digit-typed', { number });
	}

	function erase() {
		number = number.slice(0, -1);
	}

	function call() {
		if (!number) return;
		onEvent('mobile-call-placed', { number });
	}
</script>

<div data-testid="phone-app" class="flex h-full flex-col bg-white">
	<header class="shrink-0 bg-slate-100 px-4 py-2 text-center text-sm font-semibold text-slate-700">
		Τηλέφωνο
	</header>

	<!-- Number display -->
	<output
		aria-label="Αριθμός που πληκτρολογείς"
		class="flex min-h-[3.5rem] items-center justify-center px-4 text-3xl font-light tracking-wider text-slate-900 tabular-nums"
	>
		{number}
	</output>

	<!-- Keypad -->
	<div class="grid flex-1 grid-cols-3 content-center gap-x-2 gap-y-4 px-6 py-2">
		{#each keys as key (key)}
			<button
				type="button"
				onclick={() => press(key)}
				aria-label={/\d/.test(key) ? `Ψηφίο ${key}` : `Σύμβολο ${key}`}
				class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl font-medium text-slate-900 transition active:bg-slate-300 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
			>
				{key}
			</button>
		{/each}
	</div>

	<!-- Call / erase row -->
	<div class="grid shrink-0 grid-cols-3 items-center px-6 pt-1 pb-4">
		<span></span>
		<button
			type="button"
			onclick={call}
			aria-label="Κλήση"
			class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition active:bg-green-700 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
		>
			<Phone class="h-7 w-7" aria-hidden="true" />
		</button>
		<button
			type="button"
			onclick={erase}
			aria-label="Διαγραφή ψηφίου"
			class="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-slate-500 transition active:bg-slate-100 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
		>
			<Delete class="h-6 w-6" aria-hidden="true" />
		</button>
	</div>
</div>
