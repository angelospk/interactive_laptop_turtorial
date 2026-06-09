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

export interface TocEntry {
	/** Heading depth: 2 (section) or 3 (subsection). */
	level: number;
	/** Plain-text heading label for the TOC. */
	text: string;
	/** Anchor id injected into the rendered heading. */
	id: string;
}

export interface RenderedContent {
	html: string;
	toc: TocEntry[];
}

/**
 * Inject anchor ids into every h2/h3 and collect them into a table of
 * contents. Index-based ids (sec-0, sec-1, …) stay stable for Greek text
 * where slugifying would otherwise produce empty/ambiguous anchors.
 */
function extractToc(html: string): RenderedContent {
	const toc: TocEntry[] = [];
	const withIds = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_m, lvl: string, inner: string) => {
		const id = `sec-${toc.length}`;
		const text = inner.replace(/<[^>]+>/g, '').trim();
		toc.push({ level: Number(lvl), text, id });
		return `<h${lvl} id="${id}">${inner}</h${lvl}>`;
	});
	return { html: withIds, toc };
}

/** Parse markdown to sanitized HTML + a TOC. Safe for {@html}. Browser-only. */
export function renderMarkdown(src: string): RenderedContent {
	ensureHook();
	const raw = marked.parse(src, { gfm: true, breaks: false, async: false }) as string;
	const { html: withIds, toc } = extractToc(raw);
	const html = DOMPurify.sanitize(withIds, {
		ADD_TAGS: ['iframe', 'figure', 'figcaption'],
		ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'target', 'rel']
	});
	return { html, toc };
}
