#!/usr/bin/env python3
"""Apply the curated module<->theory mapping cleanup onto content/manifest.json.

User decisions (2026-06-09):
- Drop every "Επισκόπηση" / "Συμπεράσματα" / "Συμπεράσματα και μελλοντικές τάσεις".
- Per-module KEEP lists below decide which reading lessons survive in each module.
- Reading lessons sort first (handled by build_manifest.write_seed offset = -1000).

Run dry-run first:   python3 exported_courses/apply_module_mapping.py
Apply changes:       python3 exported_courses/apply_module_mapping.py --apply

Does NOT touch content/md/** (the manually corrected source of truth). It only
rewrites modules[] in the manifest and regenerates the reading-lessons seed.
"""
import json
import os
import sys
import unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
MANIFEST = os.path.join(REPO, "content", "manifest.json")

# Titles dropped from EVERY module.
GLOBAL_DROP = {
    "Επισκόπηση",
    "Συμπεράσματα",
    "Συμπεράσματα και μελλοντικές τάσεις",
}

# Per-module KEEP lists: a reading lesson stays in <module> only if its title is here.
# Any module not listed keeps nothing (all its theory mappings are dropped).
KEEP = {
    "module1": {"Περιήγηση στα Windows 11"},
    "module3": {"Περιήγηση στα Windows 11"},
    "module4": set(),  # Google Docs -> word, Google Drive removed
    "module5": {
        "Το διαδίκτυο",
        "Ιστοσελίδες και προγράμματα περιήγησης",
        "Λειτουργίες προγράμματος περιήγησης",
        "Μηχανές αναζήτησης",
    },
    "module6": {"Το ηλεκτρονικό ταχυδρομείο"},
    "word": {"Επεξεργαστής κειμένου", "Η πλατφόρμα Google Docs"},
    "module7": {"Εφαρμογή υπολογιστικών φύλλων"},
    "module8": {
        "Αντιμετώπιση περιστατικών παραβίασης δεδομένων",
        "Ασφαλής χρήση ψηφιακών τεχνολογιών",
        "Βασικές έννοιες της κυβερνοασφάλειας",
        "Βασικές έννοιες και κανόνες καλής συμπεριφοράς στο διαδίκτυο",
        "Ηλεκτρονικές αγορές",
        "Προσωπικά δεδομένα",
        "Τραπεζικές συναλλαγές",
    },
    "module9": {
        "Ρυθμίσεις προσβασιμότητας",
        "Άλλα χρήσιμα εργαλεία επίλυσης προβλημάτων",
        "Απλοί τρόποι επίλυσης",
        "Βοήθεια από το διαδίκτυο",
        "Κοινά προβλήματα κινητών συσκευών και πιθανές λύσεις",
        "Κοινά προβλήματα υπολογιστή και πιθανές λύσεις",
        "Συμβουλές για πρόληψη προβλημάτων",
    },
    "module10": {
        "Προκλήσεις στο ψηφιακό περιβάλλον",
        "Ασφαλής χρήση ψηφιακών τεχνολογιών",
    },
    "module11": {
        "H εφαρμογή Messenger",
        "H εφαρμογή Viber",
        "Η εφαρμογή Google Meet",
        "Η εφαρμογή Microsoft Teams",
        "Η εφαρμογή Zoom",
    },
    "module12": {
        "Χρήση διαδικτυακών υπηρεσιών του δημοσίου",
        "Χρήση εξειδικευμένων ψηφιακών υπηρεσιών για άτομα με αναπηρία",
        "Χρήση επιλεγμένων ιστότοπων",
    },
    "module13": {"Αναζήτηση πληροφοριών με Μεγάλα Γλωσσικά Μοντέλα"},
}


def norm(s):
    """NFC + strip; collapse Latin/Greek capital-H homoglyph to a single marker."""
    s = unicodedata.normalize("NFC", s).strip()
    return s.replace("Η", "H")  # Greek capital Eta -> Latin H for matching


KEEP_N = {m: {norm(t) for t in titles} for m, titles in KEEP.items()}
GLOBAL_DROP_N = {norm(t) for t in GLOBAL_DROP}


def decide(title, module):
    """Return True if the reading lesson for <title> should stay in <module>."""
    t = norm(title)
    if t in GLOBAL_DROP_N:
        return False
    return t in KEEP_N.get(module, set())


