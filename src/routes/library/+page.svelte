<script lang="ts">
	import { resolve } from '$app/paths';
	let { data } = $props();
</script>

<div class="mx-auto max-w-3xl px-4 py-6 sm:px-6">
	<h1 class="mb-6 text-3xl font-bold">Βιβλιοθήκη Θεωρίας</h1>
	{#each data.manifest.courses as course, ci (ci)}
		<section class="mb-8">
			<h2 class="mb-2 text-2xl font-semibold">{course.title}</h2>
			{#each course.chapters as chapter, hi (hi)}
				<h3 class="text-muted-foreground mt-4 mb-1 text-lg font-medium">{chapter.title}</h3>
				<ul class="ml-4 list-disc space-y-1">
					{#each chapter.subsections as sub, si (si)}
						<li>
							<a class="hover:text-primary underline" href={resolve('/library/[course]/[sub]', { course: course.id, sub: sub.id })}
								>{sub.title}</a
							>
						</li>
					{/each}
				</ul>
			{/each}
		</section>
	{/each}
</div>
