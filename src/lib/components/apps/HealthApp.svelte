<script lang="ts">
	import {
		MessageSquare,
		ShieldCheck,
		Pill,
		Calendar,
		FileText,
		ChevronRight,
		Check
	} from 'lucide-svelte';
	import type { HealthSimConfig } from '$lib/lessons/healthSim';

	/**
	 * Isolated health-services surface (issue B2): renders one of three
	 * senior-friendly screens driven by `config.screen` and emits semantic events
	 * the HealthSimLesson wrapper checks against the goal. No BrowserApp coupling.
	 *
	 * Accessibility: large tap targets (min-h-14), clear focus rings, and the
	 * wrapper owns the aria-live status line — this component only fires events.
	 */
	let {
		config,
		onAction,
		disabled = false
	} = $props<{
		config: HealthSimConfig;
		onAction: (action: string, data?: Record<string, unknown>) => void;
		disabled?: boolean;
	}>();

	function emit(action: string, data: Record<string, unknown> = {}) {
		if (disabled) return;
		onAction(action, data);
	}

	// ── SMS screen ────────────────────────────────────────────────────────────
	let smsOpen = $state(false);

	function openOfficialMessage() {
		if (disabled) return;
		smsOpen = true;
	}

	function confirmCode() {
		emit('health-code-revealed', { confirmed: true, code: config.code });
	}

	// ── Portal screen ─────────────────────────────────────────────────────────
	let loggedIn = $state(false);
	let portalView = $state<'dashboard' | 'prescriptions'>('dashboard');

	function login() {
		if (disabled) return;
		loggedIn = true;
	}

	function openPrescriptions() {
		if (disabled) return;
		portalView = 'prescriptions';
		emit('health-prescriptions-viewed', {});
	}

	// ── Appointments screen ───────────────────────────────────────────────────
	let selectedSlot = $state<string | null>(null);

	function bookAppointment() {
		if (!selectedSlot) return;
		emit('health-appointment-booked', { slotId: selectedSlot });
	}
</script>

