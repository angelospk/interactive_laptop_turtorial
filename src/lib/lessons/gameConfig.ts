import { parseHoverConfig, HOVER_THEMES, type HoverTheme } from './hoverConfig';

/**
 * Playability contract for the "primitive" lesson types — the mouse/keyboard
 * drills that predate the simulation lessons and, unlike them, had no config
 * parser at all.
 *
 * That gap is how bd-5t4 shipped: a seed asked for `theme: 'shape-path'`, the
 * component knew three unrelated names, and the learner got a teleporting dot
 * under an instruction telling them to follow a path. Nothing failed, because
 * nothing was checking.
 *
 * Each tuple below is the set of variants content may ask for. Components pair
 * the same tuple with `satisfies Record<Theme, …>`, so the two cannot drift:
 * a variant with no renderer stops the build, and a renderer with no contract
 * entry is unreachable from content.
 */

export const CLICK_THEMES = ['default', 'balloons', 'moles', 'bugs', 'flies', 'mixed'] as const;
export const DOUBLE_CLICK_THEMES = ['default', 'chests'] as const;
export const RIGHT_CLICK_THEMES = ['default', 'mystery'] as const;
export const DRAG_THEMES = ['shapes', 'recycle', 'puzzle'] as const;
export const TYPING_PRESETS = [
	'simple',
	'capitals',
	'mixed-case',
	'accents',
	'with-errors',
	'special-chars',
	'paragraph',
	'full-test'
] as const;

export type ClickTheme = (typeof CLICK_THEMES)[number];
export type DoubleClickTheme = (typeof DOUBLE_CLICK_THEMES)[number];
export type RightClickTheme = (typeof RIGHT_CLICK_THEMES)[number];
export type DragTheme = (typeof DRAG_THEMES)[number];
export type TypingPreset = (typeof TYPING_PRESETS)[number];

/** Lesson types this module certifies. */
export const PRIMITIVE_LESSON_TYPES = [
	'hover',
	'click',
	'double-click',
	'right-click',
	'drag',
	'scroll',
	'typing',
	'quiz'
] as const;

export type PrimitiveLessonType = (typeof PRIMITIVE_LESSON_TYPES)[number];

export const isPrimitiveLessonType = (t: string): t is PrimitiveLessonType =>
	(PRIMITIVE_LESSON_TYPES as readonly string[]).includes(t);

/**
 * Narrows a raw config value to a known variant, falling back when the DB holds
 * something the build does not know about. Components use this so their theme
 * lookup is type-safe; `parsePrimitiveGameConfig` is what makes sure the seeds
 * never rely on the fallback in the first place.
 */
export function coerceVariant<T extends string>(
	value: unknown,
	allowed: readonly T[],
	fallback: T
): T {
	return typeof value === 'string' && (allowed as readonly string[]).includes(value)
		? (value as T)
		: fallback;
}

const asRecord = (raw: unknown): Record<string, unknown> => (raw ?? {}) as Record<string, unknown>;

function requireVariant<T extends string>(
	value: unknown,
	allowed: readonly T[],
	field: string,
	type: string
): T {
	if (typeof value !== 'string' || !(allowed as readonly string[]).includes(value)) {
		throw new Error(
			`${type} config: ${field} must be one of ${allowed.join(' | ')}, got ${JSON.stringify(value)}`
		);
	}
	return value as T;
}

function requirePositive(value: unknown, field: string, type: string): number {
	if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
		throw new Error(
			`${type} config: ${field} must be a positive number, got ${JSON.stringify(value)}`
		);
	}
	return value;
}

/**
 * Validates a seeded config for a primitive lesson type. Throws with a message
 * naming the field, so a contract failure reads like a bug report.
 */
export function parsePrimitiveGameConfig(lessonType: string, raw: unknown): void {
	const c = asRecord(raw);
	switch (lessonType) {
		case 'hover':
			parseHoverConfig(raw);
			return;

		case 'click':
			requireVariant(c.theme, CLICK_THEMES, 'theme', 'click');
			requirePositive(c.targetCount, 'targetCount', 'click');
			requirePositive(c.timeLimit, 'timeLimit', 'click');
			return;

		case 'double-click':
			requireVariant(c.theme, DOUBLE_CLICK_THEMES, 'theme', 'double-click');
			requirePositive(c.targetCount, 'targetCount', 'double-click');
			requirePositive(c.timeLimit, 'timeLimit', 'double-click');
			return;

		case 'right-click':
			requireVariant(c.theme, RIGHT_CLICK_THEMES, 'theme', 'right-click');
			requirePositive(c.targetCount, 'targetCount', 'right-click');
			requirePositive(c.timeLimit, 'timeLimit', 'right-click');
			return;

		case 'drag':
			requireVariant(c.theme, DRAG_THEMES, 'theme', 'drag');
			requirePositive(c.itemCount, 'itemCount', 'drag');
			requirePositive(c.dropZones, 'dropZones', 'drag');
			return;

		case 'scroll':
			requirePositive(c.scrollDistance, 'scrollDistance', 'scroll');
			requirePositive(c.timeLimit, 'timeLimit', 'scroll');
			return;

		case 'typing':
			requireVariant(c.text, TYPING_PRESETS, 'text', 'typing');
			requirePositive(c.timeLimit, 'timeLimit', 'typing');
			return;

		case 'quiz': {
			// Two shapes are in the wild: a single inline question, or a bank.
			const bank = c.questions;
			if (Array.isArray(bank)) {
				if (bank.length === 0) throw new Error('quiz config: questions must not be empty');
				bank.forEach((q, i) => assertQuestion(q, `questions[${i}]`));
				return;
			}
			assertQuestion(c, 'config');
			return;
		}

		default:
			throw new Error(`No playability contract registered for lesson type "${lessonType}"`);
	}
}

/**
 * A quiz question is only answerable if the learner can read it, pick from at
 * least two choices, and exactly one of them can be right.
 *
 * The prompt lives under `text` in question banks and under `question` in the
 * single-question shape; QuizLesson renders `text || question`, so the contract
 * accepts either. Option ids are required because the component resolves the
 * chosen answer by id — an option without one can never be marked correct.
 */
function assertQuestion(raw: unknown, where: string): void {
	const q = asRecord(raw);
	const prompt = q.text ?? q.question;
	if (typeof prompt !== 'string' || prompt.trim() === '') {
		throw new Error(`quiz config: ${where} needs a non-empty text/question`);
	}
	if (!Array.isArray(q.options) || q.options.length < 2) {
		throw new Error(`quiz config: ${where}.options needs at least two choices`);
	}
	const ids = q.options.map((o) => asRecord(o).id);
	if (ids.some((id) => typeof id !== 'string' || id === '')) {
		throw new Error(`quiz config: ${where} has an option without an id — it can never be chosen`);
	}
	if (new Set(ids).size !== ids.length) {
		throw new Error(`quiz config: ${where} has duplicate option ids`);
	}
	const correct = q.options.filter((o) => asRecord(o).correct === true);
	if (correct.length !== 1) {
		throw new Error(
			`quiz config: ${where} must have exactly one correct option, found ${correct.length}`
		);
	}
}

export { HOVER_THEMES, type HoverTheme };
