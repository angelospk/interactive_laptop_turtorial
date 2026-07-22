import type { NewLesson } from '../schema';

/**
 * gov.gr track (issue B1) — «Δημόσιες υπηρεσίες online».
 *
 * A realistic-but-not-photoreal gov.gr / TaxisNet flow for the ΚΑΠΗ / senior
 * audience, using the `gov-simulation` lessonType (renderer GovLesson.svelte,
 * screen component GovGrApp.svelte, config parser govSim.ts).
 *
 * Five chained lessons, one focused task each:
 *   1. Σύνδεση με κωδικούς TaxisNet          → goal `gov-login`
 *   2. Εύρεση υπηρεσίας (βεβαίωση)           → goal `gov-find-service`
 *   3. Λήψη της βεβαίωσης                    → goal `download-file` (reused)
 *   4. Εύρεση δεύτερης υπηρεσίας (εξάσκηση)  → goal `gov-find-service`
 *   5. Χορήγηση εξουσιοδότησης               → goal `gov-authorize`
 *
 * IDs/keys are immutable and namespaced `gov-*`. Prompts/hints are Greek-only,
 * inline (per parallel-agent protocol). Only titles/descriptions use i18n keys.
 */

// Shared service catalogue for the "find the service" screens. Reused across
// lessons 2 & 4 with different targets so the skill is practised twice.
const govServices = [
	{
		id: 'family-cert',
		label: 'Βεβαίωση οικογενειακής κατάστασης',
		description: 'Επίσημο έγγραφο για την οικογένειά σας',
		icon: '👨‍👩‍👧'
	},
	{
		id: 'birth-cert',
		label: 'Πιστοποιητικό γέννησης',
		description: 'Στοιχεία γέννησης από το ληξιαρχείο',
		icon: '👶'
	},
	{
		id: 'tax-clearance',
		label: 'Φορολογική ενημερότητα',
		description: 'Βεβαίωση ότι δεν έχετε οφειλές',
		icon: '💶'
	},
	{
		id: 'residence-cert',
		label: 'Βεβαίωση μόνιμης κατοικίας',
		description: 'Επιβεβαίωση της διεύθυνσής σας',
		icon: '🏠'
	}
];

export const govLessons: NewLesson[] = [
	// Lesson 1 — TaxisNet login
	{
		id: 'gov-login',
		moduleId: 'gov',
		lessonKey: 'gov-login',
		titleKey: 'gov_lesson1_title',
		descriptionKey: 'gov_lesson1_desc',
		difficulty: 'beginner',
		orderIndex: 1,
		lessonType: 'gov-simulation',
		config: {
			goal: 'gov-login',
			startScreen: 'login',
			prompt: 'Συνδεθείτε στο gov.gr με τους κωδικούς TaxisNet σας.',
			demoUsername: 'kaph2024',
			demoPassword: '123456',
			successMessage: 'Μπράβο! Συνδεθήκατε με ασφάλεια στο gov.gr.',
			hint: 'Γράψτε το Όνομα χρήστη στο πρώτο πλαίσιο, τον Κωδικό στο δεύτερο και πατήστε το μπλε κουμπί «Σύνδεση».'
		},
		enabled: true,
		requiredLessonId: null
	},

	// Lesson 2 — find the family-status certificate service
	{
		id: 'gov-find-family-cert',
		moduleId: 'gov',
		lessonKey: 'gov-find-family-cert',
		titleKey: 'gov_lesson2_title',
		descriptionKey: 'gov_lesson2_desc',
		difficulty: 'beginner',
		orderIndex: 2,
		lessonType: 'gov-simulation',
		config: {
			goal: 'gov-find-service',
			startScreen: 'services',
			prompt: 'Βρείτε και ανοίξτε την υπηρεσία «Βεβαίωση οικογενειακής κατάστασης».',
			services: govServices,
			targetServiceId: 'family-cert',
			successMessage: 'Τέλεια! Βρήκατε τη σωστή υπηρεσία.',
			hint: 'Διαβάστε τον τίτλο σε κάθε πλαίσιο. Ψάχνουμε αυτόν που λέει «οικογενειακής κατάστασης».'
		},
		enabled: true,
		requiredLessonId: 'gov-login'
	},

	// Lesson 3 — download the certificate
	{
		id: 'gov-download-cert',
		moduleId: 'gov',
		lessonKey: 'gov-download-cert',
		titleKey: 'gov_lesson3_title',
		descriptionKey: 'gov_lesson3_desc',
		difficulty: 'beginner',
		orderIndex: 3,
		lessonType: 'gov-simulation',
		config: {
			goal: 'download-file',
			startScreen: 'certificate',
			prompt: 'Κατεβάστε (κάντε λήψη) τη βεβαίωσή σας στον υπολογιστή.',
			certificate: {
				title: 'Βεβαίωση οικογενειακής κατάστασης',
				authority: 'Δήμος Αθηναίων',
				filename: 'vevaiosi-oikogeneiakis.pdf'
			},
			successMessage: 'Μπράβο! Η βεβαίωση αποθηκεύτηκε στον υπολογιστή σας.',
			hint: 'Πατήστε το μεγάλο μπλε κουμπί «Λήψη εγγράφου» για να κατεβάσετε το αρχείο.'
		},
		enabled: true,
		requiredLessonId: 'gov-find-family-cert'
	},

	// Lesson 4 — find a different service (reinforcement)
	{
		id: 'gov-find-birth-cert',
		moduleId: 'gov',
		lessonKey: 'gov-find-birth-cert',
		titleKey: 'gov_lesson4_title',
		descriptionKey: 'gov_lesson4_desc',
		difficulty: 'intermediate',
		orderIndex: 4,
		lessonType: 'gov-simulation',
		config: {
			goal: 'gov-find-service',
			startScreen: 'services',
			prompt: 'Αυτή τη φορά βρείτε την υπηρεσία «Πιστοποιητικό γέννησης».',
			services: govServices,
			targetServiceId: 'birth-cert',
			successMessage: 'Εξαιρετικά! Μαθαίνετε να βρίσκετε μόνοι σας τις υπηρεσίες.',
			hint: 'Ψάχνουμε το πλαίσιο με το μωρό 👶 και τον τίτλο «Πιστοποιητικό γέννησης».'
		},
		enabled: true,
		requiredLessonId: 'gov-download-cert'
	},

	// Lesson 5 — grant an authorization to a trusted person
	{
		id: 'gov-authorize',
		moduleId: 'gov',
		lessonKey: 'gov-authorize',
		titleKey: 'gov_lesson5_title',
		descriptionKey: 'gov_lesson5_desc',
		difficulty: 'intermediate',
		orderIndex: 5,
		lessonType: 'gov-simulation',
		config: {
			goal: 'gov-authorize',
			startScreen: 'authorize',
			prompt: 'Δώστε εξουσιοδότηση σε ένα άτομο εμπιστοσύνης να κάνει μια υπόθεση για εσάς.',
			successMessage: 'Μπράβο! Χορηγήσατε την εξουσιοδότηση με επιτυχία.',
			hint: 'Γράψτε το Ονοματεπώνυμο και το ΑΦΜ του ατόμου και πατήστε «Χορήγηση εξουσιοδότησης».'
		},
		enabled: true,
		requiredLessonId: 'gov-find-birth-cert'
	}
];
