import { isValidGoalId, type GoalId } from './goals';

/**
 * Typed config for the `mac-simulation` lessonType (CURRICULUM_PLAN §5).
 *
 * Mirrors `mobileSim.ts`: the simulation is deterministic — everything the
 * learner interacts with (Dock apps, Finder folders, Settings) comes from this
 * config, so a seeded goal is always reachable from the initial state.
 *
 * Simplification (documented on purpose): ONE window per app. The Mac state
 * model in `MacSimLesson.svelte` is therefore `runningApps` + a single
 * `windowState` per app + the frontmost `activeAppId`. The teaching goal is the
 * macOS truth that closing a window (red button) does NOT quit the app — only
 * ⌘Q / menu «Quit» does.
 */

/** Functional kind of a Mac app — drives which screen opens and which events fire. */
export type MacSimAppKind = 'finder' | 'settings' | 'browser' | 'notes' | 'placeholder';

export interface MacSimApp {
	id: string;
	label: string;
	/** Emoji rendered inside the Dock icon tile. */
	icon: string;
	kind?: MacSimAppKind;
	/**
	 * Finder is special on macOS: it is always running and cannot be quit. Marked
	 * here so the state model can start it running and reject it as a quit target.
	 */
	alwaysRunning?: boolean;
}

export interface MacSimFolder {
	id: string;
	name: string;
	/** Emoji/glyph shown next to the folder in Finder. */
	icon?: string;
}

export interface MacSimConfig {
	goal: GoalId;
	prompt: string;
	apps: MacSimApp[];
	/** Apps pinned to the Dock, in order. Must reference `apps` ids. */
	dockAppIds: string[];
	/** Apps already running (window closed) at the start — e.g. Finder. */
	initialRunningAppIds?: string[];
	targetAppId?: string;
	/** Finder folders (mac-finder-open-folder). */
	folders?: MacSimFolder[];
	targetFolderId?: string;
	/** Seed text shown in the Spotlight field to guide the learner (not matched). */
	spotlightQuery?: string;
	/** Which accessibility setting the size lesson targets (default 'text'). */
	targetSetting?: 'text' | 'pointer';
	/** 'small' | 'medium' | 'large' for the increase-size goal. */
	targetSize?: string;
	successMessage?: string;
	hint?: string;
}

/**
 * Per-goal reachability requirements (same idea as mobileSim's GOAL_REQUIREMENTS,
 * codex plan review). A goal not listed here has no structural app requirement.
 */
interface MacGoalRequirement {
	/** `targetAppId` must be present in `apps`. */
	requiresTargetAppId?: boolean;
	/** The target app must carry this functional kind. */
	targetKind?: MacSimAppKind;
	/** The target app must be pinned to the Dock (dock-launch lessons). */
	targetInDock?: boolean;
}

const MAC_GOAL_REQUIREMENTS: Partial<Record<string, MacGoalRequirement>> = {
	'mac-open-from-dock': { requiresTargetAppId: true, targetInDock: true },
	// close/quit target any Dock app by id — no functional-kind constraint.
	'mac-close-window': { requiresTargetAppId: true },
	'mac-quit-app': { requiresTargetAppId: true },
	'mac-finder-open-folder': { requiresTargetAppId: true, targetKind: 'finder' },
	// Spotlight launches an app that need NOT be in the Dock (that is the point).
	'mac-spotlight-search': { requiresTargetAppId: true },
	'mac-increase-size': { requiresTargetAppId: true, targetKind: 'settings' }
};

const SUPPORTED_SIZES = ['small', 'medium', 'large'];
const ALLOWED_KINDS: MacSimAppKind[] = ['finder', 'settings', 'browser', 'notes', 'placeholder'];
const ALLOWED_SETTINGS = ['text', 'pointer'];

/**
 * Validates a raw lesson config and returns it typed, or throws naming the exact
 * defect. Used by the component (fail loud in dev) and by seed contract tests
 * (every seeded mac-simulation lesson must be playable).
 */
