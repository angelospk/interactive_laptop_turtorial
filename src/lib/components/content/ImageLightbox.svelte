<script lang="ts">
	import X from '@lucide/svelte/icons/x';

	interface Props {
		src: string;
		alt: string;
		onclose: () => void;
	}
	let { src, alt, onclose }: Props = $props();

	let closeButton = $state<HTMLButtonElement | null>(null);

	// Focus the X while open, keep the page behind still, and give focus back
	// to where the learner was when the picture closes.
	$effect(() => {
		const previous = document.activeElement as HTMLElement | null;
		const overflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		closeButton?.focus();
		return () => {
			document.body.style.overflow = overflow;
			previous?.focus?.();
		};
	});

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			onclose();
		}
	}
</script>

<svelte:window {onkeydown} />

<!-- Whole picture, no zoom: a click anywhere outside it, the X, or Esc closes. -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	role="dialog"
	aria-modal="true"
	aria-label={alt || 'Εικόνα'}
	tabindex="-1"
	class="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
	onclick={(e) => {
		if (e.target === e.currentTarget) onclose();
	}}
>
	<img {src} {alt} class="max-h-[90dvh] max-w-[95vw] rounded-lg bg-white object-contain" />
	<button
		bind:this={closeButton}
		type="button"
		onclick={onclose}
		aria-label="Κλείσιμο"
		title="Κλείσιμο"
		class="absolute top-4 right-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg hover:bg-slate-200 focus-visible:ring-4 focus-visible:ring-sky-400 focus-visible:outline-none"
	>
		<X class="h-10 w-10" strokeWidth={3} aria-hidden="true" />
	</button>
</div>
