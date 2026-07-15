# Σχέδιο: Αναδιοργάνωση μαθημάτων ανά συσκευή + ρεαλιστικοί simulators

*2026-07-15. Εκτελεί τη Φάση 2 του [ROADMAP.md](ROADMAP.md). Βασίζεται σε πλήρες audit των 156 μαθημάτων + έρευνα Grok (live search) σε GCFGlobal, DigitalLearn, Senior Planet, Εθνική Ακαδημία Ψηφιακών Ικανοτήτων.*

## 1. Audit υπάρχοντος περιεχομένου

16 modules, 156 lessons. Κατανομή ανά «πραγματική» συσκευή:

| Ομάδα | Modules | Κατάσταση |
|---|---|---|
| Είσοδος (ποντίκι/πληκτρολόγιο) | module1, module2 | Universal desktop, ΑΛΛΑ οι συντομεύσεις (Ctrl+C, Alt+Shift, F-keys) είναι Windows-flavored |
| Windows-only | module3 (Win11 UI), module9 (Ρυθμίσεις/Settings sim), module4 (File Explorer sim) | Σωστά δεμένα με το Windows desktop simulation |
| Παραγωγικότητα | word, module7 (Excel) | Generic office UI — δουλεύει και ως «Mac» εννοιολογικά, αλλά το chrome είναι Windows |
| Universal έννοιες | module5, module6, module8, module10, module11, module12, module13 | Σωστά universal· τα sims τρέχουν σε desktop frame |
| Mobile tracks | android (1 μάθημα), iphone (1 μάθημα) | Ουσιαστικά κενά — το κρισιμότερο κενό για το κοινό (ΚΑΠΗ) |
| Mac | — | Μηδέν περιεχόμενο, παρότι τα moduleDevices tags υπόσχονται mac σε 5 modules |

### Ευρήματα (τι διορθώνουμε)

- **A1 — Ψευδές mac tagging**: `moduleDevices` λέει ότι module1/2/4/7/word ισχύουν για Mac. Για τα module2 (Ctrl/Alt+Shift) και module4 (Windows Explorer UI) αυτό είναι παραπλανητικό. Διόρθωση tags + πραγματικό Mac track.
- **A2 — Windows περιεχόμενο διάσπαρτο**: module3/module9 είναι Windows-only αλλά εμφανίζονται σε γενικές κατηγορίες («Τα πρώτα βήματα», «Ψηφιακή ζωή»). Θέλουν δική τους κατηγορία «Windows υπολογιστής».
- **A3 — Χαμηλής αξίας μαθήματα**: module1 lessons 8–10 («Γρήγορο Κλικ», «Ακολουθήστε το Σχήμα», «Κλικ με Μοτίβο») είναι arcade-style εξάσκηση χωρίς νέο skill — γίνονται προαιρετική υποενότητα «Επιπλέον εξάσκηση» (όχι διαγραφή — non-destructive, κρατάμε πρόοδο). Το module1-lesson8 έχει και mismatch τίτλου/τύπου (drag με τίτλο «Γρήγορο Κλικ») — έλεγχος/διόρθωση.
- **A4 — Mobile tracks κενά**: 1 μάθημα ανά track έναντι ~12 που διδάσκουν τα αντίστοιχα curricula (βλ. §2).
- **A5 — Αταξινόμητα readings**: τα ΕΑΨΙ readings μπαίνουν με orderIndex -1000 μπροστά από κάθε module· σε modules με 7 readings (module8, module9) ο μαθητής βλέπει τοίχο θεωρίας πριν από κάθε πράξη. Λύση: υποενότητες «Θεωρία» / «Εξάσκηση» μέσω `moduleSections` (υπάρχων μηχανισμός, μηδέν migration).

## 2. Έρευνα: τι διδάσκουν τα αυθεντικά curricula

**Πηγές**: GCFGlobal Windows Basics· DigitalLearn «Using a PC (Windows)», «Mobile Device Basics — Android/iOS», «QR Code Basics»· Senior Planet (AARP/OATS) «Computer Essentials», «Getting to Know Your Android Smartphone», «Intro to Smartphone Photography», «Managing Privacy Settings»· Εθνική Ακαδημία Ψηφιακών Ικανοτήτων (μονοπάτι «Ψηφιακός Πολίτης»).

