import { isValidGoalId, type GoalId } from './goals';

/**
 * Typed config for the `mobile-sim` lessonType (CURRICULUM_PLAN §4).
 *
 * The simulation is deterministic: everything the learner can interact with
 * (apps, dock, target number…) comes from this config — no randomness, so a
 * seeded goal is always reachable from the initial state.
 */

export interface MobileSimApp {
	id: string;
	label: string;
	/** Emoji rendered inside the icon tile. */
	icon: string;
	/** Which mini-app opens on tap. Default: an inert placeholder screen. */
	kind?: 'phone' | 'placeholder';
	/** Tailwind-compatible background class for the icon tile. */
	color?: string;
}

export interface MobileSimConfig {
	goal: GoalId;
	variant: 'android' | 'ios';
	prompt: string;
	apps: MobileSimApp[];
	/** Apps pinned to the dock (bottom row). Must reference `apps` ids. */
	dockAppIds?: string[];
	targetAppId?: string;
	targetNumber?: string;
	successMessage?: string;
	hint?: string;
}

/** Goals that require a target app to exist on the home screen. */
const GOALS_NEEDING_TARGET_APP = new Set<string>(['mobile-open-app', 'mobile-dial-number']);

/** Goals that can only be completed inside a `kind: 'phone'` app. */
const GOALS_NEEDING_PHONE_APP = new Set<string>(['mobile-dial-number']);

/**
 * Validates a raw lesson config and returns it typed, or throws with a
 * message naming the exact defect. Used both by the component (fail loud in
 * dev) and by seed contract tests (every seeded lesson must be playable).
 */
export function parseMobileSimConfig(raw: unknown): MobileSimConfig {
	const c = raw as Partial<MobileSimConfig> | null;
	if (!c || typeof c !== 'object') throw new Error('mobile-sim config must be an object');

	if (typeof c.goal !== 'string' || !isValidGoalId(c.goal) || !c.goal.startsWith('mobile-')) {
		throw new Error(`mobile-sim config needs a registered mobile-* goal (got "${c.goal}")`);
	}
	if (c.variant !== 'android' && c.variant !== 'ios') {
		throw new Error(`mobile-sim config needs variant android|ios (got "${c.variant}")`);
	}
	if (typeof c.prompt !== 'string' || !c.prompt.trim()) {
		throw new Error('mobile-sim config needs a non-empty prompt');
	}
	if (!Array.isArray(c.apps) || c.apps.length === 0) {
		throw new Error('mobile-sim config needs a non-empty apps list');
	}
	const ids = new Set<string>();
	for (const app of c.apps) {
		if (!app?.id || !app.label || !app.icon) {
			throw new Error(`mobile-sim app entries need id/label/icon (got ${JSON.stringify(app)})`);
		}
		if (ids.has(app.id)) throw new Error(`duplicate mobile-sim app id "${app.id}"`);
		ids.add(app.id);
	}
	for (const dockId of c.dockAppIds ?? []) {
		if (!ids.has(dockId)) throw new Error(`dockAppIds references unknown app "${dockId}"`);
	}
	if (GOALS_NEEDING_TARGET_APP.has(c.goal)) {
		if (!c.targetAppId || !ids.has(c.targetAppId)) {
			throw new Error(`goal "${c.goal}" needs a targetAppId present in apps`);
		}
	}
	if (GOALS_NEEDING_PHONE_APP.has(c.goal)) {
		if (!c.apps.some((a) => a.kind === 'phone')) {
			throw new Error(`goal "${c.goal}" needs an app with kind "phone"`);
		}
	}
	return c as MobileSimConfig;
}
