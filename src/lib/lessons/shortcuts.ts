/**
 * Keyboard shortcuts that follow the device the learner chose.
 *
 * The shortcut lessons used to hardcode `Ctrl` in both the label and the key
 * check, so a learner who told us they use a Mac was shown "Ctrl + C" and the
 * lesson refused the ⌘C they will actually press for the rest of their life.
 *
 * Shortcuts are therefore stored semantically — `['primary', 'C']` — and this
 * module is the single place that decides what "primary" prints and accepts.
 * Substituting `Ctrl` for `⌘` in prose would be worse: some lessons legitimately
 * talk about the Control key itself.
 */

export type LearnerDevice = 'windows' | 'mac' | 'android' | 'iphone' | null | undefined;

/** Semantic key: a role ('primary', 'alt', …) or a literal key name ('C', 'F5'). */
export type ShortcutKey = string;

const isMac = (device: LearnerDevice) => device === 'mac';

/**
 * Only a computer choice tells us the keyboard. A learner who chose a phone
 * still does the keyboard drills at whatever computer is in front of them, so
 * for them — as for no choice at all — both keys are shown and accepted.
 */
const knowsKeyboard = (device: LearnerDevice) => device === 'windows' || device === 'mac';

/** Roles consumed as modifiers; everything else names a key to compare. */
const MODIFIER_ROLES = new Set(['primary', 'alt', 'shift', 'control']);

/** Keys whose *name* differs per keyboard but which arrive as the same event. */
const KEY_ALIASES: Record<string, string> = {
	backspace: 'backspace',
	delete: 'backspace',
	// A space bar arrives as `' '`, but ' + Space' is what a lesson writes.
	space: ' ',
	spacebar: ' ',
	// Zoom in is printed "+" but sits on the "=" key; pressed without Shift it
	// arrives as '='. The numpad "+" already arrives as '+'.
	'=': '+'
};

/** Keys that need Shift on some keyboards and not others, so Shift is not checked. */
const SHIFT_AGNOSTIC = new Set(['+']);

/** Mac keyboards print ⌘/⌥/⌫; PC keyboards print Ctrl/Alt/Backspace. */
const ROLE_LABELS: Record<string, { mac: string; pc: string }> = {
	primary: { mac: '⌘', pc: 'Ctrl' },
	// The literal Control key. On a Mac it is *not* the shortcut modifier, which
	// is why it needs a role of its own.
	control: { mac: '⌃ (Control)', pc: 'Ctrl' },
	alt: { mac: '⌥ (Option)', pc: 'Alt' },
	shift: { mac: 'Shift', pc: 'Shift' },
	backspace: { mac: 'Delete (⌫)', pc: 'Backspace' }
};

function labelFor(key: ShortcutKey, device: LearnerDevice): string {
	const role = ROLE_LABELS[key.toLowerCase()];
	if (!role) return key.length === 1 ? key.toUpperCase() : key;
	return isMac(device) ? role.mac : role.pc;
}

/**
 * Human label for a shortcut. With no chosen device we spell out both rather
 * than guessing from the user agent and teaching the wrong key.
 */
export function formatShortcut(keys: ShortcutKey[], device: LearnerDevice): string {
	const known = knowsKeyboard(device);
	const render = (d: LearnerDevice) => keys.map((k) => labelFor(k, d)).join(' + ');

	if (known) return render(device);

	const pc = render('windows');
	const mac = render('mac');
	return pc === mac ? pc : `${pc} (σε Mac: ${mac})`;
}

/** Does this keypress satisfy the shortcut on this device? */
export function matchesShortcut(
	event: KeyboardEvent,
	keys: ShortcutKey[],
	device: LearnerDevice
): boolean {
	const wanted = keys.map((k) => k.toLowerCase());
	const unknownDevice = !knowsKeyboard(device);

	const wantsPrimary = wanted.includes('primary');
	const wantsControl = wanted.includes('control');
	const wantsAlt = wanted.includes('alt');
	const wantsShift = wanted.includes('shift');

	// On a Mac the shortcut modifier is ⌘ and Control is a separate key; on a PC
	// they are the same physical key. With no chosen device, accept either.
	const primaryHeld = isMac(device)
		? !!event.metaKey
		: unknownDevice
			? !!event.ctrlKey || !!event.metaKey
			: !!event.ctrlKey;

	if (wantsPrimary !== primaryHeld) return false;
	if (wantsControl !== !!event.ctrlKey && !(wantsPrimary && !isMac(device))) return false;
	// A held modifier that the shortcut never asked for is a different shortcut.
	if (!wantsPrimary && !wantsControl && (event.ctrlKey || event.metaKey)) return false;
	if (wantsAlt !== !!event.altKey) return false;

	// Only the modifier roles are consumed above; a role like `backspace` still
	// names a real key and must be compared. Excluding every role made
	// `['backspace']` match any unmodified keypress.
	const literals = wanted.filter((k) => !MODIFIER_ROLES.has(k));
	const shiftAgnostic = literals.some((k) => SHIFT_AGNOSTIC.has(KEY_ALIASES[k] ?? k));
	if (!shiftAgnostic && wantsShift !== !!event.shiftKey) return false;
	if (literals.length === 0) return true;

	const pressed = (event.key ?? '').toLowerCase();
	const normalisedPress = KEY_ALIASES[pressed] ?? pressed;
	return literals.every((k) => (KEY_ALIASES[k] ?? k) === normalisedPress);
}

