# Interactive Laptop Tutorial

Svelte 5 educational platform for teaching elderly users Windows 11 skills.

## Features

- 🔐 Simple username-based authentication with **HMAC-signed session cookies** (tamper-proof; `SESSION_SECRET` required in production) and redirect-after-login (deep links survive the login step)
- 📱 Device-aware onboarding — auto-_detects_ the user's device (Windows/Mac/Android/iPhone) as a hint and asks them to confirm which device they want to learn (`preferredDevice`), the enabling layer for per-device content tracks (see `docs/ROADMAP.md`)
- 🔗 Deep-linkable lessons — every lesson has its own URL (`/modules/<module>/<lessonKey>`), shareable and bookmarkable
- 📚 Library ↔ lesson bridge — 30 theory subsections link straight to their matching interactive lessons (source: `exported_courses/lesson_links.json`, applied with `python3 exported_courses/apply_lesson_links.py --apply`; mapping rationale in `docs/theory-exercise-mapping.md`)
- 🗂️ Device-aware module categories on the home page («Windows υπολογιστής», «Κινητό τηλέφωνο»…) + labelled Θεωρία/Εξάσκηση sub-sections inside long modules (see `docs/CURRICULUM_PLAN.md`)
- 🖥️📱 **Τέσσερις ρεαλιστικοί προσομοιωτές** (Windows 11 · macOS · Android · iPhone, `docs/SIMULATORS.md`) — πραγματικό OS chrome (Win11 taskbar/Start/Quick Settings/ημερολόγιο, Mac menu bar/Control Center/Dock/Finder/System Settings με zoom, Android QS και iOS Control Center/Dynamic Island) όπου κάθε control αλλάζει κοινή κατάσταση (`osState`, `MacState`, `PhoneState`) που φαίνεται στο tray/status bar/οθόνη, ή εξηγεί inline ότι δεν χρειάζεται στην άσκηση. Τα events των μαθημάτων έμειναν ίδια (113 browser tests).
- 📞 Realistic phone simulator (`mobile-sim`) — Android/iOS home screen with dock & wallpaper, goal-driven mini-apps: Τηλέφωνο (πληκτρολόγιο+Επαφές), Μηνύματα/Viber (βιντεοκλήση + αναγνώριση ύποπτου SMS), Ρυθμίσεις (γράμματα, Wi-Fi, νυχτερινή λειτουργία, εύρεση συσκευής), Κάμερα (σκανάρισμα QR + έλεγχος συνδέσμου gov.gr), Play/App Store (ενημέρωση και εγκατάσταση εφαρμογής, με αναζήτηση), Ψηφιακός βοηθός (chips διατύπωσης — τίμια «φωνή» χωρίς μικρόφωνο), περιηγητής με 2FA. Επιπλέον: screenshot με τα φυσικά κουμπιά (per-OS chord), κλείσιμο κολλημένης εφαρμογής από τις πρόσφατες. Android/iPhone tracks με 22 μαθήματα το καθένα σε 6 ενότητες (Βασικά → Καθημερινή χρήση → Ρυθμίσεις & βοήθεια → Πιο προχωρημένα & AI → Έξυπνα & ασφάλεια → Περισσότερα για κάθε μέρα), με σημασιολογία «Ολοκληρώθηκε η βασική διαδρομή» ώστε τα νέα μαθήματα να μην υποβαθμίζουν όσους τελείωσαν (dev playground: `/demo/mobile-sim`)
- 💻 Mac simulator (`mac-simulation`) — Mac desktop με Dock (ένδειξη «τρέχει»), γραμμή μενού και «φανάρια» παραθύρου. Το κεντρικό δίδαγμα: **κλείσιμο παραθύρου (κόκκινο) ≠ τερματισμός εφαρμογής** (⌘Q / μενού «Τερματισμός»). Mac track με 9 μαθήματα σε 3 ενότητες (Τα βασικά του Mac → Finder & Spotlight → Ρυθμίσεις & συντομεύσεις): γνωριμία, άνοιγμα από Dock, τα τρία κουμπιά, κλείσιμο≠έξοδος, Finder, Spotlight, μέγεθος κειμένου, αντιγραφή/επικόλληση με Cmd, μέγεθος δείκτη ποντικιού. Κατηγορία «Mac υπολογιστής», βασική διαδρομή = τα 4 πρώτα μαθήματα
- 🛡️ Admin Panel for content management
- 📊 Per-user progress tracking
- 🧩 Dynamic Lesson System (Drag & Drop, Click, Hover, Quiz, etc.)
- 🎣 Phishing & scam-recognition module with "Scam or Not?" (`scam-spotter`) exercises — 28 realistic Greek scenarios across 4 channels (email, SMS, Viber/messaging, phone/vishing) with per-signal explanations
- ✅ **Playability contracts** — every seeded lesson is certified at build time, not at the learner's expense. Simulation lessons already had config parsers (`parseMobileSimConfig`, `parseMacSimConfig`, …); the primitive drills (hover/click/drag/typing/quiz…) now have them too in `src/lib/lessons/gameConfig.ts`, and components pair the same variant tuples with `satisfies Record<Theme, …>` so a theme with no renderer fails the build. `contracts.test.ts` runs the parsers over all 218 seeded lessons, including disabled ones
- 🧭 **Το URL είναι η μοναδική πηγή αλήθειας για το τρέχον μάθημα.** Ο συγχρονισμός γίνεται με `replaceState` (shallow routing), που ΔΕΝ ενημερώνει τα `params` — άρα το `startIndex` του server γίνεται μπαγιάτικο μόλις ο χρήστης πατήσει «Επόμενο», και κάθε `invalidateAll()` (π.χ. όταν αποθηκεύεται πρόοδος) ξανασέρβιρε το μάθημα άφιξης. Ο `LessonRunner` διαβάζει πλέον το `page.url`, το overlay ολοκλήρωσης δείχνει μόνο ολοκλήρωση που μόλις έγινε (`e2e/lesson-navigation.test.ts`)
- 🖥️ **Η προσομοίωση πιάνει όλη την οθόνη.** Η σελίδα μαθήματος ορίζει το viewport (`svh`/`dvh`) και το μάθημα παίρνει όλο τον χώρο. Τίτλος, οδηγία, «Προηγούμενο/Επόμενο» και πλήρης οθόνη βρίσκονται σε μπάρα πάνω από το μάθημα: ανοιχτή όταν ξεκινά ένα μάθημα, κρύβεται με το πρώτο πάτημα μέσα στο μάθημα και ξαναβγαίνει με το κουμπί «Μενού μαθήματος» (λεπτή λωρίδα 44px που δεν σκεπάζει τίποτα), με το ποντίκι στην κορυφή της οθόνης, με scroll προς τα πάνω ή swipe προς τα κάτω από την κορυφή. Η προσομοίωση Windows γεμίζει τον χώρο της (όχι σταθερά 600px), τα παράθυρα ανοίγουν μεγιστοποιημένα (εκτός από το μάθημα «μεγιστοποίηση») και το μεγιστοποιημένο παράθυρο σταματά πάνω από τη γραμμή εργασιών (`src/lib/lessons/lessonBar.ts`, `e2e/lesson-layout.test.ts`)
- 🆘 **«Κόλλησες;»** Αν ένα μάθημα δεν ολοκληρωθεί σε 40s (αρχάριος) / 60s (μέτριος) / 90s (προχωρημένος), ανοίγει η μπάρα με «Βοήθεια» (οδηγίες του μαθήματος), «Έξοδος» και «Συνεχίζω», και συμβουλή για το πώς βγαίνει η μπάρα. Κάθε «Συνεχίζω» διπλασιάζει την αναμονή. Όχι σε ανάγνωση, κουίζ, πληκτρολόγηση και «Απάτη ή Όχι;». Ένα μάθημα αλλάζει το όριο με `config.stuckAfterSeconds` (0 = ποτέ) (`LessonRunner.svelte.test.ts`)
- ⏱️ **Χωρίς «Έναρξη Μαθήματος» και χωρίς χρονόμετρο** στα primitive drills (hover/click/double-click/right-click/scroll): το μάθημα είναι ζωντανό μόλις ανοίξει και η αργή εκτέλεση δεν είναι αποτυχία. Το `timeLimit` παραμένει στο config contract των 218 μαθημάτων αλλά δεν οδηγεί τίποτα
- 🆘 **Ο βοηθός ανοίγει μόνο όταν του το ζητήσεις** — κουμπί «Βοήθεια» 48px, Escape/κουμπί κλεισίματος, focus που μπαίνει και επιστρέφει. Μιλά **μόνο** όταν το μάθημα έχει `config.tutorialSteps`: οι `instructions` μένουν μόνιμα ορατές μέσα στο μάθημα, οπότε η επανάληψή τους σε αιωρούμενο panel ήταν το τρίτο αντίγραφο της ίδιας πρότασης (`src/lib/lessons/assistant.ts`)
- ⌨️ **Οι συντομεύσεις ακολουθούν τη συσκευή του χρήστη** — semantic `['primary','C']` που γίνεται `⌘ + C` σε Mac και `Ctrl + C` σε Windows, και στην ετικέτα και στον έλεγχο πλήκτρων. Όπου η συντόμευση διαφέρει πραγματικά ανά πλατφόρμα υπάρχει ξεχωριστό chord (redo = `⌘ + Shift + Z` σε Mac, αλλαγή γλώσσας = `⌃ + Space`) — μηχανική αντικατάσταση `Ctrl`→`⌘` θα δίδασκε συνδυασμούς που δεν κάνουν τίποτα Μόνο η επιλογή υπολογιστή (Windows/Mac) ορίζει το πληκτρολόγιο· με κινητό ή χωρίς επιλογή δείχνονται και γίνονται δεκτά και τα δύο. Οι οδηγίες των seeds γράφουν `{{shortcut:find}}` / `{{key:primary}}` αντί για «Ctrl», και ο προσομοιωμένος browser απαντά στα ⌘/Ctrl + / − / F μόνο όταν είναι το μπροστινό παράθυρο (`src/lib/lessons/shortcuts.ts`, `e2e/device-shortcuts.test.ts`)
- 🎯 **Ό,τι ζητάει το μάθημα να πατηθεί είναι τουλάχιστον 44×44px και ορατό χωρίς hover** — κουμπιά καρτελών/αγαπημένων, ribbon του Word, Spotlight, μπάρα αρχικής οθόνης κινητού (`e2e/lesson-targets.test.ts`). Κάθε τύπος μαθήματος ανοίγει από deep-link χωρίς JS error (`e2e/lesson-smoke.test.ts`)
- 🧓 **Audit UX/QA για ηλικιωμένους (2026-09-30)** — ό,τι βρήκε το Codex audit και διορθώθηκε, το καθένα με test:
  - Το αποτέλεσμα μαθήματος είναι πραγματικό `dialog` (όνομα, focus στο επόμενο βήμα, το υπόλοιπο μάθημα `inert`). Αν η αποθήκευση αποτύχει (χωρίς ίντερνετ ή σφάλμα server), εμφανίζεται μήνυμα στα ελληνικά με κουμπί «Αποθήκευση ξανά» αντί για «Μπράβο» που χάνεται (`LessonRunner.svelte.test.ts`)
  - Η «Συνέχεια» ακολουθεί τη σειρά του προγράμματος (όχι αλφαβητική), αγνοεί απενεργοποιημένες ενότητες, τελειώνει πρώτα την ενότητα που είχε ανοίξει ο χρήστης και δεν στέλνει χρήστη Windows στα Android (`src/lib/resume.ts`). Ο «βοηθός» (`/synergos`) τελειώνει όλη τη συσκευή του χρήστη πριν προτείνει άλλη και δεν τη βαφτίζει με το όνομα της δικής του (`src/lib/together.ts`)
  - «Επανέναρξη Προόδου» ζητά επιβεβαίωση. Η επιλογή συσκευής χωράει σε οθόνη 360×640 και αλλάζει όσες φορές χρειαστεί χωρίς ανανέωση. Τα λάθη σύνδεσης μένουν δίπλα στο πεδίο (`aria-invalid` / `aria-describedby`). Η σελίδα ενότητας έχει τίτλο (`<h1>` και `<title>`) (`e2e/home-ux.test.ts`, `e2e/progress.test.ts`, `e2e/deeplink.test.ts`)
  - «Απάτη ή Όχι;»: το αποτέλεσμα μένει μέχρι να πατηθεί «Επιστροφή στις ασκήσεις», και ο αποστολέας δεν κόβεται ποτέ με «…» (το ύποπτο domain είναι συνήθως στο τέλος) (`e2e/apates.test.ts`). Η Βιβλιοθήκη έχει μεγαλύτερα γράμματα στο κινητό και σύνδεσμοι ≥44px. Όταν ένα μάθημα δεν ανοίγει, το μήνυμα είναι στα ελληνικά και χωρίς τεχνικούς όρους
  - **Χωρίς αυτόματο «Επόμενο σε 5 δευτερόλεπτα».** Το αποτέλεσμα μένει μέχρι να επιλέξει ο χρήστης· η αντίστροφη μέτρηση ήταν πίεση χρόνου, ακριβώς αυτό που αποφεύγει η πλατφόρμα. **Η πλήρης οθόνη είναι επιλογή**: το άνοιγμα μαθήματος δεν τη ζητά πια, και μέσα σε αυτήν «Προηγούμενο/Επόμενο» μένουν ορατά
  - 🔠 **«Μεγαλύτερα γράμματα»** — ένα κουμπί (αρχική, Βιβλιοθήκη, «Απάτη ή Όχι;», βοηθός) που μεγαλώνει όλο τον ιστότοπο κατά 25% (όλα είναι σε rem, άρα μεγαλώνουν μαζί κείμενο, αποστάσεις και στόχοι). Θυμάται την επιλογή στη συσκευή και εφαρμόζεται πριν την πρώτη απόδοση, χωρίς «αναβόσβημα» (`src/lib/textSize.ts`, `e2e/text-size.test.ts`)
  - 📶 **Η σελίδα «Εκτός σύνδεσης» δείχνει τι ανοίγει χωρίς ίντερνετ** — λίστα με τα μαθήματα και τις σελίδες θεωρίας που υπάρχουν στην cache του service worker, με τον τίτλο τους (`src/lib/offlineLessons.ts`). Γι' αυτό μάθημα και θεωρία έχουν πλέον `<title>`
  - «Απάτη ή Όχι;»: το focus ακολουθεί τον χρήστη (τίτλος μηνύματος → απάντηση → επόμενο μήνυμα → πίσω στο κουμπί της άσκησης). Ο διακόπτης γλώσσας γράφει «Ελληνικά / English» με `aria-pressed`, και το κουμπί κλεισίματος των διαλόγων είναι «Κλείσιμο» (44px) αντί για «Close». Με «English» η διεπαφή γύρω από τα μαθήματα (ερώτηση συσκευής και ενδείξεις, ομάδες ενοτήτων, «Μεγαλύτερα γράμματα», μήνυμα αποθήκευσης) είναι πλέον αγγλική· το περιεχόμενο των μαθημάτων μένει ελληνικό (`e2e/english.test.ts`)
