# Features

Το πλήρες κατάλογο λειτουργιών τον κρατά το `README.md` (ενότητα «Features»). Εδώ
μπαίνουν οι λειτουργίες με περισσότερες λεπτομέρειες απ' όσες χωράνε σε μια γραμμή.

## Τέσσερις προσομοιωτές (Windows · macOS · Android · iPhone)

Πλήρης περιγραφή, συμβόλαια events, οδηγίες σύνδεσης νέων controls με μαθήματα
και ροές επαλήθευσης: `docs/SIMULATORS.md`. Σύντομα:

- Ένας ιδιοκτήτης κατάστασης ανά OS (`osState` singleton με `reset()` ανά μάθημα,
  `MacState` / `PhoneState` ανά lesson instance) — Wi-Fi/φωτεινότητα/φακός κ.λπ.
  φαίνονται σε tray, status bar, Control Center και Settings ταυτόχρονα.
- Κάθε ορατό κουμπί είτε αλλάζει αυτή την κατάσταση, είτε εκπέμπει το υπάρχον
  event του goal, είτε εξηγεί inline (`role="status"`) ότι δεν χρειάζεται.
- Windows: Win11 Start/αναζήτηση/Task View με thumbnails, Quick Settings με
  λίστα δικτύων + κωδικό, ημερολόγιο, εικονίδια επιφάνειας (διπλό κλικ).
- Mac: Apple/App/File… μενού, Wi-Fi popover, Κέντρο ελέγχου, Finder με
  λίστα/εικονίδια/αναζήτηση/ιστορικό, System Settings με sidebar, zoom παραθύρου.
- Κινητά: `variant` σε κάθε component — Google Phone/Messages/Chrome vs iOS
  Phone/Messages/Safari, Android QS vs iOS Control Center, Dynamic Island.

## Οδηγός (guided tour)

Τύπος μαθήματος `guide`, ανάμεσα σε «Θεωρία» και «Εξάσκηση» κάθε module. Κάθε
module έχει τον δικό του Οδηγό (`src/lib/guides/<module>.ts`). Ο Οδηγός ανοίγει την
προσομοίωση του module μέσα από το `GuideSim.svelte`:

| `sim` | Τι ανοίγει | Modules |
|---|---|---|
| `browser` | `BrowserApp` | module5, module8, module12, module13, bank |
| `desktop` | `DesktopLesson` με `embedded` (χωρίς πλαίσιο μαθήματος, χωρίς στόχο) | module3, module4, module6 (email), word, module7, module9, module10, module11 |
| `mouse-pad` | `MousePad`: πέρασμα, κλικ, διπλό κλικ, δεξί κλικ, σύρσιμο | module1 |
| `keyboard-pad` | `KeyboardPad`: κουτί κειμένου σαν συνομιλία και τα βασικά πλήκτρα | module2 |
| `phone` | `MobileSimLesson` με `embedded`· το κινητό μικραίνει για να χωρά στη σκηνή | android, iphone |
| `mac` | `MacSimLesson` με `embedded` | mac |
| `gov` | `GovGuideSim`: το `GovGrApp`, με την οθόνη (σύνδεση, υπηρεσίες, βεβαίωση, εξουσιοδότηση) που ζητά το `target` του βήματος | gov |
| `health` | `HealthGuideSim`: το `HealthApp`, με την οθόνη `health-sms` / `health-portal` / `health-appointments` του `target` | health |

Οι ακριβείς αντιστοιχίες είναι στα `src/lib/guides/*.ts`. Το `GuideSim` παίρνει και το
`target` του τρέχοντος βήματος: έτσι μια προσομοίωση με οθόνες δείχνει τη σωστή, ακόμα
κι αν ο χρήστης πάτησε «Παράλειψη» στο προηγούμενο βήμα. Στο `desktop` ένα `target`
`taskbar-<app>` δεν κρύβεται ποτέ στο «•••» της γραμμής εργασιών, ακόμα και σε στενή οθόνη
(`guideTarget` → `keepAppIds` του `Taskbar`).

