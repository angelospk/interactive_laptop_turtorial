<script lang="ts">
	import Phone from '@lucide/svelte/icons/phone';
	import Delete from '@lucide/svelte/icons/delete';
	import { cn } from '$lib/utils';
	import type { MobileSimContact } from '$lib/lessons/mobileSim';

	/**
	 * Dialer + contacts mini-app for the mobile simulation. Purely
	 * presentational state; lesson logic listens to the semantic events:
	 *   mobile-digit-typed    { number }              — after every keypad tap
	 *   mobile-call-placed    { number, contactId? }  — a call actually starts
	 *   mobile-contact-called { contactId }           — call started from contacts
	 */
	let {
		onEvent,
		contacts = []
	}: {
		onEvent: (action: string, data?: Record<string, unknown>) => void;
		contacts?: MobileSimContact[];
	} = $props();

	let tab: 'keypad' | 'contacts' = $state('keypad');
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

	function callContact(contact: MobileSimContact) {
		onEvent('mobile-contact-called', { contactId: contact.id });
		onEvent('mobile-call-placed', { number: contact.number, contactId: contact.id });
	}
</script>

<div data-testid="phone-app" class="flex h-full flex-col bg-white">
	<header class="shrink-0 bg-slate-100 px-4 py-2 text-center text-sm font-semibold text-slate-700">
		Τηλέφωνο
	</header>

	{#if contacts.length}
		<!-- Tab switcher (only when the lesson provides contacts) -->
		<nav class="grid shrink-0 grid-cols-2 border-b border-slate-200 text-sm font-medium">
			{#each [{ id: 'keypad', label: 'Πληκτρολόγιο' }, { id: 'contacts', label: 'Επαφές' }] as t (t.id)}
				<button
					type="button"
					onclick={() => (tab = t.id as typeof tab)}
					aria-pressed={tab === t.id}
					class={cn(
						'min-h-[44px] px-2 py-2 transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none',
						tab === t.id ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500'
					)}
				>
					{t.label}
				</button>
			{/each}
		</nav>
	{/if}

	{#if tab === 'contacts'}
		<ul class="flex-1 divide-y divide-slate-100 overflow-y-auto">
			{#each contacts as contact (contact.id)}
				<li class="flex items-center justify-between gap-2 px-4 py-3">
					<div class="min-w-0">
						<p class="truncate text-base font-semibold text-slate-900">{contact.name}</p>
						<p class="text-sm text-slate-500 tabular-nums">{contact.number}</p>
					</div>
					<button
						type="button"
						onclick={() => callContact(contact)}
						aria-label={`Κλήση ${contact.name}`}
						class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-600 text-white shadow transition active:bg-green-700 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
					>
						<Phone class="h-5 w-5" aria-hidden="true" />
					</button>
				</li>
			{/each}
		</ul>
	{:else}
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
	{/if}
</div>
