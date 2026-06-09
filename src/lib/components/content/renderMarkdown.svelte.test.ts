import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './renderMarkdown';

describe('renderMarkdown', () => {
	it('renders headings and links', () => {
		const html = renderMarkdown('# Τίτλος\n\n[link](https://x.gr)');
		expect(html).toContain('<h1');
		expect(html).toContain('href="https://x.gr"');
	});
	it('keeps images', () => {
		const html = renderMarkdown('![alt](https://courses.nadia.gov.gr/a.webp)');
		expect(html).toContain('<img');
		expect(html).toContain('src="https://courses.nadia.gov.gr/a.webp"');
	});
	it('strips script tags (sanitize)', () => {
		const html = renderMarkdown('ok <script>alert(1)</script>');
		expect(html).not.toContain('<script');
	});
});
