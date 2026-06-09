<script lang="ts">
	import { onMount } from 'svelte';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';

	let visible = $state(false);

	onMount(() => {
		const onScroll = () => {
			visible = window.scrollY > 400;
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	function toTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

{#if visible}
	<button
		type="button"
		onclick={toTop}
		aria-label="Επιστροφή στην κορυφή"
		class="bg-primary text-primary-foreground fixed right-5 bottom-5 z-40 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition hover:opacity-90"
	>
		<ArrowUp class="h-5 w-5" />
	</button>
{/if}
