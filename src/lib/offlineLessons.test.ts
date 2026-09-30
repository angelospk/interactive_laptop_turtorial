import { describe, expect, it } from 'vitest';
import { offlinePages } from './offlineLessons';

const O = 'https://example.org';

describe('offlinePages', () => {
	it('keeps opened lessons and theory pages, one entry per page', () => {
		const pages = offlinePages([
			`${O}/modules/module1/hover-balloons`,
			`${O}/modules/module1/hover-balloons/__data.json?x-sveltekit-invalidated=01`,
			`${O}/library/basics/mouse`,
			`${O}/_app/immutable/chunks/abc.js`,
			`${O}/offline`,
			`${O}/`,
			`${O}/modules/module1`
		]);
		expect(pages).toEqual([
			{
				path: '/modules/module1/hover-balloons',
				kind: 'lesson',
				hasHtml: true,
				href: '/modules/module1/hover-balloons'
			},
			{
				path: '/library/basics/mouse',
				kind: 'theory',
				hasHtml: true,
				href: '/library/basics/mouse'
			}
		]);
	});

	it('ignores other sites and nonsense', () => {
		expect(offlinePages(['https://evil.example/modules/a/b', 'not a url'], O)).toEqual([]);
	});

	it('is empty when nothing was opened', () => {
		expect(offlinePages([])).toEqual([]);
	});

	it('knows when only the data of a page was kept, not its HTML', () => {
		expect(offlinePages([`${O}/modules/m/a/__data.json`])).toEqual([
			{ path: '/modules/m/a', kind: 'lesson', hasHtml: false, href: '/modules/m/a' }
		]);
		expect(offlinePages([`${O}/modules/m/a/__data.json`, `${O}/modules/m/a`])).toEqual([
			{ path: '/modules/m/a', kind: 'lesson', hasHtml: true, href: '/modules/m/a' }
		]);
	});

	// The service worker looks pages up by their exact address, query included.
	it('links to the exact address the page was kept under', () => {
		expect(offlinePages([`${O}/modules/m/a?utm_source=email`])).toEqual([
			{ path: '/modules/m/a', kind: 'lesson', hasHtml: true, href: '/modules/m/a?utm_source=email' }
		]);
	});
});
