<script lang="ts">
	import { onMount } from 'svelte';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';

	let visible = $state(false);
	// The element that actually scrolled last (a fullscreen lesson container, an
	// overflow pane, …). null means the page/window itself is scrolling.
	let scroller: Element | null = null;

	function isPageScroll(t: EventTarget | null): boolean {
		return (
			!(t instanceof Element) ||
			t === document.documentElement ||
			t === document.body
		);
	}

	onMount(() => {
		const onScroll = (e: Event) => {
			if (isPageScroll(e.target)) {
				scroller = null;
				visible = window.scrollY > 400;
			} else {
				scroller = e.target as Element;
				visible = (e.target as Element).scrollTop > 400;
			}
		};
		// Capture phase so we also catch scrolls from inner overflow containers
		// (scroll events don't bubble).
		document.addEventListener('scroll', onScroll, { capture: true, passive: true });
		visible = window.scrollY > 400;
		return () => document.removeEventListener('scroll', onScroll, { capture: true });
	});

	function toTop() {
		if (scroller) {
			scroller.scrollTo({ top: 0, behavior: 'smooth' });
		} else {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}
</script>

{#if visible}
	<button
		type="button"
		onclick={toTop}
		aria-label="Επιστροφή στην κορυφή"
		class="bg-primary text-primary-foreground fixed right-5 bottom-5 z-[60] flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition hover:opacity-90"
	>
		<ArrowUp class="h-5 w-5" />
	</button>
{/if}