<div class="flex h-full w-full flex-col overflow-y-auto bg-slate-50 text-slate-900">
	{#if config.screen === 'sms'}
		<!-- Phone-style messages surface -->
		<header class="flex items-center gap-2 bg-slate-800 px-4 py-3 text-white">
			<MessageSquare class="h-5 w-5" />
			<h2 class="text-lg font-semibold">Μηνύματα</h2>
		</header>

		{#if !smsOpen}
			<ul class="divide-y divide-slate-200">
				<li>
					<button
						class="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-100 focus:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
						onclick={openOfficialMessage}
						{disabled}
					>
						<span
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
						>
							<ShieldCheck class="h-6 w-6" />
						</span>
						<span class="min-w-0 flex-1">
							<span class="block font-semibold">{config.sender ?? 'ΕΦΚΑ 1517'}</span>
							<span class="block truncate text-sm text-slate-500"
								>{config.smsPreview ?? 'Ο κωδικός της συνταγής σας'}</span
							>
						</span>
						<ChevronRight class="h-5 w-5 shrink-0 text-slate-400" />
					</button>
				</li>
				<!-- Decoy message: tapping it is a gentle, teachable miss. -->
				<li>
					<button
						class="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-100 focus:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
						onclick={() => emit('health-wrong-message', { from: 'friend' })}
						{disabled}
					>
						<span
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-lg font-semibold text-slate-600"
						>
							Ε
						</span>
						<span class="min-w-0 flex-1">
							<span class="block font-semibold">Ελένη</span>
							<span class="block truncate text-sm text-slate-500">Τα λέμε το Σάββατο!</span>
						</span>
						<ChevronRight class="h-5 w-5 shrink-0 text-slate-400" />
					</button>
				</li>
			</ul>
		{:else}
			<div class="flex flex-1 flex-col p-4">
				<div class="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
					<ShieldCheck class="h-4 w-4" />
					<span>{config.sender ?? 'ΕΦΚΑ 1517'}</span>
				</div>
				<div class="max-w-md self-start rounded-2xl rounded-tl-sm bg-white p-4 shadow-sm">
					<p class="mb-3 text-slate-700">
						Η άυλη συνταγή σας είναι έτοιμη. Δείξτε αυτόν τον κωδικό στο φαρμακείο:
					</p>
					<div
						class="rounded-xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3 text-center"
						aria-label="Κωδικός συνταγής"
					>
						<span class="block text-sm text-emerald-800">Κωδικός συνταγής</span>
						<span class="block font-mono text-3xl font-bold tracking-widest text-emerald-900"
							>{config.code}</span
						>
					</div>
					{#if config.medication}
						<p class="mt-3 text-sm text-slate-500">Φάρμακο: {config.medication}</p>
					{/if}
				</div>

				<button
					class="mt-6 flex min-h-14 items-center justify-center gap-2 self-stretch rounded-xl bg-emerald-600 px-6 text-lg font-semibold text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
					onclick={confirmCode}
					{disabled}
				>
					<Check class="h-6 w-6" />
					Το είδα, συνέχεια
				</button>
			</div>
		{/if}
	{:else if config.screen === 'portal'}
		<!-- MyHealth-like portal -->
		<header class="flex items-center gap-2 bg-[#003476] px-4 py-3 text-white">
			<Pill class="h-5 w-5" />
			<h2 class="text-lg font-semibold">MyHealth</h2>
		</header>

		{#if !loggedIn}
			<div class="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
				<p class="max-w-sm text-slate-600">
					Για να δείτε τις συνταγές σας, συνδεθείτε με τους κωδικούς σας Taxisnet.
				</p>
				<button
					class="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#003476] px-6 text-lg font-semibold text-white hover:bg-[#00285c] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50"
					onclick={login}
					{disabled}
				>
					<ShieldCheck class="h-6 w-6" />
					Σύνδεση με Taxisnet
				</button>
			</div>
		{:else if portalView === 'dashboard'}
			<div class="p-4">
				<p class="mb-4 text-slate-600">
					Καλωσορίσατε, <strong>{config.patientName ?? 'ασθενή'}</strong>. Τι θέλετε να δείτε;
				</p>
				<div class="grid gap-3">
					<button
						class="flex min-h-16 items-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-left hover:border-[#003476] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
						onclick={openPrescriptions}
						{disabled}
					>
						<Pill class="h-7 w-7 shrink-0 text-[#003476]" />
						<span class="flex-1">
							<span class="block font-semibold">Οι συνταγές μου</span>
							<span class="block text-sm text-slate-500">Δείτε τα φάρμακά σας</span>
						</span>
						<ChevronRight class="h-5 w-5 shrink-0 text-slate-400" />
					</button>
					<!-- Decoy sections: teachable misses, not the goal. -->
					<button
						class="flex min-h-16 items-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-left hover:border-[#003476] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
						onclick={() => emit('health-wrong-section', { section: 'referrals' })}
						{disabled}
					>
						<FileText class="h-7 w-7 shrink-0 text-slate-500" />
						<span class="flex-1">
							<span class="block font-semibold">Τα παραπεμπτικά μου</span>
							<span class="block text-sm text-slate-500">Εξετάσεις &amp; παραπομπές</span>
						</span>
						<ChevronRight class="h-5 w-5 shrink-0 text-slate-400" />
					</button>
					<button
						class="flex min-h-16 items-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-left hover:border-[#003476] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
						onclick={() => emit('health-wrong-section', { section: 'appointments' })}
						{disabled}
					>
						<Calendar class="h-7 w-7 shrink-0 text-slate-500" />
						<span class="flex-1">
							<span class="block font-semibold">Τα ραντεβού μου</span>
							<span class="block text-sm text-slate-500">Επισκέψεις σε γιατρούς</span>
						</span>
						<ChevronRight class="h-5 w-5 shrink-0 text-slate-400" />
					</button>
				</div>
			</div>
		{:else}
			<div class="p-4">
				<h3 class="mb-3 flex items-center gap-2 text-xl font-bold text-[#003476]">
					<Pill class="h-6 w-6" />
					Οι συνταγές μου
				</h3>
				<ul class="grid gap-3">
					{#each config.prescriptions ?? [] as p}
						<li class="rounded-xl border border-slate-200 bg-white p-4">
							<p class="font-semibold text-slate-900">{p.title}</p>
							<p class="text-sm text-slate-500">{p.detail}</p>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	{:else if config.screen === 'appointments'}
		<!-- Appointment picker -->
		<header class="flex items-center gap-2 bg-[#003476] px-4 py-3 text-white">
			<Calendar class="h-5 w-5" />
			<h2 class="text-lg font-semibold">Κλείσιμο ραντεβού</h2>
		</header>
		<div class="p-4">
			{#if config.doctor}
				<p class="mb-4 text-slate-600">Γιατρός: <strong>{config.doctor}</strong></p>
			{/if}
			<p class="mb-2 font-medium text-slate-700">Διαλέξτε ώρα:</p>
			<div class="grid gap-2" role="radiogroup" aria-label="Διαθέσιμες ώρες">
				{#each config.slots ?? [] as slot}
					<button
						role="radio"
						aria-checked={selectedSlot === slot.id}
						class="flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 text-left text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 {selectedSlot ===
						slot.id
							? 'border-emerald-500 bg-emerald-50 font-semibold'
							: 'border-slate-200 bg-white hover:border-[#003476]'}"
						onclick={() => (selectedSlot = slot.id)}
						{disabled}
					>
						<span
							class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 {selectedSlot ===
							slot.id
								? 'border-emerald-500 bg-emerald-500 text-white'
								: 'border-slate-300'}"
						>
							{#if selectedSlot === slot.id}<Check class="h-4 w-4" />{/if}
						</span>
						{slot.label}
					</button>
				{/each}
			</div>

			<button
				class="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-lg font-semibold text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
				onclick={bookAppointment}
				disabled={disabled || !selectedSlot}
			>
				<Check class="h-6 w-6" />
				Κλείσε ραντεβού
			</button>
		</div>
	{/if}
</div>