- 🧓 **Διορθώσεις από τη δοκιμή του Harold (2026-10-04)**, η καθεμιά με test:
  - Θεωρία: τα «Περιεχόμενα» στο πλάι κυλούν μέσα τους και δεν κόβονται με μεγάλα γράμματα (`TocSidebar`). Κλικ σε εικόνα ανοίγει όλη την εικόνα σε πλήρη οθόνη, με μεγάλο X, και κλείνει με Esc ή κλικ έξω (`ImageLightbox`). Στα μαθήματα θεωρίας, μικρή μπάρα κάτω με «Προηγούμενη / Επόμενη ενότητα» και «Περιεχόμενα» (`SectionNav`, `TocMenu`)
  - Περιηγητής (module 5): το Ιστορικό ανοίγει από το εικονίδιο με το ρολόι (χωρίς πληκτρολόγηση) και τα βελάκια Πίσω/Μπροστά δουλεύουν· νέο μάθημα «12. Πίσω και Μπροστά» (goals `open-history`, `back-forward`)
  - Προσομοίωση Windows: κάθε μάθημα παραθύρων λέει ποια εφαρμογή θέλει (contract test), οι εφαρμογές λέγονται «Excel» / «Word» στο μενού Έναρξη, λάθος εφαρμογή δίνει ήπια υπόδειξη, και στην «Επαναφορά παραθύρου» το εικονίδιο του κρυμμένου παραθύρου δείχνει «Πατήστε εδώ» (`desktopApps.ts`)
  - Οδηγίες με βήματα «1. 2. 3.» εμφανίζονται ως αριθμημένη λίστα (`InstructionText`)· contract test απαγορεύει κυριολεκτικό `\\n` σε οποιοδήποτε μάθημα
