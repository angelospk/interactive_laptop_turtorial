import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './renderMarkdown';

describe('renderMarkdown', () => {
	it('renders headings and links', () => {
		const { html } = renderMarkdown('# Τίτλος\n\n[link](https://x.gr)');
		expect(html).toContain('<h1');
		expect(html).toContain('href="https://x.gr"');
	});
	it('keeps images', () => {
		const { html } = renderMarkdown('![alt](https://courses.nadia.gov.gr/a.webp)');
		expect(html).toContain('<img');
		expect(html).toContain('src="https://courses.nadia.gov.gr/a.webp"');
	});
	it('strips script tags (sanitize)', () => {
		const { html } = renderMarkdown('ok <script>alert(1)</script>');
		expect(html).not.toContain('<script');
	});
	it('keeps Vimeo iframe', () => {
		const { html } = renderMarkdown(
			'<div class="video-wrap"><iframe src="https://player.vimeo.com/video/123?h=abc" allowfullscreen></iframe></div>'
		);
		expect(html).toContain('player.vimeo.com/video/123');
		expect(html).toContain('<iframe');
	});
	// Regression (bd-k50): `target` is in ADD_ATTR, so a target=_blank link is
	// reverse-tabnabbing-capable unless we force rel on the way out.
	it('forces rel="noopener noreferrer" on any link that keeps a target', () => {
		const { html } = renderMarkdown('<a href="https://x.gr" target="_blank">κλικ</a>');
		expect(html).toContain('target="_blank"');
		expect(html).toMatch(/rel="[^"]*noopener[^"]*"/);
		expect(html).toMatch(/rel="[^"]*noreferrer[^"]*"/);
	});

	it('does not add rel to links without a target', () => {
		const { html } = renderMarkdown('[link](https://x.gr)');
		expect(html).not.toContain('rel=');
	});

	it('preserves an author-supplied rel while still forcing noopener', () => {
		const { html } = renderMarkdown(
			'<a href="https://x.gr" target="_blank" rel="nofollow">κλικ</a>'
		);
		expect(html).toContain('nofollow');
		expect(html).toMatch(/rel="[^"]*noopener[^"]*"/);
	});

	it('strips an iframe that smuggles content through srcdoc', () => {
		const { html } = renderMarkdown(
			'<iframe src="https://player.vimeo.com/video/1" srcdoc="<script>alert(1)</script>"></iframe>'
		);
		expect(html).not.toContain('srcdoc');
	});

	it('strips non-Vimeo iframe', () => {
		const { html } = renderMarkdown('<iframe src="https://evil.example/x"></iframe>');
		expect(html).not.toContain('<iframe');
	});
	it('keeps figure and figcaption', () => {
		const { html } = renderMarkdown(
			'<figure><img src="https://x.gr/a.webp" alt="a"/><figcaption>Εικόνα 1: τεστ</figcaption></figure>'
		);
		expect(html).toContain('<figure');
		expect(html).toContain('<figcaption');
	});
	it('builds a table of contents from h2/h3 with anchor ids', () => {
		const { html, toc } = renderMarkdown(
			'## Εισαγωγή\n\nκείμενο\n\n### Υποενότητα\n\nκι άλλο\n\n## Δεύτερο\n'
		);
		expect(toc).toHaveLength(3);
		expect(toc[0]).toMatchObject({ level: 2, text: 'Εισαγωγή', id: 'sec-0' });
		expect(toc[1]).toMatchObject({ level: 3, text: 'Υποενότητα', id: 'sec-1' });
		expect(toc[2]).toMatchObject({ level: 2, text: 'Δεύτερο', id: 'sec-2' });
		// ids injected into the rendered headings so anchors resolve
		expect(html).toContain('id="sec-0"');
		expect(html).toContain('id="sec-1"');
		expect(html).toContain('id="sec-2"');
	});
	it('returns an empty toc when there are no h2/h3 headings', () => {
		const { toc } = renderMarkdown('απλό κείμενο χωρίς κεφαλίδες');
		expect(toc).toEqual([]);
	});
});
