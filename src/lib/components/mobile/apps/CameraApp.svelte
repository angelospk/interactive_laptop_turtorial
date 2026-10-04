<script lang="ts">
	import QrCode from '@lucide/svelte/icons/qr-code';
	import ScanLine from '@lucide/svelte/icons/scan-line';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import { parseHost, evaluateLink } from '$lib/utils/mobileLink';
	import MobileBrowser from './MobileBrowser.svelte';
	import { cn } from '$lib/utils';

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
		pageTitle = 'gov.gr: Ενιαία Ψηφιακή Πύλη',
		variant = 'android'
	}: {
		onEvent: (action: string, data?: Record<string, unknown>) => void;
		qrUrl: string;
		/** Expected official domain — used only to keep the opened-page copy honest. */
		targetHost?: string;
		pageTitle?: string;
		variant?: 'android' | 'ios';
	} = $props();

	let stage: 'viewfinder' | 'preview' | 'opened' = $state('viewfinder');
	// Camera chrome: mode strip + shutter, like the real app. Only «Σάρωση»
	// (the QR path) matters to a lesson; the rest explains itself.
	type Mode = 'photo' | 'video' | 'portrait';
	let mode: Mode = $state('photo');
	let shots = $state(0);
	let notice = $state('');
	const MODES: { id: Mode; label: string }[] = [
		{ id: 'video', label: 'Βίντεο' },
		{ id: 'photo', label: 'Φωτογραφία' },
		{ id: 'portrait', label: 'Πορτρέτο' }
	];
	function shutter() {
		shots += 1;
		notice =
			mode === 'video'
				? 'Η εγγραφή βίντεο δεν περιλαμβάνεται στο μάθημα.'
				: `Φωτογραφία ${shots} αποθηκεύτηκε στις Φωτογραφίες (προσομοίωση).`;
	}
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

<div data-testid="camera-app" data-variant={variant} class="flex h-full flex-col bg-black">
	{#if stage === 'viewfinder'}
		<!-- Viewfinder: a dim "room" with the QR poster in the middle -->
		<div
			class="relative flex flex-1 flex-col items-center justify-center gap-5 bg-[radial-gradient(ellipse_at_center,#3b3f4a_0%,#15171c_70%)] p-6 text-white"
		>
			<div class="absolute top-3 left-3 flex gap-2 text-[11px] text-white/80">
				<span class="rounded-full bg-black/40 px-2 py-0.5">⚡ Αυτόματο</span>
				<span class="rounded-full bg-black/40 px-2 py-0.5">1×</span>
			</div>
			<div
				class="relative flex h-44 w-44 items-center justify-center rounded-lg bg-white p-3 shadow-2xl"
			>
				{#if qrUrl}
					<QrCode class="h-32 w-32 text-slate-900" aria-hidden="true" />
					<span
						class="absolute inset-x-3 top-1/2 h-0.5 bg-emerald-400/90 shadow-[0_0_8px_#34d399] motion-safe:animate-pulse"
						aria-hidden="true"
					></span>
				{:else}
					<span class="text-5xl" aria-hidden="true">🪴</span>
				{/if}
				<!-- focus corners -->
				<span
					class="pointer-events-none absolute -inset-2 rounded-xl border-2 border-amber-300/90 [mask-composite:exclude] p-[22px] [mask:linear-gradient(#000,#000)_content-box,linear-gradient(#000,#000)]"
					aria-hidden="true"
				></span>
			</div>
			{#if qrUrl}
				<p class="text-center text-sm text-slate-200">Στόχευσε τον κωδικό QR και σάρωσέ τον.</p>
				<button
					type="button"
					onclick={scan}
					class="flex min-h-[52px] items-center gap-2 rounded-full bg-white px-6 text-base font-semibold text-slate-900 shadow-lg focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
				>
					<ScanLine class="h-5 w-5" aria-hidden="true" /> Σάρωση κωδικού
				</button>
			{:else}
				<p class="text-center text-sm text-slate-300">Στόχευσε και πάτησε το στρογγυλό κουμπί.</p>
			{/if}
			{#if notice}
				<p
					class="absolute inset-x-4 bottom-3 rounded-xl bg-black/60 px-3 py-1.5 text-center text-xs"
					role="status"
					aria-live="polite"
				>
					{notice}
				</p>
			{/if}
		</div>
		<!-- Mode strip + shutter row -->
		<div class="shrink-0 bg-black px-4 pt-2 pb-3 text-white">
			<div
				class="mb-3 flex justify-center gap-5 text-xs font-medium"
				role="tablist"
				aria-label="Λειτουργία κάμερας"
			>
				{#each MODES as m (m.id)}
					<button
						type="button"
						role="tab"
						aria-selected={mode === m.id}
						onclick={() => (mode = m.id)}
						class={cn(
							'min-h-8 rounded-full px-2 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none',
							mode === m.id
								? variant === 'ios'
									? 'text-amber-300'
									: 'bg-white text-black'
								: 'text-white/70'
						)}>{m.label}</button
					>
				{/each}
			</div>
			<div class="grid grid-cols-3 items-center">
				<span
					class="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-white/40 bg-slate-700 text-xl"
					aria-label="Τελευταία φωτογραφία"
					role="img">🖼️</span
				>
				<button
					type="button"
					onclick={shutter}
					aria-label="Λήψη φωτογραφίας"
					class="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-full border-4 border-white focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none active:scale-95"
				>
					<span
						class={cn(
							'h-[54px] w-[54px] rounded-full',
							mode === 'video' ? 'bg-red-500' : 'bg-white'
						)}
						aria-hidden="true"
					></span>
				</button>
				<button
					type="button"
					onclick={() => (notice = 'Αλλαγή κάμερας: μπροστά/πίσω. Δεν χρειάζεται στο μάθημα.')}
					aria-label="Αλλαγή κάμερας"
					class="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-lg focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
					>🔄</button
				>
			</div>
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
				Άκυρο, δεν το εμπιστεύομαι
			</button>
		</div>
	{:else}
		<MobileBrowser url={qrUrl} {variant}>
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