def main():
    apply = "--apply" in sys.argv
    manifest = json.load(open(MANIFEST, encoding="utf-8"))

    kept_by_mod = {}
    removed_by_mod = {}
    seen_titles_by_mod = {}

    for c in manifest["courses"]:
        for ch in c["chapters"]:
            for s in ch["subsections"]:
                new_mods = []
                for mod in s.get("modules", []):
                    seen_titles_by_mod.setdefault(mod, set()).add(norm(s["title"]))
                    if decide(s["title"], mod):
                        new_mods.append(mod)
                        kept_by_mod.setdefault(mod, []).append(s["title"])
                    else:
                        removed_by_mod.setdefault(mod, []).append(s["title"])
                s["modules"] = new_mods

    # Report
    all_mods = sorted(set(list(kept_by_mod) + list(removed_by_mod)),
                      key=lambda m: (m != "word", m))
    for m in all_mods:
        print(f"\n=== {m} ===")
        for t in sorted(set(kept_by_mod.get(m, []))):
            print(f"  KEEP    {t}")
        for t in sorted(set(removed_by_mod.get(m, []))):
            print(f"  remove  {t}")

    # Warn if any KEEP title never appeared in its module (typo guard)
    print("\n--- KEEP-list sanity (titles that never matched) ---")
    any_warn = False
    for m, titles in KEEP_N.items():
        seen = seen_titles_by_mod.get(m, set())
        missing = titles - seen
        for t in sorted(missing):
            any_warn = True
            print(f"  ⚠ {m}: KEEP title not found in manifest -> {t!r}")
    if not any_warn:
        print("  ok — every KEEP title matched something")

    if not apply:
        print("\n(dry-run) re-run with --apply to write manifest + regen seed")
        return

    json.dump(manifest, open(MANIFEST, "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    print(f"\n✅ wrote {MANIFEST}")

    write_seed(manifest)
    print("✅ regenerated src/lib/db/seeds/eapsi-reading-lessons.ts")


def write_seed(manifest):
    """Mirror of build_manifest.write_seed but with the -1000 offset (reading
    lessons sort first) and no bs4 dependency."""
    rows = []
    for c in manifest["courses"]:
        for ch in c["chapters"]:
            for s in ch["subsections"]:
                if "theory" not in s["kind"]:
                    continue
                for mod in s["modules"]:
                    title = s["title"].replace("\\", "").replace('"', '\\"')
                    rows.append({
                        "id": f'read-{s["id"]}-{mod}',
                        "moduleId": mod,
                        "lessonKey": f'read-{s["id"]}',
                        "title": title,
                        "mdPath": s["mdPath"],
                        "sourceUrl": s["sourceUrl"],
                    })
    lines = [
        "// AUTO-GENERATED by exported_courses/build_manifest.py — do not edit by hand.",
        "// NOTE: titleKey holds the literal Greek subsection title by design (theory has no",
        "// i18n message entries). The UI renders it via the `m[key]?.() || key` fallback.",
        "import type { NewLesson } from '../schema';",
        "import { autoOrder } from './utils';",
        "",
        "const _readingLessons: Omit<NewLesson, 'orderIndex' | 'requiredLessonId'>[] = [",
    ]
    for r in rows:
        lines.append("    {")
        lines.append(f'        id: "{r["id"]}",')
        lines.append(f'        moduleId: "{r["moduleId"]}",')
        lines.append(f'        lessonKey: "{r["lessonKey"]}",')
        lines.append(f'        titleKey: "{r["title"]}",')
        lines.append('        descriptionKey: "Θεωρία ΕΑΨΙ",')
        lines.append('        difficulty: "beginner",')
        lines.append('        lessonType: "reading",')
        lines.append(f'        config: {{ mdPath: "{r["mdPath"]}", sourceUrl: "{r["sourceUrl"]}" }},')
        lines.append('        enabled: true,')
        lines.append("    },")
    lines.append("];")
    lines.append("")
    lines.append("// Group by module so autoOrder chains requiredLessonId within each module.")
    lines.append("// orderIndex offset by -1000 so reading (theory) lessons sort BEFORE the")
    lines.append("// module's interactive challenges (which use positive orderIndex).")
    lines.append("export const eapsiReadingLessons: NewLesson[] = (() => {")
    lines.append("    const byModule = new Map<string, typeof _readingLessons>();")
    lines.append("    for (const l of _readingLessons) {")
    lines.append("        if (!byModule.has(l.moduleId)) byModule.set(l.moduleId, []);")
    lines.append("        byModule.get(l.moduleId)!.push(l);")
    lines.append("    }")
    lines.append("    return [...byModule.values()].flatMap((group) => autoOrder(group).map((l) => ({ ...l, orderIndex: l.orderIndex - 1000 })));")
    lines.append("})();")
    lines.append("")
    out = os.path.join(REPO, "src", "lib", "db", "seeds", "eapsi-reading-lessons.ts")
    open(out, "w", encoding="utf-8").write("\n".join(lines))


if __name__ == "__main__":
    main()
