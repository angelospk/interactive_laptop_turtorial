// Οδηγός Τσέπης: Χρήσιμα κόλπα για υπολογιστή & κινητό
// Compile: typst compile odigos_xrisis.typ
#set document(title: "Οδηγός Τσέπης: Υπολογιστής & Κινητό", author: "PC Basics")
#set page(
  paper: "a4",
  margin: (x: 1.05cm, top: 1.0cm, bottom: 0.85cm),
)
#set text(font: ("Helvetica Neue", "Helvetica", "Arial"), size: 8.7pt, lang: "el", fill: rgb("#1d2433"))
#set par(justify: false, leading: 0.5em, spacing: 0.62em)

// ---- helpers ----
#let brand = rgb("#4338ca")
#let key(k) = box(
  fill: luma(244), inset: (x: 4pt, y: 0.5pt), outset: (y: 2.5pt),
  radius: 2.5pt, stroke: 0.5pt + luma(160),
)[#text(size: 0.82em, weight: "semibold", fill: luma(40))[#k]]
// Non-breaking "+" so a shortcut (e.g. Ctrl+C) never wraps onto two lines.
// Built from sym.plus (not a literal "+") so Typst doesn't read it as an enum marker.
#let plus = [#sym.space.nobreak#text(fill: luma(150), size: 0.82em)[#sym.plus]#sym.space.nobreak]
// Wrap a whole shortcut so it stays on one line as a unit.
#let combo(body) = box(body)

#let card(title, icon, accent, body) = block(
  width: 100%, fill: white, radius: 5pt, inset: 7pt,
  stroke: 0.6pt + luma(220), breakable: false, below: 7pt,
)[
  #block(below: 5pt)[
    #box(baseline: 3pt)[#box(fill: accent, radius: 3pt, inset: (x: 4pt, y: 2pt))[#text(fill: white, size: 0.95em)[#icon]]]
    #h(3pt) #text(weight: "bold", size: 1.06em, fill: accent)[#title]
  ]
  #body
]
#let tip(b) = block(below: 3.3pt)[#box(baseline: 0pt)[#text(fill: brand)[▸]] #h(1pt) #b]
#let warn(b) = block(below: 3.3pt)[#text(fill: rgb("#b91c1c"))[✖] #h(1pt) #b]
#let ok(b) = block(below: 3.3pt)[#text(fill: rgb("#15803d"))[✔] #h(1pt) #b]

// ---- header ----
#block(width: 100%, fill: brand, radius: 6pt, inset: (x: 10pt, y: 8pt), below: 9pt)[
  #text(fill: white, size: 1.55em, weight: "bold")[Οδηγός Τσέπης: Υπολογιστής & Κινητό]
  #v(1pt)
  #text(fill: rgb("#dbe1ff"), size: 0.95em)[Μικρά κόλπα που κάνουν τη ζωή πιο εύκολη. Μην φοβάστε την τεχνολογία. Απλώς δοκιμάστε!]
]

#columns(2, gutter: 11pt)[

#card("Ρωτήστε το Google & την Τεχνητή Νοημοσύνη", "🔎", rgb("#2563eb"))[
  #tip[Γράψτε με *φυσική γλώσσα*, σαν να μιλάτε σε φίλο, όχι μόνο λέξεις-κλειδιά.]
  #tip[Δώστε *όσες περισσότερες πληροφορίες* μπορείτε για την κατάστασή σας.]
  #tip[Πείτε *μάρκα & μοντέλο*: «Πώς βγάζω screenshot σε *Samsung Galaxy A54*;»]
  #tip[*Συνεχίστε την κουβέντα*: ρωτήστε και 2η, 3η ερώτηση από κάτω.]
  #tip[Δείτε την *Ανασκόπηση AI* στην κορυφή του Google· συχνά απαντά αμέσως.]
  #tip[Πατήστε το #key[🎤] μικρόφωνο και *μιλήστε*. Η απομαγνητοφώνηση είναι πολύ καλή.]
]

#card("Η Ψηφιακή Βοηθός στο κινητό", "🗣️", rgb("#0891b2"))[
  «Hey Google» ή κρατήστε το κουμπί Home. Πείτε της απλά:
  #tip[«Βάλε *ξυπνητήρι* στις 7». «Βάλε *χρονόμετρο* 10 λεπτά».]
  #tip[«*Θύμισέ μου* να πάρω τα χάπια στις 9 το βράδυ».]
  #tip[«Φτιάξε *ραντεβού* αύριο στις 5 στον γιατρό».]
  #tip[«Στείλε *μήνυμα* στη Μαρία ότι θα αργήσω».]
  #tip[«Τι καιρό θα κάνει;» «Πόσο κάνει 20 ευρώ σε δολάρια;»]
]

