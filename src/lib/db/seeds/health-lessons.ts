import type { NewLesson } from '../schema';

/**
 * Health services track (issue B2): άυλη συνταγογράφηση (e-prescription) +
 * MyHealth-like portal + appointment booking. Senior-friendly, Greek-only
 * prompts/hints/quiz-bodies. Immutable, additive ids under the `health-*`
 * namespace.
 *
 * Shape:
 *   - quiz lessons carry inline Greek text (QuizLesson renders raw strings via
 *     its `m[key] || key` fallback), so no i18n keys are needed for quiz bodies.
 *   - health-simulation lessons use the isolated HealthApp via HealthSimLesson.
 * Only lesson titleKey/descriptionKey are i18n keys (el+en in the manifest).
 */
export const healthLessons: NewLesson[] = [
	// Lesson 1: Intro quiz — what is άυλη συνταγογράφηση
	{
		id: 'health-lesson1',
		moduleId: 'health',
		lessonKey: 'what-is-eprescription',
		titleKey: 'health_lesson1_title',
		descriptionKey: 'health_lesson1_desc',
		difficulty: 'beginner',
		orderIndex: 1,
		lessonType: 'quiz',
		config: {
			question: 'Τι είναι η «άυλη συνταγογράφηση»;',
			explanation:
				'Με την άυλη συνταγογράφηση δεν χρειάζεστε πια χαρτί. Ο γιατρός στέλνει τη συνταγή ηλεκτρονικά και εσείς λαμβάνετε έναν κωδικό (με SMS ή στην εφαρμογή). Στο φαρμακείο δείχνετε τον κωδικό και παίρνετε τα φάρμακά σας.',
			options: [
				{
					id: 'a',
					text: 'Μια συνταγή που τυπώνει ο γιατρός σε χαρτί και σας δίνει στο χέρι',
					correct: false
				},
				{
					id: 'b',
					text: 'Μια ηλεκτρονική συνταγή που λαμβάνετε ως κωδικό με SMS ή στην εφαρμογή, χωρίς χαρτί',
					correct: true
				},
				{ id: 'c', text: 'Ένα φάρμακο που παραγγέλνετε από το ίντερνετ', correct: false }
			]
		},
		enabled: true,
		requiredLessonId: null
	},

	// Lesson 2: Quiz — where does the code arrive
	{
		id: 'health-lesson2',
		moduleId: 'health',
		lessonKey: 'where-is-the-code',
		titleKey: 'health_lesson2_title',
		descriptionKey: 'health_lesson2_desc',
		difficulty: 'beginner',
		orderIndex: 2,
		lessonType: 'quiz',
		config: {
			question: 'Ο γιατρός έγραψε τη συνταγή σας. Πού θα βρείτε τον κωδικό της;',
			explanation:
				'Ο κωδικός της άυλης συνταγής έρχεται με μήνυμα SMS στο κινητό σας (συνήθως από το 1517) ή εμφανίζεται στην εφαρμογή/πύλη MyHealth. Δεν χρειάζεται να πάτε πουθενά — τον έχετε ήδη στο τηλέφωνό σας.',
			options: [
				{ id: 'a', text: 'Με SMS στο κινητό ή στην εφαρμογή/πύλη MyHealth', correct: true },
				{ id: 'b', text: 'Μόνο αν πάτε ξανά στο ιατρείο να τον ζητήσετε', correct: false },
				{ id: 'c', text: 'Τον ανακοινώνει το φαρμακείο στην τηλεόραση', correct: false }
			]
		},
		enabled: true,
		requiredLessonId: 'health-lesson1'
	},

	// Lesson 3: Simulation — read the e-prescription code from the SMS
	{
		id: 'health-lesson3',
		moduleId: 'health',
		lessonKey: 'read-sms-code',
		titleKey: 'health_lesson3_title',
		descriptionKey: 'health_lesson3_desc',
		difficulty: 'beginner',
		orderIndex: 3,
		lessonType: 'health-simulation',
		config: {
			goal: 'health-read-eprescription-code',
			screen: 'sms',
			prompt: 'Ήρθε η συνταγή σας! Ανοίξτε το επίσημο μήνυμα και διαβάστε τον κωδικό.',
			sender: 'ΕΦΚΑ 1517',
			smsPreview: 'Ο κωδικός της συνταγής σας είναι έτοιμος',
			code: 'A7K9',
			medication: 'Παρακεταμόλη 500mg',
			successMessage: 'Μπράβο! Αυτόν τον κωδικό θα δείξετε στο φαρμακείο.',
			hint: 'Πατήστε το μήνυμα με το πράσινο σήμα (ΕΦΚΑ 1517), όχι το μήνυμα από τη φίλη σας.'
		},
		enabled: true,
		requiredLessonId: 'health-lesson2'
	},

	// Lesson 4: Simulation — log in to MyHealth and view prescriptions
	{
		id: 'health-lesson4',
		moduleId: 'health',
		lessonKey: 'view-prescriptions',
		titleKey: 'health_lesson4_title',
		descriptionKey: 'health_lesson4_desc',
		difficulty: 'intermediate',
		orderIndex: 4,
		lessonType: 'health-simulation',
		config: {
			goal: 'health-view-prescriptions',
			screen: 'portal',
			prompt: 'Συνδεθείτε στο MyHealth και δείτε τις συνταγές σας.',
			patientName: 'Μαρία Παπαδοπούλου',
			prescriptions: [
				{ title: 'Παρακεταμόλη 500mg', detail: 'Δρ. Ιωάννου · 1 κουτί · λήξη 30/09' },
				{ title: 'Βιταμίνη D3', detail: 'Δρ. Ιωάννου · 1 κουτί · λήξη 15/10' }
			],
			successMessage: 'Τέλεια! Εδώ βλέπετε όλα τα φάρμακα που σας έχει γράψει ο γιατρός.',
			hint: 'Πρώτα «Σύνδεση με Taxisnet», μετά πατήστε την κάρτα «Οι συνταγές μου».'
		},
		enabled: true,
		requiredLessonId: 'health-lesson3'
	},

	// Lesson 5: Simulation — book a doctor appointment
	{
		id: 'health-lesson5',
		moduleId: 'health',
		lessonKey: 'book-appointment',
		titleKey: 'health_lesson5_title',
		descriptionKey: 'health_lesson5_desc',
		difficulty: 'intermediate',
		orderIndex: 5,
		lessonType: 'health-simulation',
		config: {
			goal: 'health-book-appointment',
			screen: 'appointments',
			prompt: 'Κλείστε ραντεβού με τον γιατρό σας για τη Δευτέρα στις 10:00.',
			doctor: 'Δρ. Ιωάννου — Παθολόγος',
			slots: [
				{ id: 'mon-10', label: 'Δευτέρα 10:00' },
				{ id: 'tue-12', label: 'Τρίτη 12:00' },
				{ id: 'wed-09', label: 'Τετάρτη 09:00' }
			],
			targetSlotId: 'mon-10',
			successMessage: 'Μπράβο! Το ραντεβού σας κλείστηκε.',
			hint: 'Διαλέξτε πρώτα «Δευτέρα 10:00» και μετά πατήστε «Κλείσε ραντεβού».'
		},
		enabled: true,
		requiredLessonId: 'health-lesson4'
	},

	// Lesson 6: Safety wrap-up quiz — at the pharmacy
	{
		id: 'health-lesson6',
		moduleId: 'health',
		lessonKey: 'pharmacy-safety',
		titleKey: 'health_lesson6_title',
		descriptionKey: 'health_lesson6_desc',
		difficulty: 'beginner',
		orderIndex: 6,
		lessonType: 'quiz',
		config: {
			question: 'Πήγατε στο φαρμακείο για την άυλη συνταγή σας. Τι χρειάζεται;',
			explanation:
				'Στο φαρμακείο αρκεί να δείξετε τον κωδικό της συνταγής (από το SMS ή την εφαρμογή) και να πείτε το ΑΜΚΑ σας. Τον κωδικό τον δείχνετε μόνο στο φαρμακείο — ποτέ δεν τον στέλνετε σε άγνωστους που σας τηλεφωνούν.',
			options: [
				{ id: 'a', text: 'Να δείξω τον κωδικό της συνταγής και να πω το ΑΜΚΑ μου', correct: true },
				{
					id: 'b',
					text: 'Να στείλω τον κωδικό σε όποιον μου τον ζητήσει στο τηλέφωνο',
					correct: false
				},
				{ id: 'c', text: 'Να ξαναπάω στον γιατρό για χάρτινη συνταγή', correct: false }
			]
		},
		enabled: true,
		requiredLessonId: 'health-lesson5'
	}
];