/**
 * The shortcuts the seeded lessons name, kept semantic. `mac` is only present
 * where the chord genuinely differs — redo is ⌘⇧Z on a Mac, not ⌘Y, and
 * teaching the mechanical substitution teaches a key combination that does
 * nothing.
 */
export const SHORTCUT_ACTIONS: Record<
	string,
	{ keys: ShortcutKey[]; mac?: ShortcutKey[]; description: string }
> = {
	copy: { keys: ['primary', 'C'], description: 'Αντιγραφή (Copy)' },
	paste: { keys: ['primary', 'V'], description: 'Επικόλληση (Paste)' },
	cut: { keys: ['primary', 'X'], description: 'Αποκοπή (Cut)' },
	undo: { keys: ['primary', 'Z'], description: 'Αναίρεση (Undo)' },
	redo: {
		keys: ['primary', 'Y'],
		mac: ['primary', 'shift', 'Z'],
		description: 'Επανάληψη (Redo)'
	},
	'language-switch': {
		keys: ['alt', 'shift'],
		mac: ['control', 'Space'],
		description: 'Αλλαγή γλώσσας πληκτρολογίου'
	},
	'zoom-in': { keys: ['primary', '+'], description: 'Μεγέθυνση σελίδας' },
	'zoom-out': { keys: ['primary', '-'], description: 'Σμίκρυνση σελίδας' },
	find: { keys: ['primary', 'F'], description: 'Αναζήτηση στη σελίδα' }
};

export type ShortcutStep = {
	label: string;
	keys: ShortcutKey[];
	/** The Mac chord, when it differs and the learner's keyboard is unknown. */
	macKeys?: ShortcutKey[];
	description: string;
};

/** Turn seeded action names into steps labelled for this learner's keyboard. */
export function shortcutSteps(actions: string[], device: LearnerDevice): ShortcutStep[] {
	return actions
		.map((action) => SHORTCUT_ACTIONS[action])
		.filter((entry): entry is (typeof SHORTCUT_ACTIONS)[string] => !!entry)
		.map((entry) => {
			if (entry.mac && !knowsKeyboard(device)) {
				// Mechanically swapping Ctrl for ⌘ would name a chord that does nothing
				// on a Mac (redo is not ⌘ + Y), so name each keyboard's real one.
				const pc = formatShortcut(entry.keys, 'windows');
				const mac = formatShortcut(entry.mac, 'mac');
				return {
					keys: entry.keys,
					macKeys: entry.mac,
					description: entry.description,
					label: `${pc} (σε Mac: ${mac})`
				};
			}
			const keys = isMac(device) && entry.mac ? entry.mac : entry.keys;
			return {
				keys,
				description: entry.description,
				label: formatShortcut(keys, device)
			};
		});
}

/** Does this keypress complete the step? Either keyboard's chord, when we do not know which. */
export function matchesStep(
	event: KeyboardEvent,
	step: Pick<ShortcutStep, 'keys' | 'macKeys'>,
	device: LearnerDevice
): boolean {
	if (!step.macKeys) return matchesShortcut(event, step.keys, device);
	return (
		matchesShortcut(event, step.keys, 'windows') || matchesShortcut(event, step.macKeys, 'mac')
	);
}

/**
 * Lesson prose names a shortcut with an explicit `{{shortcut:<action>}}` token,
 * or a single key with `{{key:<role>}}` ("hold {{key:primary}} and press +" reads
 * better than "⌘ + +"). Both are filled in for this learner's keyboard. Bare
 * words like "Ctrl" are left alone: some lessons talk about that key itself. An
 * unknown token stays visible, so a typo in a seed shows up on screen instead of
 * leaving a gap in the sentence.
 */
export function fillShortcutText(text: string, device: LearnerDevice): string {
	return text.replace(/\{\{(shortcut|key):([a-z-]+)\}\}/g, (token, kind: string, name: string) => {
		if (kind === 'key') return name in ROLE_LABELS ? formatShortcut([name], device) : token;
		return shortcutSteps([name], device)[0]?.label ?? token;
	});
}
