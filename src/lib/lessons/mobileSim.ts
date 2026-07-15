import { isValidGoalId, type GoalId } from './goals';

/**
 * Typed config for the `mobile-sim` lessonType (CURRICULUM_PLAN §4).
 *
 * The simulation is deterministic: everything the learner can interact with
 * (apps, dock, contacts, conversations, networks…) comes from this config —
 * no randomness, so a seeded goal is always reachable from the initial state.
 */

export interface MobileSimApp {
	id: string;
	label: string;
	/** Emoji rendered inside the icon tile. */
	icon: string;
	/** Which mini-app opens on tap. Default: an inert placeholder screen. */
	kind?: 'phone' | 'messages' | 'viber' | 'settings' | 'placeholder';
	/** Tailwind-compatible background class for the icon tile. */
	color?: string;
}

export interface MobileSimContact {
	id: string;
	name: string;
	number: string;
}

export interface MobileSimConversation {
	id: string;
	name: string;
	/** Existing thread, oldest first. */
	messages: { from: 'them' | 'me'; text: string }[];
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
	targetContactId?: string;
	targetConversationId?: string;
	/** 'small' | 'medium' | 'large' for the font-size goal. */
	targetSize?: string;
	targetSsid?: string;
	/** Contacts shown in the phone app. */
	contacts?: MobileSimContact[];
	/** Conversations shown in the messages/viber app. */
	conversations?: MobileSimConversation[];
	/** Wi-Fi networks listed in settings. */
	wifiNetworks?: string[];
	successMessage?: string;
	hint?: string;
}

/** Goals that require a target app to exist on the home screen. */
const GOALS_NEEDING_TARGET_APP = new Set<string>([
	'mobile-open-app',
	'mobile-dial-number',
	'mobile-call-contact',
	'mobile-send-sms',
	'mobile-send-chat',
	'mobile-change-font-size',
	'mobile-connect-wifi',
	'mobile-start-videocall'
]);

/** Which app kind each goal is completed in (reachability check). */
const GOAL_APP_KIND: Record<string, MobileSimApp['kind']> = {
	'mobile-dial-number': 'phone',
	'mobile-call-contact': 'phone',
	'mobile-send-sms': 'messages',
	'mobile-send-chat': 'viber',
	'mobile-change-font-size': 'settings',
	'mobile-connect-wifi': 'settings',
	'mobile-start-videocall': 'viber'
};

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
	// Functional kinds must be unique: semantic events don't carry an appId, so
	// two apps of the same kind would make goal completion ambiguous.
	const kindCounts = new Map<string, number>();
	for (const app of c.apps) {
		if (app.kind && app.kind !== 'placeholder') {
			kindCounts.set(app.kind, (kindCounts.get(app.kind) ?? 0) + 1);
		}
	}
	for (const [kind, count] of kindCounts) {
		if (count > 1) throw new Error(`multiple apps with kind "${kind}" — events would be ambiguous`);
	}

	const neededKind = GOAL_APP_KIND[c.goal];
	if (neededKind) {
		// The TARGET app itself must be the one carrying the needed kind —
		// otherwise the hint highlights one app while the goal completes in
		// another (codex review).
		const target = c.apps.find((a) => a.id === c.targetAppId);
		if (target?.kind !== neededKind) {
			throw new Error(
				`goal "${c.goal}" needs targetAppId to be an app with kind "${neededKind}" (got "${target?.kind}")`
			);
		}
	}
	// Goal-specific reachability: the target entity must exist in the config data.
	if (c.goal === 'mobile-call-contact') {
		if (!c.contacts?.length) throw new Error('mobile-call-contact needs a contacts list');
		for (const p of c.contacts) {
			if (!p?.id || !p.name || !p.number) {
				throw new Error(`contacts entries need id/name/number (got ${JSON.stringify(p)})`);
			}
		}
		if (c.targetContactId && !c.contacts.some((p) => p.id === c.targetContactId)) {
			throw new Error(`targetContactId "${c.targetContactId}" is not in contacts`);
		}
	}
	if (c.goal === 'mobile-send-sms' || c.goal === 'mobile-send-chat' || c.goal === 'mobile-start-videocall') {
		if (!c.conversations?.length) throw new Error(`${c.goal} needs a conversations list`);
		for (const t of c.conversations) {
			if (!t?.id || !t.name || !Array.isArray(t.messages)) {
				throw new Error(`conversations entries need id/name/messages[] (got ${JSON.stringify(t)})`);
			}
		}
		if (c.targetConversationId && !c.conversations.some((t) => t.id === c.targetConversationId)) {
			throw new Error(`targetConversationId "${c.targetConversationId}" is not in conversations`);
		}
	}
	if (c.goal === 'mobile-connect-wifi') {
		if (!c.wifiNetworks?.length) throw new Error('mobile-connect-wifi needs wifiNetworks');
		if (c.targetSsid && !c.wifiNetworks.includes(c.targetSsid)) {
			throw new Error(`targetSsid "${c.targetSsid}" is not in wifiNetworks`);
		}
	}
	if (c.goal === 'mobile-change-font-size' && c.targetSize) {
		if (!['small', 'medium', 'large'].includes(c.targetSize)) {
			throw new Error(`targetSize must be small|medium|large (got "${c.targetSize}")`);
		}
	}
	return c as MobileSimConfig;
}
