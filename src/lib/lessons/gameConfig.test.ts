import { describe, it, expect } from 'vitest';
import {
	parsePrimitiveGameConfig,
	isPrimitiveLessonType,
	PRIMITIVE_LESSON_TYPES,
	CLICK_THEMES,
	DRAG_THEMES,
	TYPING_PRESETS
} from './gameConfig';

const ok = (type: string, config: unknown) =>
	expect(() => parsePrimitiveGameConfig(type, config)).not.toThrow();
const bad = (type: string, config: unknown, match?: RegExp) =>
	expect(() => parsePrimitiveGameConfig(type, config)).toThrow(match);

describe('isPrimitiveLessonType', () => {
	it('recognises every type it certifies', () => {
		for (const t of PRIMITIVE_LESSON_TYPES) expect(isPrimitiveLessonType(t)).toBe(true);
	});

	it('does not claim the simulation types, which have their own parsers', () => {
		for (const t of ['mobile-sim', 'mac-simulation', 'gov-simulation', 'reading']) {
			expect(isPrimitiveLessonType(t)).toBe(false);
		}
	});
});

describe('unregistered types', () => {
	it('refuses to certify a type nobody wrote a contract for', () => {
		bad('interpretive-dance', {}, /No playability contract/);
	});
});

describe('click / double-click / right-click', () => {
	it('accepts every advertised click theme', () => {
		for (const theme of CLICK_THEMES) ok('click', { theme, targetCount: 5, timeLimit: 30 });
	});

	it('rejects a theme the component cannot render', () => {
		bad('click', { theme: 'unicorns', targetCount: 5, timeLimit: 30 }, /theme must be one of/);
	});

	it.each([
		[{ theme: 'moles', timeLimit: 30 }, /targetCount/],
		[{ theme: 'moles', targetCount: 5 }, /timeLimit/],
		[{ theme: 'moles', targetCount: 0, timeLimit: 30 }, /targetCount/],
		[{ theme: 'moles', targetCount: 5, timeLimit: -1 }, /timeLimit/]
	])('rejects %o', (config, match) => bad('click', config, match));

	it('keeps double-click and right-click on their own smaller theme sets', () => {
		bad('double-click', { theme: 'moles', targetCount: 5, timeLimit: 30 });
		bad('right-click', { theme: 'chests', targetCount: 5, timeLimit: 30 });
		ok('double-click', { theme: 'chests', targetCount: 5, timeLimit: 30 });
		ok('right-click', { theme: 'mystery', targetCount: 5, timeLimit: 30 });
	});
});

describe('drag', () => {
	it('accepts every advertised drag theme', () => {
		for (const theme of DRAG_THEMES) ok('drag', { theme, itemCount: 3, dropZones: 3 });
	});

	it('needs both an item count and somewhere to drop them', () => {
		bad('drag', { theme: 'puzzle', itemCount: 3 }, /dropZones/);
		bad('drag', { theme: 'puzzle', dropZones: 3 }, /itemCount/);
	});
});

describe('scroll', () => {
	it('needs a distance to travel', () => {
		bad('scroll', { timeLimit: 60 }, /scrollDistance/);
		ok('scroll', { scrollDistance: 2000, timeLimit: 60 });
	});
});

describe('typing', () => {
	it('accepts every preset the component ships', () => {
		for (const text of TYPING_PRESETS) ok('typing', { text, timeLimit: 60 });
	});

	it('rejects a preset with no sample text behind it', () => {
		bad('typing', { text: 'shakespeare', timeLimit: 60 }, /text must be one of/);
	});
});

describe('quiz', () => {
	const q = {
		text: 'Ποιο είναι σημάδι απάτης;',
		options: [
			{ id: 'a', text: 'Επείγουσα γλώσσα', correct: true },
			{ id: 'b', text: 'Προσωπική προσφώνηση', correct: false }
		]
	};

	it('accepts a question bank', () => ok('quiz', { questions: [q] }));

	it('accepts the single inline-question shape', () => {
		ok('quiz', { question: q.text, options: q.options });
	});

	it('rejects an empty bank', () => bad('quiz', { questions: [] }, /must not be empty/));

	it('rejects a question with no prompt', () => {
		bad('quiz', { questions: [{ options: q.options }] }, /text\/question/);
	});

	it('rejects fewer than two choices', () => {
		bad('quiz', { questions: [{ ...q, options: [q.options[0]] }] }, /at least two/);
	});

	// The component resolves the answer by option id, so a missing or duplicated
	// id makes the question unanswerable no matter what the learner clicks.
	it('rejects an option without an id', () => {
		bad(
			'quiz',
			{ questions: [{ ...q, options: [{ text: 'a', correct: true }, q.options[1]] }] },
			/without an id/
		);
	});

	it('rejects duplicate option ids', () => {
		bad(
			'quiz',
			{ questions: [{ ...q, options: [q.options[0], { ...q.options[1], id: 'a' }] }] },
			/duplicate option ids/
		);
	});

	it.each([
		['no correct answer', [{ ...q.options[0], correct: false }, q.options[1]]],
		['two correct answers', [q.options[0], { ...q.options[1], correct: true }]]
	])('rejects a question with %s', (_label, options) => {
		bad('quiz', { questions: [{ ...q, options }] }, /exactly one correct option/);
	});
});

describe('hover (bd-5t4 regression)', () => {
	it('rejects the exact config that shipped broken', () => {
		bad(
			'hover',
			{ targetCount: 20, timeLimit: 300, gameMode: true, theme: 'default' },
			/theme must be one of/
		);
	});

	it('accepts the fixed config', () => {
		ok('hover', { targetCount: 20, timeLimit: 300, theme: 'shape-path', pathId: 'zigzag' });
	});
});
