<script lang="ts">
	/**
	 * Darkens `container` except for its `[data-guide=target]` element, which gets
	 * a thick yellow frame. Takes no clicks: the learner can still use the demo.
	 * The target can move (a tab opens, the page scrolls), so its box is re-read
	 * every frame and only written back when it changed.
	 */
	let { container, target } = $props<{
		container: HTMLElement | undefined;
		target: string | null;
	}>();

	type Box = { top: number; left: number; width: number; height: number };
	let box = $state<Box | null>(null);

	const PAD = 6;

	$effect(() => {
		if (!container || !target) {
			box = null;
			return;
		}
		const root = container;
		const selector = `[data-guide="${target}"]`;
		// Never frame the old element under the new target's name.
		box = null;
		let frame = requestAnimationFrame(function measure() {
			const el = root.querySelector(selector) as HTMLElement | null;
			const next = el ? relativeBox(el, root) : null;
			if (!sameBox(box, next)) box = next;
			frame = requestAnimationFrame(measure);
		});
		return () => cancelAnimationFrame(frame);
	});

	function relativeBox(el: HTMLElement, root: HTMLElement): Box | null {
		const r = el.getBoundingClientRect();
		if (r.width === 0 && r.height === 0) return null;
		const c = root.getBoundingClientRect();
		return {
			top: r.top - c.top - PAD,
			left: r.left - c.left - PAD,
			width: r.width + PAD * 2,
			height: r.height + PAD * 2
		};
	}

	function sameBox(a: Box | null, b: Box | null) {
		if (!a || !b) return a === b;
		return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
	}
</script>

{#if box}
	<div
		class="spotlight pointer-events-none absolute z-30 rounded-xl transition-all duration-300 motion-reduce:transition-none"
		style:top="{box.top}px"
		style:left="{box.left}px"
		style:width="{box.width}px"
		style:height="{box.height}px"
		data-testid="guide-spotlight"
		data-target={target}
		aria-hidden="true"
	>
		<div
			class="absolute inset-0 rounded-xl border-4 border-yellow-400 motion-safe:animate-pulse"
		></div>
	</div>
{/if}

<style>
	.spotlight {
		/* The "hole": everything outside the box is covered by its own shadow. */
		box-shadow: 0 0 0 9999px rgb(15 23 42 / 0.55);
	}
</style>
