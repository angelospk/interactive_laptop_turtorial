# Οι τέσσερις προσομοιωτές (Windows · macOS · Android · iPhone)

_2026-10-04 — redesign «ρεαλιστικοί και πλήρως λειτουργικοί». Ισχύει για ό,τι ζει
στα `src/lib/components/{desktop,mac,mobile}` και στα hosts
`DesktopLesson` / `MacSimLesson` / `MobileSimLesson` / `MobileTapLesson`._

## Αρχές

1. **Το μάθημα ακούει μόνο σημασιολογικά events.** Ένα control είτε αλλάζει
   κατάσταση που φαίνεται αλλού (status bar, tray, dim της οθόνης), είτε εκπέμπει
   το event που περιμένει ο `checkGoalMatch` (`src/lib/lessons/goalHandlers.ts`),
   είτε εξηγεί inline (role=status) γιατί δεν κάνει τίποτα στην άσκηση. Δεν
   υπάρχουν «νεκρά» κουμπιά.
2. **Ένας ιδιοκτήτης state ανά προσομοίωση.**
   - Windows: το singleton `osState` (`src/lib/osState.svelte.ts`) — ο
     `DesktopLesson` καλεί `osState.reset()` στην εκκίνηση κάθε μαθήματος.
   - Mac: `new MacState()` ανά `MacSimLesson` (`src/lib/components/mac/macState.svelte.ts`).
   - Κινητά: `new PhoneState()` ανά `MobileSimLesson` (`src/lib/components/mobile/phoneState.svelte.ts`).
     Το ίδιο instance περνάει σε chrome (menu bar / status bar / Control Center)
     και σε apps (Settings), ώστε Wi-Fi κλειστό στο ένα μέρος = κλειστό παντού.
3. **Τα ονόματα των events και τα payloads είναι συμβόλαιο** με τα seeds και τα
   tests. Το redesign δεν άλλαξε κανένα. Νέα controls που ΔΕΝ αντιστοιχούν σε
   goal δεν εκπέμπουν events (ώστε να μη μετρηθούν ως «λάθος» χωρίς λόγο).
4. **Μέγεθος στόχου ≥ 44px** για όσα ζητούν τα μαθήματα (caption buttons
   Windows 48×44, φανάρια Mac με hit area 36px, πλήκτρα κινητού 60px).

## Windows 11 (`desktop-simulation`)

