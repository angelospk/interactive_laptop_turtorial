<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import TocMenu from './TocMenu.svelte';
	import type { TocEntry } from './renderMarkdown';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	interface NavLink {
		id: string;
		title: string;
	}
	interface Props {
		toc: TocEntry[];
		courseId: string;
		prev: NavLink | null;
		next: NavLink | null;
	}
	let { toc, courseId, prev, next }: Props = $props();

	// Auto-hide: hidden when scrolling down, visible when scrolling up / near top.
	let hidden = $state(false);
	let menuOpen = $state(false);

	onMount(() => {
		let lastY = window.scrollY;
		const onScroll = () => {
			const y = window.scrollY;
			if (y < 80) {
				hidden = false;
			} else if (y > lastY + 6) {
				hidden = true;
				menuOpen = false;
			} else if (y < lastY - 6) {
				hidden = false;
			}
			lastY = y;
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<div
	class="fixed inset-x-0 top-0 z-40 transition-transform duration-300 {hidden
		? '-translate-y-full'
		: 'translate-y-0'}"
>
	<div class="bg-background/80 supports-[backdrop-filter]:bg-background/65 border-b backdrop-blur">
		<div class="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
			<!-- prev lesson -->
			<div class="flex flex-1 justify-start">
				{#if prev}
					<a
						href={resolve('/library/[course]/[sub]', { course: courseId, sub: prev.id })}
						title={prev.title}
						class="hover:bg-muted text-muted-foreground hover:text-foreground flex max-w-full items-center gap-1 rounded-lg px-2 py-1.5"
					>
						<ChevronLeft class="h-5 w-5 shrink-0" />
						<span class="hidden max-w-[10rem] truncate text-sm sm:inline">{prev.title}</span>
						<span class="sr-only">Προηγούμενο μάθημα</span>
					</a>
				{/if}
			</div>

			<!-- TOC dropdown (center) -->
			{#if toc.length}
				<TocMenu {toc} bind:open={menuOpen} />
			{/if}

			<!-- next lesson -->
			<div class="flex flex-1 justify-end">
				{#if next}
					<a
						href={resolve('/library/[course]/[sub]', { course: courseId, sub: next.id })}
						title={next.title}
						class="hover:bg-muted text-muted-foreground hover:text-foreground flex max-w-full items-center gap-1 rounded-lg px-2 py-1.5"
					>
						<span class="hidden max-w-[10rem] truncate text-sm sm:inline">{next.title}</span>
						<span class="sr-only">Επόμενο μάθημα</span>
						<ChevronRight class="h-5 w-5 shrink-0" />
					</a>
				{/if}
			</div>
		</div>
	</div>
</div>
