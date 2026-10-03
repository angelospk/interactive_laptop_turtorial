<script lang="ts">
	import { resolveContentUrl } from '$lib/content/contentUrl';
	import { renderMarkdown, type TocEntry } from './renderMarkdown';
	import ImageLightbox from './ImageLightbox.svelte';

	interface Props {
		mdPath: string;
		sourceUrl?: string;
		/** Bindable: table of contents extracted from the rendered markdown. */
		toc?: TocEntry[];
	}
	let { mdPath, sourceUrl, toc = $bindable([]) }: Props = $props();

	let html = $state('');
	let error = $state('');
	let loading = $state(true);
	let enlarged = $state<{ src: string; alt: string } | null>(null);

	// The markdown is injected as HTML, so one listener on the article catches
	// a click on any picture inside it.
	function onArticleClick(e: MouseEvent) {
		if (e.target instanceof HTMLImageElement) {
			enlarged = { src: e.target.currentSrc || e.target.src, alt: e.target.alt };
		}
	}

	$effect(() => {
		const url = resolveContentUrl(mdPath);
		loading = true;
		error = '';
		toc = [];
		fetch(url)
			.then((r) => {
				if (!r.ok) throw new Error(`HTTP ${r.status}`);
				return r.text();
			})
			.then((txt) => {
				const rendered = renderMarkdown(txt);
				html = rendered.html;
				toc = rendered.toc;
			})
			.catch((e) => {
				error = e.message;
			})
			.finally(() => {
				loading = false;
			});
	});
</script>

{#if loading}
	<div class="flex justify-center py-8">
		<div
			class="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"
		></div>
	</div>
{:else if error}
	<p class="text-red-500">Σφάλμα φόρτωσης περιεχομένου: {error}</p>
{:else}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
	<article
		class="prose prose-lg max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-img:cursor-zoom-in prose-img:rounded-lg"
		onclick={onArticleClick}
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</article>
	{#if sourceUrl}
		<p class="mt-8 border-t pt-4 text-base text-muted-foreground">
			Πηγή:
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external source URL, not an app route -->
			<a class="underline" href={sourceUrl} target="_blank" rel="noopener noreferrer"
				>Εθνική Ακαδημία Ψηφιακών Ικανοτήτων (nadia.gov.gr)</a
			>
		</p>
	{/if}
{/if}

{#if enlarged}
	<ImageLightbox src={enlarged.src} alt={enlarged.alt} onclose={() => (enlarged = null)} />
{/if}
