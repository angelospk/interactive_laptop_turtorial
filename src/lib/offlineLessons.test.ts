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
			{ path: '/modules/module1/hover-balloons', kind: 'lesson' },
			{ path: '/library/basics/mouse', kind: 'theory' }
		]);
	});

	it('ignores other sites and nonsense', () => {
		expect(offlinePages(['https://evil.example/modules/a/b', 'not a url'], O)).toEqual([]);
	});

	it('is empty when nothing was opened', () => {
		expect(offlinePages([])).toEqual([]);
	});
});
