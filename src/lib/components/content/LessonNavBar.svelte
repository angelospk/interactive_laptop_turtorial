<script lang="ts">
	import { onMount } from 'svelte';
	import ContentToc from './ContentToc.svelte';
	import type { TocEntry } from './renderMarkdown';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import List from '@lucide/svelte/icons/list';

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
						href="/library/{courseId}/{prev.id}"
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
			<div class="relative flex shrink-0 justify-center">
				{#if toc.length}
					<button
						type="button"
						onclick={() => (menuOpen = !menuOpen)}
						aria-expanded={menuOpen}
						class="bg-muted/60 hover:bg-muted flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
					>
						<List class="h-4 w-4" />
						<span>Περιεχόμενα</span>
						<ChevronDown class="h-4 w-4 transition-transform {menuOpen ? 'rotate-180' : ''}" />
					</button>
					{#if menuOpen}
						<!-- click-away backdrop -->
						<button
							type="button"
							class="fixed inset-0 z-40 cursor-default"
							aria-label="Κλείσιμο περιεχομένων"
							onclick={() => (menuOpen = false)}
						></button>
						<div
							class="bg-popover text-popover-foreground absolute top-full left-1/2 z-50 mt-2 max-h-[60vh] w-[min(20rem,calc(100vw-1.5rem))] -translate-x-1/2 overflow-auto rounded-xl border p-3 shadow-lg"
						>
							<ContentToc {toc} onnavigate={() => (menuOpen = false)} />
						</div>
					{/if}
				{/if}
			</div>

			<!-- next lesson -->
			<div class="flex flex-1 justify-end">
				{#if next}
					<a
						href="/library/{courseId}/{next.id}"
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
