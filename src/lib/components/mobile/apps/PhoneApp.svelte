<script lang="ts">
	import Phone from '@lucide/svelte/icons/phone';
	import Delete from '@lucide/svelte/icons/delete';
	import Clock from '@lucide/svelte/icons/clock';
	import Star from '@lucide/svelte/icons/star';
	import Users from '@lucide/svelte/icons/users';
	import Grip from '@lucide/svelte/icons/grip';
	import PhoneOff from '@lucide/svelte/icons/phone-off';
	import PhoneIncoming from '@lucide/svelte/icons/phone-incoming';
	import { cn } from '$lib/utils';
	import type { MobileSimContact } from '$lib/lessons/mobileSim';

	/**
	 * Dialer + contacts mini-app for the mobile simulation. Android: the Google
	 * Phone look (green accents, tabs on top, big round keys with letters under
	 * the digits). iPhone: the Phone app with its bottom tab bar (Αγαπημένα,
	 * Πρόσφατα, Επαφές, Πληκτρολόγιο). Purely presentational state; lesson logic
	 * listens to the semantic events:
	 *   mobile-digit-typed { number }              — after every keypad tap
	 *   mobile-call-placed { number, contactId? }  — the ONE canonical call
	 *     event (contactId set when the call started from the contacts tab),
	 *     so a single gesture never emits competing events (codex review).
	 * After the call event an in-call screen appears, with a red hang-up button
	 * — the full gesture a learner performs for real.
	 */
	let {
		onEvent,
		contacts = [],
		variant = 'android'
	}: {
		onEvent: (action: string, data?: Record<string, unknown>) => void;
		contacts?: MobileSimContact[];
		variant?: 'android' | 'ios';
	} = $props();

	const isIos = $derived(variant === 'ios');

	type Tab = 'keypad' | 'contacts' | 'recents' | 'favorites';
	let tab: Tab = $state('keypad');
	let number = $state('');
	let inCall = $state<{ name: string; number: string } | null>(null);

	const keys = [
		['1', ''],
		['2', 'ABC'],
		['3', 'DEF'],
		['4', 'GHI'],
		['5', 'JKL'],
		['6', 'MNO'],
		['7', 'PQRS'],
		['8', 'TUV'],
		['9', 'WXYZ'],
		['*', ''],
		['0', '+'],
		['#', '']
	] as const;

	// Recents are scenery derived from the lesson's contacts, so names match.
	const recents = $derived(
		contacts.slice(0, 3).map((c, i) => ({
			...c,
			when: ['Σήμερα, 10:12', 'Χθες, 19:05', 'Δευ, 08:40'][i] ?? 'Πρόσφατα',
			missed: i === 1
		}))
	);

	function press(key: string) {
		number += key;
		onEvent('mobile-digit-typed', { number });
	}

	function erase() {
		number = number.slice(0, -1);
	}

	/** Pretty-print a dialled number «210 123 4567» without touching the raw value. */
	const shown = $derived(number.replace(/(\d{3})(?=\d)/g, '$1 ').trim());

	function call() {
		if (!number) return;
		const match = contacts.find((c) => c.number.replace(/\D/g, '') === number.replace(/\D/g, ''));
		inCall = { name: match?.name ?? shown, number: shown };
		onEvent('mobile-call-placed', { number });
	}

	function callContact(contact: MobileSimContact) {
		inCall = { name: contact.name, number: contact.number };
		onEvent('mobile-call-placed', { number: contact.number, contactId: contact.id });
	}

	function hangUp() {
		inCall = null;
		number = '';
	}

	const TABS: { id: Tab; label: string; icon: typeof Phone }[] = [
		{ id: 'favorites', label: 'Αγαπημένα', icon: Star },
		{ id: 'recents', label: 'Πρόσφατα', icon: Clock },
		{ id: 'contacts', label: 'Επαφές', icon: Users },
		{ id: 'keypad', label: 'Πληκτρολόγιο', icon: Grip }
	];
	// Without contacts the lesson is a pure dialler: keep only the keypad tab.
	const tabs = $derived(contacts.length ? TABS : TABS.filter((t) => t.id === 'keypad'));
	const accent = $derived(isIos ? 'bg-[#34c759]' : 'bg-[#1e8e3e]');
