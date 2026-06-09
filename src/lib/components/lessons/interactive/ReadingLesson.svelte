<script lang="ts">
	import MarkdownView from '$lib/components/content/MarkdownView.svelte';
	import ContentToc from '$lib/components/content/ContentToc.svelte';
	import ScrollToTop from '$lib/components/content/ScrollToTop.svelte';
	import type { TocEntry } from '$lib/components/content/renderMarkdown';
	import { Button } from '$lib/components/ui/button';
	import List from '@lucide/svelte/icons/list';
	import type { Lesson } from '$lib/db/schema';

	let { lesson, onComplete, onBack } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}>();

	let config = $derived(lesson.config as { mdPath: string; sourceUrl?: string });

	let toc = $state<TocEntry[]>([]);
	let tocEl = $state<HTMLDetailsElement | null>(null);
</script>

<div class="mx-auto max-w-3xl p-4">
	{#if toc.length}
		<details bind:this={tocEl} class="bg-muted/40 mb-6 rounded-lg border px-4 py-2">
			<summary class="flex cursor-pointer items-center gap-2 py-1 font-medium select-none">
				<List class="h-4 w-4" /> Περιεχόμενα
			</summary>
			<div class="mt-2 border-t pt-2">
				<ContentToc {toc} onnavigate={() => tocEl && (tocEl.open = false)} />
			</div>
		</details>
	{/if}

	<MarkdownView mdPath={config.mdPath} sourceUrl={config.sourceUrl} bind:toc />

	<div class="mt-6 flex justify-between">
		<Button variant="outline" onclick={onBack}>Πίσω</Button>
		<Button onclick={() => onComplete(100)}>Το διάβασα ✓</Button>
	</div>
</div>

<ScrollToTop />
