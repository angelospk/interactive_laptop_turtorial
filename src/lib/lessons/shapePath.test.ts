import { describe, it, expect } from 'vitest';
import {
	distanceToSegment,
	createPathRun,
	advancePathRun,
	pathRunScore,
	SHAPE_PATHS,
	type Point
} from './shapePath';

/** A straight horizontal path, easy to reason about in percentages. */
const LINE: Point[] = [
	{ x: 10, y: 50 },
	{ x: 50, y: 50 },
	{ x: 90, y: 50 }
];
const TOL = 8;

const at = (x: number, y: number): Point => ({ x, y });

describe('distanceToSegment', () => {
	it('is zero on the segment itself', () => {
		expect(distanceToSegment(at(50, 50), at(0, 50), at(100, 50))).toBeCloseTo(0);
	});

	it('measures perpendicular distance for a point beside the segment', () => {
		expect(distanceToSegment(at(50, 60), at(0, 50), at(100, 50))).toBeCloseTo(10);
	});

	it('clamps to the endpoints instead of extending the line', () => {
		// Past the end: distance to the endpoint (10), not to the infinite line (0).
		expect(distanceToSegment(at(110, 50), at(0, 50), at(100, 50))).toBeCloseTo(10);
	});

	it('handles a degenerate zero-length segment', () => {
		expect(distanceToSegment(at(3, 4), at(0, 0), at(0, 0))).toBeCloseTo(5);
	});
});

describe('advancePathRun', () => {
	it('starts aimed at the second waypoint', () => {
		const run = createPathRun(LINE);
		expect(run.reached).toBe(0);
		expect(run.complete).toBe(false);
	});

	it('advances when the pointer reaches the next waypoint', () => {
		let run = createPathRun(LINE);
		run = advancePathRun(run, LINE, at(50, 50), TOL);
		expect(run.reached).toBe(1);
		expect(run.complete).toBe(false);
	});

	it('completes only after the final waypoint', () => {
		let run = createPathRun(LINE);
		run = advancePathRun(run, LINE, at(50, 50), TOL);
		run = advancePathRun(run, LINE, at(90, 50), TOL);
		expect(run.complete).toBe(true);
	});

	// The whole point of the lesson: a straight jump to the end is not "following".
	it('refuses a teleport straight to the last waypoint', () => {
		let run = createPathRun(LINE);
		run = advancePathRun(run, LINE, at(90, 50), TOL);
		expect(run.reached).toBe(0);
		expect(run.complete).toBe(false);
	});

	it('counts a slip when the pointer leaves the corridor', () => {
		let run = createPathRun(LINE);
		run = advancePathRun(run, LINE, at(30, 90), TOL);
		expect(run.slips).toBe(1);
		expect(run.reached).toBe(0);
	});

	it('tolerates a small wobble along the way', () => {
		let run = createPathRun(LINE);
		run = advancePathRun(run, LINE, at(30, 54), TOL);
		expect(run.slips).toBe(0);
	});

	// Elderly learners: leaving the corridor must not throw away the whole run.
	it('never rewinds progress already earned', () => {
		let run = createPathRun(LINE);
		run = advancePathRun(run, LINE, at(50, 50), TOL);
		run = advancePathRun(run, LINE, at(50, 95), TOL);
		expect(run.reached).toBe(1);
	});

	it('does not double-count one continuous excursion', () => {
		let run = createPathRun(LINE);
		run = advancePathRun(run, LINE, at(30, 90), TOL);
		run = advancePathRun(run, LINE, at(31, 91), TOL);
		expect(run.slips).toBe(1);
	});

	it('counts a second slip after returning to the corridor', () => {
		let run = createPathRun(LINE);
		run = advancePathRun(run, LINE, at(30, 90), TOL);
		run = advancePathRun(run, LINE, at(30, 50), TOL);
		run = advancePathRun(run, LINE, at(35, 90), TOL);
		expect(run.slips).toBe(2);
	});

	it('stays complete once complete', () => {
		let run = createPathRun(LINE);
		run = advancePathRun(run, LINE, at(50, 50), TOL);
		run = advancePathRun(run, LINE, at(90, 50), TOL);
		const after = advancePathRun(run, LINE, at(10, 10), TOL);
		expect(after.complete).toBe(true);
		expect(after.slips).toBe(run.slips);
	});
});

describe('pathRunScore', () => {
	it('awards 100 for a clean run', () => {
		const run = { reached: 2, slips: 0, outside: false, complete: true };
		expect(pathRunScore(run, LINE)).toBe(100);
	});

	it('penalises slips but never goes below zero', () => {
		expect(
			pathRunScore({ reached: 2, slips: 3, outside: false, complete: true }, LINE)
		).toBeLessThan(100);
		expect(
			pathRunScore({ reached: 2, slips: 500, outside: false, complete: true }, LINE)
		).toBeGreaterThanOrEqual(0);
	});

	it('scores an unfinished run by how far it got', () => {
		const partial = pathRunScore({ reached: 1, slips: 0, outside: false, complete: false }, LINE);
		expect(partial).toBeGreaterThan(0);
		expect(partial).toBeLessThan(100);
	});
});

describe('SHAPE_PATHS', () => {
	it('ships at least one usable named path', () => {
		expect(Object.keys(SHAPE_PATHS).length).toBeGreaterThan(0);
	});

	it('keeps every waypoint inside the 0-100 play area', () => {
		for (const [name, path] of Object.entries(SHAPE_PATHS)) {
			expect(path.length, `${name} needs at least two waypoints`).toBeGreaterThanOrEqual(2);
			for (const p of path) {
				expect(p.x, `${name} x`).toBeGreaterThanOrEqual(0);
				expect(p.x, `${name} x`).toBeLessThanOrEqual(100);
				expect(p.y, `${name} y`).toBeGreaterThanOrEqual(0);
				expect(p.y, `${name} y`).toBeLessThanOrEqual(100);
			}
		}
	});
});
