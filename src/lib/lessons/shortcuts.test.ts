import { describe, expect, test } from 'vitest';
import {
	fillShortcutText,
	formatShortcut,
	matchesShortcut,
	matchesStep,
	shortcutSteps
} from './shortcuts';

// The learner picks a device during onboarding. Until now the keyboard lessons
// ignored it: a Mac learner was told to press "Ctrl + C" and the lesson only
// accepted Control, so pressing ⌘C — the thing they will actually use — failed.

describe('formatShortcut', () => {
	test('uses Ctrl on Windows', () => {
		expect(formatShortcut(['primary', 'C'], 'windows')).toBe('Ctrl + C');
	});

	test('uses the Command symbol on a Mac', () => {
		expect(formatShortcut(['primary', 'C'], 'mac')).toBe('⌘ + C');
	});

	test('spells both out when the device is unknown, instead of guessing', () => {
		expect(formatShortcut(['primary', 'C'], null)).toBe('Ctrl + C (σε Mac: ⌘ + C)');
	});

	test('names the option key the way each keyboard prints it', () => {
		expect(formatShortcut(['alt', 'Tab'], 'windows')).toBe('Alt + Tab');
		expect(formatShortcut(['alt', 'Tab'], 'mac')).toBe('⌥ (Option) + Tab');
	});

	test('names the delete key the way each keyboard prints it', () => {
		expect(formatShortcut(['backspace'], 'windows')).toBe('Backspace');
		expect(formatShortcut(['backspace'], 'mac')).toBe('Delete (⌫)');
	});

	test('passes ordinary keys through untouched', () => {
		expect(formatShortcut(['shift', 'F5'], 'mac')).toBe('Shift + F5');
	});
});

describe('matchesShortcut', () => {
	const event = (init: Partial<KeyboardEvent>) => init as KeyboardEvent;

	test('accepts Cmd on a Mac and rejects Ctrl there', () => {
		expect(matchesShortcut(event({ key: 'c', metaKey: true }), ['primary', 'C'], 'mac')).toBe(true);
		expect(matchesShortcut(event({ key: 'c', ctrlKey: true }), ['primary', 'C'], 'mac')).toBe(
			false
		);
	});

	test('accepts Ctrl on Windows and rejects Cmd there', () => {
		expect(matchesShortcut(event({ key: 'c', ctrlKey: true }), ['primary', 'C'], 'windows')).toBe(
			true
		);
		expect(matchesShortcut(event({ key: 'c', metaKey: true }), ['primary', 'C'], 'windows')).toBe(
			false
		);
	});

	test('accepts either modifier when the device is unknown', () => {
		expect(matchesShortcut(event({ key: 'c', ctrlKey: true }), ['primary', 'C'], null)).toBe(true);
		expect(matchesShortcut(event({ key: 'c', metaKey: true }), ['primary', 'C'], null)).toBe(true);
	});

	test('is case-insensitive about the letter', () => {
		expect(matchesShortcut(event({ key: 'C', ctrlKey: true }), ['primary', 'c'], 'windows')).toBe(
			true
		);
	});

	test('rejects the right letter with the wrong modifier', () => {
		expect(matchesShortcut(event({ key: 'c' }), ['primary', 'C'], 'windows')).toBe(false);
		expect(
			matchesShortcut(
				event({ key: 'c', ctrlKey: true, shiftKey: true }),
				['primary', 'C'],
				'windows'
			)
		).toBe(false);
	});

	test('handles a modifier-only shortcut such as Alt + Shift', () => {
		expect(
			matchesShortcut(
				event({ key: 'Shift', altKey: true, shiftKey: true }),
				['alt', 'shift'],
				'windows'
			)
		).toBe(true);
		expect(
			matchesShortcut(event({ key: 'Shift', shiftKey: true }), ['alt', 'shift'], 'windows')
		).toBe(false);
	});

	test('matches a function key by name', () => {
		expect(matchesShortcut(event({ key: 'F5' }), ['F5'], 'windows')).toBe(true);
		expect(matchesShortcut(event({ key: 'F2' }), ['F5'], 'windows')).toBe(false);
	});
});

describe('shortcutSteps', () => {
	test('turns the seeded action names into device-correct steps', () => {
		const steps = shortcutSteps(['copy', 'paste'], 'mac');
		expect(steps.map((s) => s.label)).toEqual(['⌘ + C', '⌘ + V']);
		expect(steps[0].description).toContain('Αντιγραφή');
	});

	test('the same seed data reads differently on Windows', () => {
		expect(shortcutSteps(['copy'], 'windows')[0].label).toBe('Ctrl + C');
	});

	test('skips action names it does not know instead of rendering a blank step', () => {
		expect(shortcutSteps(['copy', 'teleport'], 'windows')).toHaveLength(1);
	});
});

