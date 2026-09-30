<script lang="ts">
	import { resolve } from '$app/paths';
	import TextSizeToggle from '$lib/components/TextSizeToggle.svelte';
	let { data } = $props();
</script>

<div class="mx-auto max-w-3xl px-4 py-6 sm:px-6">
	<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-3xl font-bold">Βιβλιοθήκη Θεωρίας</h1>
		<TextSizeToggle />
	</div>
	{#each data.manifest.courses as course, ci (ci)}
		<section class="mb-8">
			<h2 class="mb-2 text-2xl font-semibold">{course.title}</h2>
			{#each course.chapters as chapter, hi (hi)}
				<h3 class="mt-4 mb-1 text-lg font-medium text-muted-foreground">{chapter.title}</h3>
				<ul class="ml-4 list-disc space-y-1.5">
					{#each chapter.subsections as sub, si (si)}
						<li>
							<a
								class="inline-flex min-h-11 items-center py-1 text-lg underline hover:text-primary"
								href={resolve('/library/[course]/[sub]', { course: course.id, sub: sub.id })}
								>{sub.title}</a
							>
						</li>
					{/each}
				</ul>
			{/each}
		</section>
	{/each}
</div>
