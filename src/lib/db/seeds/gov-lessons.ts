import type { NewLesson } from '../schema';

/**
 * gov.gr track (issue B1) — «Δημόσιες υπηρεσίες online».
 *
 * A realistic-but-not-photoreal gov.gr / TaxisNet flow for the ΚΑΠΗ / senior
 * audience, using the `gov-simulation` lessonType (renderer GovLesson.svelte,
 * screen component GovGrApp.svelte, config parser govSim.ts).
 *
 * Eight chained lessons, one focused task each:
 *   1. Σύνδεση με κωδικούς TaxisNet          → goal `gov-login`
 *   2. Εύρεση υπηρεσίας (βεβαίωση)           → goal `gov-find-service`
 *   3. Λήψη της βεβαίωσης                    → goal `download-file` (reused)
 *   4. Εύρεση δεύτερης υπηρεσίας (εξάσκηση)  → goal `gov-find-service`
 *   5. Χορήγηση εξουσιοδότησης               → goal `gov-authorize`
 *   6–8. Κάρτα ανεργίας & Θυρίδα πολίτη (θεωρία esm002-c3-s3) → `gov-find-service` / `download-file`
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

// Everyday services from the public-services theory (esm002-c3-s3), with
// look-alike decoys so the learner has to read the tile, not guess.
const everydayServices = [
	{
		id: 'unemployment-card',
		label: 'Κάρτα ανεργίας',
		description: 'ΔΥΠΑ — βεβαίωση εγγραφής στο μητρώο ανέργων',
		icon: '🪪'
	},
	{
		id: 'citizen-mailbox',
		label: 'Θυρίδα πολίτη',
		description: 'Τα έγγραφα που σας στέλνει το Δημόσιο',
		icon: '📬'
	},
	{
		id: 'social-tariff',
		label: 'Κοινωνικό οικιακό τιμολόγιο',
		description: 'Έκπτωση στο ρεύμα για ευάλωτα νοικοκυριά',
		icon: '💡'
	},
	{
		id: 'pension-info',
		label: 'Ενημέρωση σύνταξης',
		description: 'e-ΕΦΚΑ — πληρωμές και κρατήσεις σύνταξης',
		icon: '👴'
	},
	{
		id: 'job-search',
		label: 'Αγγελίες εργασίας',
		description: 'ΔΥΠΑ — θέσεις εργασίας στην περιοχή σας',
		icon: '💼'
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
	},

	// Lessons 6–8 mirror the public-services theory (esm002-c3-s3): the
	// unemployment card and the citizen mailbox, among look-alike services.
	{
		id: 'gov-find-unemployment-card',
		moduleId: 'gov',
		lessonKey: 'gov-find-unemployment-card',
		titleKey: 'gov_lesson6_title',
		descriptionKey: 'gov_lesson6_desc',
		difficulty: 'intermediate',
		orderIndex: 6,
		lessonType: 'gov-simulation',
		config: {
			goal: 'gov-find-service',
			startScreen: 'services',
			prompt:
				'Ο γιος σας έμεινε χωρίς δουλειά και του ζήτησαν την κάρτα ανεργίας. Βρείτε την υπηρεσία της ΔΥΠΑ που την εκδίδει.',
			services: everydayServices,
			targetServiceId: 'unemployment-card',
			successMessage: 'Σωστά! Η κάρτα ανεργίας βγαίνει από τη ΔΥΠΑ, μέσα από το gov.gr.',
			hint: 'Ψάχνουμε το πλαίσιο που γράφει «Κάρτα ανεργίας» και από κάτω «ΔΥΠΑ».'
		},
		enabled: true,
		requiredLessonId: 'gov-authorize'
	},
	{
		id: 'gov-download-unemployment-card',
		moduleId: 'gov',
		lessonKey: 'gov-download-unemployment-card',
		titleKey: 'gov_lesson7_title',
		descriptionKey: 'gov_lesson7_desc',
		difficulty: 'intermediate',
		orderIndex: 7,
		lessonType: 'gov-simulation',
		config: {
			goal: 'download-file',
			startScreen: 'certificate',
			prompt: 'Η κάρτα ανεργίας είναι έτοιμη. Κατεβάστε τη στον υπολογιστή για να τη στείλετε.',
			certificate: {
				title: 'Βεβαίωση εγγραφής στο μητρώο ανέργων (κάρτα ανεργίας)',
				authority: 'ΔΥΠΑ',
				filename: 'karta-anergias.pdf'
			},
			successMessage: 'Μπράβο! Η κάρτα αποθηκεύτηκε ως PDF στις Λήψεις.',
			hint: 'Πατήστε το μεγάλο μπλε κουμπί «Λήψη εγγράφου».'
		},
		enabled: true,
		requiredLessonId: 'gov-find-unemployment-card'
	},
	{
		id: 'gov-find-citizen-mailbox',
		moduleId: 'gov',
		lessonKey: 'gov-find-citizen-mailbox',
		titleKey: 'gov_lesson8_title',
		descriptionKey: 'gov_lesson8_desc',
		difficulty: 'intermediate',
		orderIndex: 8,
		lessonType: 'gov-simulation',
		config: {
			goal: 'gov-find-service',
			startScreen: 'services',
			prompt:
				'Σας ήρθε SMS ότι έχετε νέο έγγραφο από το Δημόσιο. Ανοίξτε τη θυρίδα όπου φτάνουν τα έγγραφα του πολίτη.',
			services: everydayServices,
			targetServiceId: 'citizen-mailbox',
			successMessage:
				'Ακριβώς! Στη Θυρίδα πολίτη βλέπετε τα έγγραφα του Δημοσίου. Μπαίνετε πάντα από το gov.gr, όχι από σύνδεσμο σε SMS.',
			hint: 'Ψάχνουμε το πλαίσιο με τον φάκελο 📬 και τον τίτλο «Θυρίδα πολίτη».'
		},
		enabled: true,
		requiredLessonId: 'gov-download-unemployment-card'
	}
];
