#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build clean Markdown docs from extracted Open edX course content."""
import json, re, os
from bs4 import BeautifulSoup
from markdownify import markdownify as md

BASE = "https://courses.nadia.gov.gr"
ROOT = os.path.dirname(os.path.abspath(__file__))
# Extracted source JSON lives under _cache/ (not ROOT).
CACHE = os.path.join(ROOT, "_cache")
OUT = os.path.join(ROOT, "md")

# Μάθημα order -> course id
COURSES = [
    (1, "Μάθημα 1: Εισαγωγή", "esm001"),
    (2, "Μάθημα 2: Πληροφορίες και δεδομένα", "esm002"),
    (3, "Μάθημα 3: Επικοινωνία και Συνεργασία", "eapsi001"),
    (4, "Μάθημα 4: Δημιουργία ψηφιακού περιεχομένου", "esm004"),
    (5, "Μάθημα 5: Ασφάλεια", "esm005"),
    (6, "Μάθημα 6: Επίλυση προβλημάτων", "esm006"),
]

# sequentials/verticals to skip (questionnaires / self-assessment)
SKIP_RE = re.compile(r"τεστ\s*αξιολ|αξιολόγηση|ερωτήσεις\s*αυτοαξιολ|αυτοαξιολ|ερωτηματολ", re.I)


def load_structure():
    s = json.load(open(os.path.join(CACHE, "_raw_structure.json")))
    e = json.load(open(os.path.join(CACHE, "_raw_eapsi001.json")))
    by_course = {}
    for k, v in s.items():
        if "blocks" in v:
            by_course[k.split("+")[1]] = v   # esm001 etc
    by_course["eapsi001"] = e
    return by_course


def load_content(slug):
    return json.load(open(os.path.join(CACHE, f"_content_{slug}.json")))["content"]


def slug_name(name, idx=None):
    n = name.strip()
    n = re.sub(r"[\\/:*?\"<>|]", "", n)
    n = re.sub(r"\s+", "_", n)
    n = n.strip("._")
    if idx is not None:
        return f"{idx:02d}_{n}"
    return n


def clean_html_to_md(html):
    if not html or html.startswith("__ERR__"):
        return ""
    soup = BeautifulSoup(html, "html.parser")

    # images -> absolute url
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if src.startswith("/"):
            img["src"] = BASE + src
        if not img.get("alt"):
            img["alt"] = "εικόνα"

    # iframes (vimeo/youtube/other) -> explicit video link paragraph
    for ifr in soup.find_all("iframe"):
        src = ifr.get("src", "") or ifr.get("data-src", "")
        src = src.replace("&amp;", "&")
        label = "Βίντεο"
        m = re.search(r"vimeo\.com/video/(\d+)", src)
        if m:
            clean = f"https://vimeo.com/{m.group(1)}"
        else:
            clean = src.split("?")[0] if src else ""
        p = soup.new_tag("p")
        p.string = f"🎬 {label}: {clean}" if clean else "🎬 Βίντεο"
        ifr.replace_with(p)

    # drop empty style/script leftovers
    for t in soup.find_all(["script", "style"]):
        t.decompose()

    text = md(str(soup), heading_style="ATX", bullets="-", strip=["span"])
    # collapse >2 blank lines
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text


def main():
    structures = load_structure()
    contents = {slug: load_content(slug) for _, _, slug in COURSES}
    summary = []

    for num, course_title, slug in COURSES:
        struct = structures[slug]
        blocks = struct["blocks"]
        root = struct["root"]
        content = contents[slug]

        course_dir = os.path.join(OUT, slug_name(course_title.replace(":", "")))
        os.makedirs(course_dir, exist_ok=True)

        course_block = blocks[root]
        chapters = [blocks[c] for c in course_block.get("children", []) if blocks.get(c, {}).get("type") == "chapter"]

        files_written = 0
        for ci, ch in enumerate(chapters, 1):
            ch_name = ch["display_name"]
            ch_dir = os.path.join(course_dir, slug_name(ch_name, ci))
            os.makedirs(ch_dir, exist_ok=True)

            seqs = [blocks[s] for s in ch.get("children", []) if blocks.get(s, {}).get("type") == "sequential"]
            seq_idx = 0
            for seq in seqs:
                seq_name = seq["display_name"]
                if SKIP_RE.search(seq_name):
                    continue
                # build markdown for this subsection
                parts = [f"# {course_title}\n", f"## Ενότητα: {ch_name}\n", f"## Υποενότητα: {seq_name}\n"]
                has_content = False
                for v in seq.get("children", []):
                    vb = blocks.get(v)
                    if not vb or vb.get("type") != "vertical":
                        continue
                    vname = vb["display_name"]
                    if SKIP_RE.search(vname):
                        continue
                    sub_parts = []
                    for comp in vb.get("children", []):
                        cb = blocks.get(comp)
                        if not cb or cb.get("type") != "html":
                            continue
                        if cb.get("display_name") == "css":
                            continue
                        body = clean_html_to_md(content.get(comp, ""))
                        if body:
                            sub_parts.append(body)
                    if sub_parts:
                        parts.append(f"### {vname}\n")
                        parts.append("\n\n".join(sub_parts))
                        parts.append("")
                        has_content = True
                if not has_content:
                    continue
                seq_idx += 1
                fname = slug_name(seq_name, seq_idx) + ".md"
                with open(os.path.join(ch_dir, fname), "w", encoding="utf-8") as f:
                    f.write("\n".join(parts).strip() + "\n")
                files_written += 1
        summary.append((course_title, files_written))

    print("=== Σύνοψη ===")
    for t, n in summary:
        print(f"{t}: {n} αρχεία md")


if __name__ == "__main__":
    main()