// Some actions are not the same chord with a different modifier. Teaching a Mac
// learner "⌘ + Y" for redo teaches them a shortcut that does nothing.
describe('actions that genuinely differ between platforms', () => {
	test('redo is ⌘ + Shift + Z on a Mac, Ctrl + Y on Windows', () => {
		expect(shortcutSteps(['redo'], 'mac')[0].label).toBe('⌘ + Shift + Z');
		expect(shortcutSteps(['redo'], 'windows')[0].label).toBe('Ctrl + Y');
	});

	test('the Mac redo chord is what the drill accepts on a Mac', () => {
		const step = shortcutSteps(['redo'], 'mac')[0];
		expect(
			matchesShortcut(
				{ key: 'z', metaKey: true, shiftKey: true } as KeyboardEvent,
				step.keys,
				'mac'
			)
		).toBe(true);
		expect(matchesShortcut({ key: 'y', metaKey: true } as KeyboardEvent, step.keys, 'mac')).toBe(
			false
		);
	});

	test('copy is the same chord on both, so it is not duplicated', () => {
		expect(shortcutSteps(['copy'], 'mac')[0].keys).toEqual(
			shortcutSteps(['copy'], 'windows')[0].keys
		);
	});
});

describe('literal keys are matched literally', () => {
	// `backspace` lives in the label table, and label roles were excluded from
	// literal matching — so the drill accepted *any* unmodified key as Backspace.
	test('Backspace does not match an unrelated key', () => {
		expect(matchesShortcut({ key: 'Backspace' } as KeyboardEvent, ['backspace'], 'windows')).toBe(
			true
		);
		expect(matchesShortcut({ key: 'a' } as KeyboardEvent, ['backspace'], 'windows')).toBe(false);
	});

	test('a Mac learner pressing Delete satisfies the same step', () => {
		expect(matchesShortcut({ key: 'Backspace' } as KeyboardEvent, ['backspace'], 'mac')).toBe(true);
	});
});

describe('switching keyboard language', () => {
	test('Windows learners are taught Alt + Shift', () => {
		expect(shortcutSteps(['language-switch'], 'windows')[0].label).toBe('Alt + Shift');
	});

	test('Mac learners are taught Control + Space, not Alt + Shift', () => {
		const step = shortcutSteps(['language-switch'], 'mac')[0];
		expect(step.label).toBe('⌃ (Control) + Space');
		expect(matchesShortcut({ key: ' ', ctrlKey: true } as KeyboardEvent, step.keys, 'mac')).toBe(
			true
		);
		expect(
			matchesShortcut(
				{ key: 'Shift', altKey: true, shiftKey: true } as KeyboardEvent,
				step.keys,
				'mac'
			)
		).toBe(false);
	});

	test('Control is not the same role as the copy/paste modifier on a Mac', () => {
		// ⌘ copies; ⌃ does not.
		expect(
			matchesShortcut({ key: 'c', ctrlKey: true } as KeyboardEvent, ['primary', 'C'], 'mac')
		).toBe(false);
	});
});

// The browser lessons (zoom, find on page) said "Ctrl+" in their instructions
// and ignored the keyboard entirely, so a Mac learner pressing ⌘+ zoomed the
// real browser instead of the practice page.
describe('browser shortcuts', () => {
	const event = (init: Partial<KeyboardEvent>) => init as KeyboardEvent;
	const zoomIn = shortcutSteps(['zoom-in'], 'mac')[0].keys;
	const zoomOut = shortcutSteps(['zoom-out'], 'mac')[0].keys;
	const find = shortcutSteps(['find'], 'mac')[0].keys;

	test('zoom in accepts the = key, since + needs Shift on most keyboards', () => {
		expect(matchesShortcut(event({ key: '=', metaKey: true }), zoomIn, 'mac')).toBe(true);
		expect(matchesShortcut(event({ key: '+', metaKey: true, shiftKey: true }), zoomIn, 'mac')).toBe(
			true
		);
		expect(matchesShortcut(event({ key: '=', ctrlKey: true }), zoomIn, 'windows')).toBe(true);
	});

	test('zoom still follows the device modifier', () => {
		expect(matchesShortcut(event({ key: '=', ctrlKey: true }), zoomIn, 'mac')).toBe(false);
		expect(matchesShortcut(event({ key: '=', metaKey: true }), zoomIn, 'windows')).toBe(false);
	});

	test('zoom out and find are ordinary chords', () => {
		expect(matchesShortcut(event({ key: '-', metaKey: true }), zoomOut, 'mac')).toBe(true);
		expect(matchesShortcut(event({ key: '-', ctrlKey: true }), zoomOut, 'windows')).toBe(true);
		expect(matchesShortcut(event({ key: 'f', metaKey: true }), find, 'mac')).toBe(true);
		expect(
			matchesShortcut(event({ key: 'F', ctrlKey: true, shiftKey: true }), find, 'windows')
		).toBe(false);
	});

	test('labels read the way the keyboard is printed', () => {
		expect(shortcutSteps(['zoom-in', 'find'], 'mac').map((s) => s.label)).toEqual([
			'⌘ + +',
			'⌘ + F'
		]);
		expect(shortcutSteps(['zoom-out'], 'windows')[0].label).toBe('Ctrl + -');
	});
});