#card("Λιγότερες διαφημίσεις", "🛡️", rgb("#7c3aed"))[
  #tip[*Brave browser* (δωρεάν, σε υπολογιστή & κινητό): μπλοκάρει διαφημίσεις μόνος του.]
  #tip[Στο *YouTube* μέσα από Brave: τραγούδια *χωρίς διαφημίσεις* & παίζει στο παρασκήνιο (κλειστή οθόνη).]
  #block(above: 4pt)[*AdGuard DNS σε Android* (κόβει διαφημίσεις παντού):]
  #tip[Ρυθμίσεις #sym.arrow.r Δίκτυο & διαδίκτυο #sym.arrow.r *Ιδιωτικό DNS (Private DNS)*]
  #tip[Επιλέξτε «όνομα κεντρικού υπολογιστή» και γράψτε: #box(fill: luma(244), inset:(x:3pt,y:1pt), radius:2pt)[`dns.adguard-dns.com`]]
  #tip[Αποθήκευση και τελειώσατε. Δουλεύει σε όλες τις εφαρμογές.]
]

#card("Ασφάλεια: η συμπεριφορά μετράει πιο πολύ", "🔒", rgb("#dc2626"))[
  #warn[*Καχυποψία* σε άγνωστα μηνύματα/email που βιάζονται ή τρομάζουν.]
  #warn[Πριν αγοράσετε από *νέα ιστοσελίδα*: ψάξτε το όνομά της στο Google, ρωτήστε φίλο.]
  #ok[Πληρώστε με *κάρτα*: μπορείτε να κάνετε *αμφισβήτηση συναλλαγής* αν σας εξαπατήσουν.]
  #warn[*Ποτέ* τραπεζικό έμβασμα/κατάθεση για online παραγγελία· δεν γυρίζει πίσω.]
  #tip[*Antivirus*: τα Windows έχουν ήδη προστασία. Δεν είναι απαραίτητο, αλλά αν θέλετε, είναι καλή επένδυση.]
]

#colbreak()

#card("Κωδικοί που δεν ξεχνιούνται", "🔑", rgb("#ea580c"))[
  #tip[*Διαχειριστής κωδικών*: θυμάται αυτός τους κωδικούς για εσάς. Εύκολος: *Bitwarden* (δωρεάν).]
  #tip[Ή ο *Google Password Manager*: αρκεί να θυμάστε μόνο το Gmail σας.]
  #tip[Ενεργοποιήστε *2-βήμα επαλήθευση (2FA)*: ακόμη κι αν κλαπεί ο κωδικός, χρειάζεται κι ο κωδικός που έρχεται στο κινητό σας. Σώζει τον λογαριασμό.]
  #tip[*Βιομετρικά* (δαχτυλικό/πρόσωπο): ξεκλειδώνετε χωρίς να πληκτρολογείτε PIN κάθε φορά. Γρήγορο & ασφαλές.]
]

#card("Αν χαθεί το κινητό (Android)", "📍", rgb("#0d9488"))[
  #ok[*Ενεργοποιήστε από τώρα*: Ρυθμίσεις #sym.arrow.r Ασφάλεια #sym.arrow.r *Εύρεση συσκευής μου* #sym.arrow.r ON.]
  #tip[Για να το βρείτε: από άλλον υπολογιστή/κινητό μπείτε στο *android.com/find* (ή ψάξτε στο Google «Find My Device») με το Gmail σας.]
  #tip[Μπορείτε να το *κουδουνίσετε*, να το *κλειδώσετε* ή να δείτε *πού είναι* στον χάρτη.]
]

