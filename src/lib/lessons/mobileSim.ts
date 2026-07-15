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
	kind?:
		| 'phone'
		| 'messages'
		| 'viber'
		| 'settings'
		| 'camera'
		| 'browser'
		| 'store'
		| 'assistant'
		| 'placeholder';
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
	/** App ids shown as cards in the "recent apps" layer (force-close lesson). */
	recentAppIds?: string[];
	/** URL encoded in the mock QR code (scan-qr lesson). */
	qrUrl?: string;
	/** Expected official domain to verify against, e.g. 'gov.gr'. */
	targetHost?: string;
	/** Toggle target for night-mode / find-device goals (default true = turn ON). */
	targetOn?: boolean;
	/** Apps listed in the store (update-app lesson). */
	storeItems?: { id: string; label: string; icon: string; hasUpdate?: boolean }[];
	/** Which store item must be updated. */
	targetUpdateId?: string;
	/** Store name shown in the header (Play Store / App Store). */
	storeName?: string;
	/** Digital-assistant intent, e.g. 'alarm' | 'reminder' (assistant lesson). */
	intent?: string;
	/** Candidate phrase chips — exactly one is `correct`. */
	phrases?: { id: string; text: string; correct?: boolean }[];
	/** Assistant greeting bubble. */
	assistantGreeting?: string;
	/** Assistant confirmation shown after the correct phrase. */
	assistantConfirm?: string;
	/** Correct verdict for the suspicious-SMS lesson (true = it IS a scam). */
	smsIsScam?: boolean;
	/** Login URL shown in the 2FA browser lesson. */
	loginUrl?: string;
	/** The one-time code "sent by SMS" in the 2FA lesson. */
	twofaCode?: string;
	/** Service name in the 2FA login header. */
	serviceName?: string;
	successMessage?: string;
	hint?: string;
}

/**
 * Per-goal reachability requirements (codex plan review: one map instead of two
 * parallel structures, so cross-app flows scale). A goal not listed here has no
 * structural app requirement (e.g. a pure system-control goal like screenshot).
 */
interface GoalRequirement {
	/** `targetAppId` must be present in `apps`. */
	requiresTargetAppId?: boolean;
	/** The target app itself must carry this functional kind. */
	targetKind?: MobileSimApp['kind'];
}

const GOAL_REQUIREMENTS: Partial<Record<string, GoalRequirement>> = {
	'mobile-open-app': { requiresTargetAppId: true },
	'mobile-dial-number': { requiresTargetAppId: true, targetKind: 'phone' },
	'mobile-call-contact': { requiresTargetAppId: true, targetKind: 'phone' },
	'mobile-send-sms': { requiresTargetAppId: true, targetKind: 'messages' },
	'mobile-send-chat': { requiresTargetAppId: true, targetKind: 'viber' },
	'mobile-change-font-size': { requiresTargetAppId: true, targetKind: 'settings' },
	'mobile-connect-wifi': { requiresTargetAppId: true, targetKind: 'settings' },
	'mobile-start-videocall': { requiresTargetAppId: true, targetKind: 'viber' },
	// force-close targets an app by id, but from the recents layer — not by its
	// on-home kind, so no targetKind.
	'mobile-force-close': { requiresTargetAppId: true },
	'mobile-scan-qr': { requiresTargetAppId: true, targetKind: 'camera' },
	'mobile-night-mode': { requiresTargetAppId: true, targetKind: 'settings' },
	'mobile-find-device': { requiresTargetAppId: true, targetKind: 'settings' },
	'mobile-update-app': { requiresTargetAppId: true, targetKind: 'store' },
	'mobile-assistant-task': { requiresTargetAppId: true, targetKind: 'assistant' },
	'mobile-spot-scam-sms': { requiresTargetAppId: true, targetKind: 'messages' },
	'mobile-enter-2fa': { requiresTargetAppId: true, targetKind: 'browser' }
	// 'mobile-screenshot' — system-control goal, no app on the home screen.
};

