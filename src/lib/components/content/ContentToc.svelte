<script lang="ts">
	import type { TocEntry } from './renderMarkdown';

	interface Props {
		toc: TocEntry[];
		/** Called after navigating to a heading (e.g. to close a mobile dropdown). */
		onnavigate?: () => void;
	}
	let { toc, onnavigate }: Props = $props();

	function goto(e: MouseEvent, id: string) {
		e.preventDefault();
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
			history.replaceState(null, '', `#${id}`);
		}
		onnavigate?.();
	}
</script>

<nav aria-label="Περιεχόμενα" class="text-sm">
	<ul class="space-y-1">
		{#each toc as item (item.id)}
			<li class={item.level === 3 ? 'ms-3' : ''}>
				<a
					href={`#${item.id}`}
					onclick={(e) => goto(e, item.id)}
					class="text-muted-foreground hover:text-foreground block rounded py-0.5 leading-snug hover:underline {item.level ===
					3
						? 'text-[0.8rem]'
						: 'font-medium'}"
				>
					{item.text}
				</a>
			</li>
		{/each}
	</ul>
</nav>
