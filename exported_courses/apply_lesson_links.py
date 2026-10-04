#!/usr/bin/env python3
"""Apply exported_courses/lesson_links.json onto content/manifest.json.

Sets `lessonLinks` on every subsection whose title is a key in the JSON and
removes it from every other subsection, so the JSON is the single source of
truth. Does not touch modules[], content/md/** or the reading-lessons seed.

Dry-run:   python3 exported_courses/apply_lesson_links.py
Apply:     python3 exported_courses/apply_lesson_links.py --apply

The contract test in src/lib/db/seeds/contracts.test.ts checks that every
link points at a seeded (module, lessonKey).
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
MANIFEST = os.path.join(REPO, "content", "manifest.json")
LINKS = os.path.join(HERE, "lesson_links.json")


def main():
    apply = "--apply" in sys.argv
    links = json.load(open(LINKS, encoding="utf-8"))
    manifest = json.load(open(MANIFEST, encoding="utf-8"))
    seen = set()
    changed = 0
    for course in manifest["courses"]:
        for chapter in course["chapters"]:
            for sub in chapter["subsections"]:
                want = links.get(sub["title"])
                if want:
                    seen.add(sub["title"])
                if sub.get("lessonLinks") != want:
                    changed += 1
                    print(f"{sub['id']:18} {sub['title']}: {len(sub.get('lessonLinks') or [])} -> {len(want or [])}")
                    if want:
                        sub["lessonLinks"] = want
                    else:
                        sub.pop("lessonLinks", None)
    unknown = sorted(set(links) - seen)
    if unknown:
        sys.exit(f"Titles in lesson_links.json not found in the manifest: {unknown}")
    print(f"{changed} subsection(s) change.")
    if apply and changed:
        with open(MANIFEST, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print("Written.")


if __name__ == "__main__":
    main()
