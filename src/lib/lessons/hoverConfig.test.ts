import { describe, it, expect } from 'vitest';
import { parseHoverConfig, pathFor, HOVER_THEMES } from './hoverConfig';

describe('parseHoverConfig', () => {
	it('accepts every theme it advertises', () => {
		for (const theme of HOVER_THEMES) {
			expect(parseHoverConfig({ theme }).theme).toBe(theme);
		}
	});

	// bd-5t4: the seed said 'shape-path' while the component knew three other
	// names, and nothing anywhere complained.
	it.each([['shape'], ['moles'], ['simple'], ['default'], [''], [null], [undefined], [42]])(
		'rejects the unimplemented theme %p',
		(theme) => {
			expect(() => parseHoverConfig({ theme })).toThrow(/theme must be one of/);
		}
	);

	it('fills in defaults for the optional numbers', () => {
		const c = parseHoverConfig({ theme: 'balloons' });
		expect(c.targetCount).toBeGreaterThan(0);
		expect(c.timeLimit).toBeGreaterThan(0);
		expect(c.tolerance).toBeGreaterThan(0);
	});

	it.each([
		['targetCount', 0],
		['targetCount', -3],
		['timeLimit', 'sixty'],
		['tolerance', NaN]
	])('rejects a bad %s', (key, value) => {
		expect(() => parseHoverConfig({ theme: 'balloons', [key]: value })).toThrow();
	});

	it('rejects an unknown pathId instead of silently falling back', () => {
		expect(() => parseHoverConfig({ theme: 'shape-path', pathId: 'spiral' })).toThrow(
			/pathId must be one of/
		);
	});

	it('rejects non-string instructions', () => {
		expect(() => parseHoverConfig({ theme: 'balloons', instructions: 5 })).toThrow(/instructions/);
	});

	it('resolves a real, usable path for shape-path lessons', () => {
		const path = pathFor(parseHoverConfig({ theme: 'shape-path', pathId: 'staircase' }));
		expect(path.length).toBeGreaterThanOrEqual(2);
	});
});
