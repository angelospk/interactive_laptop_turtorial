# Οδηγός (guided tour) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Νέος τύπος μαθήματος `guide`: spotlight βήμα-βήμα πάνω στην πραγματική προσομοίωση, φωνή/λεζάντες από αρχείο σεναρίου, «Το ξέρω» → ασκήσεις πράσινες, «Επόμενο» → επόμενο ανολοκλήρωτο. Πιλότος: module5.

**Architecture:** Καθαρά TS modules (`script`, `machine`, `idle`, `nextUnfinished`) με unit tests· ένα endpoint για τις απαντήσεις· λεπτό Svelte UI (`GuideLesson` + `GuideSpotlight`) που συνδέει μηχανή, ήχο και `BrowserApp`. Spec: `docs/superpowers/specs/2026-10-04-guided-tour-design.md`.

**Tech Stack:** SvelteKit 2 / Svelte 5 runes, drizzle (libsql), vitest (server + browser projects), Playwright.

**Tests:** `npx vitest run --project server <path>` (node) · `npx vitest run --project client <path>` (browser) · `npx playwright test e2e/guide.test.ts`.

---

## File map

| Αρχείο | Ευθύνη |
|---|---|
| `src/lib/guides/script.ts` (+test) | `parseScript(md) → Map<id,{text,caption}>`, `stripTags` |
| `src/lib/guides/scripts.ts` | φορτώνει `docs/guides/*.script.md` (`import.meta.glob ?raw`) |
| `src/lib/guides/types.ts` | `GuideDefinition`, `GuideStep`, `clipIdsFor(guide)` |
| `src/lib/guides/module5.ts`, `index.ts` | ορισμός πιλότου, registry `guides[guideId]` |
| `src/lib/guides/contracts.test.ts` | clips υπάρχουν, lessonIds στο module, seeded guideIds έχουν ορισμό |
| `src/lib/guides/machine.ts` (+test) | μηχανή καταστάσεων |
| `src/lib/guides/idle.ts` (+test) | χρονόμετρο αδράνειας |
| `src/lib/guides/audio.ts` | ήχος + σίγαση |
| `src/lib/lessons/nextUnfinished.ts` (+test) | επόμενο ανολοκλήρωτο |
| `src/routes/api/lessons/guide-answers/+server.ts` (+test) | αποθήκευση απαντήσεων |
| `src/lib/components/lessons/interactive/GuideLesson.svelte` (+svelte test) | UI |
| `src/lib/components/lessons/GuideSpotlight.svelte` | σκοτεινό φόντο με «τρύπα» |
| τροποποιήσεις | `schema.ts`, `testDb.ts`, `+layout.server.ts`, `complete/+server.ts`, `LessonRunner.svelte`, `LessonCard.svelte`, `BrowserApp.svelte` (`data-guide`), `lessonTypeRegistry.ts`, `module5-lessons.ts`, `moduleOrganization.ts`, `messages/*.json`, README, FEATURES |

## Task 1: Parser σεναρίου (bead 8vz.1)

- [ ] Test `script.test.ts`:
  - `parseScript` διαβάζει `## a.b` headings, κείμενο ως το επόμενο heading, αγνοεί `>` γραμμές και το προοίμιο πριν το πρώτο `##`.
  - `caption` = χωρίς `[...]`, συμπτυγμένα κενά, trim· `text` = αυτούσιο (χωρίς σημειώσεις).
  - διπλό id → throw με το id στο μήνυμα· κενό clip → throw.
- [ ] Υλοποίηση `parseScript`, `stripTags`. `scripts.ts`: `allClips()` συγχωνεύει όλα τα αρχεία, throw σε διπλό id μεταξύ αρχείων.
- [ ] Commit.

## Task 2: Τύποι, ορισμός module5, contracts (8vz.1)

```ts
export type GuideSim = 'browser';
export interface GuideStep { id: string; target: string; lessonIds: string[] }
export interface GuideDefinition { id: string; moduleId: string; sim: GuideSim; simConfig: Record<string, unknown>; steps: GuideStep[] }
export const COMMON = { intro: ['common.intro.how','common.intro.controls'], known: [...3], unknown: [...3], idle: [...2], outro: { all, some, none } };
export const stepClip = (g, s) => `${g.id}.step.${s.id}`; export const hintClip = ...; export const introClip = g => `${g.id}.intro`;
export function clipIdsFor(g): string[]
```

- [ ] Test `contracts.test.ts`: για κάθε guide, κάθε `clipIdsFor` υπάρχει στο `allClips()`· κάθε lessonId υπάρχει στα seeds και έχει `moduleId === guide.moduleId`· κάθε seeded lesson `lessonType==='guide'` έχει `config.guideId` στο registry· step ids μοναδικά.
- [ ] Υλοποίηση. Commit.

## Task 3: Μηχανή (8vz.2)

```ts
type Phase = 'start' | 'intro' | 'step' | 'feedback' | 'done';
interface GuideState { phase; stepIndex; introIndex; answers: Record<stepId,'known'|'unknown'>; clip: string | null; feedbackCount }
createGuide(def) → state(start, clip null)
begin(s)       // start→intro, clip=intro[0]
clipEnded(s)   // intro: επόμενο intro clip ή μένει (clip null) περιμένοντας «Πάμε»· feedback → nextStep
proceed(s)     // intro → step 0
answer(s, k)   // step → feedback, answers[step]=k, clip = known/unknown[feedbackCount % 3]
nextStep(s)    // feedback → step+1 ή done (clip = outro all/some/none)
summary(s)     // {known, total}
```
Κάθε συνάρτηση επιστρέφει νέο state (immutable), αγνοεί άκυρη μετάβαση (επιστρέφει το ίδιο state).

