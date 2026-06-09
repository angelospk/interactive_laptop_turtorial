import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ gfm: true, breaks: false });

/** Parse markdown to sanitized HTML. Safe for {@html}. */
export function renderMarkdown(src: string): string {
	const raw = marked.parse(src, { async: false }) as string;
	return DOMPurify.sanitize(raw, { ADD_ATTR: ['target', 'rel'] });
}
