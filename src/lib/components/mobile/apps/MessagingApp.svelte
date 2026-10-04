<script lang="ts">
	import Send from '@lucide/svelte/icons/send';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import Video from '@lucide/svelte/icons/video';
	import Phone from '@lucide/svelte/icons/phone';
	import PhoneOff from '@lucide/svelte/icons/phone-off';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Mic from '@lucide/svelte/icons/mic';
	import Camera from '@lucide/svelte/icons/camera';
	import MicOff from '@lucide/svelte/icons/mic-off';
	import { cn } from '$lib/utils';
	import type { MobileSimConversation } from '$lib/lessons/mobileSim';

	/**
	 * Shared messaging mini-app: SMS ('sms' channel) and Viber-like chat ('viber'
	 * channel, purple). SMS follows the phone: Google Messages on Android (blue
	 * sent bubbles, round avatars, search bar), iOS Messages on iPhone (green SMS
	 * bubbles, centred contact header). Semantic events (unchanged):
	 *   mobile-message-sent      { channel, conversationId, text }
	 *   mobile-videocall-started { conversationId }
	 *   mobile-sms-verdict       { conversationId, isScam }   (scam-spotting lesson)
	 * A sent message gets a «Παραδόθηκε» receipt and the thread list shows it as
	 * the latest line — the learner sees the effect of what they did.
	 */
	let {
		onEvent,
		conversations = [],
		channel = 'sms',
		title = 'Μηνύματα',
		verdictConversationId = null,
		variant = 'android'
	}: {
		onEvent: (action: string, data?: Record<string, unknown>) => void;
		conversations?: MobileSimConversation[];
		channel?: 'sms' | 'viber';
		title?: string;
		/** When the open conversation matches, show «Ασφαλές/Ύποπτο» buttons. */
		verdictConversationId?: string | null;
		variant?: 'android' | 'ios';
	} = $props();

	const isViber = $derived(channel === 'viber');
	const isIos = $derived(variant === 'ios');

	let openId: string | null = $state(null);
	let draft = $state('');
	// Sent messages per conversation (appended after the seeded thread).
	let sent: Record<string, string[]> = $state({});
	let inVideoCall = $state(false);
	let callMuted = $state(false);
	let notice = $state('');
	let query = $state('');

	const open = $derived(conversations.find((c) => c.id === openId) ?? null);
	const fold = (t: string) => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
	const visible = $derived(
		query.trim()
			? conversations.filter((c) => fold(c.name).includes(fold(query.trim())))
			: conversations
	);

	const isGroup = (c: MobileSimConversation) => /ομάδα|group/i.test(c.name);
	const isUnknown = (c: MobileSimConversation) => /άγνωστ|unknown|\d{3}/i.test(c.name);
	const monogram = (c: MobileSimConversation) =>
		isUnknown(c) ? '?' : (c.name.trim()[0] ?? '?').toUpperCase();
	const lastLine = (c: MobileSimConversation) =>
		sent[c.id]?.at(-1) ?? c.messages.at(-1)?.text ?? '';

	function startVideoCall() {
		if (!open) return;
		inVideoCall = true;
		callMuted = false;
		onEvent('mobile-videocall-started', { conversationId: open.id });
	}

	function send() {
		const text = draft.trim();
		if (!text || !open) return;
		sent[open.id] = [...(sent[open.id] ?? []), text];
		draft = '';
		onEvent('mobile-message-sent', { channel, conversationId: open.id, text });
	}

	const inVerdictMode = $derived(open != null && open.id === verdictConversationId);

	function verdict(isScam: boolean) {
		if (!open) return;
		onEvent('mobile-sms-verdict', { conversationId: open.id, isScam });
	}

	// Bubble colours: Viber purple; SMS blue on Android (Google Messages), green on iPhone.
	const mine = $derived(
		isViber
			? 'bg-[#7360f2] text-white'
			: isIos
				? 'bg-[#34c759] text-white'
				: 'bg-[#0b57d0] text-white'
	);
	const theirs = $derived(isIos ? 'bg-[#e9e9eb] text-slate-900' : 'bg-[#e7edf5] text-slate-900');
	const headerClass = $derived(
		isViber
			? 'bg-[#7360f2] text-white'
			: isIos
				? 'bg-[#f6f6f6] text-slate-900'
				: 'bg-white text-slate-900'
	);
	const iconBtn =
		'flex h-10 w-10 items-center justify-center rounded-full focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none active:bg-black/5';
