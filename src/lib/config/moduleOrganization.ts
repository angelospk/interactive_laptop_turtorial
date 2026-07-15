/**
 * Non-destructive organization of modules and lessons.
 *
 * Pure config + helpers — no DB changes, no module/lesson ID changes, so user
 * progress, deep-links and the library bridge all keep working. The home page
 * groups module cards into categories; module pages group long lesson lists
 * into labelled sub-sections.
 */
import type { Lesson } from '$lib/db/schema';

// ── Module categories (home page) ──────────────────────────────────────────

export interface ModuleCategory {
	id: string;
	title: string;
	/** Module ids, in the order they should appear inside the category. */
	moduleIds: string[];
}

export const moduleCategories: ModuleCategory[] = [
	{ id: 'basics', title: 'Τα πρώτα βήματα', moduleIds: ['module1', 'module2'] },
	{
		id: 'windows',
		title: 'Windows υπολογιστής',
		moduleIds: ['module3', 'module4', 'module9']
	},
	{ id: 'mobile', title: 'Κινητό τηλέφωνο', moduleIds: ['android', 'iphone'] },
	{
		id: 'internet',
		title: 'Διαδίκτυο & Επικοινωνία',
		moduleIds: ['module5', 'module6', 'module11']
	},
	{ id: 'apps', title: 'Εφαρμογές & Παραγωγικότητα', moduleIds: ['word', 'module7'] },
	{ id: 'security', title: 'Ασφάλεια & Προστασία', moduleIds: ['module8', 'module10'] },
	{
		id: 'digital-life',
		title: 'Ψηφιακή ζωή & υπηρεσίες',
		moduleIds: ['module12', 'module13']
	}
];

// ── Device tags (device-aware prioritisation, ROADMAP Φάση 1) ───────────────

export type ModuleDevice = 'windows' | 'mac' | 'android' | 'iphone';

/**
 * Modules tied to a specific device family. A module NOT listed here is
 * "universal" — it applies to every device (e.g. internet safety, video calls,
 * gov services), so existing content needs zero migration.
 *
 * Semantics (CURRICULUM_PLAN §6): a tag means "the MATERIAL is useful on this
 * device" (concept level). Which environment the exercises visually simulate
 * is a separate axis — see `moduleSimulationPlatform` below. E.g. `word` is
 * useful on windows+mac (writing a document transfers), while module4's
 * File-Explorer exercises genuinely do not transfer to Mac/Finder.
 */
export const moduleDevices: Record<string, ModuleDevice[]> = {
	module1: ['windows', 'mac'], // Ποντίκι & Κλικ
	module2: ['windows', 'mac'], // Πληκτρολόγιο (Windows shortcuts: δικό τους section)
	module3: ['windows'], // Περιβάλλον Windows 11 (Windows-only)
	module4: ['windows'], // Αρχεία & Φάκελοι — ασκήσεις σε Windows File Explorer
	module9: ['windows'], // Προχωρημένες Λειτουργίες — ασκήσεις σε Windows Settings
	module7: ['windows', 'mac'], // Excel
	word: ['windows', 'mac'], // Επεξεργασία Κειμένου
	android: ['android'], // Android track (ROADMAP Φάση 2)
	iphone: ['iphone'] // iPhone track (ROADMAP Φάση 2)
};

/**
 * Which device environment a module's interactive exercises visually simulate
 * (the "chrome" of the simulator). Absent = no simulated environment (pure
 * reading/quiz modules). Kept separate from `moduleDevices` so a module can be
 * concept-applicable on Mac while its exercises still render a Windows-like UI.
 */
export const moduleSimulationPlatform: Record<string, ModuleDevice> = {
	module3: 'windows',
	module4: 'windows',
	module5: 'windows',
	module6: 'windows',
	module7: 'windows',
	module9: 'windows',
	module10: 'windows',
	module11: 'windows',
	module13: 'windows',
	word: 'windows',
	android: 'android',
	iphone: 'iphone'
};

/** Device tags for a module, or `null` when it is universal (applies to all). */
export function getModuleDevices(moduleId: string): ModuleDevice[] | null {
	return moduleDevices[moduleId] ?? null;
}

