<script lang="ts">
	import Send from '@lucide/svelte/icons/send';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import Video from '@lucide/svelte/icons/video';
	import PhoneOff from '@lucide/svelte/icons/phone-off';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { cn } from '$lib/utils';
	import type { MobileSimConversation } from '$lib/lessons/mobileSim';

	/**
	 * Shared messaging mini-app: SMS ('sms' channel, green accents) and
	 * Viber-like chat ('viber' channel, purple accents). Semantic events:
	 *   mobile-message-sent { channel, conversationId, text }
	 *   mobile-sms-verdict  { conversationId, isScam }   (scam-spotting lesson)
	 */
	let {
		onEvent,
		conversations = [],
		channel = 'sms',
		title = 'Μηνύματα',
		verdictConversationId = null
	}: {
		onEvent: (action: string, data?: Record<string, unknown>) => void;
		conversations?: MobileSimConversation[];
		channel?: 'sms' | 'viber';
		title?: string;
		/** When the open conversation matches, show «Ασφαλές/Ύποπτο» buttons. */
		verdictConversationId?: string | null;
	} = $props();

	const isViber = $derived(channel === 'viber');

	let openId: string | null = $state(null);
	let draft = $state('');
	// Sent messages per conversation (appended after the seeded thread).
	let sent: Record<string, string[]> = $state({});
	let inVideoCall = $state(false);

	const open = $derived(conversations.find((c) => c.id === openId) ?? null);

	function startVideoCall() {
		if (!open) return;
		inVideoCall = true;
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
</script>

<div data-testid="messaging-app" data-channel={channel} class="flex h-full flex-col bg-white">
	{#if !open}
		<header
			class={cn(
				'shrink-0 px-4 py-2 text-center text-sm font-semibold',
				isViber ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
			)}
		>
			{title}
		</header>
		<ul class="flex-1 divide-y divide-slate-100 overflow-y-auto">
			{#each conversations as convo (convo.id)}
				<li>
					<button
						type="button"
						onclick={() => (openId = convo.id)}
						aria-label={`Συνομιλία με ${convo.name}`}
						class="flex w-full min-h-[56px] flex-col items-start gap-0.5 px-4 py-3 text-left transition active:bg-slate-50 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
					>
						<span class="text-base font-semibold text-slate-900">{convo.name}</span>
						<span class="line-clamp-1 text-sm text-slate-500">
							{convo.messages.at(-1)?.text ?? ''}
						</span>
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<header
			class={cn(
				'flex shrink-0 items-center gap-1 px-2 py-2 text-sm font-semibold',
				isViber ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
			)}
		>
			<button
				type="button"
				onclick={() => (openId = null)}
				aria-label="Πίσω στις συνομιλίες"
				class="flex h-9 w-9 items-center justify-center rounded-full focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
			>
				<ChevronLeft class="h-5 w-5" aria-hidden="true" />
			</button>
			<span class="flex-1 text-center">{open.name}</span>
			{#if isViber}
				<button
					type="button"
					onclick={startVideoCall}
					aria-label={`Βιντεοκλήση με ${open.name}`}
					class="flex h-9 w-9 items-center justify-center rounded-full focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
				>
					<Video class="h-5 w-5" aria-hidden="true" />
				</button>
			{:else}
				<span class="w-9"></span>
			{/if}
		</header>

		{#if inVideoCall}
			<!-- Mock βιντεοκλήση: αρκετά για να διδάξει το κουμπί & τον τερματισμό -->
			<div class="flex flex-1 flex-col items-center justify-center gap-4 bg-slate-900 text-white">
				<span class="flex h-24 w-24 items-center justify-center rounded-full bg-slate-700 text-4xl">
					👵
				</span>
				<p class="text-lg font-semibold">{open.name}</p>
				<p class="text-sm text-slate-300" role="status" aria-live="polite">
					Η βιντεοκλήση ξεκίνησε…
				</p>
				<button
					type="button"
					onclick={() => (inVideoCall = false)}
					aria-label="Τερματισμός βιντεοκλήσης"
					class="mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
				>
					<PhoneOff class="h-6 w-6" aria-hidden="true" />
				</button>
			</div>
		{:else}

		<div class="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-3">
			{#each open.messages as msg, i (i)}
				<p
					class={cn(
						'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
						msg.from === 'me'
							? cn('self-end text-white', isViber ? 'bg-purple-600' : 'bg-green-600')
							: 'self-start bg-slate-100 text-slate-900'
					)}
				>
					{msg.text}
				</p>
			{/each}
			{#each sent[open.id] ?? [] as text, i (i)}
				<p
					class={cn(
						'max-w-[80%] self-end rounded-2xl px-3 py-2 text-sm text-white',
						isViber ? 'bg-purple-600' : 'bg-green-600'
					)}
				>
					{text}
				</p>
			{/each}
		</div>

		{#if inVerdictMode}
			<div class="shrink-0 space-y-2 border-t border-slate-200 bg-white px-3 py-3">
				<p class="text-center text-sm text-slate-600">Είναι αυτό το μήνυμα ασφαλές ή ύποπτο;</p>
				<div class="flex gap-2">
					<button
						type="button"
						onclick={() => verdict(false)}
						class="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-base font-semibold text-white transition active:bg-emerald-700 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
					>
						<ShieldCheck class="h-5 w-5" aria-hidden="true" /> Ασφαλές
					</button>
					<button
						type="button"
						onclick={() => verdict(true)}
						class="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 text-base font-semibold text-white transition active:bg-red-700 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
					>
						<TriangleAlert class="h-5 w-5" aria-hidden="true" /> Ύποπτο
					</button>
				</div>
			</div>
		{:else}
		<form
			class="flex shrink-0 items-center gap-2 border-t border-slate-200 px-3 py-2"
			onsubmit={(e) => {
				e.preventDefault();
				send();
			}}
		>
			<input
				type="text"
				bind:value={draft}
				aria-label="Γράψε μήνυμα"
				placeholder="Γράψε μήνυμα…"
				class="min-h-[44px] flex-1 rounded-full border border-slate-300 px-4 text-base text-slate-900 focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none"
			/>
			<button
				type="submit"
				aria-label="Αποστολή"
				class={cn(
					'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow transition focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none',
					isViber ? 'bg-purple-600 active:bg-purple-700' : 'bg-green-600 active:bg-green-700'
				)}
			>
				<Send class="h-5 w-5" aria-hidden="true" />
			</button>
		</form>
		{/if}
		{/if}
	{/if}
</div>
