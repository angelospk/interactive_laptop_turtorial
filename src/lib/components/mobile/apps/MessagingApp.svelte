<script lang="ts">
	import Send from '@lucide/svelte/icons/send';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import { cn } from '$lib/utils';
	import type { MobileSimConversation } from '$lib/lessons/mobileSim';

	/**
	 * Shared messaging mini-app: SMS ('sms' channel, green accents) and
	 * Viber-like chat ('viber' channel, purple accents). Semantic event:
	 *   mobile-message-sent { channel, conversationId, text }
	 */
	let {
		onEvent,
		conversations = [],
		channel = 'sms',
		title = 'Μηνύματα'
	}: {
		onEvent: (action: string, data?: Record<string, unknown>) => void;
		conversations?: MobileSimConversation[];
		channel?: 'sms' | 'viber';
		title?: string;
	} = $props();

	const isViber = $derived(channel === 'viber');

	let openId: string | null = $state(null);
	let draft = $state('');
	// Sent messages per conversation (appended after the seeded thread).
	let sent: Record<string, string[]> = $state({});

	const open = $derived(conversations.find((c) => c.id === openId) ?? null);

	function send() {
		const text = draft.trim();
		if (!text || !open) return;
		sent[open.id] = [...(sent[open.id] ?? []), text];
		draft = '';
		onEvent('mobile-message-sent', { channel, conversationId: open.id, text });
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
			<span class="w-9"></span>
		</header>

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
</div>
