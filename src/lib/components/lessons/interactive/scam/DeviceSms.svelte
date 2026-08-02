<script lang="ts">
	/**
	 * DeviceSms — presentational-only SMS chrome for the scam-spotter exercise.
	 *
	 * Renders the SAME phishing SMS the way it actually appears on the two phone
	 * families the seniors use: Android (Google Messages) vs iPhone (iOS Messages).
	 * The point is recognition: a scam looks slightly different per device, but the
	 * red flags (sender, link, urgency) are the same. This component knows nothing
	 * about scoring or goals — ScamSpotterLesson opts in via `card.deviceVariant`.
	 *
	 * Deliberately NOT wired into ScamSpotterLesson here (parallel-agent protocol):
	 * the integrator adds the small `{:else if}` branch described in the manifest.
	 */
	import { MessageSquare } from 'lucide-svelte';

	let {
		deviceVariant = 'android',
		from,
		body,
		link,
		time = '9:41'
	}: {
		/** Which phone chrome to mimic. */
		deviceVariant?: 'android' | 'ios';
		/** Sender name / shortcode shown in the SMS header. */
		from: string;
		/** Message text. */
		body: string;
		/** Optional link surfaced inside the bubble (mono, blue). */
		link?: string;
		/** Received-time label shown under the bubble. */
		time?: string;
	} = $props();

	const isIos = $derived(deviceVariant === 'ios');
	// Android shows a round monogram avatar; take the first visible glyph.
	const monogram = $derived((from?.trim()?.[0] ?? '?').toUpperCase());
</script>

<div
	data-testid="device-sms"
	data-variant={deviceVariant}
	class="overflow-hidden {isIos ? 'bg-white' : 'bg-slate-50'}"
>
	{#if isIos}
		<!-- iOS Messages: centred contact header, grey received bubble on the left. -->
		<div class="border-b border-slate-200 bg-slate-100/80 px-4 py-2 text-center">
			<div
				class="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-300 text-sm font-semibold text-slate-700"
				aria-hidden="true"
			>
				{monogram}
			</div>
			<p class="text-sm font-semibold text-slate-900">
				<span class="sr-only">Αποστολέας: </span>{from}
			</p>
			<p class="text-[11px] text-slate-500">Μήνυμα SMS</p>
		</div>
		<div class="space-y-1 p-4">
			<div class="max-w-[85%] rounded-2xl rounded-tl-md bg-[#e9e9eb] px-3.5 py-2.5 text-slate-900">
				<p class="leading-relaxed whitespace-pre-line">{body}</p>
				{#if link}
					<p class="mt-1 font-mono text-sm break-all text-blue-600 underline">
						<span class="sr-only">Σύνδεσμος: </span>{link}
					</p>
				{/if}
			</div>
			<p class="pl-1 text-[11px] text-slate-400">{time}</p>
		</div>
	{:else}
		<!-- Android (Google Messages): left-aligned header with monogram avatar,
		     squarer light bubble on the left. -->
		<div class="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
			<div
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700"
				aria-hidden="true"
			>
				{monogram}
			</div>
			<div class="min-w-0 flex-1">
				<p class="truncate font-semibold text-slate-900">
					<span class="sr-only">Αποστολέας: </span>{from}
				</p>
				<p class="flex items-center gap-1 text-xs text-slate-500">
					<MessageSquare class="h-3 w-3" aria-hidden="true" /> SMS
				</p>
			</div>
		</div>
		<div class="space-y-1 p-4">
			<div class="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-200 px-3.5 py-2.5 text-slate-900">
				<p class="leading-relaxed whitespace-pre-line">{body}</p>
				{#if link}
					<p class="mt-1 font-mono text-sm break-all text-blue-700 underline">
						<span class="sr-only">Σύνδεσμος: </span>{link}
					</p>
				{/if}
			</div>
			<p class="pl-1 text-[11px] text-slate-400">{time}</p>
		</div>
	{/if}
</div>
