<script lang="ts">
	import { resolveContentUrl } from '$lib/content/contentUrl';
	import { renderMarkdown } from './renderMarkdown';

	interface Props {
		mdPath: string;
		sourceUrl?: string;
	}
	let { mdPath, sourceUrl }: Props = $props();

	let html = $state('');
	let error = $state('');
	let loading = $state(true);

	$effect(() => {
		const url = resolveContentUrl(mdPath);
		loading = true;
		error = '';
		fetch(url)
			.then((r) => {
				if (!r.ok) throw new Error(`HTTP ${r.status}`);
				return r.text();
			})
			.then((txt) => {
				html = renderMarkdown(txt);
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
			class="border-primary h-6 w-6 animate-spin rounded-full border-4 border-t-transparent"
		></div>
	</div>
{:else if error}
	<p class="text-red-500">Σφάλμα φόρτωσης περιεχομένου: {error}</p>
{:else}
	<article class="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-img:rounded-lg">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</article>
	{#if sourceUrl}
		<p class="text-muted-foreground mt-8 border-t pt-4 text-sm">
			Πηγή: <a class="underline" href={sourceUrl} target="_blank" rel="noopener noreferrer"
				>Εθνική Ακαδημία Ψηφιακών Ικανοτήτων (nadia.gov.gr)</a
			>
		</p>
	{/if}
{/if}