- 🧭 **Οδηγός (`guide`)** — νέος τύπος μαθήματος ανάμεσα σε Θεωρία και Εξάσκηση. Ανοίγει την πραγματική προσομοίωση (πρώτα τον browser του module5) και φωτίζει ένα-ένα τα στοιχεία της, με αφήγηση και λεζάντες. Σε κάθε βήμα μόνο «Το ξέρω» / «Δεν το ξέρω»· τα «Το ξέρω» κάνουν τις αντίστοιχες ασκήσεις πράσινες («Το ήξερες», `user_progress.source = 'guide'`, χωρίς βαθμό), και το «Επόμενο Μάθημα» μετά από ολοκλήρωση πηγαίνει στο επόμενο **ανολοκλήρωτο**. Σίγαση (θυμάται την επιλογή), «Ξανά», «Έξοδος», βοήθεια στα 30″/75″ αδράνειας χωρίς ποτέ χρονικό όριο. Τα λόγια ζουν σε `docs/guides/*.script.md` (ένα clip ανά `## id`, έτοιμο για ElevenLabs **Eleven v4** με audio tags)· ο ήχος μπαίνει στο `static/audio/guides/<id>.mp3` και, όσο λείπει, ο οδηγός δουλεύει με λεζάντες. Νέος οδηγός = `src/lib/guides/<module>.ts` + σενάριο + seed `lessonType: 'guide'` (τα contract tests ελέγχουν ότι δένουν). Λεπτομέρειες: `docs/FEATURES.md`· design: `docs/superpowers/specs/2026-10-04-guided-tour-design.md`
- 🎯 Multi-level difficulty system (Beginner/Intermediate/Advanced)
- 🌍 Bilingual support (English/Greek) via inlang
- 💾 SQLite database (local dev + Turso for production)
- 🎨 Beautiful UI with shadcn-svelte components

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Initialize Database

