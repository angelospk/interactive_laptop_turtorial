<script lang="ts">
	import MarkdownView from '$lib/components/content/MarkdownView.svelte';
	let { data } = $props();
</script>

<div class="mx-auto max-w-3xl p-6">
	<a class="text-sm underline" href="/library">← Βιβλιοθήκη</a>
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
</div>
