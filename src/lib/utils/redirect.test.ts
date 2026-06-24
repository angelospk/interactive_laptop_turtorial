import { describe, it, expect } from 'vitest';
import { safeRedirect } from './redirect';

describe('safeRedirect', () => {
	it('accepts internal paths', () => {
		expect(safeRedirect('/modules/module1/hover-balloons')).toBe(
			'/modules/module1/hover-balloons'
		);
		expect(safeRedirect('/library/esm001/esm001-c1-s1')).toBe('/library/esm001/esm001-c1-s1');
		expect(safeRedirect('/modules/m1?notice=missing')).toBe('/modules/m1?notice=missing');
	});

	it('rejects protocol-relative and absolute URLs', () => {
		expect(safeRedirect('//evil.com')).toBeNull();
		expect(safeRedirect('https://evil.com')).toBeNull();
		expect(safeRedirect('http://evil.com')).toBeNull();
	});

	it('rejects backslash smuggling', () => {
		expect(safeRedirect('/\\evil.com')).toBeNull();
		expect(safeRedirect('/foo\\bar')).toBeNull();
	});

	it('rejects empty / nullish / non-rooted values', () => {
		expect(safeRedirect('')).toBeNull();
		expect(safeRedirect(null)).toBeNull();
		expect(safeRedirect(undefined)).toBeNull();
		expect(safeRedirect('modules/m1')).toBeNull();
	});

	it('rejects absurdly long values', () => {
		expect(safeRedirect('/' + 'a'.repeat(600))).toBeNull();
	});
});
