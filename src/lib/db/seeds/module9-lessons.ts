import type { NewLesson } from '../schema';

/**
 * Module 9: Advanced (Install, Settings)
 * Added Uninstall Lesson
 */
export const module9Lessons: NewLesson[] = [
	{
		id: 'module9-lesson1',
		moduleId: 'module9',
		lessonKey: 'install-app',
		titleKey: 'module9_lesson1_title',
		descriptionKey: 'module9_lesson1_desc',
		difficulty: 'intermediate',
		orderIndex: 1,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'install-app',
			initialApps: ['installer'],
			appName: 'Super Browser',
			instructions:
				'Εγκατάσταση Εφαρμογής: Ακολουθήστε τα βήματα για να εγκαταστήσετε το "Super Browser".'
		},
		enabled: true,
		requiredLessonId: null
	},
	{
		id: 'module9-lesson2',
		moduleId: 'module9',
		lessonKey: 'connect-wifi',
		titleKey: 'module9_lesson2_title',
		descriptionKey: 'module9_lesson2_desc',
		difficulty: 'intermediate',
		orderIndex: 2,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'connect-wifi',
			initialApps: ['settings'],
			initialPage: 'network',
			targetSsid: 'Home_WiFi',
			requiredPassword: 'kwdikos12345',
			instructions:
				'Σύνδεση στο Wi-Fi: Επιλέξτε το δίκτυο "Home_WiFi" και βάλτε τον κωδικό: kwdikos12345'
		},
		enabled: true,
		requiredLessonId: 'module9-lesson1'
	},
	{
		id: 'module9-lesson3',
		moduleId: 'module9',
		lessonKey: 'add-printer',
		titleKey: 'module9_lesson3_title',
		descriptionKey: 'module9_lesson3_desc',
		difficulty: 'advanced',
		orderIndex: 3,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'add-printer',
			initialApps: ['settings'],
			initialPage: 'devices',
			instructions:
				'Προσθήκη Εκτυπωτή: Πατήστε "Προσθήκη εκτυπωτή" για να συνδέσετε τον νέο εκτυπωτή.'
		},
		enabled: true,
		requiredLessonId: 'module9-lesson2'
	},
	{
		id: 'module9-lesson4',
		moduleId: 'module9',
		lessonKey: 'uninstall-app',
		titleKey: 'module9_lesson4_title',
		descriptionKey: 'module9_lesson4_desc',
		difficulty: 'advanced',
		orderIndex: 4,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'uninstall-app',
			initialApps: ['settings'],
			initialPage: 'apps',
			instructions: 'Απεγκατάσταση: Πηγαίνετε στις Εφαρμογές και διαγράψτε το "Spotify".'
		},
		enabled: true,
		requiredLessonId: 'module9-lesson3'
	},

	// Lesson 5: Update App
	{
		id: 'module9-lesson5',
		moduleId: 'module9',
		lessonKey: 'update-app',
		titleKey: 'module9_lesson5_title',
		descriptionKey: 'module9_lesson5_desc',
		difficulty: 'intermediate',
		orderIndex: 5,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'update-app',
			initialApps: ['settings'],
			initialPage: 'apps',
			instructions:
				'Ενημέρωση Εφαρμογής: Πηγαίνετε στις Ρυθμίσεις → Εφαρμογές και ελέγξτε για ενημερώσεις.'
		},
		enabled: true,
		requiredLessonId: 'module9-lesson4'
	},

	// Lesson 6: Bluetooth Connection
	{
		id: 'module9-lesson6',
		moduleId: 'module9',
		lessonKey: 'bluetooth-connect',
		titleKey: 'module9_lesson6_title',
		descriptionKey: 'module9_lesson6_desc',
		difficulty: 'intermediate',
		orderIndex: 6,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'connect-bluetooth',
			initialApps: ['settings'],
			initialPage: 'bluetooth',
			instructions:
				'Σύνδεση Bluetooth: Ανοίξτε τις Ρυθμίσεις → Bluetooth, ενεργοποιήστε το και επιλέξτε συσκευή.'
		},
		enabled: true,
		requiredLessonId: 'module9-lesson5'
	},

	// Lesson 7: Display Settings
	{
		id: 'module9-lesson7',
		moduleId: 'module9',
		lessonKey: 'display-settings',
		titleKey: 'module9_lesson7_title',
		descriptionKey: 'module9_lesson7_desc',
		difficulty: 'beginner',
		orderIndex: 7,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'open-display-settings',
			initialApps: ['settings'],
			instructions:
				'Ρυθμίσεις Οθόνης: Ανοίξτε τις Ρυθμίσεις → Εμφάνιση και προσαρμόστε φωτεινότητα και μέγεθος κειμένου.'
		},
		enabled: true,
		requiredLessonId: 'module9-lesson6'
	},

	// Lesson 8: Accessibility Settings
	{
		id: 'module9-lesson8',
		moduleId: 'module9',
		lessonKey: 'accessibility-settings',
		titleKey: 'module9_lesson8_title',
		descriptionKey: 'module9_lesson8_desc',
		difficulty: 'beginner',
		orderIndex: 8,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'open-accessibility',
			initialApps: ['settings'],
			instructions:
				'Ρυθμίσεις Προσβασιμότητας: Ανοίξτε τις Ρυθμίσεις → Προσβασιμότητα για μεγαλύτερο κείμενο και υψηλή αντίθεση.'
		},
		enabled: true,
		requiredLessonId: 'module9-lesson7'
	},

	// Lesson 9: Sound Settings
	{
		id: 'module9-lesson9',
		moduleId: 'module9',
		lessonKey: 'sound-settings',
		titleKey: 'module9_lesson9_title',
		descriptionKey: 'module9_lesson9_desc',
		difficulty: 'beginner',
		orderIndex: 9,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'open-sound-settings',
			initialApps: ['settings'],
			instructions:
				'Ρυθμίσεις Ήχου: Ανοίξτε τις Ρυθμίσεις → Ήχος και ρυθμίστε την ένταση και τις ειδοποιήσεις.'
		},
		enabled: true,
		requiredLessonId: 'module9-lesson8'
	},

	// Lessons 10–11 mirror the theory scenario (esm001-c1-s2, esm002-c1-s3):
	// get a browser from its official site, then run the installer you downloaded.
	{
		id: 'module9-lesson10',
		moduleId: 'module9',
		lessonKey: 'download-browser',
		titleKey: 'module9_lesson10_title',
		descriptionKey: 'module9_lesson10_desc',
		difficulty: 'intermediate',
		orderIndex: 10,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'download-file',
			initialApps: ['browser'],
			targetFilename: 'ChromeSetup.exe',
			instructions:
				'Θέλετε το Google Chrome. Κατεβάζετε προγράμματα μόνο από την επίσημη σελίδα τους — εδώ σας προσφέρεται το αρχείο ChromeSetup.exe κάτω δεξιά. Πατήστε «Λήψη».'
		},
		enabled: true,
		requiredLessonId: 'module9-lesson9'
	},
	{
		id: 'module9-lesson11',
		moduleId: 'module9',
		lessonKey: 'install-browser',
		titleKey: 'module9_lesson11_title',
		descriptionKey: 'module9_lesson11_desc',
		difficulty: 'intermediate',
		orderIndex: 11,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'install-app',
			initialApps: ['installer'],
			appName: 'Google Chrome',
			instructions:
				'Το ChromeSetup.exe κατέβηκε και άνοιξε. Ακολουθήστε τα βήματα για να εγκαταστήσετε το Google Chrome.'
		},
		enabled: true,
		requiredLessonId: 'module9-lesson10'
	},

	// Lesson 12: the phone won't charge — try the simple fixes in order (esm006-c1-s3)
	{
		id: 'module9-lesson12',
		moduleId: 'module9',
		lessonKey: 'phone-not-charging',
		titleKey: 'module9_lesson12_title',
		descriptionKey: 'module9_lesson12_desc',
		difficulty: 'beginner',
		orderIndex: 12,
		lessonType: 'quiz',
		config: {
			questions: [
				{
					id: 'first-try',
					text: 'Βάζετε το κινητό στον φορτιστή το βράδυ και το πρωί είναι ακόμα στο 5%. Τι δοκιμάζετε πρώτα;',
					options: [
						{ id: 'a', text: 'Αγοράζω αμέσως καινούργιο κινητό', correct: false },
						{
							id: 'b',
							text: 'Δοκιμάζω άλλο καλώδιο και φορτιστή — π.χ. της κόρης μου, που ξέρω ότι δουλεύει',
							correct: true
						},
						{ id: 'c', text: 'Το βάζω στο ψυγείο να «ξεκουραστεί» η μπαταρία', correct: false }
					],
					explanation:
						'Η πιο συχνή αιτία είναι φθαρμένο καλώδιο ή φορτιστής. Δοκιμάζουμε πρώτα με άλλο, που ξέρουμε ότι λειτουργεί.'
				},
				{
					id: 'port',
					text: 'Ούτε με άλλο φορτιστή φορτίζει. Κοιτάτε την τρυπούλα φόρτισης και βλέπετε χνούδι. Τι κάνετε;',
					options: [
						{ id: 'a', text: 'Τη φυσάω δυνατά και ρίχνω λίγο νερό να καθαρίσει', correct: false },
						{
							id: 'b',
							text: 'Κλείνω το κινητό και την καθαρίζω απαλά με κάτι στεγνό και μαλακό, π.χ. μια οδοντογλυφίδα από ξύλο',
							correct: true
						},
						{ id: 'c', text: 'Σπρώχνω μέσα μια μεταλλική καρφίτσα', correct: false }
					],
					explanation:
						'Η σκόνη στη θύρα εμποδίζει την επαφή. Καθαρίζουμε στεγνά και απαλά — ποτέ με νερό ή μέταλλο.'
				},
				{
					id: 'ask-help',
					text: 'Αλλάξατε φορτιστή, καθαρίσατε τη θύρα, το αφήσατε να φορτίσει χωρίς να το χρησιμοποιείτε — και πάλι τίποτα. Τώρα:',
					options: [
						{ id: 'a', text: 'Ανοίγω μόνος μου το κινητό να δω την μπαταρία', correct: false },
						{
							id: 'b',
							text: 'Το πηγαίνω σε τεχνικό ή στο κατάστημα — μάλλον φταίει η μπαταρία ή το κύκλωμα φόρτισης',
							correct: true
						},
						{ id: 'c', text: 'Το αφήνω στον φορτιστή για μια εβδομάδα', correct: false }
					],
					explanation:
						'Όταν τα απλά βήματα δεν φέρνουν αποτέλεσμα, είναι ώρα για τεχνική υποστήριξη. Μια φουσκωμένη ή χαλασμένη μπαταρία δεν την ανοίγουμε μόνοι μας.'
				}
			]
		},
		enabled: true,
		requiredLessonId: 'module9-lesson11'
	},

	// Lesson 13: switch on larger text (esm001-c1-s4)
	{
		id: 'module9-lesson13',
		moduleId: 'module9',
		lessonKey: 'larger-text',
		titleKey: 'module9_lesson13_title',
		descriptionKey: 'module9_lesson13_desc',
		difficulty: 'beginner',
		orderIndex: 13,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'toggle-accessibility',
			initialApps: ['settings'],
			targetSetting: 'larger-text',
			instructions:
				'Τα γράμματα στην οθόνη σας φαίνονται μικρά. Ανοίξτε την ενότητα «Προσβασιμότητα» στις Ρυθμίσεις και ανάψτε τον διακόπτη «Μεγαλύτερο κείμενο».'
		},
		enabled: true,
		requiredLessonId: 'module9-lesson12'
	},

	// Lesson 14: end a frozen program from Task Manager (esm006-c1-s5)
	{
		id: 'module9-lesson14',
		moduleId: 'module9',
		lessonKey: 'end-task',
		titleKey: 'module9_lesson14_title',
		descriptionKey: 'module9_lesson14_desc',
		difficulty: 'advanced',
		orderIndex: 14,
		lessonType: 'desktop-simulation',
		config: {
			goal: 'end-task',
			initialApps: ['browser', 'word'],
			targetTaskId: 'word',
			taskManagerApps: [
				{ id: 'word', name: 'Επεξεργασία Κειμένου', status: 'Δεν αποκρίνεται' },
				{ id: 'browser', name: 'Browser', status: 'Εκτελείται' },
				{ id: 'antivirus', name: 'Προστασία από ιούς', status: 'Εκτελείται' }
			],
			instructions:
				'Η Επεξεργασία Κειμένου κόλλησε και δεν κλείνει με το Χ. Κάντε δεξί κλικ στη γραμμή εργασιών (κάτω), ανοίξτε τη «Διαχείριση εργασιών», επιλέξτε το πρόγραμμα που «Δεν αποκρίνεται» και πατήστε «Τερματισμός εργασίας».'
		},
		enabled: true,
		requiredLessonId: 'module9-lesson13'
	}
];