**Κοινή σειρά διδασκαλίας (desktop)**: hardware/εκκίνηση → πλοήγηση OS → αρχεία/φάκελοι → internet+email → ασφάλεια → παραγωγικότητα → προσαρμογή/επίλυση προβλημάτων. ✅ Η υπάρχουσα σειρά modules μας ταιριάζει ήδη — δεν αλλάζουμε αρίθμηση, μόνο κατηγοριοποίηση.

**Κοινή σειρά διδασκαλίας (smartphone, seniors)** — προτεραιότητες σε ΟΛΑ τα προγράμματα:
1. Γνωριμία με τη συσκευή: αφή/χειρονομίες, αρχική οθόνη, φόρτιση, Wi-Fi
2. Επικοινωνία: κλήσεις, επαφές, SMS, βιντεοκλήσεις, WhatsApp/Viber (στην Ελλάδα: Viber πρώτα)
3. Κάμερα & φωτογραφίες: λήψη, προβολή, κοινοποίηση στην οικογένεια
4. Εφαρμογές: Play Store/App Store, εγκατάσταση, ενημερώσεις, QR codes
5. Ασφάλεια: ρυθμίσεις (γράμματα/ένταση), απόρρητο, scam SMS/κλήσεις

**macOS για αρχάριους** (Apple «Mac tips for Windows switchers», Mac User Guide, GCFGlobal macOS Basics): οι διαφορές που δικαιολογούν ξεχωριστά μαθήματα είναι Dock (≠taskbar), Finder (≠File Explorer), Menu bar πάνω, System Settings, trackpad gestures, Spotlight (Cmd+Space), Cmd αντί Ctrl, και — το πιο σημαντικό για switchers — ότι **το κόκκινο X κλείνει το παράθυρο αλλά ΟΧΙ την εφαρμογή** (Cmd+Q). Προτεινόμενη σειρά: γνωριμία → Dock/άνοιγμα εφαρμογών → παράθυρα (traffic lights, quit) → Finder → Spotlight → System Settings → Cmd συντομεύσεις.

**Best practices simulators** (WCAG, elder-UX research, GCFGlobal pattern): πιστότητα **low-to-medium** (αναγνωρίσιμες θέσεις/ροές, όχι φωτορεαλισμός — μειώνει cognitive load)· **guided πρώτα, free practice μετά** (hybrid scaffolding)· υψηλή ανοχή λάθους (πολλαπλές προσπάθειες, ήπια μηνύματα, ποτέ τερματισμός σε λάθος)· touch targets ≥48px με spacing, κείμενο ≥16px scalable, contrast ≥4.5:1.

## 3. Νέα οργάνωση (config-only, non-destructive)

`moduleCategories` (αρχική σελίδα):

| Κατηγορία | Modules |
|---|---|
| Τα πρώτα βήματα (κάθε υπολογιστής) | module1, module2 |
| Windows υπολογιστής | module3, module4, module9 |
| Mac υπολογιστής | mac *(νέο)* |
| Κινητό & Tablet | android, iphone |
| Διαδίκτυο & Επικοινωνία | module5, module6, module11 |
| Εφαρμογές γραφείου | word, module7 |
| Ασφάλεια & Προστασία | module8, module10 |
| Ψηφιακή ζωή & υπηρεσίες | module12, module13 |

`moduleDevices` διορθώσεις: module4 → `['windows']`· mac → `['mac']`· τα module2 κρατούν `['windows','mac']` αλλά οι Windows-specific συντομεύσεις παίρνουν υποενότητα «Συντομεύσεις Windows» (και το Mac track αποκτά δικό του μάθημα Cmd-συντομεύσεων).

`moduleSections` προσθήκες: Θεωρία/Εξάσκηση για module5, module8, module9, module11, module12· «Επιπλέον εξάσκηση» για module1.

## 4. Mobile: simulator v2 + πλήρη tracks

### Simulator (πώς «φαίνεται» το κινητό)

