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
    }
];
