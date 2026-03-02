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
			instructions: '1. Πληκτρολογήστε "gov.gr" στη γραμμή διεύθυνσης (πάνω μέρος).\n2. Πατήστε Enter.\n3. Ελέγξτε ότι εμφανίζεται το 🔒 λουκετάκι!\n\n💡 Το λουκετάκι σημαίνει ασφαλής σύνδεση.'
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
			instructions: '1. Πληκτρολογήστε "news247.gr" στη γραμμή διεύθυνσης.\n2. Πατήστε Enter.\n3. Θα εμφανιστεί παράθυρο για cookies.\n4. Πατήστε "Αποδοχή" για να συνεχίσετε.\n\n💡 Τα cookies αποθηκεύουν τις προτιμήσεις σας.'
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
			instructions: '1. Πληκτρολογήστε "piraeusbank.gr" στη γραμμή διεύθυνσης και πατήστε Enter.\n2. Συμπληρώστε:\n   • Όνομα χρήστη: οτιδήποτε\n   • Κωδικός: Kwdikos1!\n\n💡 Ισχυρός κωδικός = 8+ χαρακτήρες + αριθμοί + σύμβολα (!@#)\n\n3. Πατήστε "Είσοδος".'
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
			instructions: '1. Πληκτρολογήστε "gov.gr" στη γραμμή διεύθυνσης.\n2. Επιλέξτε "Υπεύθυνη Δήλωση" από τη λίστα.\n3. Συμπληρώστε:\n   • Ονοματεπώνυμο\n   • ΑΦΜ (9 ψηφία, π.χ. 123456789)\n4. Πατήστε "Υποβολή".'
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
			instructions: '1. Πατήστε το μενού του browser (⋮ ή ☰).\n2. Επιλέξτε "Ρυθμίσεις".\n3. Βρείτε την ενότητα "Απόρρητο και ασφάλεια".\n\n💡 Εδώ μπορείτε να διαγράψετε ιστορικό και cookies.'
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
	}
];