Το `MobileFrame` (bezel + status bar + home indicator) είναι καλή βάση. Προσθήκες για ρεαλισμό:

1. **`MobileHomeScreen.svelte`** — wallpaper, πλέγμα εικονιδίων 4×N, dock 4 εφαρμογών κάτω (όπως πραγματικό Android/iOS), ονόματα κάτω από τα εικονίδια, ώρα/ημερομηνία widget (Android) ή σκέτο grid (iOS). Εικονίδια: στυλιζαρισμένα rounded tiles με emoji/lucide — ΟΧΙ πιστά αντίγραφα brand icons (trademark + συντήρηση), αλλά σωστά σχήματα: Android=κυκλικά, iOS=rounded squares (squircle-ish).
2. **Mini-apps μέσα στο frame** (αντίστοιχο των desktop apps): `PhoneApp` (dialer με μεγάλα πλήκτρα + επαφές), `MessagesApp` (λίστα συνομιλιών + σύνθεση), `ChatApp` (Viber-like), `CameraApp` (mock viewfinder + κουμπί λήψης), `GalleryApp` (πλέγμα φωτό + κουμπί κοινοποίησης), `MobileSettingsApp` (λίστα ρυθμίσεων: μέγεθος γραμμάτων slider, Wi-Fi toggle+λίστα δικτύων, ένταση), `StoreApp` (Play Store/App Store lite: αναζήτηση → Εγκατάσταση → Άνοιγμα).
3. **Νέο lessonType `mobile-sim`** — goal-driven όπως το `desktop-simulation`: config `{ goal, variant, initialApp?, ... }`, goals στο υπάρχον registry (`goals.ts` + `goalHandlers.ts` + tests). Νέα goals: `mobile-open-app`, `mobile-dial-number`, `mobile-call-contact`, `mobile-send-sms`, `mobile-send-chat`, `mobile-take-photo`, `mobile-share-photo`, `mobile-change-font-size`, `mobile-connect-wifi`, `mobile-install-app`, `mobile-scan-qr`.
4. Το υπάρχον `mobile-tap` μένει ως έχει (backward compat) — τα νέα μαθήματα πάνε σε `mobile-sim`.

### Android track (στόχος: 12 μαθήματα + 1 reading)

1. [reading] Γνωριμία με το Android: οθόνη, χειρονομίες, κουμπιά
2. [mobile-tap] Βρες και άνοιξε εφαρμογή *(υπάρχον, αναβαθμισμένο σε home screen v2)*
3. [mobile-sim] Κάλεσε αριθμό από το πληκτρολόγιο
4. [mobile-sim] Βρες επαφή και κάλεσέ την
5. [mobile-sim] Στείλε SMS
6. [mobile-sim] Στείλε μήνυμα στο Viber
7. [mobile-sim] Τράβηξε φωτογραφία
8. [mobile-sim] Δες και μοίρασε φωτογραφία (Viber)
9. [mobile-sim] Μεγάλωσε τα γράμματα (Ρυθμίσεις)
10. [mobile-sim] Συνδέσου σε Wi-Fi
11. [mobile-sim] Εγκατάσταση εφαρμογής από το Play Store
12. [mobile-sim] Σκανάρισμα QR code
13. [scam-spotter] Απάτη ή όχι; SMS στο κινητό *(mobile-framed παραλλαγή του υπάρχοντος)*

### iPhone track

Ίδια δομή με iOS variant (FaceTime αντί για απλή βιντεοκλήση, App Store αντί Play Store, iOS Ρυθμίσεις). Κοινά components, `variant: 'ios'` — μόνο τα seeds/κείμενα διαφέρουν.

## 4β. Επίπεδα μέσα στα mobile tracks (απλό → σύνθετο)

Απαίτηση: **απλό επίπεδο για απλούς χρήστες** και σταδιακά πιο σύνθετα/ενδιαφέροντα (ρυθμίσεις, AI βοηθός). Υλοποίηση χωρίς migration, με τους υπάρχοντες μηχανισμούς (`difficulty` + `moduleSections` positional counts):