| Στοιχείο                                     | Τι κάνει                                                                                                                                                                                                                                                                                                                                        | Event / state                                                          |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Ταπετσαρία (`Desktop.svelte`)                | CSS «Bloom», χωρίς δίκτυο. Dim από `osState.brightness`, θερμός τόνος από `osState.nightLight`. Κλικ στο κενό κλείνει το Start.                                                                                                                                                                                                                 | —                                                                      |
| Εικονίδια επιφάνειας (`DesktopIcons.svelte`) | «Αυτός ο υπολογιστής» (ανοίγει Εξερεύνηση), «Κάδος» (εξηγεί), Browser/Email/Word/Excel. 1 κλικ επιλογή, διπλό/Enter άνοιγμα.                                                                                                                                                                                                                    | `open-app {appId}` (ίδιο path με taskbar/Start)                        |
| Γραμμή εργασιών (`Taskbar.svelte`)           | Start (λογότυπο Win11), pill «Αναζήτηση» (ανοίγει Start), Προβολή Εργασιών, καρφιτσωμένα με tooltip + ένδειξη «τρέχει». Tray: κρυφά εικονίδια, Wi-Fi/ήχος/μπαταρία **που αντανακλούν το osState** (`data-wifi`, `data-muted`), ρολόι → ημερολόγιο (`CalendarFlyout.svelte`), καμπανάκι. Δεξί κλικ → Διαχείριση εργασιών / Ρυθμίσεις γραμμής.    | `open-start-menu`, `open-task-view`, `open-quick-settings`, `open-app` |
| Μενού Έναρξη (`StartMenu.svelte`)            | Αναζήτηση (χωρίς τόνους), Καρφιτσωμένα (χρωματιστά tiles), «Όλες οι εφαρμογές» (αλφαβητική λίστα), Προτεινόμενα (πρόσφατα αρχεία → Εξερεύνηση), χρήστης, Τροφοδοσία (Κλείδωμα/Αναστολή/Τερματισμός/Επανεκκίνηση → inline εξήγηση ότι ο PC της εξάσκησης δεν σβήνει). Esc κλείνει.                                                               | `open-app`                                                             |
| Παράθυρο (`Window.svelte`)                   | Win11 chrome, κουμπιά με aria-label («Ελαχιστοποίηση», «Μεγιστοποίηση»/«Επαναφορά μεγέθους», «Κλείσιμο παραθύρου»), διπλό κλικ στον τίτλο = μεγιστοποίηση, ανενεργό παράθυρο με αχνό τίτλο (`active` prop).                                                                                                                                     | `minimize-app`, `maximize-app`, `restore-app`, `close-app`             |
| Γρήγορες ρυθμίσεις (`QuickSettings.svelte`)  | 6 tiles (Wi-Fi με βέλος → λίστα δικτύων, Bluetooth, Λειτουργία πτήσης, Εξοικονόμηση, Νυχτερινός φωτισμός, Προσβασιμότητα), sliders φωτεινότητας/ήχου, σίγαση (κρατά την ένταση), γρανάζι → Ρυθμίσεις. Ασφαλή δίκτυα (`Home_WiFi`, `OTE_Network`, `targetSsid`) ζητούν κωδικό inline, έλεγχος με `config.requiredPassword` όπως το Settings app. | `connect-wifi {ssid}` (μέσω `Taskbar.onAction`)                        |
| Προβολή Εργασιών (`TaskView.svelte`)         | Thumbnails παραθύρων, × ανά παράθυρο (κλείνει το instance), κλικ επαναφέρει μέσω `restoreApp` (εκπέμπει `restore-app`). Νέα επιφάνεια: εξήγηση σε title. Esc κλείνει.                                                                                                                                                                           | `close-app`, `restore-app`                                             |
| Εξερεύνηση (`apps/FileExplorerApp.svelte`)   | Λειτουργικό πεδίο «Αναζήτηση στον φάκελο», πλαϊνή «Γρήγορη πρόσβαση» που ανοίγει τον ομώνυμο φάκελο ή εξηγεί στο status bar.                                                                                                                                                                                                                    | ως είχαν (`create-folder`, `rename`, `paste-*`, `drag-drop`, …)        |

## macOS (`mac-simulation`)