- [ ] Tests: πλήρης διαδρομή· εναλλαγή feedback clips· outro all/some/none· answer εκτός step αγνοείται· βήμα χωρίς lessonIds μετράει στο σύνολο.
- [ ] Υλοποίηση. Commit.

## Task 4: Αδράνεια (8vz.2)

`createIdleWatcher({ firstMs: 30000, secondMs: 75000, onNudge(level: 1|2) }, clock = { setTimeout, clearTimeout })` με `reset()`, `stop()`. Μετά το level 2 δεν ξαναχτυπά μέχρι `reset()`.

- [ ] Tests με `vi.useFakeTimers()`: 30s → 1· 75s → 2· reset στα 20s μεταθέτει· μετά το 2 τίποτα· stop ακυρώνει.
- [ ] Υλοποίηση. Commit.

## Task 5: Πρόοδος & endpoint (8vz.3)

- [ ] `schema.ts`: `source: text('source')` στο `userProgress`· `testDb.ts` DDL `source TEXT`.
- [ ] Test `guide-answers.test.ts` (ίδιο mock pattern με `complete.test.ts`):
  401 χωρίς user· 400 χωρίς answers / μη-guide `guideLessonId`· 400 lessonId άλλου module· known → row `completed, source='guide', score null`· known πάνω σε πραγματική ολοκλήρωση → αμετάβλητη· known πάνω σε μη ολοκληρωμένη row → completed + source guide· unknown → διαγράφει μόνο source guide· unknown πάνω σε πραγματική → αμετάβλητη.
- [ ] Test στο `complete.test.ts`: πραγματική λύση μετά από guide row → `source` null, score ορισμένο.
- [ ] Υλοποίηση endpoint + `complete` θέτει `source: null` + layout map περιλαμβάνει `source`.
- [ ] Commit.

## Task 6: Επόμενο ανολοκλήρωτο (8vz.4)

`nextUnfinished(lessons: {id}[], progress: Record<id,{completed?}>, from: number): number | null`

- [ ] Tests: προσπερνά ολοκληρωμένα· null όταν όλα μετά είναι ολοκληρωμένα· δεν κοιτάει πίσω· τελευταίο → null.
- [ ] `LessonRunner`: νέα `nextUnfinishedLesson()` στα κουμπιά της οθόνης αποτελέσματος (γραμμές ~576/586)· η μπάρα (γρ. ~437) μένει `nextLesson`. Test στο `LessonRunner.svelte.test.ts`: μετά από ολοκλήρωση, «Επόμενο» προσπερνά ήδη ολοκληρωμένο.
- [ ] Commit.

## Task 7: UI + πιλότος (8vz.5)

- [ ] `BrowserApp.svelte`: `data-guide` = `tabs` (λωρίδα), `new-tab`, `close-tab` (Χ ενεργής καρτέλας), `nav-buttons` (wrapper), `address-bar` (wrapper), `bookmark`, `history`, `search` (πλαίσιο Google αρχικής), `page` (περιοχή περιεχομένου). `zoom`/`find` στοχεύουν το `page`.
- [ ] `audio.ts`: `createGuideAudio({ base: '/audio/guides/' })` → `play(id, onEnd)`, `stop()`, `muted` (localStorage `guide-muted`). Σε σίγαση/σφάλμα/404 καλεί `onEnd` μετά από `max(2500, chars*55)` ms.
- [ ] `GuideSpotlight.svelte`: props `target: string | null`, `container: HTMLElement`· βρίσκει `[data-guide=target]`, rect με `ResizeObserver` + `scroll`/`resize`· SVG mask με τρύπα + κίτρινο περίγραμμα· `pointer-events: none`· παλμός μόνο `motion-safe:`.
- [ ] `GuideLesson.svelte`: start οθόνη «Ξεκινάμε», λεζάντα `aria-live`, κουμπιά «Το ξέρω ✓»/«Δεν το ξέρω» (min-h 56px), σίγαση/«Ξανά» πάνω δεξιά, «Έξοδος» κάτω δεξιά (`onBack`), αδράνεια → idle clips/hint + παλμός κουμπιών, απαντήσεις στο endpoint (1 retry, ουρά), τέλος: «Ξέρατε Χ από τα Υ», μήνυμα μη αποθηκευμένων + επανάληψη, «Συνέχεια» → `await` εκκρεμή → `onComplete(100)`.
- [ ] Component test `GuideLesson.svelte.test.ts` (fetch mocked): start → intro → «Πάμε» → φωτίζεται `address-bar`… → «Το ξέρω» στέλνει `known` με σωστά lessonIds → τέλος δείχνει σύνοψη → Συνέχεια καλεί onComplete.
- [ ] Registry `guide`, seed `module5-guide` (orderIndex 0, `config: { guideId: 'module5' }`), `moduleSections.module5` Θεωρία 4 / Οδηγός 1 / Εξάσκηση 10, i18n `module5_guide_title/desc` (el+en), `LessonCard` badge «🧭 Οδηγός» και «Το ήξερες».
- [ ] E2E `e2e/guide.test.ts` (αν τρέχει τοπικά το build· αλλιώς σημείωση).
- [ ] README + FEATURES. Commit.

## Self-review

Spec coverage: script/parser (T1), αντιστοίχιση (T2), μηχανή/feedback/outro (T3), αδράνεια (T4), source/endpoint/complete/badge (T5, T7), επόμενο ανολοκλήρωτο (T6), UI/ήχος/σίγαση/έξοδος/spotlight/a11y (T7), Turso (bead 8vz.6, εκτός agent). Τύποι συνεπείς: `GuideDefinition.id` = `config.guideId`.