| Section (module page) | Δυσκολία | Μαθήματα |
|---|---|---|
| **Βασικά — πρώτα βήματα** | beginner | 1 άνοιγμα εφαρμογής, 2 κλήση αριθμού, 3 κλήση επαφής, 4 SMS, 5 Viber, 6 γράμματα, 7 Wi-Fi |
| **Καθημερινή χρήση** | intermediate | βιντεοκλήση Viber, screenshot με τα «κουμπιά» της συσκευής, κλείσιμο κολλημένης εφαρμογής, νυχτερινή λειτουργία, σκανάρισμα QR, φωτογραφία+κοινοποίηση |
| **Πιο προχωρημένα & AI** | advanced | AI βοηθός (ξυπνητήρι/υπενθύμιση χαπιών/μήνυμα με φωνή), «ρώτα το AI σωστά», Εύρεση συσκευής, Google Photos backup, ενημερώσεις εφαρμογών, Private DNS/λιγότερες διαφημίσεις |

### Αποφάσεις από Codex ideation review (2026-07-15)

🤝 **codex:** κατεύθυνση σωστή (~8.5/10)· υιοθετήθηκαν: **(α) capability matrix αντί για τυφλή συμμετρία Android/iPhone** (π.χ. screenshot: Power+VolDown σε Android, Side+VolUp σε iPhone· βοηθός: Gemini/Siri διαφέρουν — parity μόνο όπου το capability είναι όντως κοινό), **(β) section ≠ difficulty** (το section λέει «πού είμαι στη διαδρομή», το difficulty «πόσο απαιτητικό είναι»), **(γ) στόχος 4 sections × 5 μαθήματα**: Βασικά / Καθημερινά / Ρυθμίσεις & βοήθεια / Έξυπνα & ασφάλεια — τα κενά sections δεν εμφανίζονται μέχρι να γεμίσουν, **(δ) semantics ολοκλήρωσης module**: όταν προστεθούν νέα μαθήματα, όποιος είχε 7/7 πρέπει να βλέπει «Ολοκληρώθηκε η βασική διαδρομή» και τα νέα ως συνέχεια — όχι «7/20, ημιτελές» (θέλει contract test πριν μεγαλώσουν τα tracks), **(ε) ο AI βοηθός ονομάζεται «Ψηφιακός βοηθός»** (όχι «Hey Google» — το Android μεταβαίνει σε Gemini, με περιορισμούς στα ελληνικά· στο iPhone δεν είναι system assistant), **(στ) sections ως ordered lesson-IDs με παραγόμενα counts** (όχι χειροκίνητα positional) όταν μπουν τα waves. — **Η θέση μου:** συμφωνώ σε όλα· διαφώνησα μόνο στο να μπει appId σε κάθε semantic event — αντ' αυτού ο validator εγγυάται μοναδικό functional kind ανά config (ίδια εγγύηση, μηδέν πρόσθετη πολυπλοκότητα).

## 4γ. Wave 3 — μαθήματα από τον «Οδηγό Τσέπης» (digital tips PDF)

Υποψήφια διαδραστικά μαθήματα (όχι reading) από τα tips, με εφικτότητα:

