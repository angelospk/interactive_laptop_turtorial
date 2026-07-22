import type { NewLesson } from '../schema';

/**
 * Bank track (issue B3) — a short, senior-friendly e-banking course.
 *
 * Uses a FICTIONAL bank (address «mybank.gr», generic «η τράπεζά σας») — never a
 * real institution. All lessons REUSE the existing browser bank flow in
 * `BrowserApp.svelte` (the `desktop-simulation` lessonType) and the existing
 * goals — no new component, goal, or lessonType is introduced:
 *
 *   • navigate-site  → open the bank page and see the 🔒 padlock (https)
 *   • secure-login   → log in only when the password is STRONG (8+ chars,
 *                      digit + symbol) — the same rule BrowserApp enforces
 *   • make-transfer  → send money to a saved payee
 *
 * The two quiz lessons carry their Greek text inline: QuizLesson's `t()` returns
 * the string unchanged when it is not an i18n key, so bank prompts/answers stay
 * Greek-only and never touch the shared message catalogue. Only module + lesson
 * TITLES/DESCRIPTIONS are i18n keys (el + en), per the track's i18n contract.
 *
 * Ids are immutable and additive, namespaced `bank-*`. The chain is linear
 * (each lesson requires the previous one) so a learner walks it end to end.
 */
