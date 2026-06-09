import { marked } from 'marked';
import DOMPurify from 'dompurify';

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

/** Parse markdown to sanitized HTML. Safe for {@html}. */
export function renderMarkdown(src: string): string {
	const raw = marked.parse(src, { gfm: true, breaks: false, async: false }) as string;
	return DOMPurify.sanitize(raw, {
		ADD_TAGS: ['iframe', 'figure', 'figcaption'],
		ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'target', 'rel']
	});
}
