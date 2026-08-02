import type { NewLesson } from '../schema';
// Relative import (όχι $lib): τα seeds τρέχουν και από bun scripts (upsert)
// εκτός Vite, όπου το alias δεν είναι εγγυημένο.
import { parseMacSimConfig, type MacSimApp, type MacSimFolder } from '../../lessons/macSim';

/**
 * Mac track (CURRICULUM_PLAN §5). Teaches only what genuinely differs from
 * Windows: Dock vs taskbar, Finder vs File Explorer, the menu bar, Spotlight,
 * and — the headline — that closing a window (red button) does NOT quit the app.
 *
 * IDs and i18n keys are IMMUTABLE once shipped (data policy §6). Lessons are a
 * vertical slice: each seeds together with the flow that makes it playable.
 */

const MODULE_ID = 'mac';

/** Shared desktop: one app per functional kind, plus inert placeholders. */
const APPS: MacSimApp[] = [
	{ id: 'finder', label: 'Finder', icon: '🗂️', kind: 'finder', alwaysRunning: true },
	{ id: 'safari', label: 'Safari', icon: '🧭', kind: 'browser' },
	{ id: 'mail', label: 'Mail', icon: '✉️', kind: 'placeholder' },
	{ id: 'notes', label: 'Σημειώσεις', icon: '📝', kind: 'notes' },
	{ id: 'settings', label: 'Ρυθμίσεις', icon: '⚙️', kind: 'settings' },
	// Not on the Dock — reachable only through Spotlight (lesson 6).
	{ id: 'calculator', label: 'Αριθμομηχανή', icon: '🧮', kind: 'placeholder' }
];

const DOCK = ['finder', 'safari', 'mail', 'notes', 'settings'];

const FOLDERS: MacSimFolder[] = [
	{ id: 'documents', name: 'Έγγραφα', icon: '📄' },
	{ id: 'downloads', name: 'Λήψεις', icon: '⬇️' },
	{ id: 'pictures', name: 'Εικόνες', icon: '🖼️' }
];

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface SimDef {
	n: number;
	lessonKey: string;
	difficulty?: Difficulty;
	config: Record<string, unknown>;
}

const SIM_DEFS: SimDef[] = [
	{
		n: 2,
		lessonKey: 'open-dock',
		config: {
			goal: 'mac-open-from-dock',
			prompt: 'Άνοιξε το Safari από το Dock (τη γραμμή εικονιδίων κάτω).',
			targetAppId: 'safari',
			successMessage: 'Μπράβο! Άνοιξες το Safari από το Dock.',
			hint: 'Το Dock είναι η σειρά εικονιδίων στο κάτω μέρος. Πάτησε το εικονίδιο της πυξίδας 🧭.'
		}
	},
	{
		n: 3,
		lessonKey: 'close-window',
		config: {
			goal: 'mac-close-window',
			prompt:
				'Οι «Σημειώσεις» είναι ανοιχτές. Κλείσε το παράθυρο με το κόκκινο κουμπί (πάνω αριστερά).',
			targetAppId: 'notes',
			initialRunningAppIds: ['notes'],
			successMessage: 'Μπράβο! Έκλεισες το παράθυρο με το κόκκινο κουμπί.',
			hint: 'Πάνω αριστερά υπάρχουν τρία στρογγυλά κουμπιά: κόκκινο = κλείσιμο, κίτρινο = ελαχιστοποίηση, πράσινο = μεγέθυνση.'
		}
	},
	{
		n: 4,
		lessonKey: 'quit',
		difficulty: 'intermediate',
		config: {
			goal: 'mac-quit-app',
			prompt:
				'Τερμάτισε εντελώς τις «Σημειώσεις». Προσοχή: το κόκκινο κουμπί κλείνει μόνο το παράθυρο και το πρόγραμμα μένει ανοιχτό!',
			targetAppId: 'notes',
			initialRunningAppIds: ['notes'],
			successMessage: 'Μπράβο! Τερμάτισες σωστά το πρόγραμμα: η τελίτσα στο Dock χάθηκε.',
			hint: 'Άνοιξε το μενού με το όνομα «Σημειώσεις» (πάνω γραμμή) και πάτησε «Τερματισμός». (Ή πάτα ⌘Q.)'
		}
	},
	{
		n: 5,
		lessonKey: 'finder',
		difficulty: 'intermediate',
		config: {
			goal: 'mac-finder-open-folder',
			prompt: 'Άνοιξε το Finder και μπες στον φάκελο «Έγγραφα».',
			targetAppId: 'finder',
			folders: FOLDERS,
			targetFolderId: 'documents',
			successMessage: 'Μπράβο! Βρήκες τα «Έγγραφα» μέσα στο Finder.',
			hint: 'Το Finder είναι το πρόσωπο 🗂️ στο Dock. Στα αριστερά, στα «Αγαπημένα», πάτησε «Έγγραφα».'
		}
	},
	{
		n: 6,
		lessonKey: 'spotlight',
		difficulty: 'intermediate',
		config: {
			goal: 'mac-spotlight-search',
			prompt: 'Βρες την «Αριθμομηχανή» με το Spotlight (δεν είναι στο Dock) και άνοιξέ την.',
			targetAppId: 'calculator',
			spotlightQuery: 'Αριθμ',
			successMessage: 'Μπράβο! Χρησιμοποίησες το Spotlight για να βρεις ένα πρόγραμμα.',
			hint: 'Πάτησε τον μεγεθυντικό φακό 🔍 πάνω δεξιά, γράψε «Αριθμ» και διάλεξε την Αριθμομηχανή.'
		}
	},
	{
		n: 7,
		lessonKey: 'text-size',
		difficulty: 'intermediate',
		config: {
			goal: 'mac-increase-size',
			prompt: 'Μεγάλωσε τα γράμματα από τις Ρυθμίσεις για να διαβάζεις πιο άνετα.',
			targetAppId: 'settings',
			targetSize: 'large',
			successMessage: 'Μπράβο! Τώρα τα γράμματα φαίνονται μεγαλύτερα.',
			hint: 'Άνοιξε τις «Ρυθμίσεις» από το Dock και διάλεξε «Μεγάλα».'
		}
	}
];