export const bankLessons: NewLesson[] = [
	// 1. Concept: how do I know a bank page is safe? (padlock + https)
	{
		id: 'bank-padlock-quiz',
		moduleId: 'bank',
		lessonKey: 'bank-padlock-quiz',
		titleKey: 'bank_lesson1_title',
		descriptionKey: 'bank_lesson1_desc',
		difficulty: 'beginner',
		orderIndex: 1,
		lessonType: 'quiz',
		config: {
			question: 'Πώς καταλαβαίνετε ότι η σύνδεση με την τράπεζα είναι κρυπτογραφημένη;',
			explanation:
				'Σωστά! Το λουκετάκι 🔒 και το «https://» δείχνουν ότι η σύνδεση είναι κρυπτογραφημένη. ΠΡΟΣΟΧΗ όμως: μόνο το λουκετάκι ΔΕΝ σημαίνει ότι η σελίδα είναι αυθεντική — κι οι απατεώνες το έχουν. Ελέγχετε ΠΑΝΤΑ και ότι η διεύθυνση είναι η σωστή (π.χ. mybank.gr).',
			options: [
				{ id: 'a', text: 'Όταν η σελίδα έχει πολλά χρώματα και ωραίες εικόνες', correct: false },
				{
					id: 'b',
					text: 'Όταν εμφανίζεται το λουκετάκι 🔒 και η διεύθυνση ξεκινά με «https://»',
					correct: true
				},
				{ id: 'c', text: 'Όταν μου ζητάει γρήγορα τον κωδικό μου', correct: false }
			]
		},
		enabled: true,
		requiredLessonId: null
	},

	// 2. Practice: navigate to the bank and verify the padlock is green/locked.
	// targetUrl contains «bank», so BrowserApp classifies it as the secure
	// banking page and shows the 🔒 lock icon in the address bar.
	{
		id: 'bank-open-secure',
		moduleId: 'bank',
		lessonKey: 'bank-open-secure',
		titleKey: 'bank_lesson2_title',
		descriptionKey: 'bank_lesson2_desc',
		difficulty: 'beginner',
		orderIndex: 2,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'navigate-site',
			targetUrl: 'mybank.gr',
			initialApps: ['browser'],
			instructions:
				'1. Πληκτρολογήστε «mybank.gr» στη γραμμή διεύθυνσης (πάνω μέρος).\n2. Πατήστε Enter.\n3. Κοιτάξτε αριστερά από τη διεύθυνση: πρέπει να δείτε το πράσινο λουκετάκι 🔒.\n\n💡 Το λουκετάκι σημαίνει κρυπτογραφημένη σύνδεση — αλλά ελέγξτε και ότι η διεύθυνση είναι η σωστή (mybank.gr). Μόνο το λουκετάκι δεν αρκεί.'
		},
		enabled: true,
		requiredLessonId: 'bank-padlock-quiz'
	},

	// 3. Practice: log in — completes ONLY with a strong password (BrowserApp
	// emits bank-login with strength 'strong' for 8+ chars incl. digit + symbol).
	{
		id: 'bank-secure-login',
		moduleId: 'bank',
		lessonKey: 'bank-secure-login',
		titleKey: 'bank_lesson3_title',
		descriptionKey: 'bank_lesson3_desc',
		difficulty: 'intermediate',
		orderIndex: 3,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'secure-login',
			targetUrl: 'mybank.gr',
			initialApps: ['browser'],
			instructions:
				'1. Πληκτρολογήστε «mybank.gr» και πατήστε Enter.\n2. Συμπληρώστε:\n   • Όνομα χρήστη: οτιδήποτε (π.χ. giannis)\n   • Κωδικός: MyBank2024!  (παράδειγμα μόνο για την προσομοίωση — φτιάξτε τον δικό σας)\n3. Πατήστε «Login».\n\n💡 Ισχυρός κωδικός = 8+ χαρακτήρες με αριθμούς και σύμβολα (!@#).\n⚠️ Μην δίνετε ΠΟΤΕ τον κωδικό σας σε τηλέφωνο, email ή SMS.'
		},
		enabled: true,
		requiredLessonId: 'bank-open-secure'
	},

	// 4. Practice: transfer money to a saved payee (BrowserApp emits bank-transfer).
	{
		id: 'bank-transfer',
		moduleId: 'bank',
		lessonKey: 'bank-transfer',
		titleKey: 'bank_lesson4_title',
		descriptionKey: 'bank_lesson4_desc',
		difficulty: 'intermediate',
		orderIndex: 4,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'make-transfer',
			targetUrl: 'mybank.gr',
			initialApps: ['browser'],
			instructions:
				'1. Αφού συνδεθείτε στο «mybank.gr», βρείτε τη «Μεταφορά χρημάτων».\n2. Συμπληρώστε τον δικαιούχο:\n   • Όνομα: Μαρία Παπαδοπούλου\n   • IBAN: GR1234567890\n   • Ποσό: 50\n3. Πατήστε το κουμπί της μεταφοράς.\n\n💡 Ελέγχετε πάντα το όνομα και τον αριθμό λογαριασμού (IBAN) πριν στείλετε χρήματα.'
		},
		enabled: true,
		requiredLessonId: 'bank-secure-login'
	},

	// 5. Safety: recognise a fake-bank SMS (reuses the "is this the real thing?"
	// idea from scam-spotter/domain-check — as INLINE bank-track config, without
	// touching scam-spotter's own data files).
	{
		id: 'bank-fake-sms-quiz',
		moduleId: 'bank',
		lessonKey: 'bank-fake-sms-quiz',
		titleKey: 'bank_lesson5_title',
		descriptionKey: 'bank_lesson5_desc',
		difficulty: 'intermediate',
		orderIndex: 5,
		lessonType: 'quiz',
		config: {
			question:
				'Λαμβάνετε SMS: «Ο λογαριασμός σας μπλοκαρίστηκε! Πατήστε εδώ και επιβεβαιώστε τον κωδικό σας: http://mybank-verify.info». Τι κάνετε;',
			explanation:
				'Μπράβο! Η τράπεζα ΠΟΤΕ δεν ζητά κωδικούς μέσω SMS ή συνδέσμου. Η παραλλαγμένη διεύθυνση («mybank-verify.info» αντί για την κανονική) και το «http» χωρίς λουκετάκι είναι σαφείς ενδείξεις απάτης.',
			options: [
				{ id: 'a', text: 'Πατάω τον σύνδεσμο και βάζω αμέσως τον κωδικό μου', correct: false },
				{
					id: 'b',
					text: 'Το αγνοώ και μπαίνω στην τράπεζα μόνο πληκτρολογώντας μόνος/η μου τη σωστή διεύθυνση',
					correct: true
				},
				{ id: 'c', text: 'Απαντάω στο SMS στέλνοντας τον κωδικό μου', correct: false }
			]
		},
		enabled: true,
		requiredLessonId: 'bank-transfer'
	}
];
