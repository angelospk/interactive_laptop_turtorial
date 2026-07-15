# Roadmap — Device-aware πλατφόρμα ψηφιακών δεξιοτήτων

*Τελευταία ενημέρωση: 2026-07-15. Βασίζεται σε χαρτογράφηση του codebase + έρευνα με Grok (live web search, βλ. §Έρευνα).*

## Το όραμα

Σήμερα η πλατφόρμα είναι de facto «μαθήματα laptop με Windows», με διάσπαρτο mobile περιεχόμενο (~17 υποενότητες σε esm001/c2 και eapsi001). Ο στόχος: **η πλατφόρμα να αναγνωρίζει τη συσκευή του χρήστη και να τον οδηγεί σε περιεχόμενο για τη δική του συσκευή** — με ξεχωριστά tracks:

- 🖥️ **Windows** (το υπάρχον περιεχόμενο = βάση)
- 📱 **Android** (η πιο κρίσιμη προσθήκη — η πλειοψηφία των ηλικιωμένων έχει Android)
-  **iPhone**
- 💻 **Mac** (χαμηλή προτεραιότητα, μικρό κοινό στο target group)

**Όχι** per-μάρκα Android (Samsung/Xiaomi κλπ.) σε πρώτη φάση — σωστή η εκτίμηση ότι δεν αξίζει. Αν χρειαστεί αργότερα, αρκεί μια σημείωση τύπου «σε Samsung το κουμπί λέγεται Χ» μέσα στο ίδιο μάθημα, όχι ξεχωριστό track.

---

## Έρευνα (Grok live search, 2026-07)

### 1. Αναγνώριση συσκευής/OS από browser — τι ισχύει το 2026

- **Κύρια μέθοδος: User-Agent Client Hints** (`navigator.userAgentData.platform` → `"Windows" | "macOS" | "Android" | "iOS"`, `.mobile` → boolean). Υποστηρίζεται πλήρως μόνο σε **Chromium** browsers (Chrome, Edge, Brave...).
- **Safari και Firefox ΔΕΝ υποστηρίζουν** `userAgentData` — εκεί χρειάζεται fallback σε parsing του (παγωμένου/μειωμένου) User-Agent string.
- Το κλασικό UA string έχει «παγώσει» σε όλους τους browsers (privacy/anti-fingerprinting) — αναξιόπιστο για λεπτομέρειες (εκδόσεις), αλλά ακόμα αρκετό για τη χοντρική διάκριση Windows/Mac/Android/iPhone.
- **Παγίδα: το iPad σε Safari δηλώνει macOS** (desktop mode). Λύση: συνδυασμός με feature detection (`'ontouchend' in document`, `navigator.maxTouchPoints`).
- Πρόταση: μικρό δικό μας utility (~30 γραμμές) με σειρά προτεραιότητας `userAgentData → UA regex → touch heuristics`. Δεν χρειάζεται βιβλιοθήκη (π.χ. ua-parser-js) για 4 κατηγορίες.

### 2. Τι κάνουν οι αντίστοιχες πλατφόρμες

- **DigitalLearn.org (Public Library Association)** — το πιο κοντινό μοντέλο σε αυτό που θέλουμε: ξεχωριστά courses **"Using a PC (Windows)"**, **"Using a Mac"**, **"Using a Mobile Device (Android)"**, **"Using a Mobile Device (iOS)"**. Ο χρήστης **επιλέγει μόνος του** — καμία αυτόματη ανίχνευση.
- **GCFGlobal** — θεματική οργάνωση (Computers, Internet...) με OS-specific μαθήματα μέσα στις κατηγορίες.
- **Senior Planet (AARP)** — live μαθήματα + on-demand, ο χρήστης διαλέγει θεματική· όχι auto-detect.
- **Συμπέρασμα**: καμία μεγάλη πλατφόρμα δεν κάνει σιωπηλό auto-detect. Όλες βασίζονται σε **ρητή επιλογή χρήστη**. Το auto-detect + επιβεβαίωση θα ήταν διαφοροποίηση/βελτίωση, όχι απλή αντιγραφή.

### 3. UX για ηλικιωμένους: auto-detect vs ρητή επιλογή

Η έρευνα (NN/g elder-UX, WCAG, AARP/OATS) συγκλίνει καθαρά:

> **Auto-detect ως βοήθημα, ποτέ σιωπηλά.** Το βέλτιστο pattern: *«Φαίνεται ότι χρησιμοποιείς κινητό Android — σωστά;»* με μεγάλα κουμπιά [Ναι] / [Όχι, δείξε μου επιλογές], και δυνατότητα αλλαγής αργότερα από εμφανές σημείο.

Λόγοι: (α) η ανίχνευση κάνει λάθη (iPad, shared devices, ο παππούς μπαίνει από το laptop της κόρης για να μάθει για το κινητό *του*), (β) οι σιωπηλές αλλαγές μπερδεύουν και τρομάζουν χρήστες χαμηλής εξοικείωσης, (γ) WCAG: user control, όχι απροσδόκητες αλλαγές context. Σημαντικό σενάριο για εμάς: **η συσκευή που σερφάρει ≠ η συσκευή που θέλει να μάθει** — άρα η προτίμηση είναι ρύθμιση χρήστη, όχι ιδιότητα του browser.