/** Simulated environment of a module's exercises, or `null` if none. */
export function getSimulationPlatform(moduleId: string): ModuleDevice | null {
	return moduleSimulationPlatform[moduleId] ?? null;
}

/** A universal module matches any device; a tagged one only its listed devices. */
export function isModuleForDevice(moduleId: string, device: ModuleDevice): boolean {
	const tags = moduleDevices[moduleId];
	return !tags || tags.includes(device);
}

/**
 * Modules explicitly tagged for the given device (universal modules excluded),
 * preserving input order. This is the focused "Για τη συσκευή σου" shortlist —
 * it is empty for devices whose dedicated content does not exist yet, which the
 * UI surfaces honestly rather than padding with universal modules.
 */
export function modulesSpecificToDevice<M extends { id: string }>(
	modules: M[],
	device: ModuleDevice
): M[] {
	return modules.filter((m) => moduleDevices[m.id]?.includes(device));
}

export interface GroupedModules<M extends { id: string }> {
	category: ModuleCategory | null;
	modules: M[];
}

/**
 * Group modules by category, preserving the category order above and the
 * module order within each category. Any module not listed in a category
 * falls into a trailing "Άλλα" bucket so nothing is ever dropped.
 */
export function groupModulesByCategory<M extends { id: string }>(
	modules: M[]
): GroupedModules<M>[] {
	const byId = new Map(modules.map((m) => [m.id, m]));
	const used = new Set<string>();
	const groups: GroupedModules<M>[] = [];

	for (const category of moduleCategories) {
		const found = category.moduleIds
			.map((id) => byId.get(id))
			.filter((m): m is M => Boolean(m));
		found.forEach((m) => used.add(m.id));
		if (found.length) groups.push({ category, modules: found });
	}

	const leftovers = modules.filter((m) => !used.has(m.id));
	if (leftovers.length) {
		groups.push({ category: { id: 'other', title: 'Άλλα', moduleIds: [] }, modules: leftovers });
	}

	return groups;
}

// ── Lesson sub-sections (module page, for long lesson lists) ────────────────

/**
 * Positional section: the first N lessons (by order) belong here. Fragile by
 * design — used for the stable reading-heavy modules whose «Θεωρία» boundary is
 * pinned to orderIndex and never grows.
 */
export interface PositionalSection {
	title: string;
	/** Number of lessons (in order) that belong to this section. */
	count: number;
}

/**
 * Id-based section: lists its lessons by immutable lesson **id** (CURRICULUM_PLAN
 * §4β decision στ). Counts are derived, so growing a track never desyncs a hand
 * -written number. `completionRole: 'base'` marks the module's core path — the
 * lessons a learner must finish to have «Ολοκληρώθηκε η βασική διαδρομή», even
 * after later waves add more lessons (decision δ, migration-free).
 */
export interface IdSection {
	id: string;
	title: string;
	/** Immutable lesson ids, in display order. */
	lessonIds: string[];
	completionRole?: 'base';
}

export type LessonSection = PositionalSection | IdSection;

/** Type guard: an id-based section (has an explicit lessonIds list). */
export function isIdSection(s: LessonSection): s is IdSection {
	return 'lessonIds' in s;
}

/**
 * Split points for modules whose lesson list is long enough to benefit from
 * labelled sub-sections. Two shapes coexist:
 *  - positional (`count`) for the stable reading modules, and
 *  - id-based (`lessonIds`) for tracks that grow across waves (mobile), where a
 *    `completionRole: 'base'` section defines the core path.
 * `buildLessonSections` tolerates drift defensively either way.
 */
