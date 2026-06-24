/**
 * Svelte action: reveal an element when it scrolls into view.
 *
 * Adds `is-visible` once (one-shot) via IntersectionObserver — no scroll
 * listeners, no reflow churn. Pair with the `[data-reveal]` CSS in layout.css.
 * Optional `delay` (ms) staggers groups of elements.
 *
 *   <div data-reveal use:reveal={{ delay: 120 }}>…</div>
 */
export function reveal(node: HTMLElement, options: { delay?: number } = {}) {
	node.setAttribute('data-reveal', '');
	if (options.delay) node.style.setProperty('--reveal-delay', `${options.delay}ms`);

	// SSR / no-IO fallback: show immediately.
	if (typeof IntersectionObserver === 'undefined') {
		node.classList.add('is-visible');
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.classList.add('is-visible');
					observer.unobserve(node);
				}
			}
		},
		{ threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
