<script lang="ts">
	import MarkdownView from '$lib/components/content/MarkdownView.svelte';
	import SectionNav from '$lib/components/content/SectionNav.svelte';
	import ScrollToTop from '$lib/components/content/ScrollToTop.svelte';
	import type { TocEntry } from '$lib/components/content/renderMarkdown';
	import { Button } from '$lib/components/ui/button';
	import type { Lesson } from '$lib/db/schema';

	let { lesson, onComplete, onBack } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}>();

	let config = $derived(lesson.config as { mdPath: string; sourceUrl?: string });

	let toc = $state<TocEntry[]>([]);
</script>

<div class="mx-auto max-w-3xl p-4">
	<MarkdownView mdPath={config.mdPath} sourceUrl={config.sourceUrl} bind:toc />

	<SectionNav {toc} />

	<div class="mt-6 flex justify-between">
		<Button variant="outline" onclick={onBack}>Πίσω</Button>
		<Button onclick={() => onComplete(100)}>Το διάβασα ✓</Button>
	</div>
</div>

<ScrollToTop />
