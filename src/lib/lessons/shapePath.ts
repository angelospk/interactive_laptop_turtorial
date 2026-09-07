/**
 * Geometry for the `shape-path` hover exercise: follow a drawn route with the
 * pointer without straying outside the corridor.
 *
 * Deliberately pure and DOM-free so the rules can be tested without a browser.
 * All coordinates are percentages of the play area (0-100), which is how the
 * component positions things, so the maths is resolution independent.
 */

export interface Point {
	x: number;
	y: number;
}

export interface PathRun {
	/** Index of the last waypoint actually reached, in order. */
	reached: number;
	/** How many times the pointer left the corridor and had to come back. */
	slips: number;
	/** Whether the pointer is currently outside — so one excursion counts once. */
	outside: boolean;
	complete: boolean;
}

/** Named routes a lesson can ask for by id. */
export const SHAPE_PATHS = {
	/** A gentle zig-zag: four straight legs, no sharp reversals. */
	zigzag: [
		{ x: 10, y: 75 },
		{ x: 32, y: 25 },
		{ x: 54, y: 75 },
		{ x: 76, y: 25 },
		{ x: 92, y: 55 }
	],
	/** A wide arc, for practising smooth continuous movement. */
	arc: [
		{ x: 12, y: 80 },
		{ x: 24, y: 45 },
		{ x: 50, y: 25 },
		{ x: 76, y: 45 },
		{ x: 88, y: 80 }
	],
	/** Three sides of a rectangle — corners are the hard part for a shaky hand. */
	staircase: [
		{ x: 15, y: 80 },
		{ x: 15, y: 30 },
		{ x: 50, y: 30 },
		{ x: 50, y: 70 },
		{ x: 85, y: 70 }
	]
} as const satisfies Record<string, readonly Point[]>;

export type ShapePathId = keyof typeof SHAPE_PATHS;

export const SHAPE_PATH_IDS = Object.keys(SHAPE_PATHS) as ShapePathId[];

/**
 * Shortest distance from `p` to the segment `a`-`b`, clamped to the segment so a
 * pointer well past the end is not treated as "on the line".
 */
export function distanceToSegment(p: Point, a: Point, b: Point): number {
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const lengthSq = dx * dx + dy * dy;
	// Degenerate segment: fall back to point distance.
	const t =
		lengthSq === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq));
	const cx = a.x + t * dx;
	const cy = a.y + t * dy;
	return Math.hypot(p.x - cx, p.y - cy);
}

export function createPathRun(path: readonly Point[]): PathRun {
	return { reached: 0, slips: 0, outside: false, complete: path.length < 2 };
}

/**
 * Folds one pointer sample into the run.
 *
 * Two rules, both deliberate:
 *  - only the NEXT waypoint can be claimed, so jumping to the end is not
 *    "following the path";
 *  - straying costs a slip but never rewinds progress, because wiping a run
 *    clean on one shaky movement is the wrong lesson for this audience.
 */
export function advancePathRun(
	run: PathRun,
	path: readonly Point[],
	pointer: Point,
	tolerance: number
): PathRun {
	if (run.complete || path.length < 2) return run;

	const next = path[run.reached + 1];
	if (next && Math.hypot(pointer.x - next.x, pointer.y - next.y) <= tolerance) {
		const reached = run.reached + 1;
		return { ...run, reached, outside: false, complete: reached >= path.length - 1 };
	}

	const from = path[run.reached];
	const outside = distanceToSegment(pointer, from, next ?? from) > tolerance;
	// Only the transition inside -> outside is a slip; sitting outside is one event.
	const slips = outside && !run.outside ? run.slips + 1 : run.slips;
	return { ...run, outside, slips };
}

/** 0-100. Progress along the path, minus a small penalty per slip. */
export function pathRunScore(run: PathRun, path: readonly Point[]): number {
	const legs = Math.max(1, path.length - 1);
	const progress = (Math.min(run.reached, legs) / legs) * 100;
	return Math.max(0, Math.min(100, Math.round(progress - run.slips * 5)));
}