</script>

<div
	data-testid="phone-app"
	data-variant={variant}
	class={cn('flex h-full flex-col', isIos ? 'bg-white' : 'bg-[#f7f9fc]')}
>
	{#if inCall}
		<!-- In-call screen -->
		<div
			class="flex flex-1 flex-col items-center justify-between bg-gradient-to-b from-slate-800 to-slate-900 px-6 py-10 text-white"
		>
			<div class="flex flex-col items-center gap-3 text-center">
				<span
					class="flex h-24 w-24 items-center justify-center rounded-full bg-slate-600 text-4xl"
					aria-hidden="true">👤</span
				>
				<p class="text-2xl font-semibold">{inCall.name}</p>
				<p class="text-sm text-slate-300 tabular-nums">{inCall.number}</p>
				<p class="text-sm text-emerald-300" role="status" aria-live="polite">Καλεί…</p>
			</div>
			<button
				type="button"
				onclick={hangUp}
				aria-label="Τερματισμός κλήσης"
				class="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none active:bg-red-700"
			>
				<PhoneOff class="h-7 w-7" aria-hidden="true" />
			</button>
		</div>
	{:else}
		{#if !isIos}
			<header class="shrink-0 px-4 pt-3 pb-1 text-xl font-normal text-slate-800">Τηλέφωνο</header>
			{#if tabs.length > 1}
				<nav
					class="grid shrink-0 grid-cols-4 border-b border-slate-200 text-xs font-medium"
					aria-label="Καρτέλες"
				>
					{#each tabs as t (t.id)}
						<button
							type="button"
							onclick={() => (tab = t.id)}
							aria-pressed={tab === t.id}
							class={cn(
								'flex min-h-[48px] flex-col items-center justify-center gap-0.5 px-1 transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none',
								tab === t.id ? 'border-b-2 border-[#1e8e3e] text-[#1e8e3e]' : 'text-slate-500'
							)}
						>
							<t.icon class="h-4 w-4" aria-hidden="true" />
							{t.label}
						</button>
					{/each}
				</nav>
			{/if}
		{:else}
			<header class="shrink-0 px-4 pt-3 pb-1 text-center text-base font-semibold text-slate-900">
				{tabs.find((t) => t.id === tab)?.label ?? 'Τηλέφωνο'}
			</header>
		{/if}

		{#if tab === 'contacts'}
			<ul class="flex-1 divide-y divide-slate-100 overflow-y-auto bg-white">
				{#each contacts as contact (contact.id)}
					<li class="flex items-center justify-between gap-2 px-4 py-3">
						<div class="flex min-w-0 items-center gap-3">
							<span
								class={cn(
									'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white',
									isIos ? 'bg-slate-400' : 'bg-[#1e8e3e]'
								)}
								aria-hidden="true"
							>
								{contact.name.trim()[0]}
							</span>
							<div class="min-w-0">
								<p class="truncate text-base font-semibold text-slate-900">{contact.name}</p>
								<p class="text-sm text-slate-500 tabular-nums">{contact.number}</p>
							</div>
						</div>
						<button
							type="button"
							onclick={() => callContact(contact)}
							aria-label={`Κλήση ${contact.name}`}
							class={cn(
								'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none active:brightness-90',
								accent
							)}
						>
							<Phone class="h-5 w-5" aria-hidden="true" />
						</button>
					</li>
				{/each}
			</ul>
		{:else if tab === 'recents'}
			<ul class="flex-1 divide-y divide-slate-100 overflow-y-auto bg-white">
				{#each recents as r (r.id)}
					<li class="flex items-center gap-3 px-4 py-3">
						<PhoneIncoming
							class={cn('h-5 w-5 shrink-0', r.missed ? 'text-red-500' : 'text-slate-400')}
							aria-hidden="true"
						/>
						<div class="min-w-0 flex-1">
							<p
								class={cn(
									'truncate text-base font-medium',
									r.missed ? 'text-red-600' : 'text-slate-900'
								)}
							>
								{r.name}
							</p>
							<p class="text-xs text-slate-500">{r.missed ? 'Αναπάντητη · ' : ''}{r.when}</p>
						</div>
						<button
							type="button"
							onclick={() => callContact(r)}
							aria-label={`Κλήση ${r.name} από τα πρόσφατα`}
							class="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none active:bg-slate-100"
						>
							<Phone class="h-5 w-5" aria-hidden="true" />
						</button>
					</li>
				{:else}
					<li class="px-4 py-8 text-center text-sm text-slate-500">Καμία πρόσφατη κλήση.</li>
				{/each}
			</ul>
		{:else if tab === 'favorites'}
			<div class="flex-1 overflow-y-auto bg-white p-4">
				{#if contacts.length}
					<div class="grid grid-cols-2 gap-3">
						{#each contacts.slice(0, 2) as c (c.id)}
							<button
								type="button"
								onclick={() => callContact(c)}
								aria-label={`Κλήση ${c.name} από τα αγαπημένα`}
								class="flex flex-col items-center gap-2 rounded-2xl bg-slate-50 p-4 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none active:bg-slate-100"
							>
								<span
									class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-300 text-xl font-semibold text-white"
									aria-hidden="true">{c.name.trim()[0]}</span
								>
								<span class="text-center text-sm font-medium text-slate-900">{c.name}</span>
							</button>
						{/each}
					</div>
				{:else}
					<p class="py-8 text-center text-sm text-slate-500">
						Πρόσθεσε αγαπημένες επαφές για να τις καλείς με ένα πάτημα.
					</p>
				{/if}
			</div>
		{:else}
			<!-- Number display -->
			<output
				aria-label="Αριθμός που πληκτρολογείς"
				class="flex min-h-[3.5rem] items-center justify-center px-4 text-3xl font-light tracking-wider text-slate-900 tabular-nums"
			>
				{shown}
			</output>

			<!-- Keypad -->
			<div class="grid flex-1 grid-cols-3 content-center gap-x-4 gap-y-3 px-8 py-1">
				{#each keys as [key, letters] (key)}
					<button
						type="button"
						onclick={() => press(key)}
						aria-label={/\d/.test(key) ? `Ψηφίο ${key}` : `Σύμβολο ${key}`}
						class={cn(
							'mx-auto flex h-[60px] w-[60px] flex-col items-center justify-center rounded-full text-slate-900 transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none',
							isIos ? 'bg-[#e5e5ea] active:bg-[#d1d1d6]' : 'bg-white shadow-sm active:bg-slate-200'
						)}
					>
						<span class="text-2xl leading-none font-medium">{key}</span>
						{#if letters}<span
								class="text-[9px] leading-none font-semibold tracking-widest text-slate-500"
								aria-hidden="true">{letters}</span
							>{/if}
					</button>
				{/each}
			</div>

			<!-- Call / erase row -->
			<div class="grid shrink-0 grid-cols-3 items-center px-8 pt-1 pb-3">
				<span></span>
				<button
					type="button"
					onclick={call}
					aria-label="Κλήση"
					class={cn(
						'mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none active:brightness-90',
						accent
					)}
				>
					<Phone class="h-7 w-7" aria-hidden="true" />
				</button>
				<button
					type="button"
					onclick={erase}
					aria-label="Διαγραφή ψηφίου"
					class="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-slate-500 transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none active:bg-slate-100"
				>
					<Delete class="h-6 w-6" aria-hidden="true" />
				</button>
			</div>
		{/if}

		{#if isIos && tabs.length > 1}
			<nav
				class="grid shrink-0 grid-cols-4 border-t border-slate-200 bg-[#f9f9f9] pt-1 pb-1 text-[10px] font-medium"
				aria-label="Καρτέλες"
			>
				{#each tabs as t (t.id)}
					<button
						type="button"
						onclick={() => (tab = t.id)}
						aria-pressed={tab === t.id}
						class={cn(
							'flex min-h-[48px] flex-col items-center justify-center gap-0.5 transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none',
							tab === t.id ? 'text-[#0a84ff]' : 'text-slate-500'
						)}
					>
						<t.icon class="h-5 w-5" aria-hidden="true" />
						{t.label}
					</button>
				{/each}
			</nav>
		{/if}
	{/if}
</div>
