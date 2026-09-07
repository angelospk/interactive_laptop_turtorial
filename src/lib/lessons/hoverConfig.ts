import { SHAPE_PATHS, SHAPE_PATH_IDS, type ShapePathId, type Point } from './shapePath';

/**
 * Contract for `hover` lessons.
 *
 * Pure TypeScript on purpose: the component imports THIS, never the other way
 * round, so contract tests never have to pull a `.svelte` file (and its
 * compiler/SSR baggage) into a plain unit test.
 *
 * The tuple below is what content is allowed to ask for. The component pairs it
 * with `satisfies Record<HoverTheme, …>`, so adding a theme here without
 * implementing it is a compile error rather than a lesson that silently renders
 * a teleporting dot (bd-5t4).
 */
export const HOVER_THEMES = ['balloons', 'shape-path'] as const;
export type HoverTheme = (typeof HOVER_THEMES)[number];

export interface HoverConfig {
	theme: HoverTheme;
	/** Balloons to pop. Ignored by `shape-path`, which is driven by its waypoints. */
	targetCount: number;
	timeLimit: number;
	instructions?: string;
	/** `shape-path` only: which route to draw. */
	pathId: ShapePathId;
	/** `shape-path` only: how far off the line the pointer may wander, in play-area %. */
	tolerance: number;
}

export const DEFAULT_PATH_TOLERANCE = 9;

const isTheme = (v: unknown): v is HoverTheme =>
	typeof v === 'string' && (HOVER_THEMES as readonly string[]).includes(v);

const isPathId = (v: unknown): v is ShapePathId =>
	typeof v === 'string' && (SHAPE_PATH_IDS as readonly string[]).includes(v);

function positive(value: unknown, fallback: number, label: string): number {
	if (value === undefined || value === null) return fallback;
	if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
		throw new Error(
			`hover config: ${label} must be a positive number, got ${JSON.stringify(value)}`
		);
	}
	return value;
}

/** Validates and normalises a raw seed config. Throws with a readable reason. */
export function parseHoverConfig(raw: unknown): HoverConfig {
	const c = (raw ?? {}) as Record<string, unknown>;

	if (!isTheme(c.theme)) {
		throw new Error(
			`hover config: theme must be one of ${HOVER_THEMES.join(' | ')}, got ${JSON.stringify(c.theme)}`
		);
	}
	if (c.pathId !== undefined && !isPathId(c.pathId)) {
		throw new Error(
			`hover config: pathId must be one of ${SHAPE_PATH_IDS.join(' | ')}, got ${JSON.stringify(c.pathId)}`
		);
	}
	if (c.instructions !== undefined && typeof c.instructions !== 'string') {
		throw new Error('hover config: instructions must be a string');
	}

	return {
		theme: c.theme,
		targetCount: positive(c.targetCount, 5, 'targetCount'),
		timeLimit: positive(c.timeLimit, 60, 'timeLimit'),
		instructions: c.instructions as string | undefined,
		pathId: isPathId(c.pathId) ? c.pathId : 'zigzag',
		tolerance: positive(c.tolerance, DEFAULT_PATH_TOLERANCE, 'tolerance')
	};
}

/** The waypoints a parsed config refers to. */
export function pathFor(config: HoverConfig): readonly Point[] {
	return SHAPE_PATHS[config.pathId];
}
