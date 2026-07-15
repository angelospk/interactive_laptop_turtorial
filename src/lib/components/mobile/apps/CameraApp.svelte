<script lang="ts">
	import QrCode from '@lucide/svelte/icons/qr-code';
	import ScanLine from '@lucide/svelte/icons/scan-line';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { parseHost, evaluateLink } from '$lib/utils/mobileLink';
	import MobileBrowser from './MobileBrowser.svelte';

	/**
	 * Camera mini-app with a mock QR viewfinder (CURRICULUM_PLAN §4γ). The learner
	 * scans a QR, then must READ the link's host before opening it — the anti-scam
	 * skill. Semantic events:
	 *   mobile-qr-scanned {}
	 *   mobile-qr-link-opened { host, confirmed }
	 * The lesson decides whether the opened host is the official one; the app only
	 * surfaces the real host so the learner can judge it.
	 */
	let {
		onEvent,
		qrUrl,
		targetHost = '',
		pageTitle = 'gov.gr — Ενιαία Ψηφιακή Πύλη'
	}: {
		onEvent: (action: string, data?: Record<string, unknown>) => void;
		qrUrl: string;
		/** Expected official domain — used only to keep the opened-page copy honest. */
		targetHost?: string;
		pageTitle?: string;
	} = $props();

	let stage: 'viewfinder' | 'preview' | 'opened' = $state('viewfinder');
	const host = $derived(parseHost(qrUrl) ?? '—');
	// Never claim an opened link is "safe/official" unless it truly is (codex/
	// CodeRabbit): for a lookalike host the opened page stays neutral + cautionary.
	const official = $derived(targetHost ? evaluateLink(qrUrl, targetHost).official : false);

	function scan() {
		stage = 'preview';
		onEvent('mobile-qr-scanned', {});
	}

	function openLink() {
		stage = 'opened';
		onEvent('mobile-qr-link-opened', { host, url: qrUrl, confirmed: true });
	}
</script>

<div data-testid="camera-app" class="flex h-full flex-col bg-slate-900">
	{#if stage === 'viewfinder'}
		<div class="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-white">
			<div
				class="relative flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-white/40"
			>
				<QrCode class="h-28 w-28 text-white" aria-hidden="true" />
				<span class="absolute inset-x-6 top-1/2 h-0.5 bg-emerald-400/80"></span>
			</div>
			{#if qrUrl}
				<p class="text-center text-sm text-slate-300">Στόχευσε τον κωδικό QR και σάρωσέ τον.</p>
				<button
					type="button"
					onclick={scan}
					class="flex min-h-[52px] items-center gap-2 rounded-full bg-white px-6 text-base font-semibold text-slate-900 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
				>
					<ScanLine class="h-5 w-5" aria-hidden="true" /> Σάρωση κωδικού
				</button>
			{:else}
				<p class="text-center text-sm text-slate-300">Κάμερα</p>
			{/if}
		</div>
	{:else if stage === 'preview'}
		<div class="flex flex-1 flex-col justify-center gap-4 bg-white p-6">
			<p class="text-sm text-slate-500">Ο κωδικός QR οδηγεί σε αυτόν τον σύνδεσμο:</p>
			<div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
				<p class="text-xs text-slate-400">Διεύθυνση</p>
				<p data-testid="qr-host" class="text-lg font-bold break-all text-slate-900">{host}</p>
				<p class="mt-1 text-xs break-all text-slate-400">{qrUrl}</p>
			</div>
			<p class="text-sm text-slate-600">
				Πριν ανοίξεις: είναι η διεύθυνση το <strong>επίσημο gov.gr</strong>; Αν όχι, μην τη
				εμπιστεύεσαι.
			</p>
			<button
				type="button"
				onclick={openLink}
				class="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-blue-600 text-base font-semibold text-white focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
			>
				<ExternalLink class="h-5 w-5" aria-hidden="true" /> Άνοιγμα συνδέσμου
			</button>
			<button
				type="button"
				onclick={() => (stage = 'viewfinder')}
				class="min-h-[44px] text-base font-medium text-slate-600 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
			>
				Άκυρο — δεν το εμπιστεύομαι
			</button>
		</div>
	{:else}
		<MobileBrowser url={qrUrl}>
			{#if official}
				<div class="space-y-3 p-5">
					<p class="text-lg font-bold text-slate-900">{pageTitle}</p>
					<p class="text-sm text-slate-600">
						Άνοιξες τον επίσημο σύνδεσμο ({host}). Εδώ θα έβρισκες τις ψηφιακές υπηρεσίες του
						Δημοσίου.
					</p>
				</div>
			{:else}
				<div class="space-y-3 p-5">
					<p class="text-lg font-bold text-slate-900">{host}</p>
					<p class="text-sm text-red-600">
						Προσοχή: η διεύθυνση δεν φαίνεται να είναι το επίσημο gov.gr. Μην δίνεις προσωπικά
						στοιχεία εδώ.
					</p>
				</div>
			{/if}
		</MobileBrowser>
	{/if}
</div>
