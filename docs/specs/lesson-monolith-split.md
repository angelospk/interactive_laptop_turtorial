# Spec: Split DesktopLesson / BrowserApp monoliths (C2)

_2026-07-22. **Spec-only** — codex review: high regression risk + unclear component boundaries. Staged, human-supervised follow-up, ΟΧΙ automated burst._

## Πρόβλημα

- `src/lib/components/lessons/interactive/DesktopLesson.svelte` — legacy μονόλιθος: goal-check per-action, ad-hoc `openSettingsToPage` hacks, availableApps hardcoded, single-goal-per-lesson με scattered `checkGoal` calls. Είναι το «παλιό» pattern· το καθαρό pattern είναι το `MobileSimLesson`/`MacSimLesson` (typed config parser + `GOAL_REQUIREMENTS` + semantic-event `dispatch`).
- `src/lib/components/apps/BrowserApp.svelte` — μεγάλο, χειρίζεται browser + bank + gov flows μαζί.

## Γιατί όχι one-shot

- Πολλά υπάρχοντα desktop lessons (module3/4/5/6/7/9/…) εξαρτώνται από την ακριβή συμπεριφορά του DesktopLesson/BrowserApp → υψηλό regression risk.
- Τα όρια των components δεν είναι ξεκάθαρα (τι είναι «app» vs «window chrome» vs «goal glue»).
- Χρειάζεται characterization tests **πριν** το refactor, αλλιώς σπάει σιωπηλά.

## Προτεινόμενη σταδιακή προσέγγιση

1. **Characterization tests πρώτα**: browser tests που πινάρουν την τρέχουσα συμπεριφορά κάθε desktop lessonType/goal (open/minimize/close app, file ops, browser navigate, bank-login, gov-submit) — red/green safety net.
2. **Extract, μη rewrite**: βγάλε το goal-glue του DesktopLesson σε ένα `parseDesktopSimConfig` + `dispatch` όπως το mobile/mac, κρατώντας ΙΔΙΑ τα events/goals. Καμία αλλαγή σε seed configs/IDs.
3. **Split BrowserApp**: bank flow → `BankApp` component, gov flow → (συντονισμός με το νέο `GovGrApp` του B1), pure browser → μικρότερο `BrowserApp`. Ίδια semantic events ώστε οι goal handlers να μην αλλάξουν.
4. Migrate ένα-ένα module, τρέχοντας το characterization suite σε κάθε βήμα.

## Acceptance criteria

- [ ] Characterization suite πράσινο ΠΡΙΝ κάθε extract.
- [ ] Μηδέν αλλαγή σε lesson IDs / seed configs / goal ids.
- [ ] Πλήρες unit+e2e suite πράσινο μετά από κάθε στάδιο.
- [ ] Καμία οπτική/λειτουργική αλλαγή για τον μαθητή.

## Risk

Το πιο risky refactor του backlog. Κάν' το ΜΟΝΟ με το characterization net + σε μικρά, verifiable βήματα. Συντονισμός με B1 (gov) που ίσως ήδη έφτιαξε `GovGrApp`.
