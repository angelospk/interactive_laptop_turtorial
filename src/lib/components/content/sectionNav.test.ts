import { describe, it, expect } from 'vitest';
import { pickSection } from './sectionNav';

// Heading positions relative to where a heading lands after a jump: 0 means
// "this section starts right here", negative means already scrolled past.
describe('pickSection', () => {
	const tops = [-900, -300, 0, 500, 1200];

	it('next is the first section below the current one', () => {
		expect(pickSection(tops, 'next')).toBe(3);
	});

	it('prev from the start of a section goes to the section before', () => {
		expect(pickSection(tops, 'prev')).toBe(1);
	});

	it('prev from the middle of a section goes to that section’s start', () => {
		expect(pickSection([-900, -300, 400], 'prev')).toBe(1);
	});

	it('tolerates a pixel or two of rounding', () => {
		expect(pickSection([-1, 1.5, 600], 'next')).toBe(2);
		expect(pickSection([-600, -1, 1.5], 'prev')).toBe(0);
	});

	it('returns -1 at either end', () => {
		expect(pickSection([0, 500], 'prev')).toBe(-1);
		expect(pickSection([-500, 0], 'next')).toBe(-1);
		expect(pickSection([], 'next')).toBe(-1);
	});
});
