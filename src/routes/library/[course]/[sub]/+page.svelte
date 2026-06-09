<script lang="ts">
	import MarkdownView from '$lib/components/content/MarkdownView.svelte';
	import ContentToc from '$lib/components/content/ContentToc.svelte';
	import type { TocEntry } from '$lib/components/content/renderMarkdown';
	import { Button } from '$lib/components/ui/button';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import List from '@lucide/svelte/icons/list';
	let { data } = $props();

	let toc = $state<TocEntry[]>([]);
	let mobileToc = $state<HTMLDetailsElement | null>(null);
</script>

<div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:flex lg:gap-8">
	<div class="min-w-0 flex-1 lg:max-w-3xl">
		<!-- breadcrumb -->
		<nav class="text-muted-foreground mb-4 text-sm">
			<a class="hover:text-foreground hover:underline" href="/library">Βιβλιοθήκη</a>
			<span class="mx-1">›</span>
			<span>{data.courseTitle}</span>
			<span class="mx-1">›</span>
			<span>{data.chapterTitle}</span>
		</nav>
		<h1 class="mb-6 text-2xl font-bold sm:text-3xl">{data.sub.title}</h1>

		<!-- mobile TOC (collapsible) -->
		{#if toc.length}
			<details
				bind:this={mobileToc}
				class="bg-muted/40 mb-6 rounded-lg border px-4 py-2 lg:hidden"
			>
				<summary class="flex cursor-pointer items-center gap-2 py-1 font-medium select-none">
					<List class="h-4 w-4" /> Περιεχόμενα
				</summary>
				<div class="mt-2 border-t pt-2">
					<ContentToc {toc} onnavigate={() => mobileToc && (mobileToc.open = false)} />
				</div>
			</details>
		{/if}

		<MarkdownView mdPath={data.sub.mdPath} sourceUrl={data.sub.sourceUrl} bind:toc />

		{#if data.sub.modules.length}
			<div class="mt-8 border-t pt-4">
				<h3 class="mb-2 font-semibold">Σχετικές ασκήσεις</h3>
				<ul class="flex flex-wrap gap-2">
					{#each data.sub.modules as mod}
						<li>
							<a class="bg-secondary rounded px-3 py-1 text-sm underline" href="/modules/{mod}"
								>{mod}</a
							>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- prev / next -->
		<div class="mt-10 flex items-stretch justify-between gap-3 border-t pt-6">
			{#if data.prev}
				<Button
					variant="outline"
					class="h-auto max-w-[45%] flex-col items-start py-2 text-left"
					href="/library/{data.courseId}/{data.prev.id}"
				>
					<span class="text-muted-foreground flex items-center gap-1 text-xs"
						><ChevronLeft class="h-3 w-3" /> Προηγούμενο</span
					>
					<span class="line-clamp-1 text-sm font-medium">{data.prev.title}</span>
				</Button>
			{:else}
				<span></span>
			{/if}
			{#if data.next}
				<Button
					variant="outline"
					class="h-auto max-w-[45%] flex-col items-end py-2 text-right"
					href="/library/{data.courseId}/{data.next.id}"
				>
					<span class="text-muted-foreground flex items-center gap-1 text-xs"
						>Επόμενο <ChevronRight class="h-3 w-3" /></span
					>
					<span class="line-clamp-1 text-sm font-medium">{data.next.title}</span>
				</Button>
			{/if}
		</div>
	</div>

	<!-- desktop TOC (sticky sidebar) -->
	{#if toc.length}
		<aside class="hidden w-56 shrink-0 lg:block">
			<div class="sticky top-6">
				<p class="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
					<List class="h-4 w-4" /> Περιεχόμενα
				</p>
				<ContentToc {toc} />
			</div>
		</aside>
	{/if}
</div>
