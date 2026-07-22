/**
 * Typed config + goal-matching for the `health-simulation` lessonType
 * (health services track — issue B2: άυλη συνταγογράφηση + MyHealth).
 *
 * Mirrors the isolation pattern of `macSim.ts` / `mobileSim.ts`: the whole
 * simulation is deterministic and driven by this config, so every seeded goal is
 * always reachable from the initial state. The matcher lives here (not in the
 * shared `goalHandlers.ts`) so the health track is self-contained and unit-
 * testable in isolation — the shared goal registry gains the same `health-*`
 * handlers at integration time for parity, but the component never depends on
 * that wiring having landed.
 *
 * Design note (why a dedicated lessonType and not BrowserApp): the health flows
 * render surfaces BrowserApp cannot express — an SMS thread carrying the άυλη
 * συνταγογράφηση code, a MyHealth-like portal with «Οι συνταγές μου», and an
 * appointment picker. Rather than editing the shared BrowserApp/DesktopLesson,
 * the track ships its own isolated `HealthApp.svelte` + wrapper.
 */

/** The three health screens, each pinned to exactly one goal. */
export type HealthScreen = 'sms' | 'portal' | 'appointments';

export type HealthGoalId =
	| 'health-read-eprescription-code'
	| 'health-view-prescriptions'
	| 'health-book-appointment';

/** The `health-*` goals this track introduces (source of truth for the manifest). */
export const HEALTH_GOAL_IDS: readonly HealthGoalId[] = [
	'health-read-eprescription-code',
	'health-view-prescriptions',
	'health-book-appointment'
];

/** Which screen a goal drives, so the seed can never pair a goal with a screen
 * that cannot emit its completion event. */
export const HEALTH_GOAL_SCREEN: Record<HealthGoalId, HealthScreen> = {
	'health-read-eprescription-code': 'sms',
	'health-view-prescriptions': 'portal',
	'health-book-appointment': 'appointments'
};

export function isHealthGoalId(value: unknown): value is HealthGoalId {
	return typeof value === 'string' && (HEALTH_GOAL_IDS as readonly string[]).includes(value);
}

export interface HealthPrescription {
	/** Short medication/service title, e.g. «Παρακεταμόλη 500mg». */
	title: string;
	/** Secondary line, e.g. «Δρ. Ιωάννου · 1 κουτί · λήξη 30/09». */
	detail: string;
}

export interface HealthSlot {
	id: string;
	/** Human label shown on the slot button, e.g. «Δευτέρα 10:00». */
	label: string;
}

export interface HealthSimConfig {
	goal: HealthGoalId;
	/** Greek instruction shown above the simulation (Greek-only, not i18n). */
	prompt: string;
	screen: HealthScreen;

	// ── sms screen (health-read-eprescription-code) ────────────────────────────
	/** Sender label of the official message, e.g. «ΕΦΚΑ 1517». */
	sender?: string;
	/** One-line preview shown in the message list. */
	smsPreview?: string;
	/** The e-prescription barcode/code the learner must read. */
	code?: string;
	/** Optional medication label shown inside the message. */
	medication?: string;

	// ── portal screen (health-view-prescriptions) ─────────────────────────────
	/** Patient name shown after the mock Taxisnet login. */
	patientName?: string;
	/** Prescriptions listed under «Οι συνταγές μου». */
	prescriptions?: HealthPrescription[];

	// ── appointments screen (health-book-appointment) ─────────────────────────
	/** Doctor/clinic label shown above the slots. */
	doctor?: string;
	/** Available appointment slots. */
	slots?: HealthSlot[];
	/** If set, only this slot completes the goal (else any slot does). */
	targetSlotId?: string;

	/** Success line (falls back to a default). */
	successMessage?: string;
	/** Gentle hint revealed after repeated misses. */
	hint?: string;
}

/**
 * Validate a raw lesson config and return it typed, or throw naming the exact
 * defect. Used by the component (fail loud in dev) and by seed contract tests
 * (every seeded health-simulation lesson must be playable).
 */
export function parseHealthSimConfig(raw: unknown): HealthSimConfig {
	const c = raw as Partial<HealthSimConfig> | null;
	if (!c || typeof c !== 'object') throw new Error('health-simulation config must be an object');

	if (!isHealthGoalId(c.goal)) {
		throw new Error(`health-simulation config needs a registered health-* goal (got "${c.goal}")`);
	}
	if (typeof c.prompt !== 'string' || !c.prompt.trim()) {
		throw new Error('health-simulation config needs a non-empty prompt');
	}
	if (c.screen !== 'sms' && c.screen !== 'portal' && c.screen !== 'appointments') {
		throw new Error(`health-simulation config needs a valid screen (got "${c.screen}")`);
	}
	if (HEALTH_GOAL_SCREEN[c.goal] !== c.screen) {
		throw new Error(
			`goal "${c.goal}" must run on screen "${HEALTH_GOAL_SCREEN[c.goal]}" (got "${c.screen}")`
		);
	}

	if (c.screen === 'sms') {
		if (typeof c.code !== 'string' || !c.code.trim()) {
			throw new Error('sms screen needs a non-empty code');
		}
	}

	if (c.screen === 'portal') {
		if (!Array.isArray(c.prescriptions) || c.prescriptions.length === 0) {
			throw new Error('portal screen needs a non-empty prescriptions list');
		}
		for (const p of c.prescriptions) {
			if (typeof p?.title !== 'string' || typeof p.detail !== 'string') {
				throw new Error(
					`prescriptions entries need string title/detail (got ${JSON.stringify(p)})`
				);
			}
		}
	}

	if (c.screen === 'appointments') {
		if (!Array.isArray(c.slots) || c.slots.length === 0) {
			throw new Error('appointments screen needs a non-empty slots list');
		}
		const ids = new Set<string>();
		for (const s of c.slots) {
			if (typeof s?.id !== 'string' || typeof s.label !== 'string') {
				throw new Error(`slots entries need string id/label (got ${JSON.stringify(s)})`);
			}
			if (ids.has(s.id)) throw new Error(`duplicate slot id "${s.id}"`);
			ids.add(s.id);
		}
		if (c.targetSlotId !== undefined && !ids.has(c.targetSlotId)) {
			throw new Error(`targetSlotId "${c.targetSlotId}" is not in slots`);
		}
	}

	return c as HealthSimConfig;
}

/**
 * Returns true when a semantic event from HealthApp satisfies the lesson goal.
 * Kept deliberately narrow — the screen already scopes which events can fire.
 */
export function matchHealthGoal(
	config: HealthSimConfig,
	action: string,
	data: Record<string, unknown> = {}
): boolean {
	switch (config.goal) {
		case 'health-read-eprescription-code':
			// Merely opening the message is not enough — the learner must confirm
			// they read the code (teaches «διάβασε τον κωδικό», not «πάτα τυχαία»).
			return action === 'health-code-revealed' && data.confirmed === true;

		case 'health-view-prescriptions':
			return action === 'health-prescriptions-viewed';

		case 'health-book-appointment':
			return (
				action === 'health-appointment-booked' &&
				(!config.targetSlotId || data.slotId === config.targetSlotId)
			);

		default:
			return false;
	}
}
