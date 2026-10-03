<script lang="ts">
	import TocMenu from './TocMenu.svelte';
	import { pickSection } from './sectionNav';
	import type { TocEntry } from './renderMarkdown';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	let { toc }: { toc: TocEntry[] } = $props();

	// Only the main sections («Απάντηση σε email», «Προώθηση email»…): stepping
	// through every sub-heading would be too slow to scan with.
	const sections = $derived(toc.filter((entry) => entry.level === 2));

	// The top edge of whatever scrolls the page: the window, or the lesson body.
	function scrollerTop(el: HTMLElement): number {
		const page = [document.body, document.documentElement];
		for (let node = el.parentElement; node && !page.includes(node); node = node.parentElement) {
			const { overflowY } = getComputedStyle(node);
			if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
				return node.getBoundingClientRect().top;
			}
		}
		return 0;
	}

	function jump(dir: 'prev' | 'next') {
		const headings = sections
			.map((entry) => document.getElementById(entry.id))
			.filter((el): el is HTMLElement => !!el);
		if (!headings.length) return;
		const top = scrollerTop(headings[0]);
		// Where each heading sits relative to where a jump would put it.
		const tops = headings.map(
			(el) =>
				el.getBoundingClientRect().top - top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0)
		);
		const target = headings[pickSection(tops, dir)];
		if (!target) return;
		target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		history.replaceState(null, '', `#${target.id}`);
	}

	const buttonClass =
		'hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium';
</script>

{#if toc.length}
	<!-- Small and out of the way at the bottom, always in reach while reading. -->
	<nav
		aria-label="Πλοήγηση ενοτήτων"
		class="bg-background/90 supports-[backdrop-filter]:bg-background/75 sticky bottom-3 z-30 mx-auto mt-6 flex w-fit items-center gap-1 rounded-full border p-1 shadow-md backdrop-blur"
	>
		{#if sections.length > 1}
			<button type="button" class={buttonClass} onclick={() => jump('prev')} aria-label="Προηγούμενη ενότητα">
				<ChevronUp class="h-4 w-4" />
				<span class="hidden sm:inline">Προηγούμενη</span>
			</button>
		{/if}
		<TocMenu {toc} placement="above" />
		{#if sections.length > 1}
			<button type="button" class={buttonClass} onclick={() => jump('next')} aria-label="Επόμενη ενότητα">
				<span class="hidden sm:inline">Επόμενη</span>
				<ChevronDown class="h-4 w-4" />
			</button>
		{/if}
	</nav>
{/if}
