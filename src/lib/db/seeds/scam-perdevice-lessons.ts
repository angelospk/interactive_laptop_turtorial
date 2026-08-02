import type { NewLesson } from '../schema';

/**
 * Per-device scam-spotter scenarios (issue B4).
 *
 * Fresh, realistic Greek phishing SMS (ΕΛΤΑ / ΔΕΗ / τράπεζα / gov.gr-impersonation)
 * reusing the existing `scam-spotter` lessonType and its goal — no new goal.
 *
 * The "per-device" idea: the SAME phishing SMS is shown twice, once as it appears
 * on Android and once on iPhone, via the optional `deviceVariant` field. That field
 * is additive; cards without it fall back to the renderer's default SMS bubble.
 * The DeviceSms.svelte sub-component renders the per-device chrome; ScamSpotterLesson
 * opts in through the small switch described in the INTEGRATION MANIFEST.
 *
 * Additive & immutable: ids are namespaced `scam-pd-*`, the lesson chains after the
 * existing module10 scam-spotter set without mutating any of it.
 */
export const scamPerDeviceLessons: NewLesson[] = [
	{
		id: 'module10-lesson13',
		moduleId: 'module10',
		lessonKey: 'scam-spotter-perdevice',
		titleKey: 'module10_lesson13_title',
		descriptionKey: 'module10_lesson13_desc',
		difficulty: 'intermediate',
		orderIndex: 13,
		lessonType: 'scam-spotter',
		config: {
			instructions:
				'Το ίδιο μήνυμα φαίνεται λίγο διαφορετικά σε Android και σε iPhone. Τα σημάδια της απάτης όμως είναι τα ίδια. Απάτη ή νόμιμο;',
			cards: [
				{
					id: 'scam-pd-elta-android',
					channel: 'sms',
					deviceVariant: 'android',
					from: 'ELTA',
					body: 'ELTA: Το δέμα σας δεν παραδόθηκε γιατί η διεύθυνση είναι ελλιπής. Ενημερώστε τα στοιχεία παράδοσης εδώ για να επαναπρογραμματιστεί: elta-parcel.info/update',
					link: 'elta-parcel.info/update',
					isScam: true,
					redFlags: [
						'Σύνδεσμος «elta-parcel.info», όχι το επίσημο elta.gr.',
						'Ζητά να «ενημερώσετε στοιχεία» σε εξωτερική σελίδα: τέχνασμα για προσωπικά δεδομένα και στοιχεία κάρτας.',
						'Δεν αναφέρει αριθμό αποστολής· γενικό μήνυμα σταλμένο μαζικά.'
					],
					explanation:
						'Smishing που μιμείται τα ΕΛΤΑ. Έτσι εμφανίζεται σε κινητό Android (Μηνύματα Google): όνομα αποστολέα «ELTA» πάνω αριστερά. Ο σύνδεσμος οδηγεί σε ψεύτικη σελίδα που ζητά στοιχεία.',
					takeaway:
						'Ελέγξτε την αποστολή σας μόνο στο επίσημο elta.gr με τον πραγματικό αριθμό αποστολής. Μην πατάτε τον σύνδεσμο του SMS.'
				},
				{
					id: 'scam-pd-elta-ios',
					channel: 'sms',
					deviceVariant: 'ios',
					from: 'ELTA',
					body: 'ELTA: Το δέμα σας δεν παραδόθηκε γιατί η διεύθυνση είναι ελλιπής. Ενημερώστε τα στοιχεία παράδοσης εδώ για να επαναπρογραμματιστεί: elta-parcel.info/update',
					link: 'elta-parcel.info/update',
					isScam: true,
					redFlags: [
						'Ίδιο μήνυμα, τώρα σε iPhone, τα σημάδια δεν αλλάζουν.',
						'Σύνδεσμος «elta-parcel.info», όχι το επίσημο elta.gr.',
						'Επείγον αίτημα να «ενημερώσετε στοιχεία» για να μη χαθεί το δέμα.'
					],
					explanation:
						'Η ίδια απάτη όπως φαίνεται σε iPhone (Μηνύματα iOS): γκρι «συννεφάκι» αριστερά, όνομα επαφής στο κέντρο. Άλλη εμφάνιση, ίδιο κόλπο. Μη σας ξεγελά το πιο «καθαρό» look.',
					takeaway:
						'Το πώς δείχνει το μήνυμα δεν το κάνει αληθινό. Κρίνετε πάντα από τον αποστολέα και τον σύνδεσμο, όχι από την εμφάνιση.'
				},
				{
					id: 'scam-pd-deh-android',
					channel: 'sms',
					deviceVariant: 'android',
					from: 'DEI',
					body: 'ΔΕΗ: Εντοπίστηκε υπερχρέωση στον λογαριασμό σας. Δικαιούστε επιστροφή 34,80€. Καταχωρίστε τον IBAN σας για πίστωση: dei-refund.gr-online.com',
					link: 'dei-refund.gr-online.com',
					isScam: true,
					redFlags: [
						'Η ΔΕΗ δεν ζητά IBAN μέσω SMS για «επιστροφή».',
						'Σύνδεσμος «gr-online.com», όχι το επίσημο dei.gr.',
						'Δελεαστικό ποσό επιστροφής για να καταχωρίσετε στοιχεία βιαστικά.'
					],
					explanation:
						'Παραλλαγή της απάτης «επιστροφής χρημάτων». Ό,τι επιστροφή προκύπτει, γίνεται μέσα από τον επίσημο λογαριασμό/εφαρμογή σας, ποτέ με IBAN που δίνετε σε άγνωστο link.',
					takeaway:
						'Κανένας οργανισμός δεν ζητά IBAN με SMS. Ελέγξτε μόνοι σας στην επίσημη εφαρμογή της ΔΕΗ.'
				},
				{
					id: 'scam-pd-bank-freeze',
					channel: 'sms',
					from: 'Eurobank',
					body: 'Eurobank: Ο λογαριασμός σας θα ανασταλεί λόγω μη ολοκληρωμένης ταυτοποίησης. Ολοκληρώστε την ταυτοποίηση άμεσα: eurobank-verify.secure-id.com',
					link: 'eurobank-verify.secure-id.com',
					isScam: true,
					redFlags: [
						'Απειλή «αναστολής λογαριασμού» για να δράσετε πανικόβλητα.',
						'Σύνδεσμος «secure-id.com», όχι το επίσημο eurobank.gr.',
						'Η τράπεζα δεν κάνει «ταυτοποίηση» μέσω συνδέσμου σε SMS.'
					],
					explanation:
						'Smishing τράπεζας. Η σελίδα μιμείται το e-banking και κλέβει κωδικούς και OTP. Καμία τράπεζα δεν ζητά ταυτοποίηση με link σε μήνυμα.',
					takeaway:
						'Μην πατάτε συνδέσμους «τράπεζας» από SMS. Ανοίξτε μόνοι σας την επίσημη εφαρμογή ή καλέστε το τηλέφωνο της κάρτας σας.'
				},
				{
					id: 'scam-pd-govgr-impersonation',
					channel: 'sms',
					from: 'gov.gr',
					body: 'gov.gr: Εκκρεμεί επαλήθευση των στοιχείων σας για το επίδομα. Συνδεθείτε με τους κωδικούς Taxisnet εντός 24 ωρών, αλλιώς η αίτηση ακυρώνεται: gov-gr.services-login.com',
					link: 'gov-gr.services-login.com',
					isScam: true,
					redFlags: [
						'Το όνομα «gov.gr» στον αποστολέα μιμείται εύκολα και δεν αποδεικνύει τίποτα.',
						'Σύνδεσμος «services-login.com», όχι το επίσημο gov.gr.',
						'Ζητά κωδικούς Taxisnet μέσα από σύνδεσμο, με προθεσμία «24 ωρών».'
					],
					explanation:
						'Πλαστοπροσωπία του gov.gr. Η σελίδα κλέβει τους κωδικούς Taxisnet σας. Το επίσημο gov.gr δεν σας στέλνει link για να βάλετε κωδικούς. Μπαίνετε πάντα εσείς.',
					takeaway:
						'Πληκτρολογήστε μόνοι σας «gov.gr» στον browser. Ποτέ μη βάζετε κωδικούς Taxisnet σε σύνδεσμο από SMS.'
				},
				{
					id: 'scam-pd-efka',
					channel: 'sms',
					from: '+30 697 0000000',
					body: 'e-ΕΦΚΑ: Έχετε αχρεωστήτως καταβληθέν ποσό προς επιστροφή. Επιβεβαιώστε τα στοιχεία σας για την πίστωση: efka-epistrofi.online',
					link: 'efka-epistrofi.online',
					isScam: true,
					redFlags: [
						'Αποστολή από προσωπικό κινητό (+30 697…), όχι από επίσημο όνομα υπηρεσίας.',
						'Σύνδεσμος «efka-epistrofi.online», άγνωστο domain.',
						'Δυσνόητοι όροι («αχρεωστήτως καταβληθέν») για να φανεί επίσημο.'
					],
					explanation:
						'Απάτη που μιμείται τον e-ΕΦΚΑ. Οι δημόσιες υπηρεσίες δεν ζητούν επιβεβαίωση στοιχείων για «επιστροφή» μέσω άγνωστου συνδέσμου σε SMS.',
					takeaway:
						'Ελέγχετε τα πάντα μόνο μέσα από το gov.gr / τον επίσημο e-ΕΦΚΑ. Αγνοήστε το μήνυμα.'
				},
				{
					id: 'scam-pd-otp-legit',
					channel: 'sms',
					deviceVariant: 'ios',
					from: 'Eurobank',
					body: 'Ο κωδικός επιβεβαίωσης (OTP) για την αγορά σας είναι 736412. Ισχύει για 3 λεπτά. Μην τον κοινοποιήσετε σε κανέναν.',
					isScam: false,
					redFlags: [
						'Στέλνει OTP αλλά ΔΕΝ σας ζητά να τον προωθήσετε ή να τον πείτε σε κάποιον.',
						'Δεν περιέχει σύνδεσμο ούτε απειλή.',
						'Σας προειδοποιεί ρητά να μην τον κοινοποιήσετε.'
					],
					explanation:
						'Γνήσιο OTP, εδώ όπως φαίνεται σε iPhone. Ο κωδικός είναι για να τον πληκτρολογήσετε ΕΣΕΙΣ στη δική σας αγορά. Γίνεται απάτη μόνο αν κάποιος σας ζητήσει να του τον πείτε.',
					takeaway:
						'Νόμιμο. Ποτέ μη δίνετε το OTP σε άτομο που σας καλεί. Μόνο εσείς το πληκτρολογείτε.'
				},
				{
					id: 'scam-pd-govgr-legit',
					channel: 'sms',
					deviceVariant: 'android',
					from: 'gov.gr',
					body: 'gov.gr: Το αίτημά σας για πιστοποιητικό οικογενειακής κατάστασης ολοκληρώθηκε. Το έγγραφο είναι διαθέσιμο στη θυρίδα σας στο gov.gr.',
					isScam: false,
					redFlags: [
						'Σας ενημερώνει για κάτι που εσείς ζητήσατε και δεν ζητά τίποτα.',
						'Δεν περιέχει ύποπτο σύνδεσμο ούτε αίτημα για κωδικούς/χρήματα.',
						'Δεν υπάρχει επείγον ή απειλή προθεσμίας.'
					],
					explanation:
						'Γνήσια ενημέρωση, εδώ σε Android. Το μήνυμα δεν ζητά καμία ενέργεια με προσωπικά στοιχεία, απλώς σας λέει ότι το έγγραφο είναι στη θυρίδα σας.',
					takeaway:
						'Νόμιμο. Για να δείτε το έγγραφο, ανοίξτε μόνοι σας το gov.gr αντί να απαντήσετε στο SMS.'
				}
			]
		},
		enabled: true,
		requiredLessonId: 'module10-lesson12'
	}
];
