# Spec: Per-device analytics στο admin panel (B7)

_2026-07-22. **Spec-only** — codex review: privacy/consent/storage χρειάζονται ανθρώπινη απόφαση πριν υλοποίηση. Μην το κάνει one-shot agent._

## Στόχος

Στο admin panel: ποιο device track προχωράει, πού κολλάνε οι μαθητές, ανά συσκευή (windows/mac/android/iphone).

## Γιατί χρειάζεται σχεδιασμό πριν κώδικα

1. **Privacy/consent**: συσχέτιση προόδου με `preferredDevice` + user είναι προσωπικά δεδομένα ηλικιωμένων (GDPR, «Όλοι Digital» πλαίσιο). Χρειάζεται απόφαση: aggregate-only vs per-user; consent copy.
2. **Event semantics**: τι μετράμε; lesson-start, lesson-complete, wrong-taps, drop-off σημείο. Δεν υπάρχει event pipeline σήμερα — μόνο `user_progress` (completed/score).
3. **Storage/aggregation**: νέος πίνακας events vs aggregation πάνω στο υπάρχον `user_progress`. Το δεύτερο είναι φθηνό MVP.
4. **Device identity**: `preferredDevice` είναι δηλωμένη προτίμηση, όχι πραγματική συσκευή — τα analytics πρέπει να το λένε ρητά.

## Προτεινόμενο MVP (μετά από απόφαση consent)

- **Aggregate-only, χωρίς νέο pipeline**: query πάνω στο υπάρχον `user_progress` + `users.preferredDevice`.
- Metrics ανά device: #ενεργοί μαθητές, μέσο % ολοκλήρωσης base-path ανά module, top «κολλήματα» (μαθήματα με χαμηλότερο completion rate).
- Νέα σελίδα `src/routes/admin/analytics/+page.svelte` + server load (drizzle group-by).
- Καμία per-user έκθεση χωρίς ρητή απόφαση.

## Acceptance criteria (όταν υλοποιηθεί)

- [ ] Consent/privacy απόφαση καταγεγραμμένη (aggregate-only ή όχι).
- [ ] Admin-only route (reuse υπάρχον admin auth).
- [ ] Aggregation queries χωρίς N+1, δουλεύουν σε Turso.
- [ ] Ρητή σήμανση «δηλωμένη προτίμηση, όχι ανιχνευμένη συσκευή».
- [ ] Δεν εκθέτει PII πέρα από ό,τι το admin ήδη βλέπει (`admin/statistics`).

## Blockers

Απόφαση χρήστη: aggregate-only vs per-user· χρειάζεται consent copy; νέος events πίνακας ή όχι.
