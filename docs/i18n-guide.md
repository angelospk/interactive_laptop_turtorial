# Οδηγός: προσθήκη i18n keys για νέο module ή μάθημα

Κάθε module και lesson εμφανίζει τίτλο/περιγραφή μέσω **paraglide** i18n keys. Αν
ένα key λείπει, η εφαρμογή δείχνει το raw key (π.χ. `android_title`) αντί για
κείμενο. Αυτός ο οδηγός δείχνει τη ροή end-to-end, με πραγματικό παράδειγμα το
Android module.

## Αρχεία που αλλάζουν

| Αρχείο | Ρόλος |
|---|---|
| `messages/el.json` | Ελληνικά (**πρωτεύον** — η εφαρμογή είναι forced-Greek) |
| `messages/en.json` | Αγγλικά (bilingual πληρότητα) |
| `src/lib/db/seeds/modules.ts` | Το module δηλώνει `titleKey` / `descriptionKey` |
| `src/lib/db/seeds/<module>-lessons.ts` | Κάθε lesson δηλώνει `titleKey` / `descriptionKey` |

> Το `src/lib/paraglide/` είναι **generated** (gitignored) — δεν το πειράζεις με το χέρι.

## Σύμβαση ονοματοδοσίας keys

```
<moduleId>_title            π.χ. android_title
<moduleId>_description      π.χ. android_description
<moduleId>_lesson<N>_title  π.χ. android_lesson1_title
<moduleId>_lesson<N>_desc   π.χ. android_lesson1_desc
```

Κανόνες (τους ελέγχει το `schema.test.ts`):
- Τα keys είναι **χωρίς κενά** και το title-key περιέχει `title`, το desc-key `desc`.
- Εξαίρεση: τα `reading` lessons χρησιμοποιούν literal τίτλους από το manifest — δεν
  ακολουθούν τη σύμβαση key (φιλτράρονται στο test).

## Βήματα

**1. Πρόσθεσε τα keys και στα δύο αρχεία** (ίδια keys, μεταφρασμένες τιμές):

```jsonc
// messages/el.json
"android_title": "Κινητό Android [BETA]",
"android_description": "Μάθε να χρησιμοποιείς το κινητό σου Android …",
"android_lesson1_title": "1. Άνοιξε μια εφαρμογή",
"android_lesson1_desc": "Εξάσκηση: βρες και πάτησε το σωστό εικονίδιο …",
```

```jsonc
// messages/en.json
"android_title": "Android Phone [BETA]",
"android_description": "Learn to use your Android phone …",
"android_lesson1_title": "1. Open an app",
"android_lesson1_desc": "Practice: find and tap the correct icon …",
```

**2. Δήλωσε τα keys στο seed** (`modules.ts` + το `<module>-lessons.ts`):

```ts
{ id: 'android', titleKey: 'android_title', descriptionKey: 'android_description', iconName: 'Smartphone', enabled: true }
```

**3. Compile τα paraglide messages** (αλλιώς το `m.<key>` δεν υπάρχει ακόμα):

```bash
bunx @inlang/paraglide-js compile --project ./project.inlang --outdir ./src/lib/paraglide
```

Το `bun run dev` / `bun run build` κάνει το ίδιο αυτόματα.

**4. (Προαιρετικό) Χρήση στο UI** — για hardcoded strings σε components:

```svelte
import * as m from '$lib/paraglide/messages.js';
…
{m.android_title()}
```

**5. Επαλήθευση**:

```bash
bun run check       # svelte-check — resolve-άρει τα m.<key>
bun run test        # schema.test ελέγχει key-format + validΤypes
```

## Παγίδες

- **Ξέχασες το `en.json`** → το key λείπει σε αγγλικά· πρόσθεσέ το πάντα και στα δύο.
- **Δεν έκανες compile** → svelte-check λέει «Property '…' does not exist on messages».
- **Νέο lessonType** → πρόσθεσέ το και στο `validTypes` set του `schema.test.ts`.
- **Το UI δείχνει το raw key** → το module/lesson δεν έχει seed-αριστεί στη βάση
  (τρέξε το seed· δες README §Database — provisioning με `db:push`).