| Μάθημα | Goal (νέο) | Mini-app | Δυσκολία | Κόστος |
|---|---|---|---|---|
| Screenshot: Power+Vol− μαζί | `mobile-screenshot` ← `mobile-screenshot-taken` | Κουμπιά πάνω στο MobileFrame bezel | Μέτριο | Φθηνό |
| Κλείσε κολλημένη εφαρμογή | `mobile-force-close` ← `mobile-app-force-closed{appId}` | RecentApps view (κάρτες + σύρσιμο/Χ) | Μέτριο | Φθηνό |
| Βιντεοκλήση στο Viber | `mobile-start-videocall` ← `mobile-videocall-started{conversationId}` | κουμπί 📹 στο MessagingApp header | Μέτριο | Φθηνό |
| Νυχτερινή λειτουργία | `mobile-night-mode` ← `mobile-night-mode-set{on}` | MobileSettingsApp νέα σελίδα | Μέτριο | Φθηνό |
| Σκανάρισμα QR | `mobile-scan-qr` ← `mobile-qr-scanned` | CameraApp mock (viewfinder με QR) | Μέτριο | Μέτριο |
| AI βοηθός: ξυπνητήρι | `mobile-assistant-task{intent:'alarm'}` ← `mobile-assistant-command` | AssistantApp: μεγάλο μικρόφωνο + **chips επιλογής φράσης** (τίμια προσομοίωση φωνής χωρίς μικρόφωνο) | Προχωρ. | Μέτριο |
| AI βοηθός: υπενθύμιση χαπιών | ίδιο goal, `intent:'reminder'` | AssistantApp | Προχωρ. | Φθηνό μετά το πρώτο |
| Ρώτα το AI σωστά | επιλογή καλύτερης διατύπωσης (quiz μέσα σε chat UI) | AssistantApp/quiz | Προχωρ. | Φθηνό |
| Εύρεση συσκευής ON | `mobile-find-device` ← toggle event | MobileSettingsApp (βαθύτερο path + αναζήτηση ρύθμισης) | Προχωρ. | Φθηνό |
| Google Photos backup | `mobile-backup-on` | GalleryApp settings | Προχωρ. | Μέτριο |
| Ενημέρωση εφαρμογής | `mobile-update-app` | StoreApp lite | Προχωρ. | Μέτριο |
| Δημόσιο WiFi & τράπεζα (σενάριο) | quiz/scam-spotter variant | — | Προχωρ. | Φθηνό |

Αρχές για τα «φωνητικά»: χωρίς πραγματικό μικρόφωνο — ο μαθητής **διαλέγει τι θα έλεγε** (chips με 2-3 φράσεις, μία σωστά διατυπωμένη)· έτσι διδάσκεται η διατύπωση, που είναι και το πραγματικό ζητούμενο των curricula για AI.

**Γνωστό εκκρεμές (codex diff review)**: το module2 είναι tagged windows+mac αλλά η ενότητα «Συντομεύσεις Windows & ταχύτητα» είναι Windows-only. Λύνεται στο Mac track (B7): Cmd-παραλλαγές μαθημάτων + per-lesson device tags αν χρειαστεί. Μέχρι τότε το section label το δηλώνει ρητά.

## 5. Mac: simulator + track (νέο module `mac`)

### Simulator

- **`MacDesktop.svelte`** — menu bar πάνω (λογότυπο-placeholder, μενού εφαρμογής, ρολόι/Wi-Fi δεξιά), Dock κάτω (μεγεθυνόμενα εικονίδια, ένδειξη ανοιχτής εφαρμογής), wallpaper.
- **`MacWindow.svelte`** — traffic lights (κόκκινο/κίτρινο/πράσινο) πάνω-αριστερά· wrap του υπάρχοντος window content ώστε τα desktop apps (Finder-like FileExplorer, Browser, Word, Settings) να ξαναχρησιμοποιούνται.
- **Νέο lessonType `mac-simulation`** — ίδιο pattern με `desktop-simulation`, νέα goals: `mac-open-from-dock`, `mac-close-window`, `mac-quit-app` (η διαφορά κλείσιμο≠έξοδος — το πιο σημαντικό mac-specific μάθημα), `mac-spotlight-search`, `mac-menu-bar-action`.

### Mac track (στόχος: 8 μαθήματα)

1. [reading] Γνωριμία με το Mac: Dock, Menu bar, Finder — τι αλλάζει από τα Windows
2. [mac-simulation] Άνοιξε εφαρμογή από το Dock
3. [mac-simulation] Τα τρία χρωματιστά κουμπιά
4. [mac-simulation] Κλείσιμο παραθύρου ≠ Έξοδος από εφαρμογή (Cmd+Q)
5. [mac-simulation] Finder: φάκελοι και αρχεία
6. [mac-simulation] Αναζήτηση με Spotlight
7. [mac-simulation] Ρυθμίσεις: μεγάλωσε δείκτη & γράμματα
8. [keyboard-action] Αντιγραφή/Επικόλληση με Cmd (αντί Ctrl)

## 6. Φάσεις υλοποίησης (μετά από Codex plan review — vertical slices)

