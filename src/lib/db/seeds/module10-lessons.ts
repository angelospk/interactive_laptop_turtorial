import type { NewLesson } from '../schema';

/**
 * Module 10: Advanced Security & Phishing
 * Dedicated module for recognizing and handling security threats.
 */
export const module10Lessons: NewLesson[] = [
    // Lesson 1: Urgent Payment Request (Phishing)
    {
        id: 'module10-lesson1',
        moduleId: 'module10',
        lessonKey: 'phishing-urgent',
        titleKey: 'module10_lesson1_title',
        descriptionKey: 'module10_lesson1_desc',
        difficulty: 'intermediate',
        orderIndex: 1,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'identify-phishing',
            initialApps: ['email'],
            instructions: 'Εντοπίστε το ύποπτο email που ζητάει επείγουσα πληρωμή.',
            emails: [
                {
                    id: 'phish-urgent',
                    sender: 'CEO Office <ceo-urgent@gmail.com>',
                    subject: 'ΕΠΕΙΓΟΝ: Μεταφορά χρημάτων',
                    body: 'Είμαι σε meeting και δεν μπορώ να μιλήσω. Χρειάζομαι να κάνεις μια επείγουσα μεταφορά σε αυτόν τον λογαριασμό τώρα. Μην το καθυστερείς.',
                    date: '10:00',
                    isRead: false,
                    isPhishing: true,
                    folder: 'inbox'
                },
                {
                    id: 'safe-work',
                    sender: 'Γιώργος <giorgos@company.com>',
                    subject: 'Αναφορά εβδομάδας',
                    body: 'Σου στέλνω την αναφορά που ζήτησες.',
                    date: '09:30',
                    isRead: true,
                    isPhishing: false,
                    folder: 'inbox'
                }
            ]
        },
        enabled: true,
        requiredLessonId: null
    },

    // Lesson 2: Fake Login Page (Phishing)
    {
        id: 'module10-lesson2',
        moduleId: 'module10',
        lessonKey: 'phishing-login',
        titleKey: 'module10_lesson2_title',
        descriptionKey: 'module10_lesson2_desc',
        difficulty: 'intermediate',
        orderIndex: 2,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'identify-phishing',
            initialApps: ['email'],
            instructions: 'Προσοχή στους συνδέσμους! Βρείτε το email που προσπαθεί να κλέψει κωδικούς.',
            emails: [
                {
                    id: 'phish-netflix',
                    sender: 'Netflix Support <support@netflix-verify-account.com>',
                    subject: 'Η συνδρομή σας έληξε',
                    body: 'Για να συνεχίσετε να βλέπετε, κάντε κλικ εδώ και συνδεθείτε ξανά: www.netflix-login-secure.com',
                    date: '11:15',
                    isRead: false,
                    isPhishing: true,
                    folder: 'inbox'
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module10-lesson1'
    },

    // Lesson 3: Safe Attachment (Safe)
    {
        id: 'module10-lesson3',
        moduleId: 'module10',
        lessonKey: 'safe-attachment',
        titleKey: 'module10_lesson3_title',
        descriptionKey: 'module10_lesson3_desc',
        difficulty: 'intermediate',
        orderIndex: 3,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'download-attachment', // User needs to realize it's safe and download it? Or just report as safe.
            // Current reportPhishing logic: if it's NOT phishing, user should report it as safe?
            // Actually, standard flow is: Report Phishing -> Correct/Incorrect.
            // If user deletes a safe email thinking it's phishing, that's an error?
            // Let's stick to "identify-phishing" goal but this time the 'target' is to CORRECTLY identify it as safe (which reportPhishing handles).
            // Wait, if goal is 'identify-phishing', usually we want them to find the BAD one.
            // Let's make them find the BAD one among good ones.
            initialApps: ['email'],
            instructions: 'Βρείτε το ασφαλές email από το λογιστήριο και κατεβάστε το συνημμένο αρχείο.',
            emails: [
                {
                    id: 'phish-zip',
                    sender: 'Courier <delivery@speedex-tracking-fake.gr>',
                    subject: 'Το δέμα σας έφτασε',
                    body: 'Κατεβάστε το συνημμένο .exe για να δείτε την απόδειξη παραλαβής.',
                    date: '12:00',
                    isRead: false,
                    isPhishing: true,
                    hasAttachment: true,
                    folder: 'inbox'
                },
                {
                    id: 'safe-pdf',
                    sender: 'Λογιστήριο <accounts@company.com>',
                    subject: 'Μισθοδοσία',
                    body: 'Επισυνάπτεται η απόδειξη μισθοδοσίας σε PDF.',
                    date: '11:50',
                    isRead: true,
                    isPhishing: false,
                    hasAttachment: true,
                    folder: 'inbox'
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module10-lesson2'
    },

    // Lesson 4: Fake Lottery Winner
    {
        id: 'module10-lesson4',
        moduleId: 'module10',
        lessonKey: 'phishing-lottery',
        titleKey: 'module10_lesson4_title',
        descriptionKey: 'module10_lesson4_desc',
        difficulty: 'beginner',
        orderIndex: 4,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'identify-phishing',
            initialApps: ['email'],
            instructions: 'Κάποιος σας χαρίζει λεφτά. Είναι αλήθεια;',
            emails: [
                {
                    id: 'phish-lotto',
                    sender: 'Google Lottery <winner@lucky-day-prize.com>',
                    subject: 'ΣΥΓΧΑΡΗΤΗΡΙΑ!!! ΚΕΡΔΙΣΑΤΕ 1.000.000€',
                    body: 'Είστε ο τυχερός νικητής! Στείλτε μας τα στοιχεία της τράπεζάς σας για να λάβετε τα χρήματα.',
                    date: '08:00',
                    isRead: false,
                    isPhishing: true,
                    folder: 'inbox'
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module10-lesson3'
    },

    // Lesson 5: Bank Verification
    {
        id: 'module10-lesson5',
        moduleId: 'module10',
        lessonKey: 'phishing-bank',
        titleKey: 'module10_lesson5_title',
        descriptionKey: 'module10_lesson5_desc',
        difficulty: 'intermediate',
        orderIndex: 5,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'identify-phishing',
            initialApps: ['email'],
            instructions: 'Η τράπεζα στέλνει email. Είναι γνήσιο;',
            emails: [
                {
                    id: 'phish-bank',
                    sender: 'Alpha Bank Security <alert@alpha-bank-secure-login.com>',
                    subject: 'Μη εξουσιοδοτημένη πρόσβαση',
                    body: 'Κάποιος προσπάθησε να μπει στο λογαριασμό σας. Κάντε κλικ εδώ για επαλήθευση στοιχείων.',
                    date: '14:30',
                    isRead: false,
                    isPhishing: true,
                    folder: 'inbox'
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module10-lesson4'
    },

    // Lesson 6: Tech Support Scam
    {
        id: 'module10-lesson6',
        moduleId: 'module10',
        lessonKey: 'phishing-support',
        titleKey: 'module10_lesson6_title',
        descriptionKey: 'module10_lesson6_desc',
        difficulty: 'advanced',
        orderIndex: 6,
        lessonType: 'desktop-simulation',
        config: {
            goal: 'identify-phishing',
            initialApps: ['email'],
            instructions: 'Η Microsoft σας ζητάει πρόσβαση;',
            emails: [
                {
                    id: 'phish-ms',
                    sender: 'Windows Support <help@microsoft-support-team.net>',
                    subject: 'Ο υπολογιστής σας έχει ιό',
                    body: 'Εντοπίσαμε 5 ιούς στον υπολογιστή σας. Καλέστε μας αμέσως στο 800-123-FAKE ή κατεβάστε το εργαλείο καθαρισμού.',
                    date: '16:45',
                    isRead: false,
                    isPhishing: true,
                    folder: 'inbox'
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module10-lesson5'
    },

    // Lesson 7: Quiz - Phishing Signs
    {
        id: 'module10-lesson7',
        moduleId: 'module10',
        lessonKey: 'quiz-phishing-signs',
        titleKey: 'module10_lesson7_title',
        descriptionKey: 'module10_lesson7_desc',
        difficulty: 'beginner',
        orderIndex: 7,
        lessonType: 'quiz',
        config: {
            questions: [
                {
                    id: 'q1',
                    text: 'Ποιο από τα παρακάτω είναι σημάδι phishing;',
                    options: [
                        { id: 'a', text: 'Ορθογραφικά λάθη και επείγουσα γλώσσα', correct: true },
                        { id: 'b', text: 'Προσωπική προσφωνηση (π.χ. "Αγαπητέ Γιάννη")', correct: false },
                        { id: 'c', text: 'Αποστολέας από γνωστή διεύθυνση', correct: false }
                    ]
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module10-lesson6'
    },

    // Lesson 8: Quiz - Password Safety
    {
        id: 'module10-lesson8',
        moduleId: 'module10',
        lessonKey: 'quiz-passwords',
        titleKey: 'module10_lesson8_title',
        descriptionKey: 'module10_lesson8_desc',
        difficulty: 'intermediate',
        orderIndex: 8,
        lessonType: 'quiz',
        config: {
            questions: [
                {
                    id: 'q1',
                    text: 'Ποιος είναι ο πιο ασφαλής κωδικός;',
                    options: [
                        { id: 'a', text: '123456', correct: false },
                        { id: 'b', text: 'password', correct: false },
                        { id: 'c', text: 'Kwd!k0s2024$', correct: true }
                    ]
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module10-lesson7'
    },

    // Lesson 9: Scam-spotter — Email ("Απάτη ή Όχι;")
    {
        id: 'module10-lesson9',
        moduleId: 'module10',
        lessonKey: 'scam-spotter-email',
        titleKey: 'module10_lesson9_title',
        descriptionKey: 'module10_lesson9_desc',
        difficulty: 'intermediate',
        orderIndex: 9,
        lessonType: 'scam-spotter',
        config: {
            instructions: 'Δείτε κάθε μήνυμα και αποφασίστε: είναι απάτη ή νόμιμο;',
            cards: [
                {
                    id: 'aade-refund',
                    channel: 'email',
                    from: 'ΑΑΔΕ - Επιστροφή Φόρου',
                    fromAddress: 'no-reply@aade-epistrofi.gr',
                    subject: 'Δικαιούστε επιστροφή φόρου 218,40€',
                    body: 'Αγαπητέ φορολογούμενε, μετά από επανέλεγχο της δήλωσής σας δικαιούστε επιστροφή φόρου 218,40€. Συμπληρώστε τα στοιχεία του τραπεζικού σας λογαριασμού (IBAN) στον παρακάτω σύνδεσμο εντός 48 ωρών, διαφορετικά το ποσό ακυρώνεται.',
                    link: 'https://aade-gov.epistrofi-tax.gr/refund',
                    isScam: true,
                    redFlags: [
                        'Η ΑΑΔΕ ποτέ δεν ζητά IBAN ή στοιχεία λογαριασμού μέσω email.',
                        'Το domain «aade-epistrofi.gr» δεν είναι το επίσημο aade.gr / gov.gr.',
                        'Επείγον χρονικό όριο («48 ώρες αλλιώς ακυρώνεται») για να βιαστείτε.',
                        'Δελεαστικό ποσό για να πατήσετε τον σύνδεσμο χωρίς σκέψη.'
                    ],
                    explanation:
                        'Κλασικό phishing που μιμείται την ΑΑΔΕ. Οι επιστροφές φόρου γίνονται αυτόματα στον ήδη δηλωμένο λογαριασμό σας μέσω του myAADE — ποτέ δεν θα σας ζητηθεί IBAN με μήνυμα.',
                    takeaway: 'Μπείτε μόνοι σας στο gov.gr ή στο myAADE — μην πατάτε συνδέσμους από email.'
                },
                {
                    id: 'nbg-suspended',
                    channel: 'email',
                    from: 'Εθνική Τράπεζα',
                    fromAddress: 'security@nbg-secure-alert.com',
                    subject: 'Ο λογαριασμός σας ανεστάλη',
                    body: 'Εντοπίσαμε σύνδεση από νέα συσκευή. Για την ασφάλειά σας, ο λογαριασμός σας ανεστάλη προσωρινά. Επιβεβαιώστε τα στοιχεία σας (κωδικό e-banking και OTP) στον σύνδεσμο για άμεση επανενεργοποίηση.',
                    link: 'https://mynbg-secure-login.com',
                    isScam: true,
                    redFlags: [
                        'Το domain «nbg-secure-alert.com» δεν είναι το επίσημο nbg.gr.',
                        'Ζητά κωδικό e-banking και OTP — η τράπεζα ΠΟΤΕ δεν τα ζητά.',
                        'Δημιουργεί φόβο («ο λογαριασμός ανεστάλη») για άμεση, βιαστική αντίδραση.'
                    ],
                    explanation:
                        'Οι τράπεζες δεν ζητούν ποτέ κωδικούς ή OTP μέσω email, SMS ή συνδέσμου. Το OTP είναι μόνο για να το πληκτρολογείτε εσείς μέσα στην επίσημη εφαρμογή.',
                    takeaway:
                        'Αν ανησυχείτε, ανοίξτε μόνοι σας την επίσημη εφαρμογή ή καλέστε την τράπεζα στο τηλέφωνο που αναγράφεται στην κάρτα σας.'
                },
                {
                    id: 'govgr-mailbox',
                    channel: 'email',
                    from: 'gov.gr',
                    fromAddress: 'no-reply@gov.gr',
                    subject: 'Νέο έγγραφο στη θυρίδα σας',
                    body: 'Έχετε ένα νέο έγγραφο στην προσωπική σας θυρίδα στο gov.gr. Συνδεθείτε στο gov.gr με τους κωδικούς Taxisnet για να το δείτε.',
                    link: 'https://www.gov.gr/',
                    isScam: false,
                    redFlags: [
                        'Αποστολέας από το επίσημο «gov.gr».',
                        'Δεν ζητά κωδικούς μέσα στο μήνυμα — σας λέει να συνδεθείτε μόνοι σας.',
                        'Δεν υπάρχει επείγον, απειλή ή αίτημα για χρήματα/στοιχεία.'
                    ],
                    explanation:
                        'Πρόκειται για γνήσια ειδοποίηση. Η εγκυρότητα όμως δεν κρίνεται από το όνομα του αποστολέα (που μιμείται εύκολα) — γι’ αυτό, ακόμη κι εδώ, η ασφαλέστερη συνήθεια είναι να ανοίγετε μόνοι σας το gov.gr.',
                    takeaway: 'Νόμιμο μήνυμα. Καλή συνήθεια: πληκτρολογήστε εσείς «gov.gr» στον browser, αντί να πατήσετε τον σύνδεσμο.'
                },
                {
                    id: 'acs-parcel-fee',
                    channel: 'email',
                    from: 'ACS Courier',
                    fromAddress: 'info@acs-paketo-tracking.com',
                    subject: 'Το δέμα σας είναι σε εκκρεμότητα',
                    body: 'Το δέμα σας δεν παραδόθηκε λόγω εκκρεμούς τέλους αποστολής 0,79€. Πληρώστε το μικρό τέλος για να προγραμματιστεί νέα παράδοση.',
                    link: 'https://acs-tracking.delivery-fee.com/pay',
                    isScam: true,
                    redFlags: [
                        'Ζητά πληρωμή μικρού ποσού (0,79€) — τέχνασμα για να αποσπάσει στοιχεία κάρτας.',
                        'Domain «acs-paketo-tracking.com» αντί του επίσημου acscourier.net.',
                        'Δεν αναφέρει αριθμό αποστολής ή όνομα — γενικό μήνυμα σταλμένο μαζικά.'
                    ],
                    explanation:
                        'Οι εταιρείες courier δεν ζητούν πληρωμή «τέλους» μέσω συνδέσμου σε email ή SMS. Στόχος είναι τα στοιχεία της κάρτας σας.',
                    takeaway:
                        'Δεν περιμένετε δέμα; Αγνοήστε το. Αν περιμένετε, ελέγξτε με τον αριθμό αποστολής στο επίσημο site της εταιρείας.'
                },
                {
                    id: 'cosmote-points',
                    channel: 'email',
                    from: 'COSMOTE Rewards',
                    fromAddress: 'no-reply@cosmote-rewards-gr.com',
                    subject: 'Έχετε 2.000 πόντους που λήγουν σήμερα!',
                    body: 'Αγαπητέ πελάτη, έχετε 2.000 πόντους COSMOTE που λήγουν σήμερα. Εξαργυρώστε τους τώρα για δώρο επιλογής σας — απαιτείται μόνο επιβεβαίωση των στοιχείων της κάρτας σας.',
                    link: 'https://cosmote-rewards-gr.com/redeem',
                    isScam: true,
                    redFlags: [
                        'Το domain «cosmote-rewards-gr.com» δεν είναι το επίσημο cosmote.gr.',
                        'Ζητά στοιχεία κάρτας για «δώρο» — κανένα πρόγραμμα πόντων δεν το κάνει αυτό.',
                        'Λήξη «σήμερα» για να σας πιέσει να βιαστείτε.'
                    ],
                    explanation:
                        'Phishing που εκμεταλλεύεται τα προγράμματα επιβράβευσης. Οι πόντοι εξαργυρώνονται μέσα στην επίσημη εφαρμογή/λογαριασμό σας, ποτέ με στοιχεία κάρτας σε εξωτερικό σύνδεσμο.',
                    takeaway: 'Ελέγξτε τους πόντους σας μόνο μέσα από την επίσημη εφαρμογή COSMOTE.'
                },
                {
                    id: 'eshop-order',
                    channel: 'email',
                    from: 'Online Shop',
                    fromAddress: 'orders@shop-secure-checkout.net',
                    subject: 'Η παραγγελία σας #48217 δεν ολοκληρώθηκε',
                    body: 'Η πληρωμή της παραγγελίας σας απορρίφθηκε. Για να μην ακυρωθεί, επιβεβαιώστε τα στοιχεία της κάρτας σας (αριθμός, ημερομηνία λήξης, CVV) μέσα στις επόμενες 2 ώρες.',
                    link: 'https://shop-secure-checkout.net/verify',
                    isScam: true,
                    redFlags: [
                        'Ζητά πλήρη στοιχεία κάρτας, μαζί με τον κωδικό CVV — τεράστιο κόκκινο σημάδι.',
                        'Δεν αναφέρει τι αγοράσατε ή από πού — γενικό μήνυμα.',
                        'Πίεση χρόνου («2 ώρες») για βιαστική ενέργεια.'
                    ],
                    explanation:
                        'Ένα νόμιμο κατάστημα δεν ζητά ξανά τον CVV μέσω email. Αν είχατε όντως παραγγελία, θα τη βλέπατε στον λογαριασμό σας στο κατάστημα.',
                    takeaway: 'Δεν θυμάστε την παραγγελία; Είναι απάτη. Μπείτε στο κατάστημα μόνοι σας για να ελέγξετε.'
                },
                {
                    id: 'nbg-statement-legit',
                    channel: 'email',
                    from: 'Εθνική Τράπεζα',
                    fromAddress: 'no-reply@nbg.gr',
                    subject: 'Ο λογαριασμός της κάρτας σας είναι διαθέσιμος',
                    body: 'Σας ενημερώνουμε ότι ο μηνιαίος λογαριασμός της πιστωτικής σας κάρτας είναι διαθέσιμος. Μπορείτε να τον δείτε συνδεόμενοι στο Internet & Mobile Banking, όπως πάντα.',
                    isScam: false,
                    redFlags: [
                        'Αποστολέας από το επίσημο «nbg.gr».',
                        'Δεν ζητά κωδικούς, στοιχεία κάρτας ή IBAN.',
                        'Δεν υπάρχει επείγον ούτε σύνδεσμος που να ζητά στοιχεία — σας κατευθύνει να συνδεθείτε μόνοι σας.'
                    ],
                    explanation:
                        'Τυπική, γνήσια ενημέρωση τράπεζας. Δεν ζητά καμία ενέργεια με στοιχεία· απλώς σας λέει ότι ο λογαριασμός είναι διαθέσιμος στο e-banking.',
                    takeaway: 'Νόμιμο. Συνδεθείτε όπως πάντα, μέσα από την επίσημη εφαρμογή ή πληκτρολογώντας μόνοι σας τη διεύθυνση.'
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module10-lesson8'
    },

    // Lesson 10: Scam-spotter — SMS & μηνύματα ("Απάτη ή Όχι;")
    {
        id: 'module10-lesson10',
        moduleId: 'module10',
        lessonKey: 'scam-spotter-sms',
        titleKey: 'module10_lesson10_title',
        descriptionKey: 'module10_lesson10_desc',
        difficulty: 'intermediate',
        orderIndex: 10,
        lessonType: 'scam-spotter',
        config: {
            instructions: 'Δείτε κάθε μήνυμα στο κινητό και αποφασίστε: είναι απάτη ή νόμιμο;',
            cards: [
                {
                    id: 'deh-cutoff',
                    channel: 'sms',
                    from: 'ΔΕΗ',
                    body: 'ΔΕΗ: Ο λογαριασμός σας είναι ληξιπρόθεσμος. Το ρεύμα θα διακοπεί σήμερα. Πληρώστε άμεσα: deh-pay.gr/ofeili',
                    link: 'deh-pay.gr/ofeili',
                    isScam: true,
                    redFlags: [
                        'Απειλή άμεσης διακοπής «σήμερα» για να σας πανικοβάλει.',
                        'Σύνδεσμος «deh-pay.gr» — όχι το επίσημο dei.gr.',
                        'Η ΔΕΗ ειδοποιεί μέσω λογαριασμού/επιστολής, όχι με SMS που απαιτεί άμεση πληρωμή σε link.'
                    ],
                    explanation:
                        'Smishing που μιμείται τη ΔΕΗ. Ο επείγων τόνος υπάρχει για να μη σταματήσετε να σκεφτείτε. Ο σύνδεσμος οδηγεί σε ψεύτικη σελίδα πληρωμής.',
                    takeaway: 'Ελέγξτε την οφειλή σας μόνοι σας στην επίσημη εφαρμογή/site της ΔΕΗ ή στον έντυπο λογαριασμό.'
                },
                {
                    id: 'family-newnumber',
                    channel: 'sms',
                    from: '+30 698 1234567',
                    body: 'Γεια σου μαμά, χάλασε το κινητό μου και σου γράφω από νέο νούμερο. Έχω ένα επείγον, μπορείς να μου στείλεις 300€ για να πληρώσω έναν λογαριασμό; Θα σου τα επιστρέψω αύριο.',
                    isScam: true,
                    redFlags: [
                        '«Νέο νούμερο» μαζί με άμεσο αίτημα χρημάτων — κλασικό μοτίβο απάτης.',
                        'Πίεση και επείγον («θα σου τα επιστρέψω αύριο»).',
                        'Αποφεύγει τηλεφωνική ή βιντεοκλήση που θα επιβεβαίωνε ποιος είναι.'
                    ],
                    explanation:
                        'Η απάτη «Γεια σου μαμά/μπαμπά». Οι απατεώνες υποδύονται συγγενή που τάχα άλλαξε τηλέφωνο και χρειάζεται επειγόντως χρήματα.',
                    takeaway:
                        'Καλέστε τον πραγματικό αριθμό του παιδιού/συγγενή σας ή ζητήστε βιντεοκλήση πριν στείλετε οποιοδήποτε ποσό.'
                },
                {
                    id: 'bank-otp-legit',
                    channel: 'sms',
                    from: 'NBG',
                    body: 'Ο κωδικός μίας χρήσης (OTP) για τη συναλλαγή σας είναι 481923. Μην τον κοινοποιήσετε σε κανέναν.',
                    isScam: false,
                    redFlags: [
                        'Στέλνει κωδικό OTP, αλλά ΔΕΝ σας ζητά να τον στείλετε πίσω ή να τον δώσετε κάπου.',
                        'Δεν περιέχει σύνδεσμο ούτε απειλή.',
                        'Σας προειδοποιεί ρητά να μην τον κοινοποιήσετε.'
                    ],
                    explanation:
                        'Γνήσιο OTP. Η τράπεζα στέλνει τον κωδικό για να τον πληκτρολογήσετε ΕΣΕΙΣ στη δική σας συναλλαγή. Γίνεται απάτη μόνο αν κάποιος σας ζητήσει να του τον πείτε.',
                    takeaway: 'Νόμιμο. Ποτέ μη δίνετε το OTP σε άτομο που σας καλεί — μόνο εσείς το πληκτρολογείτε.'
                },
                {
                    id: 'invest-scam',
                    channel: 'sms',
                    from: '+44 7700 900123',
                    body: 'Συγχαρητήρια! Επιλεχθήκατε για το πρόγραμμα επενδύσεων. Με μόλις 250€ κερδίστε έως 3.000€ τον μήνα. Εγγραφή εδώ: invest-now-eu.com',
                    link: 'invest-now-eu.com',
                    isScam: true,
                    redFlags: [
                        'Υπόσχεση εύκολου, εγγυημένου κέρδους — δεν υπάρχει στην πραγματικότητα.',
                        'Άγνωστος αριθμός εξωτερικού (+44).',
                        'Πίεση να εγγραφείτε άμεσα σε άγνωστη πλατφόρμα.'
                    ],
                    explanation:
                        'Επενδυτική απάτη. Συχνά συνοδεύεται από ψεύτικα άρθρα με δήθεν δηλώσεις διασήμων για να φανεί αξιόπιστη.',
                    takeaway: 'Καμία νόμιμη επένδυση δεν εγγυάται κέρδη. Αν ακούγεται πολύ καλό για να είναι αληθινό, είναι απάτη.'
                },
                {
                    id: 'courier-customs',
                    channel: 'sms',
                    from: 'ELTA',
                    body: 'ELTA: Το δέμα σας κρατείται στο τελωνείο. Απαιτείται πληρωμή τέλους 2,99€ για παράδοση: elta-gr.info/telos',
                    link: 'elta-gr.info/telos',
                    isScam: true,
                    redFlags: [
                        'Ζητά πληρωμή μικρού «τέλους» μέσω συνδέσμου — τέχνασμα για στοιχεία κάρτας.',
                        'Σύνδεσμος «elta-gr.info» — όχι το επίσημο elta.gr.',
                        'Δεν αναφέρει αριθμό αποστολής· γενικό μήνυμα σταλμένο μαζικά.'
                    ],
                    explanation:
                        'Smishing που μιμείται τα ΕΛΤΑ. Τα τελωνειακά τέλη δεν πληρώνονται ποτέ μέσω συνδέσμου σε SMS προς άγνωστο site.',
                    takeaway: 'Ελέγξτε την αποστολή σας μόνο στο επίσημο site/εφαρμογή της εταιρείας με τον πραγματικό αριθμό αποστολής.'
                },
                {
                    id: 'kok-fine',
                    channel: 'sms',
                    from: '+30 695 0000000',
                    body: 'ΤΡΟΧΑΙΑ: Έχετε ανεξόφλητη κλήση ΚΟΚ. Εξοφλήστε άμεσα για να αποφύγετε προσαύξηση και δικαστική κλήση: e-paravolo-gr.com',
                    link: 'e-paravolo-gr.com',
                    isScam: true,
                    redFlags: [
                        'Απειλή «δικαστικής κλήσης» για να σας τρομάξει.',
                        'Σύνδεσμος «e-paravolo-gr.com» — όχι το επίσημο gov.gr / aade.gr.',
                        'Η Τροχαία δεν στέλνει κλήσεις ΚΟΚ με SMS από προσωπικό κινητό.'
                    ],
                    explanation:
                        'Απάτη που εκμεταλλεύεται τον φόβο του προστίμου. Οι κλήσεις ΚΟΚ και τα παράβολα διεκπεραιώνονται μόνο μέσω gov.gr/ΑΑΔΕ.',
                    takeaway: 'Αμφιβάλλετε; Μπείτε μόνοι σας στο gov.gr — μην πατάτε τον σύνδεσμο του μηνύματος.'
                },
                {
                    id: 'govgr-appointment-legit',
                    channel: 'sms',
                    from: 'gov.gr',
                    body: 'gov.gr: Το ραντεβού σας στο ΚΕΠ επιβεβαιώθηκε για 12/06 στις 10:00. Για αλλαγή, συνδεθείτε στο gov.gr.',
                    isScam: false,
                    redFlags: [
                        'Επιβεβαιώνει ένα ραντεβού που εσείς κλείσατε — δεν ζητά τίποτα.',
                        'Δεν περιέχει ύποπτο σύνδεσμο ούτε αίτημα για κωδικούς/χρήματα.',
                        'Δεν υπάρχει επείγον ή απειλή.'
                    ],
                    explanation:
                        'Γνήσια ενημερωτική επιβεβαίωση ραντεβού. Δεν ζητά καμία ενέργεια με προσωπικά στοιχεία.',
                    takeaway: 'Νόμιμο. Αν θέλετε αλλαγή, μπείτε μόνοι σας στο gov.gr αντί να απαντήσετε στο μήνυμα.'
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module10-lesson9'
    },
    // Lesson 11: Scam-spotter — Viber / μηνύματα ("Απάτη ή Όχι;")
    {
        id: 'module10-lesson11',
        moduleId: 'module10',
        lessonKey: 'scam-spotter-viber',
        titleKey: 'module10_lesson11_title',
        descriptionKey: 'module10_lesson11_desc',
        difficulty: 'intermediate',
        orderIndex: 11,
        lessonType: 'scam-spotter',
        config: {
            instructions: 'Μηνύματα σε Viber/WhatsApp. Είναι απάτη ή νόμιμο;',
            cards: [
                {
                    id: 'viber-hi-mom',
                    channel: 'viber',
                    from: '+30 698 0000000 (άγνωστος)',
                    body: 'Γεια σου μαμά, χάλασε το κινητό μου και σου γράφω από καινούριο αριθμό. Έχω ένα πρόβλημα και πρέπει να πληρώσω έναν λογαριασμό σήμερα, αλλά δεν μπαίνει το e-banking μου. Μπορείς να μου στείλεις 850€ τώρα; Θα σου τα δώσω αύριο.',
                    isScam: true,
                    redFlags: [
                        'Άγνωστος αριθμός που ισχυρίζεται ότι είναι το παιδί σας.',
                        'Δικαιολογία «χάλασε το κινητό μου» για τον νέο αριθμό.',
                        'Επείγον αίτημα για χρήματα «σήμερα/τώρα».',
                        'Σας πιέζει συναισθηματικά για να μη σκεφτείτε λογικά.'
                    ],
                    explanation:
                        'Κλασική απάτη «Γεια σου μαμά». Οι απατεώνες υποδύονται συγγενή από νέο αριθμό και ζητούν επείγουσα μεταφορά χρημάτων.',
                    takeaway:
                        'Πάρτε τηλέφωνο το παιδί σας στον ΓΝΩΣΤΟ του αριθμό για επιβεβαίωση. Ποτέ μη στέλνετε χρήματα μόνο από ένα μήνυμα.'
                },
                {
                    id: 'viber-verification-code',
                    channel: 'viber',
                    from: 'Νίκος (επαφή)',
                    body: 'Φίλε, κατά λάθος έβαλα το δικό σου νούμερο για να φτιάξω τον λογαριασμό μου και μου ήρθε ένας 6-ψήφιος κωδικός στο δικό σου κινητό. Μου τον στέλνεις να ξεμπερδέψω;',
                    isScam: true,
                    redFlags: [
                        'Ζητά κωδικό επιβεβαίωσης (OTP) που ήρθε στο ΔΙΚΟ σας κινητό.',
                        'Ακόμη κι αν φαίνεται γνωστή επαφή, ο λογαριασμός μπορεί να έχει παραβιαστεί.',
                        'Κανείς δεν χρειάζεται «κατά λάθος» τον δικό σας κωδικό.'
                    ],
                    explanation:
                        'Έτσι κλέβουν λογαριασμούς Viber/WhatsApp: ο κωδικός που ήρθε σε εσάς είναι για να συνδεθούν ΕΚΕΙΝΟΙ ως εσείς. Συχνά το μήνυμα έρχεται από ήδη χακαρισμένο λογαριασμό φίλου.',
                    takeaway: 'Ποτέ μη δίνετε κωδικούς επιβεβαίωσης σε κανέναν — ούτε σε φίλους.'
                },
                {
                    id: 'viber-invest',
                    channel: 'viber',
                    from: '+44 7700 000000 (άγνωστος)',
                    body: 'Καλησπέρα! Είμαι σύμβουλος επενδύσεων. Με μόλις 250€ σε κρυπτονομίσματα εγγυημένα κέρδη 3.000€ τον μήνα. Η ομάδα μας έχει 100% επιτυχία. Θέλετε να ξεκινήσετε σήμερα; Στείλτε «ΝΑΙ».',
                    link: 'https://crypto-profit-gr.live',
                    isScam: true,
                    redFlags: [
                        '«Εγγυημένα κέρδη» — καμία πραγματική επένδυση δεν τα εγγυάται.',
                        'Άγνωστος αριθμός εξωτερικού (+44).',
                        'Υπερβολικές αποδόσεις (250€ → 3.000€/μήνα).',
                        'Πίεση για άμεση απόφαση.'
                    ],
                    explanation:
                        'Επενδυτική απάτη — από τις πιο διαδεδομένες στην Ελλάδα. Παίρνουν την «επένδυση» και εξαφανίζονται, ή σας δείχνουν ψεύτικα κέρδη για να βάλετε κι άλλα.',
                    takeaway: 'Αν ακούγεται πολύ καλό για να είναι αληθινό, είναι απάτη. Καμία σοβαρή επένδυση δεν εγγυάται κέρδη.'
                },
                {
                    id: 'viber-prize',
                    channel: 'viber',
                    from: 'ΔΩΡΟΕΠΙΤΑΓΗ (άγνωστος)',
                    body: '🎉 Συγχαρητήρια! Επιλεχθήκατε για δωροεπιταγή 500€ από γνωστή αλυσίδα σούπερ μάρκετ! Συμπληρώστε τη σύντομη φόρμα για να την παραλάβετε. Μόνο για σήμερα!',
                    link: 'https://super-market-dwro.gr-offer.net',
                    isScam: true,
                    redFlags: [
                        'Δεν λάβατε μέρος σε κανέναν διαγωνισμό.',
                        'Σύνδεσμος με περίεργη κατάληξη («.gr-offer.net»).',
                        'Πίεση «μόνο για σήμερα».',
                        'Emoji και υπερβολικός ενθουσιασμός.'
                    ],
                    explanation:
                        'Απομίμηση γνωστής μάρκας (brand counterfeiting). Η φόρμα ζητά προσωπικά στοιχεία ή στοιχεία κάρτας «για τα έξοδα αποστολής».',
                    takeaway: 'Δεν κερδίζετε δώρα σε διαγωνισμούς που δεν δηλώσατε. Διαγράψτε το.'
                },
                {
                    id: 'viber-vote',
                    channel: 'viber',
                    from: 'Μαρία (επαφή)',
                    body: 'Καλημέρα! Η ανιψιά μου παίρνει μέρος σε διαγωνισμό χορού. Ψήφισέ την εδώ, πατάς απλά το λινκ και κάνεις σύνδεση με το Facebook σου. Ευχαριστώ πολύ! ❤️',
                    link: 'https://facebook-vote-contest.com',
                    isScam: true,
                    redFlags: [
                        'Ζητά να «συνδεθείτε με Facebook» σε εξωτερικό σύνδεσμο.',
                        'Το domain δεν είναι το πραγματικό facebook.com.',
                        'Μπορεί να έρχεται από παραβιασμένο λογαριασμό φίλης.'
                    ],
                    explanation:
                        'Η σελίδα κλέβει τους κωδικούς Facebook σας. Μετά στέλνει το ίδιο μήνυμα στους δικούς σας φίλους από τον δικό σας λογαριασμό.',
                    takeaway: 'Μη βάζετε ποτέ κωδικούς κοινωνικών δικτύων σε σελίδες που ανοίγουν από λινκ μηνύματος.'
                },
                {
                    id: 'viber-romance',
                    channel: 'viber',
                    from: '+1 202 000 0000 (άγνωστος)',
                    body: 'Αγάπη μου, σε σκέφτομαι συνέχεια. Είμαι μηχανικός σε εξέδρα πετρελαίου και θέλω να έρθω να σε γνωρίσω, αλλά μπλόκαραν τα χρήματά μου στο τελωνείο. Μπορείς να στείλεις 1.200€ για να ελευθερωθούν; Θα σ’ τα επιστρέψω χιλιαπλάσια.',
                    isScam: true,
                    redFlags: [
                        'Άγνωστος από το εξωτερικό που εκφράζει γρήγορα «έρωτα».',
                        'Ποτέ δεν έχετε συναντηθεί από κοντά.',
                        'Ζητά χρήματα για «μπλοκαρισμένα» κεφάλαια/τελωνείο.',
                        'Υπόσχεται να τα επιστρέψει πολλαπλάσια.'
                    ],
                    explanation:
                        'Ρομαντική απάτη (romance scam). Χτίζουν συναισθηματική σχέση εξ αποστάσεως και μετά εφευρίσκουν «έκτακτη ανάγκη» που χρειάζεται χρήματα.',
                    takeaway: 'Ποτέ μη στέλνετε χρήματα σε κάποιον που δεν έχετε γνωρίσει από κοντά.'
                },
                {
                    id: 'viber-friend-legit',
                    channel: 'viber',
                    from: 'Ελένη (επαφή)',
                    body: 'Καλησπέρα! Τελικά θα τα πούμε αύριο στις 6 για καφέ; Πες μου αν σε βολεύει το ίδιο μαγαζί όπως την προηγούμενη φορά. 😊',
                    isScam: false,
                    redFlags: [
                        'Μήνυμα από αποθηκευμένη, γνωστή επαφή.',
                        'Δεν ζητά χρήματα, κωδικούς ή κλικ σε σύνδεσμο.',
                        'Αναφέρεται σε κοινό σας πλαίσιο (προηγούμενη φορά).'
                    ],
                    explanation:
                        'Φυσιολογικό προσωπικό μήνυμα από φίλη. Δεν υπάρχει κανένα ύποπτο αίτημα.',
                    takeaway: 'Νόμιμο. Αν όμως ξαφνικά ζητούσε χρήματα ή κωδικό, θα άξιζε ένα τηλεφώνημα επιβεβαίωσης.'
                },
                {
                    id: 'viber-order-legit',
                    channel: 'viber',
                    from: 'Φαρμακείο Παπαδοπούλου',
                    body: 'Καλημέρα σας. Η παραγγελία σας είναι έτοιμη για παραλαβή από το φαρμακείο. Ωράριο: 8:00–21:00. Δεν χρειάζεται καμία πληρωμή ή στοιχείο εκ των προτέρων.',
                    isScam: false,
                    redFlags: [
                        'Από επιχείρηση που γνωρίζετε και συναλλαχθήκατε.',
                        'Δεν ζητά πληρωμή ή προσωπικά στοιχεία μέσω μηνύματος.',
                        'Δεν υπάρχει επείγον ή σύνδεσμος.'
                    ],
                    explanation:
                        'Γνήσια ειδοποίηση παραλαβής. Σας ενημερώνει χωρίς να ζητά τίποτα ευαίσθητο.',
                    takeaway: 'Νόμιμο. Σε αμφιβολία, καλέστε το φαρμακείο στο γνωστό του τηλέφωνο.'
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module10-lesson10'
    },
    // Lesson 12: Scam-spotter — Τηλεφωνικές κλήσεις / vishing ("Απάτη ή Όχι;")
    {
        id: 'module10-lesson12',
        moduleId: 'module10',
        lessonKey: 'scam-spotter-phone',
        titleKey: 'module10_lesson12_title',
        descriptionKey: 'module10_lesson12_desc',
        difficulty: 'advanced',
        orderIndex: 12,
        lessonType: 'scam-spotter',
        config: {
            instructions: 'Τηλεφωνικές κλήσεις. Ακούστε τι ζητά ο/η καλών — απάτη ή νόμιμο;',
            cards: [
                {
                    id: 'phone-bank-otp',
                    channel: 'phone',
                    from: 'Εθνική Τράπεζα',
                    fromAddress: '+30 210 4848484 (εμφανίζεται)',
                    body: 'Καλησπέρα σας, σας καλώ από το Τμήμα Ασφαλείας της τράπεζας. Εντοπίσαμε ύποπτη συναλλαγή 740€ στην κάρτα σας. Για να την ακυρώσω άμεσα, διαβάστε μου τον 6-ψήφιο κωδικό OTP που μόλις σας ήρθε με SMS.',
                    isScam: true,
                    redFlags: [
                        'Σας ζητά να πείτε τον κωδικό OTP — η τράπεζα ΠΟΤΕ δεν το κάνει.',
                        'Ο αριθμός που εμφανίζεται μπορεί να είναι πλαστός (Caller ID spoofing).',
                        'Δημιουργεί πανικό («ύποπτη συναλλαγή») για άμεση αντίδραση.'
                    ],
                    explanation:
                        'Vishing με πλαστό αριθμό. Ο κωδικός OTP που σας ήρθε εγκρίνει τη ΔΙΚΗ ΤΟΥΣ συναλλαγή — γι’ αυτό τον θέλουν. Η τράπεζα δεν τον ζητά ποτέ τηλεφωνικά.',
                    takeaway:
                        'Κλείστε το τηλέφωνο. Καλέστε εσείς την τράπεζα στον αριθμό που γράφει η κάρτα σας. Ποτέ μην πείτε OTP σε κανέναν.'
                },
                {
                    id: 'phone-tech-support',
                    channel: 'phone',
                    from: 'Microsoft Support',
                    fromAddress: '+1 800 000 000 (εξωτερικό)',
                    body: 'Hello, this is Microsoft technical support. Ο υπολογιστής σας έστειλε σήμα ότι έχει μολυνθεί με ιό. Πρέπει να εγκαταστήσετε τώρα μια εφαρμογή που θα σας στείλω, για να αποκτήσω πρόσβαση και να τον καθαρίσω.',
                    isScam: true,
                    redFlags: [
                        'Η Microsoft δεν τηλεφωνεί ποτέ για «ιούς» στον υπολογιστή σας.',
                        'Ζητά να εγκαταστήσετε εφαρμογή απομακρυσμένης πρόσβασης.',
                        'Κλήση από εξωτερικό, συχνά με σπαστά αγγλικά/ελληνικά.'
                    ],
                    explanation:
                        'Απάτη τεχνικής υποστήριξης. Με την απομακρυσμένη πρόσβαση κλέβουν αρχεία, κωδικούς και χρήματα από το e-banking.',
                    takeaway: 'Καμία εταιρεία δεν σας καλεί για ιούς. Κλείστε αμέσως και μην εγκαταστήσετε τίποτα.'
                },
                {
                    id: 'phone-aade-debt',
                    channel: 'phone',
                    from: 'ΑΑΔΕ / Εφορία',
                    fromAddress: 'Απόκρυψη αριθμού',
                    body: 'Έχετε ληξιπρόθεσμη οφειλή 1.250€ προς την εφορία. Αν δεν πληρώσετε εντός 2 ωρών μέσω της εφαρμογής που θα σας υποδείξω, θα παγώσει ο τραπεζικός σας λογαριασμός και θα ασκηθεί δίωξη.',
                    isScam: true,
                    redFlags: [
                        'Απόκρυψη αριθμού.',
                        'Απειλή «πάγωμα λογαριασμού/δίωξη» σε 2 ώρες.',
                        'Ζητά πληρωμή μέσω «εφαρμογής που θα υποδείξω».'
                    ],
                    explanation:
                        'Η ΑΑΔΕ δεν απαιτεί πληρωμές τηλεφωνικά με απειλές και προθεσμίες λίγων ωρών. Οι οφειλές φαίνονται και εξοφλούνται μόνο μέσα από το myAADE/gov.gr.',
                    takeaway: 'Κλείστε. Ελέγξτε μόνοι σας τυχόν οφειλές στο myAADE — ποτέ μέσω τηλεφώνου.'
                },
                {
                    id: 'phone-lottery',
                    channel: 'phone',
                    from: 'Άγνωστος',
                    fromAddress: '+30 695 0000000',
                    body: 'Συγχαρητήρια! Κερδίσατε αυτοκίνητο σε κλήρωση! Για να το παραλάβετε, πρέπει πρώτα να καταβάλετε τα τέλη μεταβίβασης, 450€, με κάρτα ή μεταφορά. Δώστε μου τον αριθμό της κάρτας σας.',
                    isScam: true,
                    redFlags: [
                        'Δεν λάβατε μέρος σε καμία κλήρωση.',
                        'Ζητά να πληρώσετε για να «παραλάβετε» κέρδος.',
                        'Ζητά αριθμό κάρτας στο τηλέφωνο.'
                    ],
                    explanation:
                        'Απάτη λαχειοφόρου. Κανένα νόμιμο δώρο δεν απαιτεί προπληρωμή ή τα στοιχεία της κάρτας σας.',
                    takeaway: 'Αν πρέπει να πληρώσετε για να «κερδίσετε», είναι απάτη. Μη δίνετε ποτέ στοιχεία κάρτας τηλεφωνικά.'
                },
                {
                    id: 'phone-bank-callback-legit',
                    channel: 'phone',
                    from: 'Τράπεζα Πειραιώς',
                    fromAddress: '+30 210 3288000',
                    body: 'Καλησπέρα σας. Σας ενημερώνουμε ότι λήγει η κάρτα σας τον επόμενο μήνα και η νέα έχει αποσταλεί στο υποκατάστημά σας. Δεν χρειάζεται καμία ενέργεια από εσάς. Αν έχετε απορία, καλέστε μας στο τηλέφωνο που αναγράφεται στην κάρτα σας.',
                    isScam: false,
                    redFlags: [
                        'Δεν ζητά κωδικούς, OTP ή στοιχεία κάρτας.',
                        'Δεν υπάρχει επείγον ή απειλή.',
                        'Σας παραπέμπει να καλέσετε ΕΣΕΙΣ στο επίσημο τηλέφωνο.'
                    ],
                    explanation:
                        'Γνήσια ενημερωτική κλήση. Δεν ζητά καμία ευαίσθητη ενέργεια — απλώς ενημερώνει.',
                    takeaway: 'Νόμιμο. Σε κάθε αμφιβολία, κλείνετε και καλείτε εσείς το επίσημο τηλέφωνο της τράπεζας.'
                },
                {
                    id: 'phone-doctor-legit',
                    channel: 'phone',
                    from: 'Διαγνωστικό Κέντρο',
                    fromAddress: '+30 2310 000000',
                    body: 'Καλημέρα σας, σας καλούμε για να επιβεβαιώσουμε το ραντεβού σας για αιματολογικές αύριο στις 9:00. Παρακαλούμε να είστε νηστικός/ή. Θα θέλατε να το κρατήσουμε;',
                    isScam: false,
                    redFlags: [
                        'Αφορά ραντεβού που εσείς κλείσατε.',
                        'Δεν ζητά χρήματα, κωδικούς ή στοιχεία κάρτας.',
                        'Απλή επιβεβαίωση χωρίς πίεση.'
                    ],
                    explanation:
                        'Φυσιολογική κλήση επιβεβαίωσης ραντεβού. Δεν υπάρχει κανένα ύποπτο αίτημα.',
                    takeaway: 'Νόμιμο. Αν δεν θυμάστε το ραντεβού, καλέστε εσείς το κέντρο στο γνωστό του τηλέφωνο.'
                }
            ]
        },
        enabled: true,
        requiredLessonId: 'module10-lesson11'
    }
];