```bash
# Generate schema and create local.db
bun run db:init
```

### 3. Run Development Server

```bash
bun run dev
```

Navigate to `http://localhost:5173` and login with any username (e.g., `user01`)

### 4. Access Admin Panel

Navigate to `http://localhost:5173/admin/login`
Password: `admin123` (configurable in `.env`)

After 5 attempts within 15 minutes from one IP, login is refused (429) until the window ends. The counter lives in the `admin_login_attempts` table; create it with `bun run scripts/create-admin-login-attempts.ts`.

Features:

- Enable/Disable lessons
- Seed database with default lessons
- View statistics

## Database Scripts

```bash
bun run db:generate  # Generate migration files
bun run db:push      # Push schema to database
bun run db:studio    # Open Drizzle Studio to view/edit data
bun run db:init      # Full initialization (generate + push)
```

> **Provisioning uses `db:push`, not migrations.** The schema is applied by
> diffing `src/lib/db/schema.ts` against the database with `drizzle-kit push`
> (see `scripts/init-db.sh`). The `drizzle/` migration files are gitignored
> advisory artifacts and are **not** a complete history — e.g. `db:generate`
> re-emits `CREATE TABLE modules` because that table was only ever provisioned
> via push. Treat `schema.ts` + `db:push` as the source of truth. When adding a
> column, run `db:push` against every target database (local **and** Turso).

