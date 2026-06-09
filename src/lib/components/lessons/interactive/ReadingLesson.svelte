<script lang="ts">
	import MarkdownView from '$lib/components/content/MarkdownView.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { Lesson } from '$lib/db/schema';

	let { lesson, onComplete, onBack } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}>();

	const config = lesson.config as { mdPath: string; sourceUrl?: string };
</script>

<div class="mx-auto max-w-3xl p-4">
	<MarkdownView mdPath={config.mdPath} sourceUrl={config.sourceUrl} />
	<div class="mt-6 flex justify-between">
		<Button variant="outline" onclick={onBack}>Πίσω</Button>
		<Button onclick={() => onComplete(100)}>Το διάβασα ✓</Button>
	</div>
</div>
