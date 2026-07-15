<script lang="ts">
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import MobileBrowser from './MobileBrowser.svelte';

	/**
	 * Two-factor login (CURRICULUM_PLAN §4γ): the learner logs in, a one-time code
	 * arrives by SMS, and they type it into the browser to finish. Teaches what a
	 * 2FA code is and that you enter it yourself — never read it out to a caller.
	 * Semantic event: mobile-2fa-submitted { code }
	 */
	let {
		onEvent,
		url,
		code,
		serviceName = 'Τράπεζα'
	}: {
		onEvent: (action: string, data?: Record<string, unknown>) => void;
		url: string;
		code: string;
		serviceName?: string;
	} = $props();

	let smsRevealed = $state(false);
	let entered = $state('');
	let error = $state('');
	let done = $state(false);

	function submit(e: Event) {
		e.preventDefault();
		const value = entered.trim();
		if (!value) return;
		onEvent('mobile-2fa-submitted', { code: value });
		if (value === code) {
			done = true;
			error = '';
		} else {
			error = 'Λάθος κωδικός. Δες ξανά το SMS και δοκίμασε πάλι.';
		}
	}
</script>

<MobileBrowser url={url || 'https://—'}>
	{#if !code}
		<!-- Scenery: browser opened outside a 2FA lesson. -->
		<div class="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-slate-500">
			<p class="text-base font-semibold text-slate-700">Περιηγητής</p>
			<p class="text-sm">Γράψε μια διεύθυνση για να ανοίξεις μια ιστοσελίδα.</p>
		</div>
	{:else}
	<div class="space-y-4 p-5">
		<p class="text-lg font-bold text-slate-900">{serviceName} — Σύνδεση</p>

		{#if done}
			<div class="flex flex-col items-center gap-3 py-6 text-center">
				<span class="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
					<ShieldCheck class="h-7 w-7" aria-hidden="true" />
				</span>
				<p class="text-base font-semibold text-slate-800">Συνδεθήκατε με ασφάλεια.</p>
			</div>
		{:else}
			<p class="text-sm text-slate-600">
				Στείλαμε έναν 6ψήφιο κωδικό μιας χρήσης στο κινητό σας με SMS. Γράψ' τον για να μπεις.
			</p>

			<!-- Simulated SMS notification (the code arrives here) -->
			<div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
				<p class="flex items-center gap-2 text-xs font-semibold text-slate-500">
					<MessageSquare class="h-4 w-4" aria-hidden="true" /> Νέο SMS
				</p>
				{#if smsRevealed}
					<p data-testid="sms-code" class="mt-1 text-base text-slate-800">
						Ο κωδικός σας είναι <strong class="tracking-widest">{code}</strong>. Μην τον πείτε σε
						κανέναν.
					</p>
				{:else}
					<button
						type="button"
						onclick={() => (smsRevealed = true)}
						class="mt-1 text-base font-medium text-blue-600 underline focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
					>
						Άνοιξε το SMS
					</button>
				{/if}
			</div>

			<form class="space-y-3" onsubmit={submit}>
				<input
					inputmode="numeric"
					bind:value={entered}
					aria-label="Κωδικός μιας χρήσης"
					placeholder="______"
					class="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-xl tracking-widest text-slate-900 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
				/>
				{#if error}
					<p class="text-sm font-medium text-red-600" role="alert">{error}</p>
				{/if}
				<button
					type="submit"
					class="w-full rounded-xl bg-blue-600 py-3 text-base font-semibold text-white focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
				>
					Επιβεβαίωση
				</button>
			</form>
		{/if}
	</div>
	{/if}
</MobileBrowser>
