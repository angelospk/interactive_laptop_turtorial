import { marked } from 'marked';
import DOMPurify from 'dompurify';

/** Parse markdown to sanitized HTML. Safe for {@html}. */
export function renderMarkdown(src: string): string {
	// Pass options per-call to avoid mutating the shared `marked` singleton.
	const raw = marked.parse(src, { gfm: true, breaks: false, async: false }) as string;
	return DOMPurify.sanitize(raw, { ADD_ATTR: ['target', 'rel'] });
}