| Στοιχείο                                            | Τι κάνει                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Event / state                                                                 |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Επιφάνεια (`MacDesktop.svelte`)                     | Sonoma-style gradient, σκοτεινή εκδοχή όταν `machine.appearance === 'dark'`, dim από `machine.brightness`.                                                                                                                                                                                                                                                                                                                                                                                    | —                                                                             |
| Γραμμή μενού (`MacMenuBar.svelte`)                  | Μενού Apple (Σχετικά, **Ρυθμίσεις συστήματος…** → ανοίγει το Settings app χωρίς launch event, App Store, Ύπνος/Επανεκκίνηση/Τερματισμός → εξήγηση, Κλείδωμα), μενού εφαρμογής (Σχετικά, Ρυθμίσεις…, **Τερματισμός ⌘Q**), Αρχείο/Επεξεργασία/Προβολή/Παράθυρο/Βοήθεια (κάθε item εξηγεί). Δεξιά: Wi-Fi popover (διακόπτης + δίκτυα), μπαταρία, Spotlight, **Κέντρο ελέγχου** (Wi-Fi/Bluetooth/AirDrop/Συγκέντρωση/Εμφάνιση, sliders Οθόνη/Ήχος), ζωντανό ρολόι «Τρί 4 Οκτ 10:09». Esc κλείνει. | `mac-app-quit {appId}`; Spotlight → `mac-app-opened {source:'spotlight'}`     |
| Dock (`MacDock.svelte`)                             | Squircle tiles με vector εικονίδια (`ui/app-icon`, emoji μόνο ως fallback), magnification, tooltip, τελίτσα «τρέχει», διαχωριστικό + Κάδος (εξηγεί).                                                                                                                                                                                                                                                                                                                                          | `mac-app-opened {source:'dock'}`                                              |
| Παράθυρο (`MacWindow.svelte`)                       | Φανάρια με hit area 36px και glyph στο hover, **πράσινο = πραγματικό zoom** (`zoomed` prop, γεμίζει μεταξύ menu bar και Dock, toggle). Διπλό κλικ στον τίτλο = zoom.                                                                                                                                                                                                                                                                                                                          | `mac-window-closed`, `mac-window-control-used {control:'minimize' \| 'zoom'}` |
| Finder (`apps/FinderMacApp.svelte`)                 | Toolbar πίσω/μπροστά (ιστορικό, χωρίς re-emit), προβολή λίστα/εικονίδια, αναζήτηση (χωρίς τόνους, ανά φάκελο), sidebar Αγαπημένα από `config.folders` + inert iCloud/Θέσεις, λίστα με στήλες Όνομα/Ημερομηνία/Μέγεθος, path bar. Αντικείμενα: `folder.items` αν δοθούν (`[]` = άδειος), αλλιώς defaults ανά όνομα φακέλου. Διπλό κλικ σε αρχείο → εξήγηση. Φάκελος/προβολή ζουν στο `MacState`.                                                                                               | `mac-folder-opened {folderId}` (μόνο από sidebar)                             |
| Ρυθμίσεις συστήματος (`apps/MacSettingsApp.svelte`) | Δίστηλο με sidebar + αναζήτηση. Λειτουργικά panes: Wi-Fi, Bluetooth, Ήχος, Εμφάνιση (αλλάζει την ταπετσαρία), **Προσβασιμότητα** (μέγεθος κειμένου/δείκτη), Οθόνες (φωτεινότητα). Τα υπόλοιπα εξηγούν ότι δεν είναι στην άσκηση.                                                                                                                                                                                                                                                              | `mac-size-changed {setting, size}`                                            |

Νέο προαιρετικό πεδίο config: `folders[].items: {name, kind, modified?, size?}[]`
(validated στο `parseMacSimConfig`, kinds: folder/document/image/pdf/sheet/archive).

## Android & iPhone (`mobile-sim`, `mobile-tap`)

Όλα τα mobile components δέχονται `variant: 'android' | 'ios'` και το chrome αλλάζει:

