<script lang="ts">
	import ContentToc from './ContentToc.svelte';
	import type { TocEntry } from './renderMarkdown';
	import List from '@lucide/svelte/icons/list';

	let { toc }: { toc: TocEntry[] } = $props();
</script>

<!-- Never taller than the screen: with large text the list scrolls inside
     itself instead of running past the bottom edge, out of reach. -->
<div
	data-toc-sidebar
	class="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain pe-1 pb-4"
>
	<p
		class="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
	>
		<List class="h-4 w-4" /> Περιεχόμενα
	</p>
	<ContentToc {toc} />
</div>