/**
 * Truthful per-platform hardware capabilities (codex plan review: the source of
 * truth lives centrally, NOT copied into every lesson config). Chord ids are the
 * canonical sorted `button+button` form emitted by MobileFrame.
 *
 * Screenshot: Android is Power + Volume-Down, modern iPhone (notch/Face ID) is
 * Side + Volume-Up. https://support.google.com/android/answer/9075928 ·
 * https://support.apple.com/guide/iphone/iphc872c0115
 */
export const mobilePlatformCapabilities = {
	android: { screenshotChord: 'power+volume-down' },
	ios: { screenshotChord: 'power+volume-up' }
} as const;

export type MobileVariantKey = keyof typeof mobilePlatformCapabilities;

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
	const req = GOAL_REQUIREMENTS[c.goal];
	if (req?.requiresTargetAppId) {
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

	const neededKind = req?.targetKind;
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
	if (
		c.goal === 'mobile-send-sms' ||
		c.goal === 'mobile-send-chat' ||
		c.goal === 'mobile-start-videocall' ||
		c.goal === 'mobile-spot-scam-sms'
	) {
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
	if (c.goal === 'mobile-force-close') {
		if (!c.recentAppIds?.length) throw new Error('mobile-force-close needs recentAppIds');
		for (const id of c.recentAppIds) {
			if (!ids.has(id)) throw new Error(`recentAppIds references unknown app "${id}"`);
		}
		if (c.targetAppId && !c.recentAppIds.includes(c.targetAppId)) {
			throw new Error(`mobile-force-close targetAppId "${c.targetAppId}" must be in recentAppIds`);
		}
	}
	if (c.goal === 'mobile-scan-qr') {
		if (!c.qrUrl || !c.targetHost) throw new Error('mobile-scan-qr needs qrUrl and targetHost');
		try {
			// eslint-disable-next-line no-new
			new URL(c.qrUrl);
		} catch {
			throw new Error(`mobile-scan-qr qrUrl is not a valid URL ("${c.qrUrl}")`);
		}
	}
	if (c.goal === 'mobile-update-app') {
		if (!c.storeItems?.length) throw new Error('mobile-update-app needs storeItems');
		const storeIds = new Set(c.storeItems.map((s) => s.id));
		if (!c.targetUpdateId || !storeIds.has(c.targetUpdateId)) {
			throw new Error('mobile-update-app needs a targetUpdateId present in storeItems');
		}
		const target = c.storeItems.find((s) => s.id === c.targetUpdateId);
		if (!target?.hasUpdate) {
			throw new Error(`store item "${c.targetUpdateId}" must have hasUpdate:true to be updatable`);
		}
	}
	if (c.goal === 'mobile-enter-2fa') {
		if (!c.twofaCode) throw new Error('mobile-enter-2fa needs a twofaCode');
		if (!c.loginUrl) throw new Error('mobile-enter-2fa needs a loginUrl');
	}
	if (c.goal === 'mobile-assistant-task') {
		if (!c.intent) throw new Error('mobile-assistant-task needs an intent');
		if (!c.phrases?.length) throw new Error('mobile-assistant-task needs phrases');
		const correct = c.phrases.filter((p) => p.correct);
		if (correct.length !== 1) {
			throw new Error(
				`mobile-assistant-task needs exactly one correct phrase (got ${correct.length})`
			);
		}
		const phraseIds = new Set<string>();
		for (const p of c.phrases) {
			if (!p.id || !p.text) throw new Error('phrases entries need id/text');
			if (phraseIds.has(p.id)) throw new Error(`duplicate phrase id "${p.id}"`);
			phraseIds.add(p.id);
		}
	}
	if (c.goal === 'mobile-change-font-size' && c.targetSize) {
		if (!['small', 'medium', 'large'].includes(c.targetSize)) {
			throw new Error(`targetSize must be small|medium|large (got "${c.targetSize}")`);
		}
	}
	return c as MobileSimConfig;
}