| Στοιχείο                                    | Android                                                                                                                               | iPhone                                                                                                | Event / state                                                                                                                                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Πλαίσιο (`MobileFrame.svelte`)              | Ώρα αριστερά, σήμα/Wi-Fi/μπαταρία % δεξιά, gesture pill                                                                               | Dynamic Island, έντονη ώρα, home indicator                                                            | Status bar διαβάζει `phone` (Wi-Fi/πτήση/φακός/μπαταρία, `data-status=*`), dim από `phone.brightness`. Pull-down label: «Γρήγορες ρυθμίσεις» / «Κέντρο ελέγχου»                                       |
| Αρχική (`MobileHomeScreen.svelte`)          | Μεγάλο ρολόι + ημερομηνία, 4 στήλες στρογγυλά εικονίδια (vector, `ui/app-icon`), pill αναζήτησης Google (εξηγεί), dock                | 4 στήλες squircles, page dots, frosted dock                                                           | `mobile-app-opened {appId}`                                                                                                                                                                           |
| Πάνελ (`QuickSettingsPanel.svelte`)         | Pill tiles (Wi-Fi, Bluetooth, Φακός, Πτήση, Περιστροφή, Εξοικονόμηση), φωτεινότητα, footer (επεξεργασία/λειτουργία/ρυθμίσεις εξηγούν) | Control Center: 2×2 συνδεσιμότητα, Συγκέντρωση, Περιστροφή, sliders Φωτεινότητα/Ήχος, Φακός, Μπαταρία | `mobile-quick-toggle {tile, on}` — tile ids όπως πριν (+ `rotation`, `saver`, `dnd` που ποτέ δεν ικανοποιούν goal)                                                                                    |
| Τηλέφωνο (`apps/PhoneApp.svelte`)           | Google Phone: καρτέλες πάνω, πράσινο                                                                                                  | Phone: tab bar κάτω (Αγαπημένα/Πρόσφατα/Επαφές/Πληκτρολόγιο)                                          | `mobile-digit-typed`, `mobile-call-placed {number, contactId?}` — **ένα** event ανά κλήση, μετά οθόνη κλήσης με «Τερματισμός κλήσης»                                                                  |
| Μηνύματα/Viber (`apps/MessagingApp.svelte`) | Google Messages: μπλε φούσκες, avatars, αναζήτηση, FAB «Νέο μήνυμα» (εξηγεί)                                                          | iOS Messages: πράσινες SMS φούσκες, κεντρική επικεφαλίδα                                              | `mobile-message-sent`, `mobile-videocall-started`, `mobile-sms-verdict`. Απόδειξη «Παραδόθηκε», η λίστα δείχνει το τελευταίο μήνυμα, βιντεοκλήση με σίγαση/τερματισμό                                 |
| Ρυθμίσεις (`apps/MobileSettingsApp.svelte`) | Αναζήτηση + επίπεδη λίστα με χρωματιστά εικονίδια                                                                                     | Grouped inset λίστες, πίσω «‹ Ρυθμίσεις»                                                              | `mobile-font-size-set`, `mobile-wifi-connected`, `mobile-night-mode-set`, `mobile-find-device-set`. Επιπλέον σελίδες Bluetooth/Ήχος/Οθόνη (γράφουν στο `PhoneState`), Ειδοποιήσεις/Ασφάλεια (εξηγούν) |
| Browser (`apps/MobileBrowser.svelte`)       | Chrome: μπάρα πάνω, μενού ⋮                                                                                                           | Safari: μπάρα + toolbar κάτω                                                                          | Host πάντα ευανάγνωστο με λουκέτο/προειδοποίηση· toolbar εξηγεί                                                                                                                                       |
| Κάμερα (`apps/CameraApp.svelte`)            | Viewfinder, λειτουργίες Βίντεο/Φωτογραφία/Πορτρέτο, κλείστρο (εξηγεί), αλλαγή κάμερας                                                 | ίδιο, κίτρινη ενεργή λειτουργία                                                                       | `mobile-qr-scanned`, `mobile-qr-link-opened {url, host, confirmed}`                                                                                                                                   |
| Κατάστημα (`apps/StoreApp.svelte`)          | Play Store header                                                                                                                     | App Store header                                                                                      | `mobile-app-updated`, `mobile-app-installed` — μετά από 0,9″ «Ενημέρωση…/Εγκατάσταση…» (timers καθαρίζονται στο unmount)                                                                              |

Το `MobileTapLesson` (μάθημα 1 κάθε track) αποδίδει πλέον το ίδιο
`MobileHomeScreen` με χρώματα ανά γνωστό app id, ίδια aria-labels «Άνοιγμα X».

## Πώς συνδέεις ένα νέο control με μάθημα (οδηγός για τον επόμενο)

1. **Goal**: πρόσθεσε id στο `src/lib/lessons/goals.ts` και handler στο
   `goalHandlers.ts` (+ test στο `goalHandlers.test.ts`). Namespace `mobile-*` /
   `mac-*` για κινητά/Mac, ώστε events διαφορετικών OS να μη συγκρούονται.
2. **Event**: το component καλεί `onEvent('<action>', data)` (mobile/mac) ή
   `onAction(...)` (Windows). Για Windows chrome εκτός apps, το `Taskbar.onAction`
   φτάνει στο `DesktopLesson.handleAppAction` — δες το `connect-wifi` των
   Quick Settings ως παράδειγμα.