function simLesson(def: SimDef, prevLessonId: string): NewLesson {
	const config = parseMacSimConfig({
		...def.config,
		apps: APPS,
		dockAppIds: DOCK
	});
	return {
		id: `${MODULE_ID}-${def.lessonKey}`,
		moduleId: MODULE_ID,
		lessonKey: def.lessonKey,
		titleKey: `${MODULE_ID}_lesson${def.n}_title`,
		descriptionKey: `${MODULE_ID}_lesson${def.n}_desc`,
		difficulty: def.difficulty ?? 'beginner',
		orderIndex: def.n,
		lessonType: 'mac-simulation',
		config,
		enabled: true,
		requiredLessonId: prevLessonId
	};
}

export const macLessons: NewLesson[] = [
	// 1 — reading intro (τι αλλάζει από τα Windows). Body served as static markdown.
	{
		id: 'mac-intro',
		moduleId: MODULE_ID,
		lessonKey: 'intro',
		titleKey: 'mac_lesson1_title',
		descriptionKey: 'mac_lesson1_desc',
		difficulty: 'beginner',
		orderIndex: 1,
		lessonType: 'reading',
		config: { mdPath: 'md/mac/intro.md' },
		enabled: true,
		requiredLessonId: null
	},
	// 2..7 — goal-driven mac-simulation lessons, chained.
	...SIM_DEFS.map((def, i) =>
		simLesson(def, i === 0 ? 'mac-intro' : `${MODULE_ID}-${SIM_DEFS[i - 1].lessonKey}`)
	),
	// 8 — Cmd copy/paste (reuses keyboard-action; Mac modifier label).
	{
		id: 'mac-copy-paste',
		moduleId: MODULE_ID,
		lessonKey: 'copy-paste',
		titleKey: 'mac_lesson8_title',
		descriptionKey: 'mac_lesson8_desc',
		difficulty: 'intermediate',
		orderIndex: 8,
		lessonType: 'keyboard-action',
		config: {
			action: 'copy-paste',
			sampleText: 'Καλημέρα από το Mac!',
			modifierLabel: 'Cmd (⌘)'
		},
		enabled: true,
		requiredLessonId: `${MODULE_ID}-text-size`
	},
	// 9 — pointer (cursor) size, same goal as 7 but targetSetting:'pointer'.
	simLesson(
		{
			n: 9,
			lessonKey: 'pointer-size',
			difficulty: 'intermediate',
			config: {
				goal: 'mac-increase-size',
				prompt: 'Μεγάλωσε τον δείκτη (το βελάκι) του ποντικιού από τις Ρυθμίσεις.',
				targetAppId: 'settings',
				targetSetting: 'pointer',
				targetSize: 'large',
				successMessage: 'Μπράβο! Τώρα ο δείκτης του ποντικιού φαίνεται μεγαλύτερος.',
				hint: 'Άνοιξε τις «Ρυθμίσεις» από το Dock και στο «Μέγεθος δείκτη (ποντικιού)» διάλεξε «Μεγάλος».'
			}
		},
		`${MODULE_ID}-copy-paste`
	)
];
