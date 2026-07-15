<script lang="ts">
	import Lock from '@lucide/svelte/icons/lock';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import { parseHost } from '$lib/utils/mobileLink';

	/**
	 * Minimal mobile browser chrome (reusable by the QR and 2FA lessons): an
	 * address bar that puts the real host front and centre — because reading the
	 * host is the skill — plus a lock/warning by scheme. Presentational: the page
	 * body is passed in as {children}.
	 */
	let {
		url,
		children
	}: {
		url: string;
		children?: Snippet;
	} = $props();

	const parsedHost = $derived(parseHost(url));
	const host = $derived(parsedHost ?? '—');
	// Secure only when a real host parsed AND the scheme is https — so a malformed
	// or fallback value like `https://—` is never shown with a lock (CodeRabbit).
	const https = $derived(
		parsedHost !== null &&
			parsedHost.includes('.') &&
			url.trim().toLowerCase().startsWith('https://')
	);
</script>

<div data-testid="mobile-browser" class="flex h-full flex-col bg-white">
	<div class="flex shrink-0 items-center gap-2 bg-slate-100 px-3 py-2">
		<span
			class={cn(
				'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
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
		<span class="truncate text-xs text-slate-400">{url}</span>
	</div>
	<div class="flex-1 overflow-y-auto">
		{@render children?.()}
	</div>
</div>