## Development

- Adding a new module/lesson? See **[docs/i18n-guide.md](docs/i18n-guide.md)** for the i18n key workflow.
- Uses **local SQLite** (`local.db`) for development
- All user progress saved locally
- Database can be viewed with `bun run db:studio`

## Production Deployment (Vercel)

### 1. Create Turso Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create laptop-tutorial

# Get database URL
turso db show laptop-tutorial --url

# Create auth token
turso db tokens create laptop-tutorial
```

### 2. Set Environment Variables in Vercel

```
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token-here
NODE_ENV=production
```

### 3. Push Schema to Turso

```bash
# Set environment variables locally for migration
export TURSO_DATABASE_URL="your-url"
export TURSO_AUTH_TOKEN="your-token"

# Push schema
bun run db:push
```

### 4. Deploy to Vercel

```bash
vercel --prod
```

## Tech Stack

- **Framework**: SvelteKit + Svelte 5 (runes)
- **Database**: SQLite (better-sqlite3) + Turso (production)
- **ORM**: Drizzle ORM
- **UI**: shadcn-svelte + Tailwind CSS v4
- **i18n**: inlang/paraglide
- **Package Manager**: bun

## Project Structure

```
src/
├── lib/
│   ├── db/
│   │   ├── schema.ts      # Database schema
│   │   └── client.ts      # DB connection (dev/prod)
│   ├── server/
│   │   └── auth.ts        # Authentication logic
│   ├── components/
│   │   └── ui/            # shadcn components
│   ├── appState.svelte.ts # Global state (Svelte 5 runes)
│   └── types.ts           # TypeScript types
├── routes/
│   ├── login/             # Login page
│   ├── api/auth/          # Auth API endpoints
│   └── +page.svelte       # Home page
└── hooks.server.ts        # Auth + i18n middleware