describe('fillShortcutText', () => {
	const text = 'Πατήστε {{shortcut:find}} για αναζήτηση.';

	test('names the key of the chosen device', () => {
		expect(fillShortcutText(text, 'mac')).toBe('Πατήστε ⌘ + F για αναζήτηση.');
		expect(fillShortcutText(text, 'windows')).toBe('Πατήστε Ctrl + F για αναζήτηση.');
	});

	test('spells out both when the device is unknown', () => {
		expect(fillShortcutText(text, null)).toBe('Πατήστε Ctrl + F (σε Mac: ⌘ + F) για αναζήτηση.');
	});

	test('uses the Mac chord where it genuinely differs', () => {
		expect(fillShortcutText('{{shortcut:redo}}', 'mac')).toBe('⌘ + Shift + Z');
	});

	test('leaves prose that mentions a key by name alone', () => {
		const prose = 'Το πλήκτρο Ctrl βρίσκεται κάτω αριστερά.';
		expect(fillShortcutText(prose, 'mac')).toBe(prose);
	});

	// "⌘ + +" is hard to read aloud; prose can name the held key on its own.
	test('names a single key the same way', () => {
		const zoom = 'Κρατήστε πατημένο το {{key:primary}} και πατήστε +.';
		expect(fillShortcutText(zoom, 'mac')).toBe('Κρατήστε πατημένο το ⌘ και πατήστε +.');
		expect(fillShortcutText(zoom, 'windows')).toBe('Κρατήστε πατημένο το Ctrl και πατήστε +.');
		expect(fillShortcutText(zoom, null)).toBe(
			'Κρατήστε πατημένο το Ctrl (σε Mac: ⌘) και πατήστε +.'
		);
	});

	test('leaves an unknown key role visible too', () => {
		expect(fillShortcutText('{{key:hyper}}', 'mac')).toBe('{{key:hyper}}');
	});

	test('leaves an unknown token visible rather than printing nothing', () => {
		expect(fillShortcutText('{{shortcut:nope}}', 'mac')).toBe('{{shortcut:nope}}');
	});
});

// A learner who chose a phone still does the keyboard drills on whatever
// computer is in front of them. Insisting on ⌘ (iPhone) or Ctrl (Android) made
// those drills unwinnable on the other kind of keyboard.
describe('a phone learner at an unknown keyboard', () => {
	const event = (init: Partial<KeyboardEvent>) => init as KeyboardEvent;

	test('is shown both keys', () => {
		expect(formatShortcut(['primary', 'C'], 'iphone')).toBe('Ctrl + C (σε Mac: ⌘ + C)');
		expect(formatShortcut(['primary', 'C'], 'android')).toBe('Ctrl + C (σε Mac: ⌘ + C)');
	});

	test('may press either', () => {
		for (const device of ['iphone', 'android'] as const) {
			expect(matchesShortcut(event({ key: 'c', metaKey: true }), ['primary', 'C'], device)).toBe(
				true
			);
			expect(matchesShortcut(event({ key: 'c', ctrlKey: true }), ['primary', 'C'], device)).toBe(
				true
			);
		}
	});
});

describe('a shortcut whose Mac chord differs, on an unknown keyboard', () => {
	const event = (init: Partial<KeyboardEvent>) => init as KeyboardEvent;
	const [redo] = shortcutSteps(['redo'], null);

	test('names the real Mac chord, not the mechanical ⌘ + Y', () => {
		expect(redo.label).toBe('Ctrl + Y (σε Mac: ⌘ + Shift + Z)');
	});

	test('accepts both real chords and not the made-up one', () => {
		expect(matchesStep(event({ key: 'y', ctrlKey: true }), redo, null)).toBe(true);
		expect(matchesStep(event({ key: 'z', metaKey: true, shiftKey: true }), redo, null)).toBe(true);
		expect(matchesStep(event({ key: 'y', metaKey: true }), redo, null)).toBe(false);
	});

	test('a known keyboard gets only its own chord', () => {
		const [macRedo] = shortcutSteps(['redo'], 'mac');
		expect(matchesStep(event({ key: 'z', metaKey: true, shiftKey: true }), macRedo, 'mac')).toBe(
			true
		);
		expect(matchesStep(event({ key: 'y', ctrlKey: true }), macRedo, 'mac')).toBe(false);
	});
});
