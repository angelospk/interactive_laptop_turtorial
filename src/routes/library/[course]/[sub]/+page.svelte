<script lang="ts">
	import { rememberTitle } from '$lib/offlineLessons';
	import TextSizeToggle from '$lib/components/TextSizeToggle.svelte';
	import MarkdownView from '$lib/components/content/MarkdownView.svelte';
	import ContentToc from '$lib/components/content/ContentToc.svelte';
	import LessonNavBar from '$lib/components/content/LessonNavBar.svelte';
	import ScrollToTop from '$lib/components/content/ScrollToTop.svelte';
	import type { TocEntry } from '$lib/components/content/renderMarkdown';
	import { Button } from '$lib/components/ui/button';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import List from '@lucide/svelte/icons/list';
	let { data } = $props();

	let toc = $state<TocEntry[]>([]);
	// Noted for the offline page, which may only have this page's data cached.
	$effect(() => {
		rememberTitle(`/library/${data.courseId}/${data.sub.id}`, data.sub.title);
	});
</script>

<LessonNavBar {toc} courseId={data.courseId} prev={data.prev} next={data.next} />
<ScrollToTop />

<svelte:head>
	<title>{data.sub.title} — Βιβλιοθήκη</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 pt-20 pb-8 sm:px-6 lg:flex lg:gap-8">
	<div class="min-w-0 flex-1 lg:max-w-3xl">
		<!-- breadcrumb -->
		<nav class="mb-4 text-base text-muted-foreground">
			<a class="hover:text-foreground hover:underline" href="/library">Βιβλιοθήκη</a>
			<span class="mx-1">›</span>
			<span>{data.courseTitle}</span>
			<span class="mx-1">›</span>
			<span>{data.chapterTitle}</span>
		</nav>
		<div class="mb-4"><TextSizeToggle /></div>
		<h1 class="mb-6 text-2xl font-bold sm:text-3xl">{data.sub.title}</h1>

		<MarkdownView mdPath={data.sub.mdPath} sourceUrl={data.sub.sourceUrl} bind:toc />

		{#if data.sub.lessonLinks?.length}
			<div class="mt-8 border-t pt-4">
				<h3 class="mb-3 font-semibold">Δοκιμάστε το στην πράξη</h3>
				<ul class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
					{#each data.sub.lessonLinks as link}
						<li>
							<a
								class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
								href="/modules/{link.module}/{link.lesson}"
							>
								<span aria-hidden="true">▶</span>
								{link.label ?? 'Άσκηση'}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if data.sub.modules.length}
			<div class="mt-6 {data.sub.lessonLinks?.length ? '' : 'border-t pt-4'}">
				<h3 class="mb-2 font-semibold">Σχετικές ασκήσεις</h3>
				<ul class="flex flex-wrap gap-2">
					{#each data.sub.modules as mod}
						<li>
							<a
								class="inline-block rounded-lg bg-secondary px-4 py-2 text-base hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
								href="/modules/{mod}">{mod}</a
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
					class="h-auto max-w-[48%] flex-col items-start py-2 text-left whitespace-normal"
					href="/library/{data.courseId}/{data.prev.id}"
				>
					<span class="flex items-center gap-1 text-sm text-muted-foreground"
						><ChevronLeft class="h-3 w-3" /> Προηγούμενο</span
					>
					<span class="text-base leading-snug font-medium break-words whitespace-normal"
						>{data.prev.title}</span
					>
				</Button>
			{:else}
				<span></span>
			{/if}
			{#if data.next}
				<Button
					variant="outline"
					class="h-auto max-w-[48%] flex-col items-end py-2 text-right whitespace-normal"
					href="/library/{data.courseId}/{data.next.id}"
				>
					<span class="flex items-center gap-1 text-sm text-muted-foreground"
						>Επόμενο <ChevronRight class="h-3 w-3" /></span
					>
					<span class="text-base leading-snug font-medium break-words whitespace-normal"
						>{data.next.title}</span
					>
				</Button>
			{/if}
		</div>
	</div>

	<!-- desktop TOC (sticky sidebar) -->
	{#if toc.length}
		<aside class="hidden w-56 shrink-0 lg:block">
			<div class="sticky top-20">
				<p
					class="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
				>
					<List class="h-4 w-4" /> Περιεχόμενα
				</p>
				<ContentToc {toc} />
			</div>
		</aside>
	{/if}
</div>