Όταν το `target` ενός βήματος λείπει (π.χ. ο χρήστης έκλεισε το παράθυρο), ο Οδηγός
περιμένει έως 2,5″ (`waitForTarget`, για στοιχεία που εμφανίζονται με καθυστέρηση) και
μετά ξαναστήνει το demo. Το `resumeConfig` ενός οδηγού είναι το demo αυτής της
επανεκκίνησης (π.χ. το email ή η τράπεζα ήδη ανοιχτά)· χωρίς αυτό, ξαναμπαίνει το
`simConfig`.

Δύο είδη βημάτων («μικτός» Οδηγός):

- **Γνωριμία:** το στοιχείο φωτίζεται και ο χρήστης απαντά «Το ξέρω» / «Δεν το ξέρω».
- **Πρακτικό** (`task: { type, where }`): η κάρτα γράφει «Δοκιμάστε το εσείς». Ο Οδηγός
  περιμένει το event της προσομοίωσης (π.χ. `minimize-app`, `pad-typed` με
  `text: 'γεια σας'`). Μόλις γίνει, μετράει ως «Το ξέρω», παίζει ένα «Μπράβο»
  (`common.done.*`) και προχωρά. «Βοήθεια» = το `hint` του βήματος, «Παράλειψη» = «Δεν το ξέρω».
  Ό,τι κάνει ο χρήστης όσο παίζει το «Μπράβο» κρατιέται για το επόμενο βήμα, οπότε
  όποιος προτρέχει δεν κολλάει.

Τι κάνει ο χρήστης:

1. Πατά «Ξεκινάμε» (το πάτημα ξεκλειδώνει τον ήχο) και ακούει μια σύντομη εισαγωγή.
2. Σε κάθε βήμα ένα στοιχείο φωτίζεται με κίτρινο πλαίσιο· μπορεί να πατά ελεύθερα
   μέσα στο demo. Απαντά «Το ξέρω» ή «Δεν το ξέρω» και ο οδηγός προχωρά μόνος του.
3. Στο τέλος βλέπει «Ξέρατε Χ από τα Υ» και πατά «Συνέχεια». Το «Επόμενο Μάθημα»
   τον πηγαίνει στην πρώτη άσκηση που δεν ξέρει.

Τι γίνεται με την πρόοδο:

- «Το ξέρω» → οι ασκήσεις του βήματος γράφονται ολοκληρωμένες με `source = 'guide'`
  και χωρίς βαθμό· η κάρτα τους δείχνει «Το ήξερες».
- «Δεν το ξέρω» → αναιρεί μόνο ό,τι είχε σημειώσει οδηγός.
- Πραγματική λύση άσκησης δεν αγγίζεται ποτέ από τον οδηγό, και όταν ο χρήστης λύσει
  μια άσκηση που είχε δηλώσει «Το ξέρω», παίρνει κανονικό βαθμό (`source` → null).

Φωνή και λεζάντες:

- Σενάρια: `docs/guides/common.script.md` (κοινά clips) και `docs/guides/<module>.script.md`.
  Κάθε `## id` είναι ένα clip· το κείμενο επικολλάται στο ElevenLabs (Eleven v4,
  `eleven_v4`) με τα `[audio tags]` του. Η λεζάντα είναι το ίδιο κείμενο χωρίς tags.
- Ήχος: `static/audio/guides/<id>.mp3`. Αρχείο που λείπει, σίγαση ή μπλοκαρισμένος ήχος
  = μόνο λεζάντα, με χρόνο ανάγνωσης.
- Αδράνεια: 30″ → «Είστε εδώ;», 75″ → βοήθεια του βήματος και παλμός στα κουμπιά.

Νέος οδηγός για άλλο module:

1. `src/lib/guides/<module>.ts` (βήματα: `target` = `data-guide` της προσομοίωσης,
   `lessonIds` = ασκήσεις του ίδιου module, προαιρετικά `task`) και καταχώριση στο
   `src/lib/guides/index.ts`. Ένα `target` που δεν υπάρχει ως `data-guide` σε κανένα
   component το πιάνει contract test.
2. `docs/guides/<module>.script.md` με `<module>.intro`, `<module>.step.<βήμα>`, `<module>.hint.<βήμα>`.
3. Seed μάθημα `lessonType: 'guide'`, `config: { guideId }` και ενότητα «Οδηγός» στο `moduleSections`.
4. `npx vitest run --project server src/lib/guides` — τα contract tests λένε τι λείπει.