3. **Config**: αν χρειάζεται δεδομένα (δίκτυα, φάκελοι, items), πρόσθεσέ τα στο
   typed config (`mobileSim.ts` / `macSim.ts`) **με validation** στον parser, ώστε
   τα seed contract tests (`src/lib/db/seeds/contracts.test.ts`) να πιάνουν λάθη.
4. **Seed**: νέο μάθημα στο `src/lib/db/seeds/*` (ids αμετάβλητα μόλις shipped).
5. **Test**: browser test που περνάει από το host component (π.χ.
   `MobileSimLesson`) και ελέγχει `onComplete`, όχι εσωτερικά του component.

Έτοιμα για σύνδεση (state υπάρχει, goal ΔΕΝ υπάρχει ακόμη): Windows
night light / brightness / mute, Mac Wi-Fi/Bluetooth/Εμφάνιση/φωτεινότητα/zoom,
κινητό Bluetooth/περιστροφή/εξοικονόμηση/φωτεινότητα/ήχος, iOS Συγκέντρωση.
Πιθανά goals: `set-brightness {min}`, `mac-connect-wifi {ssid}`,
`mobile-set-brightness`, `mac-toggle-dark-mode`. Μηχανική: όπως παραπάνω, ο
handler συγκρίνει το payload με `config.target*`.

## Πώς το επαληθεύεις

```bash
# Browser tests των τεσσάρων προσομοιωτών (113 tests)
npx vitest run --project client src/lib/components/desktop src/lib/components/mac \
  src/lib/components/mobile src/lib/components/apps/FileExplorerApp.svelte.test.ts \
  src/lib/components/lessons/interactive/{DesktopLesson,MacSimLesson,MobileSimLesson,MobileTapLesson}.svelte.test.ts
# Συμβόλαια goals/configs/seeds
npx vitest run --project server src/lib/lessons src/lib/db/seeds
npm run check && npx eslint src/lib/components/{desktop,mac,mobile}
```

Χειροκίνητες ροές (dev server, μία ανά OS):

- **Windows** `/modules/module3/open-application` → tray Wi-Fi → κλείσε Wi-Fi → το
  εικονίδιο γίνεται γκρι· βέλος Wi-Fi → `Coffee_Shop` συνδέεται· ρολόι → ημερολόγιο·
  Start → Τροφοδοσία → Τερματισμός → inline εξήγηση· διπλό κλικ στον τίτλο παραθύρου.
- **Mac** `/modules/mac/quit-app` → Dock «Σημειώσεις» → πράσινο φανάρι (zoom) → ξανά
  (επαναφορά) → κόκκινο (η τελίτσα μένει) → μενού «Σημειώσεις» → Τερματισμός.
  Κέντρο ελέγχου → Εμφάνιση σκοτεινή → αλλάζει η ταπετσαρία.
- **Android** `/modules/android/connect-wifi` → Ρυθμίσεις → Wi-Fi → `SPITI-WIFI` →
  το Wi-Fi φαίνεται στο status bar· `/modules/android/quick-torch` → γραμμή ώρας →
  Φακός → εικονίδιο φακού στο status bar.
- **iPhone** `/modules/iphone/send-sms` → Μηνύματα → Ελένη → γράψε → Αποστολή →
  πράσινη φούσκα + «Παραδόθηκε»· `/modules/iphone/quick-torch` → Κέντρο ελέγχου.

## Γνωστές απλοποιήσεις

- Μπαταρία σταθερή (Windows 74%, Mac 86%, κινητό 82%), δεν αδειάζει.
- Ένα παράθυρο ανά app στο Mac· το minimize κρύβει το παράθυρο (επανέρχεται από το Dock).
- Το `osState` των Windows είναι singleton: δύο ταυτόχρονα mounted Windows
  μαθήματα θα το μοιράζονταν (δεν συμβαίνει στην εφαρμογή· τα tests καλούν `reset()`).
- Η iOS «Αναζήτηση Spotlight», τα widgets και οι σελίδες αρχικής δεν προσομοιώνονται.
- Στο Viber/SMS δεν στέλνεται τίποτα πραγματικά· καμία εξωτερική κλήση, auth ή πληρωμή.
