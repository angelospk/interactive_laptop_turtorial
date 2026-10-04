<script lang="ts">
	import Lock from '@lucide/svelte/icons/lock';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Share from '@lucide/svelte/icons/share';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Copy from '@lucide/svelte/icons/copy';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
	import Home from '@lucide/svelte/icons/home';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import { parseHost } from '$lib/utils/mobileLink';

	/**
	 * Mobile browser chrome (reusable by the QR and 2FA lessons): Chrome on
	 * Android (address bar on top, menu dots), Safari on iPhone (address bar and
	 * toolbar at the bottom). Either way the real host is front and centre —
	 * reading the host is the skill — with a lock or a warning by scheme. The
	 * page body is passed in as {children}; the toolbar buttons explain
	 * themselves since no lesson needs them.
	 */
	let {
		url,
		variant = 'android',
		children
	}: {
		url: string;
		variant?: 'android' | 'ios';
		children?: Snippet;
	} = $props();

	const isIos = $derived(variant === 'ios');
	const parsedHost = $derived(parseHost(url));
	const host = $derived(parsedHost ?? '—');
	// Secure only when a real host parsed AND the scheme is https — so a malformed
	// or fallback value like `https://—` is never shown with a lock (CodeRabbit).
	const https = $derived(
		parsedHost !== null &&
			parsedHost.includes('.') &&
			url.trim().toLowerCase().startsWith('https://')
	);

	let notice = $state('');
	const explain = (t: string) => (notice = t);
	const toolBtn =
		'flex h-11 w-11 items-center justify-center rounded-full focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:outline-none active:bg-black/5';
</script>

{#snippet addressBar()}
	<div
		class={cn(
			'flex min-h-11 flex-1 items-center gap-2 px-3 text-sm',
			isIos ? 'rounded-xl bg-white shadow-sm' : 'rounded-full bg-[#eef1f6]'
		)}
		role="group"
		aria-label="Γραμμή διεύθυνσης"
	>
		<span
			class={cn(
				'flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
				https ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
			)}
		>
			{#if https}
				<Lock class="h-3.5 w-3.5" aria-hidden="true" />
			{:else}
				<TriangleAlert class="h-3.5 w-3.5" aria-hidden="true" />
			{/if}
			<span data-testid="browser-host">{host}</span>
		</span>
		<span class="min-w-0 truncate text-xs text-slate-500">{url}</span>
		{#if !isIos}
			<button
				type="button"
				onclick={() => explain('Ανανέωση: ξαναφορτώνει τη σελίδα.')}
				aria-label="Ανανέωση"
				class="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500"
			>
				<RotateCw class="h-4 w-4" aria-hidden="true" />
			</button>
		{/if}
	</div>
{/snippet}

<div data-testid="mobile-browser" data-variant={variant} class="flex h-full flex-col bg-white">
	{#if !isIos}
		<!-- Chrome: address bar on top -->
		<div class="flex shrink-0 items-center gap-1 bg-white px-2 py-1.5 shadow-sm">
			<button
				type="button"
				onclick={() => explain('Αρχική σελίδα του Chrome.')}
				aria-label="Αρχική σελίδα"
				class={cn(toolBtn, 'text-slate-500')}><Home class="h-5 w-5" aria-hidden="true" /></button
			>
			{@render addressBar()}
			<span
				class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 border-slate-500 text-xs font-bold text-slate-600"
				aria-label="1 καρτέλα"
				role="img">1</span
			>
			<button
				type="button"
				onclick={() =>
					explain('Μενού Chrome: αγαπημένα, ιστορικό, ρυθμίσεις. Δεν χρειάζεται στο μάθημα.')}
				aria-label="Μενού"
				class={cn(toolBtn, 'text-slate-500')}
				><EllipsisVertical class="h-5 w-5" aria-hidden="true" /></button
			>
		</div>
	{/if}

	<div class="min-h-0 flex-1 overflow-y-auto">
		{@render children?.()}
	</div>

	{#if notice}
		<p
			class="shrink-0 bg-slate-900/85 px-3 py-1.5 text-center text-xs text-white"
			role="status"
			aria-live="polite"
		>
			{notice}
		</p>
	{/if}

	{#if isIos}
		<!-- Safari: address bar + toolbar at the bottom -->
		<div class="shrink-0 space-y-1 bg-[#f6f6f6] px-2 pt-2 pb-1">
			<div class="flex items-center gap-1">
				{@render addressBar()}
			</div>
			<div class="flex items-center justify-between text-[#0a84ff]">
				<button
					type="button"
					onclick={() => explain('Πίσω: προηγούμενη σελίδα.')}
					aria-label="Πίσω"
					class={toolBtn}><ChevronLeft class="h-6 w-6" aria-hidden="true" /></button
				>
				<button type="button" aria-label="Μπροστά" disabled class={cn(toolBtn, 'text-slate-300')}
					><ChevronRight class="h-6 w-6" aria-hidden="true" /></button
				>
				<button
					type="button"
					onclick={() =>
						explain('Κοινή χρήση: στέλνεις τον σύνδεσμο σε άλλον. Δεν χρειάζεται στο μάθημα.')}
					aria-label="Κοινή χρήση"
					class={toolBtn}><Share class="h-5 w-5" aria-hidden="true" /></button
				>
				<button
					type="button"
					onclick={() => explain('Σελιδοδείκτες και ιστορικό.')}
					aria-label="Σελιδοδείκτες"
					class={toolBtn}><BookOpen class="h-5 w-5" aria-hidden="true" /></button
				>
				<button
					type="button"
					onclick={() => explain('Καρτέλες: ανοιχτές σελίδες. Έχεις μία.')}
					aria-label="Καρτέλες"
					class={toolBtn}><Copy class="h-5 w-5" aria-hidden="true" /></button
				>
			</div>
		</div>
	{/if}
</div>
