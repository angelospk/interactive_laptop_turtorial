#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build content/md/** (ascii paths) + content/manifest.json from cached EAPSI data.

WARNING — DO NOT re-run blindly. After initial generation, content/md/** received
243 manual editorial corrections (Phase C) that are NOT in this script; re-running
overwrites them. Also overview esm002-c4-s1 was removed by hand (manifest + seed + DB).
content/md + content/manifest.json are now the source of truth; this script is kept
for history. If a regenerate is ever needed, re-run the content review afterwards too.
"""
import json, re, os, shutil
from bs4 import BeautifulSoup
from markdownify import markdownify as md

BASE_SITE = "https://courses.nadia.gov.gr"
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "_cache")
REPO = os.path.dirname(HERE)
OUT_MD = os.path.join(REPO, "content", "md")
OUT_MANIFEST = os.path.join(REPO, "content", "manifest.json")

SKIP = re.compile(r"τεστ\s*αξιολ|αξιολόγηση|αυτοαξιολ|ερωτηματολ", re.I)

COURSES = [
    (1, "Μάθημα 1: Εισαγωγή", "esm001"),
    (2, "Μάθημα 2: Πληροφορίες και δεδομένα", "esm002"),
    (3, "Μάθημα 3: Επικοινωνία και Συνεργασία", "eapsi001"),
    (4, "Μάθημα 4: Δημιουργία ψηφιακού περιεχομένου", "esm004"),
    (5, "Μάθημα 5: Ασφάλεια", "esm005"),
    (6, "Μάθημα 6: Επίλυση προβλημάτων", "esm006"),
]

CHAPTER_MAP = {
    "Χρήση Υπολογιστή": (["module3", "module1"], "theory"),
    "Χρήση έξυπνου κινητού": ([], "theory+quiz"),
    "Το διαδίκτυο": (["module5"], "theory"),
    "Αναζήτηση πληροφοριών": (["module5"], "theory"),
    "Πλοήγηση σε χρήσιμους διαδικτυακούς τόπους": (["module12"], "theory"),
    "Ηλεκτρονικές συναλλαγές": (["module8"], "theory+quiz"),
    "Ηλεκτρονική επικοινωνία": (["module6"], "theory"),
    "Μέσα κοινωνικής δικτύωσης": ([], "theory+challenge"),
    "Χρήσιμες εφαρμογές": (["module11"], "theory"),
    "Προσωπικά δεδομένα και κανόνες συμπεριφοράς": (["module8", "module10"], "theory+quiz"),
    "Χρήση εφαρμογών γραφείου": (["word", "module7"], "theory"),
    "Πολυμέσα": ([], "theory+quiz"),
    "Πνευματικά δικαιώματα": (["module10"], "theory+quiz"),
    "Κυβερνοασφάλεια και προστασία δεδομένων": (["module8", "module10"], "theory"),
    "Η τεχνολογία στη ζωή μας": ([], "theory+quiz"),
    "Συχνά προβλήματα και τρόποι επίλυσης": (["module9"], "theory+challenge"),
    "Επιμόρφωση και εκπαίδευση": ([], "theory"),
}

SUBSECTION_OVERRIDES = {
    "Ρυθμίσεις προσβασιμότητας": (["module9"], "theory"),
    "Αναζήτηση πληροφοριών με Μεγάλα Γλωσσικά Μοντέλα": (["module13"], "theory"),
    "H εφαρμογή Messenger": (["module11"], "theory"),
    "H εφαρμογή Viber": (["module11"], "theory"),
    "Η πλατφόρμα Google Docs": (["word", "module4"], "theory"),
    "Η πλατφόρμα Google Drive": (["module4"], "theory"),
    "Επεξεργαστής κειμένου": (["word"], "theory"),
    "Εφαρμογή υπολογιστικών φύλλων": (["module7"], "theory"),
    "Εφαρμογή παρουσιάσεων": ([], "theory+challenge"),
}


def load_structures():
    s = json.load(open(os.path.join(CACHE, "_raw_structure.json")))
    e = json.load(open(os.path.join(CACHE, "_raw_eapsi001.json")))
    out = {}
    for k, v in s.items():
        if "blocks" in v:
            out[k.split("+")[1]] = v
    out["eapsi001"] = e
    return out


def load_content(slug):
    return json.load(open(os.path.join(CACHE, f"_content_{slug}.json")))["content"]


def clean_html_to_md(html):
    if not html or html.startswith("__ERR__"):
        return ""
    soup = BeautifulSoup(html, "html.parser")
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if src.startswith("/"):
            img["src"] = BASE_SITE + src
        if not img.get("alt"):
            img["alt"] = "εικόνα"
    for ifr in soup.find_all("iframe"):
        src = (ifr.get("src", "") or ifr.get("data-src", "")).replace("&amp;", "&")
        if "player.vimeo.com" in src:
            marker = soup.new_string(f"[[VIDEO:{src}]]")
            ifr.replace_with(marker)
        else:
            ifr.decompose()  # drop SCORM / non-video iframes
    for t in soup.find_all(["script", "style"]):
        t.decompose()
    text = md(str(soup), heading_style="ATX", bullets="-", strip=["span"])
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    # [[VIDEO:url]] -> responsive iframe embed
    def _video(m):
        url = m.group(1).replace("&amp;", "&")
        return ('<div class="video-wrap"><iframe src="' + url +
                '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>')
    text = re.sub(r"\[\[VIDEO:([^\]]+)\]\]", _video, text)
    # image + "Εικόνα N: ..." caption -> <figure>
    def _figure(m):
        alt, url, cap = m.group(1), m.group(2), m.group(3).strip()
        return ('<figure><img src="' + url + '" alt="' + alt + '" />' +
                '<figcaption>' + cap + '</figcaption></figure>')
    text = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)\s*\n\s*\n(Εικόνα[^\n]+)", _figure, text)
    return text


def main():
    structures = load_structures()
    if os.path.exists(OUT_MD):
        shutil.rmtree(OUT_MD)
    os.makedirs(OUT_MD, exist_ok=True)
    manifest = {"courses": []}

    for num, course_title, slug in COURSES:
        struct = structures[slug]
        blocks = struct["blocks"]
        root = struct["root"]
        content = load_content(slug)
        course_url = f"{BASE_SITE}/courses/course-v1:EAPSI+{slug}+2025_S2/course/"
        course_entry = {"id": slug, "moduleNumber": num, "title": course_title,
                        "courseUrl": course_url, "chapters": []}

        chapters = [blocks[c] for c in blocks[root].get("children", [])
                    if blocks.get(c, {}).get("type") == "chapter"]
        for ci, ch in enumerate(chapters, 1):
            ch_name = ch["display_name"]
            ch_modules, ch_kind = CHAPTER_MAP.get(ch_name, ([], "theory"))
            chapter_entry = {"title": ch_name, "subsections": []}
            seqs = [blocks[s] for s in ch.get("children", [])
                    if blocks.get(s, {}).get("type") == "sequential"]
            si = 0
            for seq in seqs:
                seq_name = seq["display_name"]
                if SKIP.search(seq_name):
                    continue
                parts = []
                has = False
                first_v = True
                for v in seq.get("children", []):
                    vb = blocks.get(v)
                    if not vb or vb.get("type") != "vertical" or SKIP.search(vb["display_name"]):
                        continue
                    sub = []
                    for comp in vb.get("children", []):
                        cb = blocks.get(comp)
                        if not cb or cb.get("type") != "html" or cb.get("display_name") == "css":
                            continue
                        body = clean_html_to_md(content.get(comp, ""))
                        if body:
                            sub.append(body)
                    if sub:
                        if not first_v:
                            parts.append("---\n")
                        parts.append(f"## {vb['display_name']}\n")
                        parts.append("\n\n".join(sub))
                        parts.append("")
                        first_v = False
                        has = True
                if not has:
                    continue
                si += 1
                sub_id = f"{slug}-c{ci}-s{si}"
                rel_md = f"md/{slug}/c{ci}/s{si}.md"
                abs_md = os.path.join(REPO, "content", rel_md)
                os.makedirs(os.path.dirname(abs_md), exist_ok=True)
                with open(abs_md, "w", encoding="utf-8") as f:
                    f.write("\n".join(parts).strip() + "\n")
                mods, kind = SUBSECTION_OVERRIDES.get(seq_name, (ch_modules, ch_kind))
                source_url = f"{BASE_SITE}/courses/course-v1:EAPSI+{slug}+2025_S2/jump_to/{seq['id']}"
                chapter_entry["subsections"].append({
                    "id": sub_id, "title": seq_name, "mdPath": rel_md,
                    "sourceUrl": source_url, "modules": mods, "kind": kind,
                })
            if chapter_entry["subsections"]:
                course_entry["chapters"].append(chapter_entry)
        manifest["courses"].append(course_entry)

    os.makedirs(os.path.dirname(OUT_MANIFEST), exist_ok=True)
    json.dump(manifest, open(OUT_MANIFEST, "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    write_seed(manifest)
    total = sum(len(ch["subsections"]) for c in manifest["courses"] for ch in c["chapters"])
    print(f"OK: {total} subsections, {len(manifest['courses'])} courses")


def write_seed(manifest):
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