</script>

<div
	data-testid="messaging-app"
	data-channel={channel}
	data-variant={variant}
	class="relative flex h-full flex-col bg-white"
>
	{#if !open}
		<header class={cn('shrink-0 px-4 pt-3 pb-2', headerClass)}>
			<p
				class={cn(
					'font-semibold',
					isIos ? 'text-3xl font-bold' : isViber ? 'text-center text-sm' : 'text-xl font-normal'
				)}
			>
				{title}
			</p>
			{#if !isViber}
				<label
					class={cn(
						'mt-2 flex h-10 items-center gap-2 px-3 text-sm text-slate-500',
						isIos ? 'rounded-xl bg-[#e3e3e8]' : 'rounded-full bg-[#eef1f6]'
					)}
				>
					<Search class="h-4 w-4" aria-hidden="true" />
					<input
						type="search"
						bind:value={query}
						placeholder="Αναζήτηση συνομιλιών"
						aria-label="Αναζήτηση συνομιλιών"
						class="min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-500"
					/>
				</label>
			{/if}
		</header>
		<ul class="flex-1 divide-y divide-slate-100 overflow-y-auto">
			{#each visible as convo (convo.id)}
				<li>
					<button
						type="button"
						onclick={() => (openId = convo.id)}
						aria-label={`Συνομιλία με ${convo.name}`}
						class="flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none active:bg-slate-50"
					>
						<span
							class={cn(
								'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white',
								isViber ? 'bg-[#7360f2]' : isUnknown(convo) ? 'bg-slate-400' : 'bg-[#0b57d0]'
							)}
							aria-hidden="true"
						>
							{isGroup(convo) ? '👥' : monogram(convo)}
						</span>
						<span class="min-w-0 flex-1">
							<span class="flex items-baseline justify-between gap-2">
								<span class="truncate text-base font-semibold text-slate-900">{convo.name}</span>
								<span class="shrink-0 text-xs text-slate-400"
									>{sent[convo.id]?.length ? 'τώρα' : '10:12'}</span
								>
							</span>
							<span class="line-clamp-1 text-sm text-slate-500">{lastLine(convo)}</span>
						</span>
					</button>
				</li>
			{:else}
				<li class="px-4 py-8 text-center text-sm text-slate-500">
					Καμία συνομιλία για «{query.trim()}».
				</li>
			{/each}
		</ul>
		{#if !isViber}
			<button
				type="button"
				onclick={() =>
					(notice =
						'Νέο μήνυμα: διαλέγεις επαφή ή γράφεις αριθμό. Σε αυτό το μάθημα απαντάς σε υπάρχουσα συνομιλία.')}
				aria-label="Νέο μήνυμα"
				class={cn(
					'absolute right-4 bottom-4 flex h-14 items-center gap-2 px-5 text-white shadow-lg focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none',
					isIos ? 'w-14 justify-center rounded-full bg-[#0a84ff] px-0' : 'rounded-2xl bg-[#0b57d0]'
				)}
			>
				<Plus class="h-5 w-5" aria-hidden="true" />{#if !isIos}<span class="text-sm font-medium"
						>Νέο μήνυμα</span
					>{/if}
			</button>
			{#if notice}
				<p
					class="absolute inset-x-4 bottom-20 rounded-xl bg-slate-900/85 px-3 py-2 text-xs text-white"
					role="status"
					aria-live="polite"
				>
					{notice}
				</p>
			{/if}
		{/if}
	{:else}
		<header
			class={cn(
				'flex shrink-0 items-center gap-1 px-2 py-2 text-sm font-semibold',
				headerClass,
				!isViber && 'border-b border-slate-200'
			)}
		>
			<button
				type="button"
				onclick={() => (openId = null)}
				aria-label="Πίσω στις συνομιλίες"
				class={cn(iconBtn, isIos && !isViber && 'text-[#0a84ff]')}
			>
				<ChevronLeft class="h-6 w-6" aria-hidden="true" />
			</button>
			{#if isIos && !isViber}
				<span class="flex flex-1 flex-col items-center">
					<span
						class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-400 text-sm text-white"
						aria-hidden="true">{isGroup(open) ? '👥' : monogram(open)}</span
					>
					<span class="mt-0.5 text-[11px] font-normal">{open.name}</span>
				</span>
			{:else}
				<span
					class="flex h-9 w-9 items-center justify-center rounded-full text-sm {isViber
						? 'bg-white/25'
						: 'bg-[#0b57d0] text-white'}"
					aria-hidden="true">{isGroup(open) ? '👥' : monogram(open)}</span
				>
				<span class="min-w-0 flex-1 truncate px-1 text-base">{open.name}</span>
			{/if}
			{#if isViber}
				<button
					type="button"
					onclick={() =>
						(notice =
							'Φωνητική κλήση μέσω Viber. Σε αυτό το μάθημα χρησιμοποιούμε την κάμερα (βιντεοκλήση).')}
					aria-label={`Φωνητική κλήση με ${open.name}`}
					class={iconBtn}
				>
					<Phone class="h-5 w-5" aria-hidden="true" />
				</button>
				<button
					type="button"
					onclick={startVideoCall}
					aria-label={`Βιντεοκλήση με ${open.name}`}
					class={iconBtn}
				>
					<Video class="h-6 w-6" aria-hidden="true" />
				</button>
			{:else}
				<button
					type="button"
					onclick={() =>
						(notice = 'Από εδώ καλείς τον αποστολέα. Δεν χρειάζεται σε αυτό το μάθημα.')}
					aria-label={`Κλήση ${open.name}`}
					class={iconBtn}
				>
					<Phone class="h-5 w-5" aria-hidden="true" />
				</button>
			{/if}
		</header>

		{#if inVideoCall}
			<!-- Mock βιντεοκλήση: αρκετά για να διδάξει το κουμπί & τον τερματισμό -->
			<div
				class="relative flex flex-1 flex-col items-center justify-center gap-4 bg-slate-900 text-white"
			>
				<span
					class="flex h-24 w-24 items-center justify-center rounded-full bg-slate-700 text-4xl"
					aria-hidden="true">👵</span
				>
				<p class="text-lg font-semibold">{open.name}</p>
				<p class="text-sm text-slate-300" role="status" aria-live="polite">
					{callMuted ? 'Το μικρόφωνό σου είναι κλειστό.' : 'Η βιντεοκλήση ξεκίνησε…'}
				</p>
				<!-- Self-view thumbnail -->
				<span
					class="absolute top-3 right-3 flex h-24 w-16 items-center justify-center rounded-xl border border-white/30 bg-slate-700 text-2xl"
					aria-hidden="true">🙂</span
				>
				<div class="mt-4 flex items-center gap-4">
					<button
						type="button"
						onclick={() => (callMuted = !callMuted)}
						aria-pressed={callMuted}
						aria-label="Σίγαση μικροφώνου"
						class={cn(
							'flex h-14 w-14 items-center justify-center rounded-full focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none',
							callMuted ? 'bg-white text-slate-900' : 'bg-white/20'
						)}
					>
						{#if callMuted}<MicOff class="h-6 w-6" aria-hidden="true" />{:else}<Mic
								class="h-6 w-6"
								aria-hidden="true"
							/>{/if}
					</button>
					<button
						type="button"
						onclick={() => (inVideoCall = false)}
						aria-label="Τερματισμός βιντεοκλήσης"
						class="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
					>
						<PhoneOff class="h-7 w-7" aria-hidden="true" />
					</button>
					<span
						class="flex h-14 w-14 items-center justify-center rounded-full bg-white/20"
						aria-hidden="true"><Camera class="h-6 w-6" /></span
					>
				</div>
			</div>
		{:else}
			<div
				class={cn(
					'flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-3',
					isIos && !isViber ? 'bg-white' : 'bg-[#f7f9fc]'
				)}
			>
				{#if !isIos || isViber}
					<p class="mb-1 text-center text-[11px] text-slate-400">
						{isViber ? 'Σήμερα' : 'SMS · Σήμερα'}
					</p>
				{/if}
				{#each open.messages as msg, i (i)}
					<p
						class={cn(
							'max-w-[80%] px-3.5 py-2 text-[15px] leading-snug',
							msg.from === 'me'
								? cn('self-end rounded-2xl rounded-br-md', mine)
								: cn('self-start rounded-2xl rounded-bl-md', theirs)
						)}
					>
						{msg.text}
					</p>
				{/each}
				{#each sent[open.id] ?? [] as text, i (i)}
					<p
						class={cn(
							'max-w-[80%] self-end rounded-2xl rounded-br-md px-3.5 py-2 text-[15px] leading-snug',
							mine
						)}
					>
						{text}
					</p>
					<span class="self-end pr-1 text-[10px] text-slate-400"
						>{isViber ? 'Προβλήθηκε ✓✓' : 'Παραδόθηκε'}</span
					>
				{/each}
				{#if notice}
					<p
						class="mt-2 self-center rounded-xl bg-slate-900/80 px-3 py-1.5 text-center text-xs text-white"
						role="status"
						aria-live="polite"
					>
						{notice}
					</p>
				{/if}
			</div>

			{#if inVerdictMode}
				<div class="shrink-0 space-y-2 border-t border-slate-200 bg-white px-3 py-3">
					<p class="text-center text-sm text-slate-600">Είναι αυτό το μήνυμα ασφαλές ή ύποπτο;</p>
					<div class="flex gap-2">
						<button
							type="button"
							onclick={() => verdict(false)}
							class="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-base font-semibold text-white transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none active:bg-emerald-700"
						>
							<ShieldCheck class="h-5 w-5" aria-hidden="true" /> Ασφαλές
						</button>
						<button
							type="button"
							onclick={() => verdict(true)}
							class="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 text-base font-semibold text-white transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none active:bg-red-700"
						>
							<TriangleAlert class="h-5 w-5" aria-hidden="true" /> Ύποπτο
						</button>
					</div>
				</div>
			{:else}
				<form
					class="flex shrink-0 items-center gap-2 border-t border-slate-200 bg-white px-3 py-2"
					onsubmit={(e) => {
						e.preventDefault();
						send();
					}}
				>
					{#if !isIos || isViber}
						<button
							type="button"
							onclick={() =>
								(notice =
									'Από εδώ στέλνεις φωτογραφία ή αρχείο. Σε αυτό το μάθημα γράφεις κείμενο.')}
							aria-label="Προσθήκη φωτογραφίας"
							class={cn(iconBtn, 'shrink-0 text-slate-500')}
						>
							<Plus class="h-5 w-5" aria-hidden="true" />
						</button>
					{/if}
					<input
						type="text"
						bind:value={draft}
						aria-label="Γράψε μήνυμα"
						placeholder={isIos && !isViber ? 'Μήνυμα SMS' : 'Γράψε μήνυμα…'}
						class="min-h-[44px] flex-1 rounded-full border border-slate-300 px-4 text-base text-slate-900 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
					/>
					<button
						type="submit"
						aria-label="Αποστολή"
						class={cn(
							'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none active:brightness-90',
							isViber ? 'bg-[#7360f2]' : isIos ? 'bg-[#34c759]' : 'bg-[#0b57d0]'
						)}
					>
						<Send class="h-5 w-5" aria-hidden="true" />
					</button>
				</form>
			{/if}
		{/if}
	{/if}
</div>