### 4. Ελληνικό/ΕΕ πλαίσιο (τι περιεχόμενο έχει αξία)

- Το εθνικό πιλοτικό **«Όλοι Digital»** (2026) τρέχει σε ~120 ΚΑΠΗ/Λέσχες Φιλίας — ακριβώς το κοινό μας. Ύλη προτεραιότητας: **gov.gr υπηρεσίες, άυλη συνταγογράφηση, προστασία από απάτες, e-banking, βιντεοκλήσεις**.
- **Εθνική Ακαδημία Ψηφιακών Ικανοτήτων** (nationaldigitalacademy.gov.gr): δωρεάν self-paced μαθήματα — πηγή έμπνευσης ύλης, όχι ανταγωνιστής (δεν έχει διαδραστικές προσομοιώσεις).
- EU Digital Decade: στόχος 80% βασικές δεξιότητες ως 2030, Ελλάδα ~52% — οι 65+ η μεγαλύτερη υστέρηση. Τάση: πρακτικές δεξιότητες καθημερινότητας (υγεία, τράπεζα, δημόσιο, anti-scam), όχι «θεωρία υπολογιστών».

Πηγές: MDN/web.dev (UA-CH), digitallearn.org, gcfglobal.org, seniorplanet.org, minscfa.gov.gr (Όλοι Digital), nationaldigitalacademy.gov.gr, digital-skills-jobs.europa.eu/greece.

---

## Φάσεις

### Φάση 1 — Θεμέλια device-awareness (το enabling layer)

Στόχος: η πλατφόρμα ξέρει (α) τι συσκευή πιθανόν έχει ο χρήστης, (β) τι συσκευή *θέλει να μάθει*, και τα μαθήματα φέρουν device tags.

1. **Schema**: πεδίο `preferredDevice` (`windows | mac | android | iphone | null`) — είτε στον πίνακα `users` είτε σε νέο `userPreferences` (src/lib/db/schema.ts). Το `null` = δεν έχει επιλέξει ακόμα.
2. **Detection utility** (`src/lib/utils/deviceDetect.ts`): `userAgentData` → UA fallback → touch heuristics (για iPad-ως-Mac). Επιστρέφει *υπόθεση*, όχι απόφαση.
3. **Onboarding βήμα** μετά το login (πρώτη φορά): «Φαίνεται ότι έχεις …— σωστά;» με 4 μεγάλα εικονογραφημένα κουμπιά. Αποθήκευση στο profile + αλλαγή ανά πάσα στιγμή από ορατό σημείο (header/settings). Επιπλέον ερώτηση-κλειδί: **«Τι θέλεις να μάθεις;»** (μπορεί να διαφέρει από τη συσκευή που σερφάρει).
4. **Content tagging**: προαιρετικό πεδίο `devices: string[]` σε manifest subsections (content/manifest.json) και lesson seeds. Ό,τι δεν έχει tag = ισχύει παντού (μηδενικό migration cost για το υπάρχον περιεχόμενο).
5. **Filtering/badging στο UI**: στην αρχική, ενότητα «Για τη συσκευή σου»· στα modules, φιλτράρισμα ή badges (🖥️/📱) ανά μάθημα. Όχι απόκρυψη — *προτεραιοποίηση* (ο χρήστης βλέπει πρώτα τα δικά του, αλλά όλα προσβάσιμα).

### Φάση 2 — Per-device tracks περιεχομένου

> **Πρόοδος 2026-07-15**: εκτελείται μέσω του [CURRICULUM_PLAN.md](CURRICULUM_PLAN.md). Ολοκληρώθηκαν: mobile simulator v2 (`mobile-sim`), Android/iPhone tracks με **19 μαθήματα** το καθένα σε 5 ενότητες, και όλο το **wave 3**: βιντεοκλήση, screenshot με φυσικά κουμπιά (per-OS chord), κλείσιμο κολλημένης εφαρμογής (recent apps), Κάμερα+QR με έλεγχο συνδέσμου gov.gr, νυχτερινή λειτουργία, εύρεση συσκευής, ενημέρωση από Store, Ψηφιακός βοηθός (chips διατύπωσης), ύποπτο SMS + 2FA. Επίσης: σημασιολογία ολοκλήρωσης «βασικής διαδρομής» + id-based sections. Εκκρεμεί: **Mac track** (ibm/532).

Σειρά προτεραιότητας με βάση το κοινό (ΚΑΠΗ):

