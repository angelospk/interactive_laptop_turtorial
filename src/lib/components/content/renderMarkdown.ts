import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Register the iframe-filter hook lazily and only in the browser. DOMPurify has
// no working DOM (and no `addHook`) during SSR, so calling it at module load
// crashes server-side rendering. renderMarkdown only runs client-side anyway.
let hookAdded = false;
function ensureHook(): void {
	if (hookAdded || typeof window === 'undefined' || typeof DOMPurify.addHook !== 'function') {
		return;
	}
	// Allow only Vimeo player iframes; strip any other iframe.
	DOMPurify.addHook('uponSanitizeElement', (node, data) => {
		if (data.tagName === 'iframe') {
			const el = node as Element;
			const src = el.getAttribute('src') || '';
			if (!src.startsWith('https://player.vimeo.com/')) {
				el.parentNode?.removeChild(el);
			}
		}
	});
	hookAdded = true;
}

/** Parse markdown to sanitized HTML. Safe for {@html}. Browser-only. */
export function renderMarkdown(src: string): string {
	ensureHook();
	const raw = marked.parse(src, { gfm: true, breaks: false, async: false }) as string;
	return DOMPurify.sanitize(raw, {
		ADD_TAGS: ['iframe', 'figure', 'figcaption'],
		ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'target', 'rel']
	});
}
