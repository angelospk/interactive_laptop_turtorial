# Σχεδιασμός: Ενσωμάτωση θεωρητικού υλικού ΕΑΨΙ

**Ημερομηνία:** 2026-06-09
**Κατάσταση:** Εγκεκριμένο σχέδιο (brainstorming → spec)

## 1. Στόχος

Σύνδεση του εξαγμένου θεωρητικού υλικού των 6 μαθημάτων ΕΑΨΙ (92 αρχεία Markdown, ιεραρχία Μάθημα → Ενότητα → Υποενότητα) με την υπάρχουσα εφαρμογή interactive digital-literacy tutorial:

1. Σερβίρισμα της θεωρίας ως δομημένα, αναγνώσιμα «μαθήματα».
2. Σύνδεση κάθε υποενότητας θεωρίας με τα σχετικά app modules/challenges (many-to-many).
3. Προτάσεις νέων ενοτήτων (challenges & quizzes) με βάση τα κενά που αναδεικνύει το υλικό.

## 2. Αποφάσεις (κλειδωμένες)

| Θέμα | Απόφαση |
|---|---|
| Σύνδεση θεωρίας ↔ interactive | **Και τα δύο**: reading-steps μέσα στα modules + κεντρική Βιβλιοθήκη Θεωρίας |
| Serving markdown | **GitHub CDN (jsDelivr) runtime**, με env-configurable base + τοπικό fallback |
| Granularity mapping | **Υποενότητα → module(s)**, many-to-many |
| Νέο περιεχόμενο | **Mix challenges + quizzes** (+ καθαρή θεωρία όπου δεν χρειάζεται άσκηση) |
| Κινητό/smartphone | **Μόνο θεωρία + quiz** — ΟΧΙ interactive simulation |

## 3. Αρχιτεκτονική

### 3.1 Content manifest (μία πηγή αλήθειας)

`content/manifest.json` περιγράφει όλη την ιεραρχία ΕΑΨΙ. Σχήμα:

```jsonc
{
  "courses": [
    {
      "id": "esm001",
      "moduleNumber": 1,
      "title": "Μάθημα 1: Εισαγωγή",
      "courseUrl": "https://courses.nadia.gov.gr/courses/course-v1:EAPSI+esm001+2025_S2/course/",
      "chapters": [
        {
          "title": "Χρήση Υπολογιστή",
          "subsections": [
            {
              "id": "esm001-c1-s2",
              "title": "Ο Υπολογιστής",
              "mdPath": "md/Μάθημα_1_Εισαγωγή/01_Χρήση_Υπολογιστή/02_Ο_Υπολογιστής.md",
              "sourceUrl": "https://courses.nadia.gov.gr/courses/course-v1:EAPSI+esm001+2025_S2/jump_to/block-v1:...",
              "modules": ["module3", "module1"],
              "kind": "theory"          // theory | theory+quiz | theory+challenge
            }
          ]
        }
      ]
    }
  ]
}
```

Το manifest παράγεται από script (`exported_courses/build_manifest.py`) που διασχίζει τα `_cache/_raw_*.json`, αντλεί `sourceUrl` από τα `lms_web_url`/`jump_to` των sequentials, και ενσωματώνει τον πίνακα mapping (§5). Το πεδίο `modules` & `kind` ορίζονται από επιμελημένο πίνακα στο script (όχι αυτόματα).

### 3.2 Serving & base URL

- Τα `content/md/**` + `content/manifest.json` ζουν στο repo.
- Env var **`PUBLIC_CONTENT_BASE_URL`**:
  - Dev/πριν το public repo: `/content` (σερβίρεται από `static/content` ή symlink) → δουλεύει χωρίς public repo.
  - Μετά το public: `https://cdn.jsdelivr.net/gh/<user>/<repo>@main/content`.
- Helper `resolveContentUrl(relPath)` συνθέτει base + path. Καμία αλλαγή κώδικα στη μετάβαση — μόνο env.
- jsDelivr αντί raw.githubusercontent: σταθερό CORS, global caching, versioning με `@tag`.

### 3.3 Rendering

- Βιβλιοθήκες: **`marked`** (runtime parse) + **`dompurify`** (sanitize) + Tailwind **`prose`** (το `@tailwindcss/typography` υπάρχει ήδη).
- Component `lib/components/content/MarkdownView.svelte`: δέχεται `mdPath`, κάνει fetch (με in-memory cache), parse, sanitize, render σε `prose` container.
- Εικόνες: παραμένουν hotlinked στο `courses.nadia.gov.gr` (επιβεβαιωμένα public). Μελλοντικό προαιρετικό mirror.
- Footer πηγής: «Πηγή: Εθνική Ακαδημία Ψηφιακών Ικανοτήτων (nadia.gov.gr)» → `sourceUrl`.

### 3.4 Reading lessons (μέσα στα modules)

- Νέος `lessonType: "reading"`.
- Component `lib/components/lessons/interactive/ReadingLesson.svelte` (χρησιμοποιεί `MarkdownView`).
- `config: { mdPath, sourceUrl }`.
- Ολοκλήρωση: standalone (όπως το υπάρχον `QuizLesson`) — κουμπί «Το διάβασα ✓» καλεί `onComplete(100)`. **Χωρίς** goal/goalHandler (απλούστερο· δεν περνά από το desktop-simulation goal system).
- Seed: για κάθε υποενότητα με `kind` που περιλαμβάνει theory & module(s), δημιουργείται reading lesson στα αντίστοιχα modules, με `orderIndex` πριν τα σχετικά challenges.

### 3.5 Βιβλιοθήκη Θεωρίας

- Routes:
  - `/library` — δέντρο όλων των μαθημάτων/ενοτήτων (από manifest).
  - `/library/[course]/[subsection]` — render μιας υποενότητας + «Σχετικά challenges» (links στα modules του `modules[]`).