#card("Κόλπα στον υπολογιστή (Windows 11)", "💻", rgb("#4f46e5"))[
  #tip[Αντιγραφή: #combo[#key[Ctrl]#plus#key[C]] #h(4pt) Επικόλληση: #combo[#key[Ctrl]#plus#key[V]]]
  #tip[Αποκοπή: #combo[#key[Ctrl]#plus#key[X]] #h(4pt) Αναίρεση: #combo[#key[Ctrl]#plus#key[Z]]]
  #tip[Αλλαγή γλώσσας ΕΛ/EN: #combo[#key[Alt]#plus#key[Shift]]]
  #tip[*Ιστορικό αντιγραφής*: #combo[#key[#sym.suit.club.filled Win]#plus#key[V]] δείχνει ό,τι αντιγράψατε. (Ενεργοποίηση: Ρυθμίσεις #sym.arrow.r Σύστημα #sym.arrow.r Πρόχειρο #sym.arrow.r Ιστορικό προχείρου).]
  #tip[*Wi-Fi*: κάτω δεξιά το εικονίδιο δικτύου. Αν δείτε *υδρόγειο* 🌐, *δεν* είστε συνδεδεμένοι. Πατήστε το και διαλέξτε δίκτυο.]
]

#card("Στον περιηγητή (browser)", "⭐", rgb("#d97706"))[
  #tip[*Σελιδοδείκτες (αγαπημένα)*: πατήστε το αστεράκι #key[★] στη γραμμή διεύθυνσης για να σώσετε μια σελίδα.]
  #tip[*Νέα καρτέλα*: #combo[#key[Ctrl]#plus#key[T]] για να κρατάτε πολλές σελίδες ανοιχτές μαζί.]
  #tip[*Μεγέθυνση γραμμάτων*: #combo[#key[Ctrl]#plus#key[#sym.plus]] (πιο μεγάλα & ξεκούραστα).]
]

]

#pagebreak()

#block(width: 100%, fill: brand, radius: 6pt, inset: (x: 10pt, y: 7pt), below: 9pt)[
  #text(fill: white, size: 1.35em, weight: "bold")[Κι ακόμα μερικά χρήσιμα…]
  #v(1pt)
  #text(fill: rgb("#dbe1ff"), size: 0.92em)[Πρακτικά πραγματάκια για την καθημερινότητα με υπολογιστή & κινητό.]
]

#columns(2, gutter: 11pt)[

#card("Όταν κάτι «κόλλησε»", "🔄", rgb("#0d9488"))[
  #ok[*Η επανεκκίνηση λύνει τα μισά προβλήματα.* Κλείστε & ανοίξτε ξανά τη συσκευή πριν αγχωθείτε.]
  #tip[Μια εφαρμογή πάγωσε; Κλείστε τη τελείως και ξανανοίξτε την.]
  #tip[Δεν φορτώνει σελίδα; Ελέγξτε αν είστε σε *Wi-Fi* (όχι 🌐 υδρόγειος).]
  #tip[Πριν φωνάξετε τεχνικό, σημειώστε *τι ακριβώς γράφει* το μήνυμα λάθους, ή βγάλτε φωτογραφία.]
]

#card("Δείτε καλύτερα την οθόνη", "🔍", rgb("#2563eb"))[
  #tip[*Μεγέθυνση παντού σε υπολογιστή*: #combo[#key[#sym.suit.club.filled Win]#plus#key[#sym.plus]] ανοίγει τον Μεγεθυντή· #combo[#key[#sym.suit.club.filled Win]#plus#key[Esc]] κλείνει.]
  #tip[*Πιο μεγάλα γράμματα*: Ρυθμίσεις #sym.arrow.r Προσβασιμότητα #sym.arrow.r Μέγεθος κειμένου.]
  #tip[*Νυχτερινή λειτουργία* (σκούρο φόντο): ξεκουράζει τα μάτια το βράδυ.]
  #tip[Στο κινητό: ανοίξτε δύο δάχτυλα πάνω στην οθόνη για *ζουμ* σε φωτογραφίες & σελίδες.]
]

#card("Μη χάσετε ποτέ τις φωτογραφίες σας", "☁️", rgb("#7c3aed"))[
  #tip[Ενεργοποιήστε το *Google Photos* → *Δημιουργία αντιγράφων ασφαλείας*: οι φωτογραφίες σώζονται αυτόματα στο «σύννεφο».]
  #ok[Αν χαθεί ή χαλάσει το κινητό, οι φωτογραφίες *δεν* χάνονται· μπαίνετε με το Gmail σας από οποιαδήποτε συσκευή.]
  #tip[Το ίδιο και για αρχεία: *Google Drive* τα κρατά ασφαλή & προσβάσιμα παντού.]
]