🤝 **codex plan review (2026-07-15)**: υιοθετήθηκαν — vertical slices αντί για layer-phases (κάθε μάθημα seed-άρεται μόνο όταν η ροή του είναι εκτελέσιμη), ρητή πολιτική progress, διαχωρισμός applicable-vs-simulated semantics, semantic events για goals, data-contract tests, mobile πριν από Mac.

**Πολιτική δεδομένων (δεσμευτική):**
- Τα module/lesson IDs είναι **αμετάβλητα για πάντα**. Καμία μετονομασία ID, καμία διαγραφή row.
- Αλλαγές μόνο additive (νέα lessons) ή cosmetic (τίτλοι/περιγραφές/config UI). Ολοκληρωμένα μαθήματα μένουν ολοκληρωμένα· νέα μαθήματα σε module δεν «ξε-ολοκληρώνουν» κανέναν.
- Το `moduleDevices` σημαίνει **«σε ποια συσκευή είναι χρήσιμη η ύλη»** (concept-level). Το πού «τρέχει» η προσομοίωση είναι χωριστό metadata (`moduleSimulationPlatform`) — π.χ. word/module7: ύλη windows+mac, προσομοίωση windows-like.
- Upserts: πάντα per-row select→update/insert σε σταθερό ID (υπάρχον pattern), modules πριν από lessons, ποτέ αγγίζοντας user_progress. Deprecation = `enabled:false`, ποτέ delete.

| Φάση | Παραδοτέο | Ρίσκο |
|---|---|---|
| **B1** | Reorg config-only: κατηγορίες ανά συσκευή, semantics σχόλια+`moduleSimulationPlatform`, υποενότητες, fix τίτλου lesson8 (μόνο i18n — ίδιο ID/skill) + contract tests | Χαμηλό |
| **B2** | Mobile walking skeleton: MobileHomeScreen v2 + `mobile-sim` type + goal/event protocol + ΕΝΑ πλήρες μάθημα Android+iOS end-to-end (renderer, i18n, tests) | Μεσαίο |
| **B3** | Mobile app primitives: PhoneApp, MessagesApp, ChatApp, MobileSettingsApp (+ tests ανά goal) | Μεσαίο |
| **B4** | Tracks ως vertical slices: κάθε Android/iPhone μάθημα seed-άρεται μαζί με το app/goal του | Χαμηλό |
| **B5** | Mobile wave 2: Camera/Gallery/Store/QR + αντίστοιχα μαθήματα + βιντεοκλήση + mobile scam-spotter variant | Μεσαίο |
| **B6** | Mac walking skeleton: MacDesktop/MacWindow με χωριστό `windowOpen`/`appRunning` state (close≠quit), `mac-simulation` + ένα μάθημα | Μεσαίο |
| **B7** | Mac track πλήρες + module `mac` + κατηγορία «Mac υπολογιστής» + truthful mac tags | Χαμηλό |
| **B8** | Turso upsert (modules→lessons), e2e verify, README/ROADMAP sync | Χαμηλό |

Κάθε φάση: red-green (tests πρώτα), μετά υλοποίηση, μετά πλήρες suite. Goals καταναλώνουν **semantic events** (π.χ. `{type:'mobile-app-opened', appId}`), ποτέ DOM internals· lesson scoring χωριστό από app state.

## 7. Αρχές simulators (από έρευνα + υπάρχον pattern)

- **Αναγνωρίσιμο, όχι φωτορεαλιστικό**: αρκετή πιστότητα για μεταφορά δεξιότητας (θέση/σχήμα/σειρά στοιχείων), όχι pixel-perfect αντίγραφο ή brand assets.
- **Καθοδήγηση χωρίς τιμωρία**: λάθος tap → ήπιο μήνυμα, 2 λάθη → highlight στόχου (υπάρχον pattern του MobileTapLesson — επεκτείνεται παντού).
- **Προσβασιμότητα seniors**: min 84px touch targets, aria-live feedback, μεγάλα γράμματα, υψηλό contrast.
- **Ένα goal ανά μάθημα**, score ήπιο (100/80/60 όπως MobileTapLesson).