export const moduleSections: Record<string, LessonSection[]> = {
	// 1 reading + 7 core skills + 3 arcade-style drills (χαμηλή διδακτική αξία —
	// μένουν διαθέσιμα ως προαιρετική εξάσκηση, δεν σβήνονται: audit A3).
	module1: [
		{ title: 'Θεωρία', count: 1 },
		{ title: 'Βασική εξάσκηση', count: 7 },
		{ title: 'Επιπλέον εξάσκηση (προαιρετική)', count: 3 }
	],
	module2: [
		{ title: 'Βασική πληκτρολόγηση', count: 9 },
		{ title: 'Συντομεύσεις Windows & ταχύτητα', count: 4 }
	],
	// Τα ΕΑΨΙ readings μπαίνουν πρώτα (orderIndex −1000) — χωρίς section label
	// ο μαθητής βλέπει «τοίχο θεωρίας» πριν από κάθε άσκηση (audit A5).
	module5: [
		{ title: 'Θεωρία', count: 4 },
		{ title: 'Εξάσκηση', count: 10 }
	],
	module8: [
		{ title: 'Θεωρία', count: 7 },
		{ title: 'Ασφαλής περιήγηση', count: 5 },
		{ title: 'Συναλλαγές & προστασία λογαριασμού', count: 6 }
	],
	module9: [
		{ title: 'Θεωρία', count: 7 },
		{ title: 'Εξάσκηση', count: 9 }
	],
	module11: [
		{ title: 'Θεωρία', count: 5 },
		{ title: 'Εξάσκηση', count: 6 }
	],
	// Mobile tracks: id-based sections (grow across waves). «Βασικά» is the base
	// path — its 7 lesson ids are the immutable original track (7/7 = «βασική
	// διαδρομή ολοκληρωμένη»). Later waves append lessons to the other sections.
	android: [
		{
			id: 'basics',
			title: 'Βασικά — πρώτα βήματα',
			completionRole: 'base',
			lessonIds: [
				'android-open-viber',
				'android-call-number',
				'android-call-contact',
				'android-send-sms',
				'android-send-viber',
				'android-font-size',
				'android-connect-wifi'
			]
		},
		{
			id: 'daily',
			title: 'Καθημερινή χρήση',
			lessonIds: [
				'android-videocall-viber',
				'android-screenshot',
				'android-force-close',
				'android-scan-qr'
			]
		},
		{
			id: 'settings-help',
			title: 'Ρυθμίσεις & βοήθεια',
			lessonIds: ['android-night-mode', 'android-find-device', 'android-update-app']
		}
	],
	iphone: [
		{
			id: 'basics',
			title: 'Βασικά — πρώτα βήματα',
			completionRole: 'base',
			lessonIds: [
				'iphone-open-facetime',
				'iphone-call-number',
				'iphone-call-contact',
				'iphone-send-sms',
				'iphone-send-viber',
				'iphone-font-size',
				'iphone-connect-wifi'
			]
		},
		{
			id: 'daily',
			title: 'Καθημερινή χρήση',
			lessonIds: [
				'iphone-videocall-viber',
				'iphone-screenshot',
				'iphone-force-close',
				'iphone-scan-qr'
			]
		},
		{
			id: 'settings-help',
			title: 'Ρυθμίσεις & βοήθεια',
			lessonIds: ['iphone-night-mode', 'iphone-find-device', 'iphone-update-app']
		}
	]
};

export interface BuiltSection {
	title: string;
	/** Lessons in this section, each carrying its original index in the full list. */
	items: { lesson: Lesson; index: number }[];
}

/**
 * Turn a flat lesson list into labelled sections for the given module.
 * Returns `null` when the module has no configured sections (caller renders a
 * plain grid).
 *
 * Positional specs slice by count; id-based specs map by lesson id. Either way
 * no lesson is ever hidden: positional overflow lands in the last section, and
 * id-based lessons absent from every section fall into a trailing «Επιπλέον
 * μαθήματα» bucket (guards against a live-DB lesson missing from compiled
 * config — codex plan review).
 */
export function buildLessonSections(
	moduleId: string,
	lessons: Lesson[]
): BuiltSection[] | null {
	const spec = moduleSections[moduleId];
	if (!spec || lessons.length === 0) return null;

	const idBased = spec.every(isIdSection);
	const sections: BuiltSection[] = idBased
		? buildIdSections(spec as IdSection[], lessons)
		: buildPositionalSections(spec as PositionalSection[], lessons);

	return sections.length ? sections : null;
}