messages/
├── en.json                # English translations
└── el.json                # Greek translations
```

## Development Workflow (TDD)

1. Write test first
2. Run test (should fail)
3. Write minimal code to pass
4. Refactor
5. Repeat

Tests:

```bash
bun run test          # All tests
bun run test:unit     # Vitest unit tests
bun run test:e2e      # Playwright e2e tests
```

## Παρουσιάσεις ΚΑΠΗ (offline)

Αυτόνομες παρουσιάσεις για διδασκαλία σε ΚΑΠΗ — λειτουργούν **χωρίς ίντερνετ** (`file://`),
σε οποιοδήποτε mini PC, με διπλό κλικ.

- `static/kapi/index.html` — launcher με τα 4 μαθήματα
- `static/kapi/mathima-1..6.html` — 6 ξεχωριστές, αναλυτικές παρουσιάσεις (μία ανά μάθημα: 1-4 υπολογιστής, 5-6 κινητό)
- `static/kapi/start-minipc.bat` / `static/kapi/start-minipc.sh` — άνοιγμα σε πλήρη οθόνη (kiosk)
- `static/slides-kapi.html` — σύνοψη «4 σε 1»

Επεξεργασία περιεχομένου: άλλαξε το `scripts/build-kapi-slides.mjs` και ξανατρέξε:

```bash
node scripts/build-kapi-slides.mjs   # ξαναχτίζει static/kapi/*.html
```

## License

MIT
