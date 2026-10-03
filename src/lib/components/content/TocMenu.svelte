<script lang="ts">
	import ContentToc from './ContentToc.svelte';
	import type { TocEntry } from './renderMarkdown';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import List from '@lucide/svelte/icons/list';

	interface Props {
		toc: TocEntry[];
		/** Bindable, so a parent can close the list (e.g. when the bar hides). */
		open?: boolean;
		/** Where the list opens: under the button, or above it at the bottom of the screen. */
		placement?: 'below' | 'above';
	}
	let { toc, open = $bindable(false), placement = 'below' }: Props = $props();
</script>

<div class="relative flex shrink-0 justify-center">
	<button
		type="button"
		onclick={() => (open = !open)}
		aria-expanded={open}
		class="bg-muted/60 hover:bg-muted flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
	>
		<List class="h-4 w-4" />
		<span>Περιεχόμενα</span>
		<ChevronDown
			class="h-4 w-4 transition-transform {open === (placement === 'below') ? 'rotate-180' : ''}"
		/>
	</button>
	{#if open}
		<!-- click-away backdrop -->
		<button
			type="button"
			class="fixed inset-0 z-40 cursor-default"
			aria-label="Κλείσιμο περιεχομένων"
			onclick={() => (open = false)}
		></button>
		<div
			class="bg-popover text-popover-foreground absolute left-1/2 z-50 max-h-[60vh] w-[min(20rem,calc(100vw-1.5rem))] -translate-x-1/2 overflow-auto rounded-xl border p-3 shadow-lg {placement ===
			'below'
				? 'top-full mt-2'
				: 'bottom-full mb-2'}"
		>
			<ContentToc {toc} onnavigate={() => (open = false)} />
		</div>
	{/if}
</div>
