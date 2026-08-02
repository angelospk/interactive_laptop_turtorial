# Απόφαση: Ελληνικό-μόνο interactive lesson content (όριο i18n)

_2026-07-22. Αφορά το issue C3. Ελήφθη με best-practice + codex review._

## Το όριο (τι μεταφράζεται και τι όχι)

| Επίπεδο                                                                                                             | Localized (el + en);            | Πηγή                                                                                         |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------- |
| **UI chrome**: πλοήγηση, κουμπιά, μηνύματα σφάλματος, accessibility controls, τίτλοι/περιγραφές μαθημάτων & modules | ✅ Ναι (el + en)                | `messages/el.json`, `messages/en.json` — enforced από το `contracts.test.ts` (parity el↔en) |
| **Lesson narratives**: prompts, hints, success/miss μηνύματα, περιεχόμενο προσομοιώσεων, σενάρια                    | ❌ Όχι — **ελληνικά by design** | Τυποποιημένα ανά-track seed builders (`src/lib/db/seeds/*-lessons.ts`, `mobile-track.ts`)    |

## Γιατί

Το κοινό είναι **ρητά Έλληνες ηλικιωμένοι** (ΚΑΠΗ / «Όλοι Digital»). Το interactive περιεχόμενο (τι λέει ο ψηφιακός βοηθός, πώς μοιάζει ένα ύποπτο SMS, οι οδηγίες βήμα-βήμα) είναι **authored εκπαιδευτικό υλικό**, όχι UI strings. Η δίγλωσση συντήρησή του θα:

- διπλασίαζε τον όγκο συντήρησης χωρίς πραγματικό κοινό για τα αγγλικά,
- ρίσκαρε αγγλικές μεταφράσεις που χάνουν το ελληνικό context (gov.gr, ΕΛΤΑ, ΔΕΗ, TaxisNet, Viber-first),
- δεν προσφέρει τίποτα στο target group.

Το `en.json` καλύπτει σκόπιμα **μόνο** το chrome, ώστε το EN UI να είναι λειτουργικό (όχι raw keys) — δες issue `dyc`.

## Συνέπεια για την υλοποίηση (η «καλή» μορφή του C3)

Το ζητούμενο **δεν** είναι full i18n· είναι **externalization**: το ελληνικό copy να ζει σε **τυποποιημένα per-track content αρχεία**, όχι σκορπισμένο μέσα σε components. Αυτό **ήδη ισχύει** — τα prompts/hints ζουν στα typed seed builders (`mac-lessons.ts`, `mobile-track.ts`, κ.λπ.), όχι hardcoded σε `.svelte`. Άρα το C3 θεωρείται **καλυμμένο**:

- ✅ Content σε typed seed files (externalized).
- ✅ Chrome i18n el+en με parity contract.
- ❌ Δεν προστίθενται αγγλικά για prompts/hints/σενάρια (by design).

**Μελλοντικό (αν ποτέ χρειαστεί άλλη γλώσσα περιεχομένου):** επειδή το copy είναι ήδη σε typed αρχεία, η μετάφραση γίνεται προσθέτοντας ένα locale layer πάνω στα seed builders — χωρίς άγγιγμα components. Δεν το κάνουμε τώρα.

## Κανόνας για νέους agents / συνεισφορές

Όταν προσθέτεις interactive lesson: **τίτλος/περιγραφή** → i18n keys σε **el + en**. **prompt/hint/σενάρια** → ελληνικά, μέσα στο seed builder. Μην προσθέτεις αγγλικά prompts.
