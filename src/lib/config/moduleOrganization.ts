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
	{ id: 'basics', title: 'Τα πρώτα βήματα', moduleIds: ['module1', 'module2', 'module3', 'module4'] },
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
		moduleIds: ['module9', 'module12', 'module13']
	}
];

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

export interface LessonSection {
	title: string;
	/** Number of lessons (in order) that belong to this section. */
	count: number;
}

/**
 * Split points for modules whose lesson list is long enough to benefit from
 * labelled sub-sections. Counts are positional (first N, next N…) so they don't
 * depend on fragile lessonKeys. Sum should equal the module's lesson count, but
 * `buildLessonSections` tolerates drift defensively.
 */
export const moduleSections: Record<string, LessonSection[]> = {
	module2: [
		{ title: 'Βασική πληκτρολόγηση', count: 9 },
		{ title: 'Προχωρημένα & ταχύτητα', count: 4 }
	],
	module8: [
		{ title: 'Ασφαλής περιήγηση', count: 5 },
		{ title: 'Συναλλαγές & προστασία λογαριασμού', count: 6 }
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
 * plain grid). Any lessons beyond the configured counts are appended to the
 * last section so none are ever hidden.
 */
export function buildLessonSections(
	moduleId: string,
	lessons: Lesson[]
): BuiltSection[] | null {
	const spec = moduleSections[moduleId];
	if (!spec || lessons.length === 0) return null;

	const sections: BuiltSection[] = [];
	let cursor = 0;
	spec.forEach((section, i) => {
		const isLast = i === spec.length - 1;
		const end = isLast ? lessons.length : Math.min(cursor + section.count, lessons.length);
		const items = lessons.slice(cursor, end).map((lesson, j) => ({ lesson, index: cursor + j }));
		if (items.length) sections.push({ title: section.title, items });
		cursor = end;
	});

	return sections.length ? sections : null;
}