1. **Android track** — αναβάθμιση του esm001/c2 από «κεφάλαιο» σε πλήρες module: αρχική οθόνη/χειρονομίες, κλήσεις/επαφές, φωτογραφίες, Viber/WhatsApp, Play Store, ρυθμίσεις (μέγεθος γραμμάτων, ένταση, WiFi), μπαταρία/αποθηκευτικός χώρος, ασφάλεια.
2. **iPhone track** — ίδια δομή, iOS παραλλαγή. Όπου η ύλη είναι κοινή (π.χ. «τι είναι το WiFi»), κοινό μάθημα με device tag και στα δύο.
3. **«Χρήσιμες συμβουλές» ανά συσκευή** — tips ενότητα ανά track (τα υπάρχοντα typst cheatsheets στο docs/cheatsheet/ μπορούν να γίνουν per-device εκτυπώσιμα PDF).
4. **Mac track** — μόνο ό,τι διαφέρει ουσιωδώς από Windows (Finder vs Explorer, Dock vs taskbar). Χαμηλή προτεραιότητα· ίσως ξεκινήσει ως «σημειώσεις διαφορών» μέσα στα Windows μαθήματα.
5. **Interactive simulations για mobile**: το lesson system (click/drag/hover) δουλεύει ήδη σε touch — χρειάζεται «κινητό frame» component (προσομοίωση οθόνης κινητού) αντίστοιχο του υπάρχοντος desktop simulation, ώστε τα Android/iPhone μαθήματα να είναι διαδραστικά και όχι μόνο reading.

### Φάση 3 — Περιεχόμενο υψηλής αξίας για Ελλάδα

Ευθυγράμμιση με τις προτεραιότητες του «Όλοι Digital» (ό,τι ζητάει το πραγματικό κοινό):

- Προσομοίωση **gov.gr** (κωδικοί TaxisNet, εξουσιοδοτήσεις, βεβαιώσεις) στο υπάρχον BrowserApp pattern.
- **Άυλη συνταγογράφηση** + MyHealth walkthrough.
- **e-banking simulation** (γενικευμένο, όχι συγκεκριμένη τράπεζα) — πατάει στο υπάρχον module10/scam-spotter για το σκέλος ασφάλειας.
- Επέκταση scam-spotter με per-device σενάρια (SMS phishing σε Android vs iPhone εμφάνιση).

### Φάση 4 — Ιδέες μεγαλύτερου βεληνεκούς (backlog)

- **PWA/offline mode** — τα ΚΑΠΗ έχουν συχνά κακό internet (υπάρχει ήδη offline slides pipeline στο static/kapi/ — φυσική συνέχεια).
- **Λειτουργία «βοηθού»**: view για συγγενή/εθελοντή που βλέπει την πρόοδο του μαθητή και τι να εξασκήσουν μαζί.
- **Εκτυπώσιμο υλικό ανά μάθημα** (το typst pipeline υπάρχει ήδη).
- Per-device analytics στο admin panel (ποιο track προχωράει, πού κολλάνε).
- Αν ποτέ χρειαστεί per-μάρκα Android: inline παραλλαγές («σε Samsung λέγεται…»), ποτέ ξεχωριστά tracks.

---

## Διορθώσεις που προηγούνται (από .planning/codebase/CONCERNS.md)

Πριν ή παράλληλα με τη Φάση 1 — τα critical επηρεάζουν ό,τι χτιστεί από πάνω:

| Προτεραιότητα | Θέμα | Γιατί μπλοκάρει |
|---|---|---|
| 🔴 | Unsigned session cookies (src/hooks.server.ts) | Το `preferredDevice` θα ζει στο user profile — θέλει αξιόπιστο session |
| 🔴 | Turso token σε `.env.example` | Rotate + αφαίρεση, ανεξάρτητα από roadmap |
| 🟠 | `gameStore.svelte.ts` legacy vs `appState.svelte.ts` | Το device state πρέπει να μπει σε ΕΝΑ store — καθάρισμα πριν προστεθεί νέο state |
| 🟠 | DesktopLesson/BrowserApp μονόλιθοι | Το mobile simulation frame (Φάση 2.5) θα κληρονομήσει τα ίδια προβλήματα αν δεν σπάσουν πρώτα |
| 🟡 | Hardcoded locale, lesson locking ανενεργό, PocketBase dependency | Housekeeping, όχι blockers |

---

## Προτεινόμενη σειρά εκτέλεσης

```
Fixes (cookies, token) ──→ Φάση 1 (schema + detect + onboarding + tags)
                                   │
                     ┌─────────────┴──────────────┐
             Φάση 2.1 Android track        Φάση 3 (gov.gr κλπ. — ανεξάρτητο)
                     │
             Φάση 2.2 iPhone track ──→ 2.3 tips ──→ 2.4 Mac
```

Η Φάση 1 είναι μικρή (schema πεδίο + utility + ένα onboarding βήμα + optional tags) και ξεκλειδώνει όλα τα υπόλοιπα. Το ακριβό κομμάτι είναι το περιεχόμενο της Φάσης 2 — γι' αυτό το tagging είναι optional-by-default: το υπάρχον περιεχόμενο δεν χρειάζεται καμία αλλαγή για να δουλέψει το σύστημα.