#card("Στιγμιότυπο οθόνης (screenshot)", "📸", rgb("#ea580c"))[
  #tip[*Υπολογιστής*: #combo[#key[#sym.suit.club.filled Win]#plus#key[Shift]#plus#key[S]], διαλέγετε περιοχή & την αντιγράφετε.]
  #tip[*Κινητό*: πατήστε μαζί #combo[#key[Power]#plus#key[Ένταση −]] για μια στιγμή.]
  #tip[Χρήσιμο για να *δείξετε ένα πρόβλημα* σε κάποιον ή να κρατήσετε μια απόδειξη.]
]

#colbreak()

#card("Δωρεάν κλήσεις & βιντεοκλήσεις", "📞", rgb("#0891b2"))[
  #tip[Με *Wi-Fi* μιλάτε δωρεάν (φωνή & εικόνα) από *Viber, WhatsApp, Messenger*, ακόμη και στο εξωτερικό.]
  #tip[Δείτε τα εγγόνια σας με *βιντεοκλήση*: πατήστε το εικονίδιο της κάμερας 🎥 μέσα στη συνομιλία.]
  #tip[Δεν χρεώνεστε λεπτά ομιλίας· θέλει μόνο σύνδεση στο ίντερνετ.]
]

#card("Ψηφιακό κράτος: gov.gr", "🏛️", rgb("#4f46e5"))[
  #tip[Στο *gov.gr* βγάζετε χαρτιά χωρίς ουρές: υπεύθυνες δηλώσεις, εξουσιοδοτήσεις, πιστοποιητικά.]
  #tip[Συνδέεστε με τους *κωδικούς Taxisnet* (ή web banking).]
  #tip[Το *Wallet (gov.gr Wallet)* έχει ταυτότητα & δίπλωμα στο κινητό.]
  #warn[Μόνο σελίδες που τελειώνουν σε *.gov.gr*. Προσοχή σε ψεύτικες απομιμήσεις.]
]

#card("Ενημερώσεις & δεδομένα", "⚙️", rgb("#dc2626"))[
  #ok[*Κάντε τις ενημερώσεις (updates)* όταν σας τις ζητά: κλείνουν «τρύπες» ασφαλείας.]
  #tip[Συνδεθείτε σε *Wi-Fi* στο σπίτι για να μην ξοδεύετε τα δεδομένα του κινητού.]
  #warn[Σε *δημόσιο Wi-Fi* (καφέ, αεροδρόμιο) μην κάνετε τραπεζικές συναλλαγές.]
  #tip[Στις εγκαταστάσεις μη πατάτε «Επόμενο» τυφλά· διαβάστε, μη σας βάλουν *άχρηστα προγράμματα*.]
]

#card("Μετάφραση & Χάρτες", "🌍", rgb("#d97706"))[
  #tip[*Google Μετάφραση*: γράψτε ή *μιλήστε* και μεταφράζει· με την *κάμερα* μεταφράζει πινακίδες & μενού ζωντανά.]
  #tip[*Google Maps*: γράψτε πού θέλετε να πάτε και σας *οδηγεί βήμα-βήμα* με φωνή.]
  #tip[Σκανάρετε ένα *QR code* απλά με την *κάμερα* του κινητού, χωρίς ειδική εφαρμογή.]
]

]

// ---- footer με QR ----
#v(3pt)
#block(width: 100%, fill: luma(247), radius: 6pt, inset: 8pt, stroke: 0.6pt + luma(220))[
  #grid(columns: (1fr, auto, auto), align: (left + horizon, center, center), column-gutter: 10pt,
    [
      #text(weight: "bold", size: 1.1em, fill: brand)[Συνεχίστε την εξάσκηση!]
      #v(2pt)
      #text(size: 0.95em)[*Εξασκηθείτε συχνά να ξεχωρίζετε τις απάτες*, λίγα λεπτά κάθε εβδομάδα. \
      Όλο το υλικό θεωρίας & ασκήσεις στη Βιβλιοθήκη. Σκανάρετε με την κάμερα του κινητού #sym.arrow.r]
    ],
    [
      #image("qr_apates.png", width: 2.05cm)
      #text(size: 0.78em, weight: "semibold")[Απάτη ή Όχι;]
      #linebreak() #text(size: 0.7em, fill: luma(110))[pcbasics.vercel.app/apates]
    ],
    [
      #image("qr_library.png", width: 2.05cm)
      #text(size: 0.78em, weight: "semibold")[Βιβλιοθήκη]
      #linebreak() #text(size: 0.7em, fill: luma(110))[pcbasics.vercel.app/library]
    ],
  )
]
