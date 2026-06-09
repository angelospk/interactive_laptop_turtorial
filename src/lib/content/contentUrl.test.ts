import { describe, it, expect } from 'vitest';
import { joinContentUrl } from './contentUrl';

describe('joinContentUrl', () => {
	it('joins base and relPath with single slash', () => {
		expect(joinContentUrl('/content', 'md/esm001/c1/s1.md')).toBe('/content/md/esm001/c1/s1.md');
	});
	it('trims trailing slash on base', () => {
		expect(joinContentUrl('https://cdn.example/x/', 'manifest.json')).toBe(
			'https://cdn.example/x/manifest.json'
		);
	});
	it('trims leading slash on relPath', () => {
		expect(joinContentUrl('/content', '/manifest.json')).toBe('/content/manifest.json');
	});
});