function buildPositionalSections(spec: PositionalSection[], lessons: Lesson[]): BuiltSection[] {
	const sections: BuiltSection[] = [];
	let cursor = 0;
	spec.forEach((section, i) => {
		const isLast = i === spec.length - 1;
		const end = isLast ? lessons.length : Math.min(cursor + section.count, lessons.length);
		const items = lessons.slice(cursor, end).map((lesson, j) => ({ lesson, index: cursor + j }));
		if (items.length) sections.push({ title: section.title, items });
		cursor = end;
	});
	return sections;
}

function buildIdSections(spec: IdSection[], lessons: Lesson[]): BuiltSection[] {
	const indexById = new Map(lessons.map((l, i) => [l.id, i]));
	const placed = new Set<string>();
	const sections: BuiltSection[] = [];

	for (const section of spec) {
		const items = section.lessonIds
			.map((id) => {
				const index = indexById.get(id);
				if (index === undefined) return null;
				placed.add(id);
				return { lesson: lessons[index], index };
			})
			.filter((x): x is { lesson: Lesson; index: number } => x !== null);
		if (items.length) sections.push({ title: section.title, items });
	}

	// Any seeded/live lesson not named by a section still shows up (never hidden).
	const leftovers = lessons
		.map((lesson, index) => ({ lesson, index }))
		.filter(({ lesson }) => !placed.has(lesson.id));
	if (leftovers.length) sections.push({ title: 'Επιπλέον μαθήματα', items: leftovers });

	return sections;
}

// ── Module completion semantics (base path vs extensions, CURRICULUM_PLAN §4β δ)

/**
 * Immutable lesson ids that form a module's core «base path» (the section marked
 * `completionRole: 'base'`), or `null` when the module has no base section.
 * These are the lessons whose completion means «Ολοκληρώθηκε η βασική διαδρομή»
 * — stable even as later waves append more lessons.
 */
export function getBasePathLessonIds(moduleId: string): string[] | null {
	const spec = moduleSections[moduleId];
	if (!spec) return null;
	const base = spec.filter(isIdSection).filter((s) => s.completionRole === 'base');
	if (base.length === 0) return null;
	return base.flatMap((s) => s.lessonIds);
}

export interface ModuleCompletion {
	overallPercent: number;
	allComplete: boolean;
	/** Whether this module has a defined base path at all. */
	hasBase: boolean;
	/** Base path fully done (false when there is no base path). */
	baseComplete: boolean;
	/** Lessons beyond the base path (0 when there is no base path). */
	extensionTotal: number;
	extensionCompleted: number;
}

/**
 * Full completion summary for a module. The overall percent is the honest
 * completed/all ratio (unchanged), but `baseComplete` lets the UI show «βασική
 * διαδρομή ολοκληρωμένη» so adding lessons never demotes a finished learner to
 * «7/12, ημιτελές» (codex plan review, decision δ). Migration-free: reads only
 * the existing progress map, keyed by immutable lesson id.
 */
export function getModuleCompletion(
	moduleId: string,
	moduleLessonIds: Record<string, string[]>,
	userProgress: Record<string, { completed?: boolean } | undefined>
): ModuleCompletion {
	const lessonIds = moduleLessonIds?.[moduleId] ?? [];
	const isDone = (id: string) => Boolean(userProgress?.[id]?.completed);
	const total = lessonIds.length;
	const completed = lessonIds.filter(isDone).length;
	const overallPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

	const baseIdsAll = getBasePathLessonIds(moduleId);
	// Only base lessons that actually exist in this module count (defensive).
	const baseIds = baseIdsAll?.filter((id) => lessonIds.includes(id)) ?? [];
	const hasBase = baseIds.length > 0;
	const baseComplete = hasBase && baseIds.every(isDone);

	const baseSet = new Set(baseIds);
	const extensionIds = lessonIds.filter((id) => !baseSet.has(id));

	return {
		overallPercent,
		allComplete: total > 0 && completed === total,
		hasBase,
		baseComplete,
		extensionTotal: extensionIds.length,
		extensionCompleted: extensionIds.filter(isDone).length
	};
}
