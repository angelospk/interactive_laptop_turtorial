# Design: Lesson deep-linking + redirect-after-login + library↔lessons bridge

**Date:** 2026-06-24
**Scope (foundation):** Workstreams A + B + D, με ένα accessibility/visual pass (στόχος: μεσήλικες χρήστες).
**Stack:** SvelteKit 2, Svelte 5 (runes), Tailwind v4, Drizzle (SQLite), paraglide i18n, cookie-session auth.

## Πρόβλημα

Τα μαθήματα δεν έχουν δικό τους URL: το `/modules/[id]` κρατά in-component state
(`selectedLessonId`) και αποδίδει το `LessonRunner`. Αυτό μπλοκάρει: (1) deep-link σε
μάθημα, (2) σύνδεσμο βιβλιοθήκης→συγκεκριμένο μάθημα, (3) redirect-after-login (δεν
υπάρχει `returnUrl` — το hook στέλνει σκέτο `/login`).

## A — Μαθήματα με δικό τους URL

**Νέο child route:** `src/routes/modules/[id]/[lesson]/` όπου `[lesson] = lessonKey`
(π.χ. `/modules/module10/scam-spotter-email`).

- `/modules/[id]/+page.svelte` → **μόνο το grid**. Αφαιρείται το `selectedLessonId`,
  το module-change `$effect`, και το fullscreen-on-select. Το `LessonCard` γίνεται
  `<a href="/modules/[id]/<lessonKey>">` (όχι button-goto — accessibility,
  open-in-new-tab). Το fullscreen request μένει στο click handler (user gesture) πριν
  το navigation.
- `src/routes/modules/[id]/[lesson]/+page.server.ts`:
  - Φορτώνει `moduleLessons` (ίδιο query με το γονικό), βρίσκει τη θέση με `lessonKey`.
  - Άκυρο `lessonKey` σε **έγκυρο** module → `redirect(303, /modules/[id]?notice=missing)`.
  - Άδειο/άκυρο module → ο γονικός loader ήδη δείχνει «no lessons»· κρατάμε ίδια συμπεριφορά.
  - Κλειδωμένο (μέσω `isLessonLocked`, σήμερα πάντα `false`) → `redirect(303, /modules/[id]?notice=locked)`.
    Κρατάμε το guard για μελλοντική επαναφορά locking· σήμερα no-op.
  - Επιστρέφει `moduleLessons`, `startIndex`, `moduleId`, `nextModuleId`, `isLastModule`.
- `src/routes/modules/[id]/[lesson]/+page.svelte`: αποδίδει `LessonRunner` με
  `startIndex` από τον server (SSR ορίζει το αρχικό μάθημα· ο client μόνο το ακολουθεί —
  καμία `$effect` που να μάχεται με τα `$page.params`).

**Συγχρονισμός URL κατά την πλοήγηση μέσα στον runner:**
Ο `LessonRunner` δέχεται `moduleId` και callback `onLessonChange(lessonKey)`. Σε κάθε
`nextLesson`/`prevLesson` καλεί `onLessonChange`, που κάνει
`replaceState('/modules/<moduleId>/<lessonKey>', {})` (από `$app/navigation`,
**client-only**). Έτσι ένα refresh κρατά τον χρήστη στο σωστό μάθημα. Το history δεν
γεμίζει· Back → grid (αποδεκτό για το κοινό-στόχο).

**Ολοκλήρωση module:** όταν τελειώνει το τελευταίο μάθημα, ο runner κρατά την υπάρχουσα
λογική `goto('/modules/<nextModuleId>')` (grid επόμενης ενότητας) ή `onExit`.

**Back-compat:** παλιά links `/modules/[id]` δείχνουν grid. Καμία σπασμένη ροή.

## B — Redirect-after-login (`redirectTo`)

- **`hooks.server.ts`:** η ανακατεύθυνση μη-συνδεδεμένου γίνεται μόνο για
  **navigational GET** (αποκλεισμός non-GET· τα public routes/assets ήδη εξαιρούνται).
  Νέο: `/login?redirectTo=<encodeURIComponent(pathname + search)>`. Όριο μήκους
  `redirectTo` (π.χ. ≤ 512 chars) για αποφυγή τεράστιων URLs.
- **`login/+page.svelte`:** διαβάζει `redirectTo` από `page.url.searchParams`· μετά το
  επιτυχές login → `goto(safeRedirect(redirectTo) ?? '/', { replaceState: true })`
  (το Back δεν γυρνά στη φόρμα login).
- **`safeRedirect(value)`** (open-redirect guard): δέχεται μόνο εσωτερικό path —
  ξεκινά με `/`, **όχι** `//`, **όχι** `/\`, χωρίς backslash πριν το `?`. Αλλιώς `null`.

## D — Βιβλιοθήκη ↔ μαθήματα + links βιβλιοθήκης

- **Manifest subsection:** προαιρετικό `lessonLinks?: { module: string; lesson: string; label?: string }[]`
  δίπλα στο υπάρχον `modules: string[]` (backwards-compatible· το `build_manifest.py`
  συνεχίζει να δουλεύει — το νέο πεδίο μέσω `SUBSECTION_OVERRIDES`).
- **`library/[course]/[sub]/+page.svelte`:** κάτω από «Σχετικές ασκήσεις», render
  `<a href="/modules/<module>/<lesson>">▶ <label ή lesson title>`. Επειδή τα `/modules/*`
  είναι protected, ο μη-συνδεδεμένος χρήστης περνά αυτόματα από τη ροή B και επιστρέφει
  στο μάθημα.
- **Link βιβλιοθήκης:** ορατό κουμπί «📚 Βιβλιοθήκη» στο **home** (`/+page.svelte`) και στο
  **login page** (public route, επιτρέπεται).

## Accessibility / visual pass (μεσήλικες)

Στοχευμένα, χωρίς rewrite, στα αρχεία που ήδη αγγίζουμε:
- Μεγαλύτερα touch targets & κείμενο σε home/login/grid/breadcrumbs.
- Ορατά focus rings (πληκτρολόγιο), `scroll-behavior: smooth`.
- Breadcrumb «Αρχική › Ενότητα › Μάθημα» στο lesson page, ώστε ο χρήστης να μη χάνεται.
- Notice banner στο grid όταν έρχεται `?notice=locked|missing`.
- Σταθερό font με χαρακτήρα (system-safe, χωρίς νέα εξάρτηση αν δεν χρειάζεται).

## Tests (red-green — acceptance criteria)

- **A (Playwright):** direct URL valid lessonKey → φορτώνει το μάθημα· invalid → grid με
  `?notice=missing`· παλιό `/modules/[id]` → grid· internal next → URL αλλάζει με replaceState.
- **B (vitest unit):** `safeRedirect` δέχεται `/modules/x/y`, απορρίπτει `//evil.com`,
  `/\evil`, `https://evil`, `null`. **(Playwright):** GET σε protected χωρίς login →
  `/login?redirectTo=...`· μετά login → πάει στο σωστό path.
- **D (vitest unit):** subsection με `lessonLinks` → loader επιστρέφει σωστά entries·
  manifest validation: κάθε `lessonLinks.lesson` αντιστοιχεί σε υπαρκτό `lessonKey`.

## Μη-στόχοι (εδώ)

Workstreams C (πλήρες visual redesign), E (scam pool), F (module reorg). Η μαζική
χαρτογράφηση `lessonLinks` σε ~100 subsections είναι ξεχωριστό content task.