export function parseMacSimConfig(raw: unknown): MacSimConfig {
	const c = raw as Partial<MacSimConfig> | null;
	if (!c || typeof c !== 'object') throw new Error('mac-simulation config must be an object');

	if (typeof c.goal !== 'string' || !isValidGoalId(c.goal) || !c.goal.startsWith('mac-')) {
		throw new Error(`mac-simulation config needs a registered mac-* goal (got "${c.goal}")`);
	}
	if (typeof c.prompt !== 'string' || !c.prompt.trim()) {
		throw new Error('mac-simulation config needs a non-empty prompt');
	}
	if (!Array.isArray(c.apps) || c.apps.length === 0) {
		throw new Error('mac-simulation config needs a non-empty apps list');
	}

	const ids = new Set<string>();
	for (const app of c.apps) {
		if (
			typeof app?.id !== 'string' ||
			typeof app.label !== 'string' ||
			typeof app.icon !== 'string'
		) {
			throw new Error(
				`mac-simulation app entries need string id/label/icon (got ${JSON.stringify(app)})`
			);
		}
		if (app.kind !== undefined && !ALLOWED_KINDS.includes(app.kind)) {
			throw new Error(`mac-simulation app "${app.id}" has invalid kind "${app.kind}"`);
		}
		if (ids.has(app.id)) throw new Error(`duplicate mac-simulation app id "${app.id}"`);
		ids.add(app.id);
	}

	if (!Array.isArray(c.dockAppIds) || c.dockAppIds.length === 0) {
		throw new Error('mac-simulation config needs a non-empty dockAppIds list');
	}
	for (const dockId of c.dockAppIds) {
		if (!ids.has(dockId)) throw new Error(`dockAppIds references unknown app "${dockId}"`);
	}
	if (c.initialRunningAppIds !== undefined && !Array.isArray(c.initialRunningAppIds)) {
		throw new Error('initialRunningAppIds must be an array');
	}
	for (const runId of c.initialRunningAppIds ?? []) {
		if (!ids.has(runId)) throw new Error(`initialRunningAppIds references unknown app "${runId}"`);
	}

	// Functional kinds must be unique: semantic events don't carry a kind, so two
	// apps of the same kind would make goal completion ambiguous (mobile parity).
	const kindCounts = new Map<string, number>();
	for (const app of c.apps) {
		if (app.kind && app.kind !== 'placeholder') {
			kindCounts.set(app.kind, (kindCounts.get(app.kind) ?? 0) + 1);
		}
	}
	for (const [kind, count] of kindCounts) {
		if (count > 1) throw new Error(`multiple apps with kind "${kind}" — events would be ambiguous`);
	}

	const req = MAC_GOAL_REQUIREMENTS[c.goal];
	if (req?.requiresTargetAppId) {
		if (!c.targetAppId || !ids.has(c.targetAppId)) {
			throw new Error(`goal "${c.goal}" needs a targetAppId present in apps`);
		}
	}
	const target = c.apps.find((a) => a.id === c.targetAppId);
	if (req?.targetKind && target?.kind !== req.targetKind) {
		throw new Error(
			`goal "${c.goal}" needs targetAppId to be an app with kind "${req.targetKind}" (got "${target?.kind}")`
		);
	}
	if (req?.targetInDock && c.targetAppId && !c.dockAppIds.includes(c.targetAppId)) {
		throw new Error(`goal "${c.goal}" needs targetAppId "${c.targetAppId}" to be in the Dock`);
	}

	// Finder cannot be quit on macOS — reject it as a quit target so the lesson is
	// truthful (codex plan review).
	if (c.goal === 'mac-quit-app' && target?.alwaysRunning) {
		throw new Error(`goal "mac-quit-app" cannot target an always-running app ("${c.targetAppId}")`);
	}

	if (c.goal === 'mac-finder-open-folder') {
		if (!Array.isArray(c.folders) || c.folders.length === 0) {
			throw new Error('mac-finder-open-folder needs a folders list');
		}
		const folderIds = new Set<string>();
		for (const f of c.folders) {
			if (typeof f?.id !== 'string' || typeof f.name !== 'string')
				throw new Error(`folders entries need string id/name (got ${JSON.stringify(f)})`);
			if (folderIds.has(f.id)) throw new Error(`duplicate folder id "${f.id}"`);
			folderIds.add(f.id);
		}
		if (c.targetFolderId && !folderIds.has(c.targetFolderId)) {
			throw new Error(`targetFolderId "${c.targetFolderId}" is not in folders`);
		}
	}

	if (c.targetSetting !== undefined && !ALLOWED_SETTINGS.includes(c.targetSetting)) {
		throw new Error(
			`targetSetting must be ${ALLOWED_SETTINGS.join('|')} (got "${c.targetSetting}")`
		);
	}

	if (c.goal === 'mac-increase-size') {
		if (!c.targetSize) throw new Error('mac-increase-size needs a targetSize');
		if (!SUPPORTED_SIZES.includes(c.targetSize)) {
			throw new Error(`targetSize must be ${SUPPORTED_SIZES.join('|')} (got "${c.targetSize}")`);
		}
	}

	return c as MacSimConfig;
}
