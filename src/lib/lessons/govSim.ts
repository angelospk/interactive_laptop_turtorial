/**
 * Typed config for the `gov-simulation` lessonType (gov.gr track, issue B1).
 *
 * A deterministic, senior-friendly simulation of the gov.gr / TaxisNet flow:
 *   1. Σύνδεση με κωδικούς TaxisNet          (goal `gov-login`)
 *   2. Εύρεση της υπηρεσίας/βεβαίωσης         (goal `gov-find-service`)
 *   3. Λήψη της βεβαίωσης                     (goal `download-file`, reused)
 *   4. Χορήγηση εξουσιοδότησης σε άλλο άτομο  (goal `gov-authorize`)
 *
 * Mirrors `macSim.ts`/`mobileSim.ts`: everything the learner touches comes from
 * this config, so a seeded goal is always reachable from `startScreen`. The
 * parser is used both by the component (fail loud in dev) and by seed contract
 * tests (every seeded gov-simulation lesson must be playable).
 *
 * Note on goals: this lessonType intentionally REUSES the existing generic
 * `download-file` goal for the certificate-download step, and otherwise uses
 * `gov-*` goals. Registration of those goals lives in `goals.ts`; here we only
 * enforce structural reachability, so the parser stays self-contained (it does
 * not import the goal registry, which keeps this file testable in isolation).
 */

/** The gov.gr screen a lesson starts on — one focused task per lesson. */
export type GovScreen = 'login' | 'services' | 'certificate' | 'authorize';

/** A service tile shown on the `services` screen. */
export interface GovService {
	id: string;
	/** Greek label shown on the tile. */
	label: string;
	/** Short Greek description under the label. */
	description?: string;
	/** Emoji glyph rendered on the tile. */
	icon?: string;
}

/** The document shown on the `certificate` (download) screen. */
export interface GovCertificate {
	/** Greek title of the certificate, e.g. «Βεβαίωση οικογενειακής κατάστασης». */
	title: string;
	/** Filename that "downloads", e.g. «vevaiosi.pdf». */
	filename: string;
	/** Optional issuing authority line, e.g. «Δήμος Αθηναίων». */
	authority?: string;
}

export interface GovSimConfig {
	/** Registered goal id — `gov-*` or the reused `download-file`. */
	goal: string;
	/** Greek instruction shown above the simulation. */
	prompt: string;
	/** Which screen the lesson opens on (each lesson = one task). */
	startScreen: GovScreen;
	/** Service tiles for the `services` screen. */
	services?: GovService[];
	/** For `gov-find-service`: which tile completes the lesson. */
	targetServiceId?: string;
	/** The document for the `certificate` (download) screen. */
	certificate?: GovCertificate;
	/** Optional demo credentials shown as a gentle hint on the login screen. */
	demoUsername?: string;
	demoPassword?: string;
	/** Greek success banner (defaults to a generic «Μπράβο!»). */
	successMessage?: string;
	/** Greek hint revealed after two wrong tries. */
	hint?: string;
}

/** Goals this lessonType understands, mapped to the screen that satisfies them. */
const GOAL_SCREEN: Record<string, GovScreen> = {
	'gov-login': 'login',
	'gov-find-service': 'services',
	'download-file': 'certificate',
	'gov-authorize': 'authorize'
};

const ALLOWED_SCREENS: GovScreen[] = ['login', 'services', 'certificate', 'authorize'];

/**
 * Validate a raw lesson config and return it typed, or throw naming the exact
 * defect. Kept dependency-free (no goal-registry import) so it can be unit
 * tested in isolation before the shared `gov-*` goals are registered.
 */
export function parseGovSimConfig(raw: unknown): GovSimConfig {
	const c = raw as Partial<GovSimConfig> | null;
	if (!c || typeof c !== 'object') throw new Error('gov-simulation config must be an object');

	if (typeof c.goal !== 'string' || !(c.goal in GOAL_SCREEN)) {
		throw new Error(
			`gov-simulation config needs a supported goal (${Object.keys(GOAL_SCREEN).join('|')}) — got "${c.goal}"`
		);
	}
	if (typeof c.prompt !== 'string' || !c.prompt.trim()) {
		throw new Error('gov-simulation config needs a non-empty prompt');
	}
	if (typeof c.startScreen !== 'string' || !ALLOWED_SCREENS.includes(c.startScreen)) {
		throw new Error(
			`gov-simulation startScreen must be ${ALLOWED_SCREENS.join('|')} (got "${c.startScreen}")`
		);
	}

	// Reachability: the start screen must be the one that can satisfy the goal.
	const required = GOAL_SCREEN[c.goal];
	if (c.startScreen !== required) {
		throw new Error(
			`goal "${c.goal}" is only reachable from startScreen "${required}" (got "${c.startScreen}")`
		);
	}

	// Per-screen structural requirements.
	if (required === 'services') {
		if (!Array.isArray(c.services) || c.services.length === 0) {
			throw new Error('gov-find-service needs a non-empty services list');
		}
		const ids = new Set<string>();
		for (const s of c.services) {
			if (typeof s?.id !== 'string' || typeof s.label !== 'string' || !s.label.trim()) {
				throw new Error(
					`service entries need string id/non-empty label (got ${JSON.stringify(s)})`
				);
			}
			if (ids.has(s.id)) throw new Error(`duplicate service id "${s.id}"`);
			ids.add(s.id);
		}
		if (typeof c.targetServiceId !== 'string' || !ids.has(c.targetServiceId)) {
			throw new Error(
				`gov-find-service needs a targetServiceId present in services (got "${c.targetServiceId}")`
			);
		}
	}

	if (required === 'certificate') {
		if (
			!c.certificate ||
			typeof c.certificate.title !== 'string' ||
			typeof c.certificate.filename !== 'string' ||
			!c.certificate.title.trim() ||
			!c.certificate.filename.trim()
		) {
			throw new Error('download-file (certificate) needs a certificate with title & filename');
		}
	}

	return c as GovSimConfig;
}