- `+page.server.ts` φορτώνει το manifest (server-side fetch με cache).
- i18n: τίτλοι route μέσω Paraglide· το ίδιο το περιεχόμενο είναι ελληνικό (όπως η πηγή).

## 4. Νέες ενότητες (από τα κενά)

**Νέα challenges (interactive simulation):**
- Social media — βασική χρήση Facebook/YouTube.
- Παρουσιάσεις — PowerPoint-like.
- Troubleshooting — σενάρια επίλυσης («ο υπολογιστής δεν ανοίγει»).

**Νέα quizzes (γνωσιακά, από θεωρία):**
- Κινητές συσκευές (αντί για simulation).
- Πνευματικά δικαιώματα.
- Εργονομία & υγεία.
- Επιπτώσεις τεχνολογίας (θετικές/αρνητικές).
- Ασφαλείς ηλεκτρονικές συναλλαγές.
- Πολυμέσα (είδη αρχείων).

**Μόνο θεωρία:** Επισκοπήσεις, «Η τεχνολογία στη ζωή μας», «Επιμόρφωση & εκπαίδευση».

> Σημείωση: Η §4 ορίζει το *τι* θα προστεθεί. Η λεπτομερής υλοποίηση κάθε νέου challenge/quiz θα γίνει σε επόμενες φάσεις/specs. Σε αυτή τη φάση παραδίδεται: manifest + mapping, reading lessonType, Βιβλιοθήκη, και seed των reading lessons + quizzes που προκύπτουν άμεσα από το υλικό.

## 5. Πίνακας mapping (αρχικός — υποενότητα → module(s))

| ΕΑΨΙ υποενότητα/ομάδα | App module(s) | kind |
|---|---|---|
| Ο Υπολογιστής, Περιήγηση Windows 11 | module3, module1 | theory |
| Ρυθμίσεις προσβασιμότητας | module9 | theory |
| Χρήση κινητού (όλη η ενότητα) | — (νέο: quiz «Κινητό») | theory+quiz |
| Διαδίκτυο, Ιστοσελίδες, Μηχανές αναζήτησης | module5 | theory |
| Αναζήτηση με LLM | module13 | theory |
| Δημόσιες/ΑμεΑ υπηρεσίες | module12 | theory |
| Ηλεκτρονικές αγορές/τραπεζικές | module8 | theory+quiz |
| Email | module6 | theory |
| Messenger, Viber, Teams/Meet/Zoom | module11 | theory |
| Facebook, YouTube | — (νέο challenge «Social») | theory+challenge |
| Google Docs/Drive | word, module4 | theory |
| Προσωπικά δεδομένα, κανόνες | module8, module10 | theory+quiz |
| Επεξεργαστής κειμένου | word | theory |
| Υπολογιστικά φύλλα | module7 | theory |
| Παρουσιάσεις | — (νέο challenge «Παρουσιάσεις») | theory+challenge |
| Πολυμέσα | — | theory+quiz |
| Πνευματικά δικαιώματα | module10 | theory+quiz |
| Κυβερνοασφάλεια, παραβιάσεις | module8, module10 | theory |
| Η τεχνολογία στη ζωή μας / Εργονομία | — | theory+quiz |
| Συχνά προβλήματα (troubleshooting) | module9 (νέο challenge) | theory+challenge |
| Επιμόρφωση & εκπαίδευση | — | theory |

(Ο πλήρης, ανά-υποενότητα πίνακας υλοποιείται στο `build_manifest.py`. Επισκοπήσεις = theory.)

## 6. Ασφάλεια repo (πριν γίνει public)

Checklist που θα τρέξει ως ξεχωριστό βήμα:
- Σάρωση για secrets/API tokens/Turso credentials σε όλο το tree **και στο git history**.
- Επιβεβαίωση ότι `.env`, `local.db`, `.beads/` (Dolt creds) είναι gitignored & δεν έχουν committed.
- `.env.example` χωρίς πραγματικές τιμές (υπάρχει ήδη).
- Επιβεβαίωση αδειών/πηγής υλικού ΕΑΨΙ (attribution links σε κάθε σελίδα).

## 7. Εκτός σκοπού (YAGNI)

- Mirroring εικόνων (μένει hotlink).
- Πλήρης υλοποίηση όλων των νέων challenges (επόμενες φάσεις).
- Authoring UI για το manifest (χειροκίνητη επιμέλεια στο script αρκεί).
- Μετάφραση θεωρίας στα αγγλικά (η πηγή είναι ελληνική).

## 8. Μονάδες & όρια (για isolation)

| Μονάδα | Τι κάνει | Εξαρτήσεις |
|---|---|---|
| `build_manifest.py` | Παράγει `content/manifest.json` από cache + mapping | `_cache/*.json` |
| `resolveContentUrl` | base + relPath → πλήρες URL | `PUBLIC_CONTENT_BASE_URL` |
| `MarkdownView.svelte` | fetch + parse + sanitize + render | marked, dompurify, resolveContentUrl |
| `ReadingLesson.svelte` | reading lesson + goal read-content | MarkdownView, goalHandlers |
| `/library` routes | δέντρο + ανάγνωση υποενότητας | manifest, MarkdownView |
| seed (reading + quiz) | δημιουργεί lessons από manifest | manifest, schema |

## 9. Testing

- `goalHandlers.test.ts`: νέος goal `read-content` (scroll-to-end → complete).
- Unit test `resolveContentUrl` (base variants).
- Unit test `build_manifest.py` (ελάχιστο: παράγει έγκυρο JSON, κάθε subsection έχει mdPath που υπάρχει).
- Component smoke test `MarkdownView` (render markdown με εικόνα/link/heading).
