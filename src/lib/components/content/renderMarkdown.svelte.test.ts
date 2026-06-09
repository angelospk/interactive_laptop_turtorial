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
	it('keeps Vimeo iframe', () => {
		const html = renderMarkdown('<div class="video-wrap"><iframe src="https://player.vimeo.com/video/123?h=abc" allowfullscreen></iframe></div>');
		expect(html).toContain('player.vimeo.com/video/123');
		expect(html).toContain('<iframe');
	});
	it('strips non-Vimeo iframe', () => {
		const html = renderMarkdown('<iframe src="https://evil.example/x"></iframe>');
		expect(html).not.toContain('<iframe');
	});
	it('keeps figure and figcaption', () => {
		const html = renderMarkdown('<figure><img src="https://x.gr/a.webp" alt="a"/><figcaption>Εικόνα 1: τεστ</figcaption></figure>');
		expect(html).toContain('<figure');
		expect(html).toContain('<figcaption');
	});
});
