import type { NewLesson } from '../schema';

/**
 * Module 8: Internet Safety & Banking
 */
export const module8Lessons: NewLesson[] = [
	{
		id: 'module8-lesson1',
		moduleId: 'module8',
		lessonKey: 'quiz-https',
		titleKey: 'module8_lesson1_title',
		descriptionKey: 'module8_lesson1_desc',
		difficulty: 'beginner',
		orderIndex: 1,
		lessonType: 'quiz',
		config: {
			question: 'quiz_https_question',
			explanation: 'quiz_https_explanation',
			options: [
				{ id: 'a', text: 'quiz_https_opt_a', correct: false },
				{ id: 'b', text: 'quiz_https_opt_b', correct: true }, // The lock icon
				{ id: 'c', text: 'quiz_https_opt_c', correct: false }
			]
		},
		enabled: true,
		requiredLessonId: null
	},
	{
		id: 'module8-lesson2',
		moduleId: 'module8',
		lessonKey: 'secure-site',
		titleKey: 'module8_lesson2_title',
		descriptionKey: 'module8_lesson2_desc',
		difficulty: 'beginner',
		orderIndex: 2,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'navigate-site',
			targetUrl: 'gov.gr',
			initialApps: ['browser'],
			instructions:
				'1. Πληκτρολογήστε "gov.gr" στη γραμμή διεύθυνσης (πάνω μέρος).\n2. Πατήστε Enter.\n3. Ελέγξτε ότι εμφανίζεται το 🔒 λουκετάκι!\n\n💡 Το λουκετάκι σημαίνει ασφαλής σύνδεση.'
		},
		enabled: true,
		requiredLessonId: 'module8-lesson1'
	},
	{
		id: 'module8-lesson3',
		moduleId: 'module8',
		lessonKey: 'quiz-cookies',
		titleKey: 'module8_lesson3_title',
		descriptionKey: 'module8_lesson3_desc',
		difficulty: 'intermediate',
		orderIndex: 3,
		lessonType: 'quiz',
		config: {
			question: 'quiz_cookies_question',
			explanation: 'quiz_cookies_explanation',
			options: [
				{ id: 'a', text: 'quiz_cookies_opt_a', correct: true }, // Small files saved by sites
				{ id: 'b', text: 'quiz_cookies_opt_b', correct: false },
				{ id: 'c', text: 'quiz_cookies_opt_c', correct: false }
			]
		},
		enabled: true,
		requiredLessonId: 'module8-lesson2'
	},
	{
		id: 'module8-lesson4',
		moduleId: 'module8',
		lessonKey: 'cookies-practice',
		titleKey: 'module8_lesson4_title',
		descriptionKey: 'module8_lesson4_desc',
		difficulty: 'intermediate',
		orderIndex: 4,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'handle-cookies',
			targetChoice: 'accept',
			targetUrl: 'news247.gr',
			initialApps: ['browser'],
			instructions:
				'1. Πληκτρολογήστε "news247.gr" στη γραμμή διεύθυνσης.\n2. Πατήστε Enter.\n3. Θα εμφανιστεί παράθυρο για cookies.\n4. Πατήστε "Αποδοχή" για να συνεχίσετε.\n\n💡 Τα cookies αποθηκεύουν τις προτιμήσεις σας.'
		},
		enabled: true,
		requiredLessonId: 'module8-lesson3'
	},
	{
		id: 'module8-lesson5',
		moduleId: 'module8',
		lessonKey: 'quiz-password',
		titleKey: 'module8_lesson5_title',
		descriptionKey: 'module8_lesson5_desc',
		difficulty: 'intermediate',
		orderIndex: 5,
		lessonType: 'quiz',
		config: {
			question: 'quiz_password_question',
			explanation: 'quiz_password_explanation',
			options: [
				{ id: 'a', text: 'quiz_password_opt_a', correct: false },
				{ id: 'b', text: 'quiz_password_opt_b', correct: false },
				{ id: 'c', text: 'quiz_password_opt_c', correct: true } // Mix of chars, numbers, symbols
			]
		},
		enabled: true,
		requiredLessonId: 'module8-lesson4'
	},
	{
		id: 'module8-lesson6',
		moduleId: 'module8',
		lessonKey: 'bank-login-practice',
		titleKey: 'module8_lesson6_title',
		descriptionKey: 'module8_lesson6_desc',
		difficulty: 'advanced',
		orderIndex: 6,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'secure-login',
			targetUrl: 'piraeusbank.gr',
			initialApps: ['browser'],
			instructions:
				'1. Πληκτρολογήστε "piraeusbank.gr" στη γραμμή διεύθυνσης και πατήστε Enter.\n2. Συμπληρώστε:\n   • Όνομα χρήστη: οτιδήποτε\n   • Κωδικός: Kwdikos1!\n\n💡 Ισχυρός κωδικός = 8+ χαρακτήρες + αριθμοί + σύμβολα (!@#)\n\n3. Πατήστε "Είσοδος".'
		},
		enabled: true,
		requiredLessonId: 'module8-lesson5'
	},
	{
		id: 'module8-lesson7',
		moduleId: 'module8',
		lessonKey: 'gov-service-practice',
		titleKey: 'module8_lesson7_title',
		descriptionKey: 'module8_lesson7_desc',
		difficulty: 'advanced',
		orderIndex: 7,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'gov-service',
			targetUrl: 'gov.gr',
			initialApps: ['browser'],
			instructions:
				'1. Πληκτρολογήστε "gov.gr" στη γραμμή διεύθυνσης.\n2. Επιλέξτε "Υπεύθυνη Δήλωση" από τη λίστα.\n3. Συμπληρώστε:\n   • Ονοματεπώνυμο\n   • ΑΦΜ (9 ψηφία, π.χ. 123456789)\n4. Πατήστε "Υποβολή".'
		},
		enabled: true,
		requiredLessonId: 'module8-lesson6'
	},

	// Lesson 8: Strong Password Practice
	{
		id: 'module8-lesson8',
		moduleId: 'module8',
		lessonKey: 'strong-password',
		titleKey: 'module8_lesson8_title',
		descriptionKey: 'module8_lesson8_desc',
		difficulty: 'beginner',
		orderIndex: 8,
		lessonType: 'quiz',
		config: {
			question: 'quiz_strong_password_question',
			explanation: 'quiz_strong_password_explanation',
			options: [
				{ id: 'a', text: 'quiz_strong_password_opt_a', correct: false },
				{ id: 'b', text: 'quiz_strong_password_opt_b', correct: true },
				{ id: 'c', text: 'quiz_strong_password_opt_c', correct: false }
			]
		},
		enabled: true,
		requiredLessonId: 'module8-lesson7'
	},

	// Lesson 9: Two-Factor Authentication Quiz
	{
		id: 'module8-lesson9',
		moduleId: 'module8',
		lessonKey: 'quiz-2fa',
		titleKey: 'module8_lesson9_title',
		descriptionKey: 'module8_lesson9_desc',
		difficulty: 'intermediate',
		orderIndex: 9,
		lessonType: 'quiz',
		config: {
			question: 'quiz_2fa_question',
			explanation: 'quiz_2fa_explanation',
			options: [
				{ id: 'a', text: 'quiz_2fa_opt_a', correct: false },
				{ id: 'b', text: 'quiz_2fa_opt_b', correct: false },
				{ id: 'c', text: 'quiz_2fa_opt_c', correct: true }
			]
		},
		enabled: true,
		requiredLessonId: 'module8-lesson8'
	},

	// Lesson 10: Privacy Settings
	{
		id: 'module8-lesson10',
		moduleId: 'module8',
		lessonKey: 'privacy-settings',
		titleKey: 'module8_lesson10_title',
		descriptionKey: 'module8_lesson10_desc',
		difficulty: 'intermediate',
		orderIndex: 10,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'open-privacy-settings',
			initialApps: ['browser'],
			instructions:
				'1. Πατήστε το μενού του browser (⋮ ή ☰).\n2. Επιλέξτε "Ρυθμίσεις".\n3. Βρείτε την ενότητα "Απόρρητο και ασφάλεια".\n\n💡 Εδώ μπορείτε να διαγράψετε ιστορικό και cookies.'
		},
		enabled: true,
		requiredLessonId: 'module8-lesson9'
	},

	// Lesson 11: Public WiFi Risks Quiz
	{
		id: 'module8-lesson11',
		moduleId: 'module8',
		lessonKey: 'quiz-public-wifi',
		titleKey: 'module8_lesson11_title',
		descriptionKey: 'module8_lesson11_desc',
		difficulty: 'intermediate',
		orderIndex: 11,
		lessonType: 'quiz',
		config: {
			question: 'quiz_public_wifi_question',
			explanation: 'quiz_public_wifi_explanation',
			options: [
				{ id: 'a', text: 'quiz_public_wifi_opt_a', correct: false },
				{ id: 'b', text: 'quiz_public_wifi_opt_b', correct: true },
				{ id: 'c', text: 'quiz_public_wifi_opt_c', correct: false }
			]
		},
		enabled: true,
		requiredLessonId: 'module8-lesson10'
	},

	// Lesson 12: Netiquette — everyday situations from the theory (eapsi001-c4-s3)
	{
		id: 'module8-lesson12',
		moduleId: 'module8',
		lessonKey: 'netiquette',
		titleKey: 'module8_lesson12_title',
		descriptionKey: 'module8_lesson12_desc',
		difficulty: 'beginner',
		orderIndex: 12,
		lessonType: 'quiz',
		config: {
			questions: [
				{
					id: 'rude-comment',
					text: 'Στην ομάδα της γειτονιάς στο Facebook κάποιος γράφει για εσάς ένα αγενές σχόλιο. Τι κάνετε;',
					options: [
						{ id: 'a', text: 'Του απαντώ αμέσως με το ίδιο ύφος, να μάθει', correct: false },
						{
							id: 'b',
							text: 'Ηρεμώ, δεν μπαίνω σε καβγά· αν συνεχίσει, τον αναφέρω στους διαχειριστές',
							correct: true
						},
						{ id: 'c', text: 'Ανεβάζω τα προσωπικά του στοιχεία για να τον εκθέσω', correct: false }
					],
					explanation:
						'Πίσω από κάθε οθόνη υπάρχει άνθρωπος. Δεν απαντάμε στην επιθετικότητα με επιθετικότητα· η αναφορά στους διαχειριστές είναι ο σωστός δρόμος.'
				},
				{
					id: 'capitals',
					text: 'Θέλετε να ευχηθείτε στην ανιψιά σας για τα γενέθλιά της. Ποιο μήνυμα είναι πιο ευγενικό στο διαδίκτυο;',
					options: [
						{ id: 'a', text: 'ΧΡΟΝΙΑ ΠΟΛΛΑ!!! ΝΑ ΜΟΥ ΤΗΛΕΦΩΝΗΣΕΙΣ!!!', correct: false },
						{
							id: 'b',
							text: 'Χρόνια πολλά, κορίτσι μου! Πάρε με όταν βρεις λίγο χρόνο 😊',
							correct: true
						},
						{ id: 'c', text: 'χρ πλλ τλφνσ', correct: false }
					],
					explanation:
						'Τα κεφαλαία στο διαδίκτυο διαβάζονται σαν φωνές, και οι πολλές συντομογραφίες δυσκολεύουν. Γράφουμε όπως θα μιλούσαμε από κοντά.'
				},
				{
					id: 'group-photo',
					text: 'Βγάλατε ωραία φωτογραφία με τις φίλες σας στο ΚΑΠΗ. Πριν την ανεβάσετε στο διαδίκτυο:',
					options: [
						{ id: 'a', text: 'Την ανεβάζω — αφού είμαι κι εγώ μέσα', correct: false },
						{ id: 'b', text: 'Ρωτάω πρώτα αν συμφωνούν όσες φαίνονται', correct: true },
						{ id: 'c', text: 'Την ανεβάζω και γράφω και τα ονόματα όλων', correct: false }
					],
					explanation:
						'Η φωτογραφία κάποιου είναι προσωπικό του δεδομένο. Ζητάμε πάντα την άδεια όσων φαίνονται πριν τη δημοσιεύσουμε.'
				}
			]
		},
		enabled: true,
		requiredLessonId: 'module8-lesson11'
	},

	// Lesson 13: Breach response — sign → first move → who to tell (esm005-c1-s4)
	{
		id: 'module8-lesson13',
		moduleId: 'module8',
		lessonKey: 'breach-response',
		titleKey: 'module8_lesson13_title',
		descriptionKey: 'module8_lesson13_desc',
		difficulty: 'intermediate',
		orderIndex: 13,
		lessonType: 'quiz',
		config: {
			questions: [
				{
					id: 'sign',
					text: 'Ποιο από αυτά δείχνει ότι κάποιος μπορεί να μπήκε στον λογαριασμό σας στο email;',
					options: [
						{ id: 'a', text: 'Ήρθε ένα newsletter από το σούπερ μάρκετ', correct: false },
						{
							id: 'b',
							text: 'Ο ανιψιός σας ρωτά γιατί του στείλατε μήνυμα που ζητά χρήματα — ενώ δεν του γράψατε',
							correct: true
						},
						{ id: 'c', text: 'Ξεχάσατε τον κωδικό και τον αλλάξατε μόνοι σας', correct: false }
					],
					explanation:
						'Μηνύματα που δεν στείλατε, συνδέσεις από άγνωστο μέρος και αλλαγές ρυθμίσεων που δεν κάνατε είναι σημάδια ότι κάποιος άλλος μπήκε στον λογαριασμό.'
				},
				{
					id: 'first-move',
					text: 'Είστε σχεδόν σίγουροι ότι μπήκαν στον λογαριασμό σας από τον υπολογιστή. Τι κάνετε πρώτα;',
					options: [
						{
							id: 'a',
							text: 'Αποσυνδέω τον υπολογιστή από το ίντερνετ και αλλάζω τον κωδικό από άλλη συσκευή, π.χ. το κινητό',
							correct: true
						},
						{
							id: 'b',
							text: 'Περιμένω μερικές μέρες μήπως σταματήσει από μόνο του',
							correct: false
						},
						{
							id: 'c',
							text: 'Γράφω τον νέο κωδικό σε μήνυμα στον εαυτό μου, για να μην τον ξεχάσω',
							correct: false
						}
					],
					explanation:
						'Πρώτα κόβουμε τη σύνδεση, ώστε να μη γίνει περισσότερη ζημιά. Τον κωδικό τον αλλάζουμε από συσκευή που εμπιστευόμαστε και, όπου γίνεται, ανοίγουμε τον κωδικό επιβεβαίωσης με SMS (2FA).'
				},
				{
					id: 'who-to-tell',
					text: 'Στον ίδιο λογαριασμό είχατε αποθηκεύσει τα στοιχεία της κάρτας σας. Ποιον ειδοποιείτε αμέσως;',
					options: [
						{ id: 'a', text: 'Κανέναν — ντρέπομαι που μου συνέβη', correct: false },
						{
							id: 'b',
							text: 'Την τράπεζα, στο τηλέφωνο που γράφει η κάρτα, και μετά την αστυνομία (Δίωξη Ηλεκτρονικού Εγκλήματος)',
							correct: true
						},
						{
							id: 'c',
							text: 'Όποιον αριθμό βρω πρώτο σε διαφήμιση για «ανάκτηση λογαριασμών»',
							correct: false
						}
					],
					explanation:
						'Αν εκτέθηκαν οικονομικά στοιχεία, η τράπεζα μπλοκάρει την κάρτα. Το περιστατικό το δηλώνουμε στις αρχές. Δεν ντρεπόμαστε — συμβαίνει σε πολλούς.'
				}
			]
		},
		enabled: true,
		requiredLessonId: 'module8-lesson12'
	}
];
