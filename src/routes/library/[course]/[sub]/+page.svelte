<script lang="ts">
	import MarkdownView from '$lib/components/content/MarkdownView.svelte';
	import { Button } from '$lib/components/ui/button';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	let { data } = $props();
</script>

<div class="mx-auto max-w-3xl px-4 py-6 sm:px-6">
	<!-- breadcrumb -->
	<nav class="text-muted-foreground mb-4 text-sm">
		<a class="hover:text-foreground hover:underline" href="/library">Βιβλιοθήκη</a>
		<span class="mx-1">›</span>
		<span>{data.courseTitle}</span>
		<span class="mx-1">›</span>
		<span>{data.chapterTitle}</span>
	</nav>
	<h1 class="mb-6 text-2xl font-bold sm:text-3xl">{data.sub.title}</h1>

	<MarkdownView mdPath={data.sub.mdPath} sourceUrl={data.sub.sourceUrl} />

	{#if data.sub.modules.length}
		<div class="mt-8 border-t pt-4">
			<h3 class="mb-2 font-semibold">Σχετικές ασκήσεις</h3>
			<ul class="flex flex-wrap gap-2">
				{#each data.sub.modules as mod}
					<li>
						<a class="bg-secondary rounded px-3 py-1 text-sm underline" href="/modules/{mod}">{mod}</a>
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
