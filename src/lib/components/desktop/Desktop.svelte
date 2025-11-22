<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	let {
		children,
		backgroundUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80",
		class: className
	} = $props<{
		children?: Snippet;
		backgroundUrl?: string;
		class?: string;
	}>();
</script>

<div
	class={cn(
		"relative h-[600px] w-full overflow-hidden rounded-lg border-4 border-slate-800 bg-cover bg-center shadow-2xl select-none",
		className
	)}
	style="background-image: url('{backgroundUrl}')"
>
	{@render children?.()}
</div>
