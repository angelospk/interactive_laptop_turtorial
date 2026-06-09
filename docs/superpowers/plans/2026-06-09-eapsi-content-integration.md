# EAPSI Content Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Σερβίρισμα του θεωρητικού υλικού ΕΑΨΙ ως αναγνώσιμα reading-lessons μέσα στα modules + κεντρική Βιβλιοθήκη Θεωρίας, με runtime φόρτωση markdown από GitHub CDN και σύνδεση κάθε υποενότητας με τα σχετικά app modules.

**Architecture:** Ένα `content/manifest.json` (παραγόμενο από script) είναι η πηγή αλήθειας: ιεραρχία Μάθημα→Ενότητα→Υποενότητα, με `mdPath`, `sourceUrl`, `modules[]`, `kind`. Τα `.md` φορτώνονται runtime μέσω `resolveContentUrl()` (env-configurable base: τοπικό `/content` τώρα, jsDelivr μετά το public repo). Render με `marked`+`dompurify`+Tailwind `prose`. Reading lessons = standalone Svelte component (όπως το υπάρχον QuizLesson), seeded από το manifest.

**Tech Stack:** SvelteKit 2 / Svelte 5 (runes), TypeScript, Drizzle (SQLite/Turso), Paraglide i18n, Vitest, Python 3 (build script). Package manager: **bun**.

**Scope note:** Αυτό το plan = θεμέλιο (infra + reading + library + mapping seed). Τα νέα quizzes (πνευματικά δικαιώματα, εργονομία, κ.λπ.) και νέα interactive challenges (Social, Παρουσιάσεις, Troubleshooting) είναι ξεχωριστά plans/φάσεις — απαιτούν authoring περιεχομένου.

**Key facts verified in codebase:**
- `lesson.titleKey`/`descriptionKey` αποδίδονται παντού με fallback `m[key]?.() || key` (LessonCard.svelte:24, LessonTemplate.svelte:17). → Βάζουμε ελληνικούς τίτλους **inline**, χωρίς νέα i18n keys.
- Νέος lessonType προστίθεται στο map του `LessonRenderer.svelte` (γραμμές 16-46).
- Seeds: `seeds/index.ts` συγκεντρώνει arrays· `validateLessons()` πετάει error αν `config.goal` δεν είναι valid goal. Reading lessons **δεν** έχουν `goal` → δεν επηρεάζονται.
- `autoOrder()` (seeds/utils.ts) δίνει orderIndex + requiredLessonId αλυσιδωτά.
- Seed runner: `bun run scripts/seed-lessons.ts` (διαβάζει `allLessons` από seeds/index.ts).
- Tests: `bun run test:unit -- --run` (vitest).

---

## File Structure

| Αρχείο | Ευθύνη | Create/Modify |
|---|---|---|
| `exported_courses/build_manifest.py` | Ενιαίος builder: render md (ascii paths) + `content/manifest.json` | Create |
| `content/manifest.json` | Πηγή αλήθειας ιεραρχίας + mapping | Create (generated) |
| `content/md/**` | Τα markdown (ascii paths) | Create (generated) |
| `static/content` | symlink → `../content` (τοπικό serving πριν το public) | Create |
| `.env.example` | Προσθήκη `PUBLIC_CONTENT_BASE_URL` | Modify |
| `src/lib/content/contentUrl.ts` | `resolveContentUrl(relPath, base?)` | Create |
| `src/lib/content/contentUrl.test.ts` | Unit test | Create |
| `src/lib/content/manifest.ts` | Τύποι + `loadManifest(fetch)` | Create |
| `src/lib/components/content/MarkdownView.svelte` | fetch+parse+sanitize+render md | Create |
| `src/lib/components/content/MarkdownView.test.ts` | parse/sanitize unit test | Create |
| `src/lib/components/lessons/interactive/ReadingLesson.svelte` | reading lesson UI | Create |
| `src/lib/components/lessons/LessonRenderer.svelte` | register `reading` type | Modify (line ~44) |
| `src/lib/db/seeds/eapsi-reading-lessons.ts` | reading lessons από manifest | Create (generated) |
| `src/lib/db/seeds/index.ts` | import + spread reading lessons | Modify |
| `src/routes/library/+page.server.ts` + `+page.svelte` | δέντρο βιβλιοθήκης | Create |
| `src/routes/library/[course]/[sub]/+page.server.ts` + `+page.svelte` | ανάγνωση υποενότητας | Create |

---

### Task 1: Dependencies & env config

**Files:**
- Modify: `package.json` (deps), `.env.example`

- [ ] **Step 1: Install runtime deps**

```bash
bun add marked dompurify
bun add -d @types/dompurify
```

- [ ] **Step 2: Verify install**

Run: `bun pm ls | grep -E "marked|dompurify"`
Expected: εμφανίζονται `marked` και `dompurify`.

- [ ] **Step 3: Add env var to .env.example**

Πρόσθεσε στο τέλος του `.env.example`:

```bash
# Base URL for markdown course content.
# Local/dev (before repo is public): /content
# Production (after repo is public): https://cdn.jsdelivr.net/gh/<user>/<repo>@main/content
PUBLIC_CONTENT_BASE_URL=/content
```

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock .env.example
git commit -m "chore: add marked+dompurify deps and PUBLIC_CONTENT_BASE_URL"
```

---

### Task 2: Content builder script (md + manifest)

Ενιαίο Python script που διαβάζει τα cache JSON (`exported_courses/_cache/`) και γράφει `content/md/**` (ascii paths) + `content/manifest.json`. Αντικαθιστά τη λογική του `build_md.py` με ascii paths + manifest.

**Files:**
- Create: `exported_courses/build_manifest.py`

- [ ] **Step 1: Write the builder script**

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build content/md/** (ascii paths) + content/manifest.json from cached EAPSI data."""
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

# (moduleNumber, course title, course slug)
COURSES = [
    (1, "Μάθημα 1: Εισαγωγή", "esm001"),
    (2, "Μάθημα 2: Πληροφορίες και δεδομένα", "esm002"),
    (3, "Μάθημα 3: Επικοινωνία και Συνεργασία", "eapsi001"),
    (4, "Μάθημα 4: Δημιουργία ψηφιακού περιεχομένου", "esm004"),
    (5, "Μάθημα 5: Ασφάλεια", "esm005"),
    (6, "Μάθημα 6: Επίλυση προβλημάτων", "esm006"),
]

# chapter title -> (modules, kind)
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

# subsection title -> (modules, kind) — overrides chapter defaults
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
        m2 = re.search(r"vimeo\.com/video/(\d+)", src)
        clean = f"https://vimeo.com/{m2.group(1)}" if m2 else (src.split("?")[0] if src else "")
        p = soup.new_tag("p")
        p.string = f"🎬 Βίντεο: {clean}" if clean else "🎬 Βίντεο"
        ifr.replace_with(p)
    for t in soup.find_all(["script", "style"]):
        t.decompose()
    text = md(str(soup), heading_style="ATX", bullets="-", strip=["span"])
    return re.sub(r"\n{3,}", "\n\n", text).strip()


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
                # render md from verticals/html
                parts = [f"# {course_title}\n", f"## Ενότητα: {ch_name}\n",
                         f"## Υποενότητα: {seq_name}\n"]
                has = False
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
                        parts.append(f"### {vb['display_name']}\n")
                        parts.append("\n\n".join(sub))
                        parts.append("")
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
    total = sum(len(ch["subsections"]) for c in manifest["courses"] for ch in c["chapters"])
    print(f"OK: {total} subsections, {len(manifest['courses'])} courses")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Commit the script**

```bash
git add exported_courses/build_manifest.py
git commit -m "feat: add unified content+manifest builder script"
```

---

### Task 3: Generate content + symlink + commit

**Files:**
- Create: `content/manifest.json`, `content/md/**`, `static/content` (symlink)

- [ ] **Step 1: Run builder in venv**

```bash
cd exported_courses
python3 -m venv .venv && .venv/bin/pip install -q markdownify beautifulsoup4
.venv/bin/python build_manifest.py
cd ..
```
Expected: `OK: <N> subsections, 6 courses` (N γύρω στο 75-80).

- [ ] **Step 2: Validate manifest JSON + paths exist**

```bash
python3 -c "
import json,os
m=json.load(open('content/manifest.json'))
n=0
for c in m['courses']:
  for ch in c['chapters']:
    for s in ch['subsections']:
      assert os.path.exists(os.path.join('content', s['mdPath'])), s['mdPath']
      assert s['sourceUrl'].startswith('https://'), s['id']
      n+=1
print('valid', n)
"
```
Expected: `valid <N>` χωρίς AssertionError.

- [ ] **Step 3: Create symlink for local serving**

```bash
ln -s ../content static/content
```
Expected: `static/content` → `../content`. (Vercel static adapter σερβίρει το `static/`.)

- [ ] **Step 4: Commit content**

```bash
git add content static/content
git commit -m "feat: generate EAPSI course content (md + manifest)"
```

---

### Task 4: resolveContentUrl helper

**Files:**
- Create: `src/lib/content/contentUrl.ts`, `src/lib/content/contentUrl.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/lib/content/contentUrl.test.ts
import { describe, it, expect } from 'vitest';
import { joinContentUrl } from './contentUrl';

describe('joinContentUrl', () => {
	it('joins base and relPath with single slash', () => {
		expect(joinContentUrl('/content', 'md/esm001/c1/s1.md')).toBe('/content/md/esm001/c1/s1.md');
	});
	it('trims trailing slash on base', () => {
		expect(joinContentUrl('https://cdn.example/x/', 'manifest.json')).toBe('https://cdn.example/x/manifest.json');
	});
	it('trims leading slash on relPath', () => {
		expect(joinContentUrl('/content', '/manifest.json')).toBe('/content/manifest.json');
	});
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `bun run test:unit -- --run src/lib/content/contentUrl.test.ts`
Expected: FAIL — `joinContentUrl` not exported / module missing.

- [ ] **Step 3: Implement**

```typescript
// src/lib/content/contentUrl.ts
import { env } from '$env/dynamic/public';

/** Pure join: base + relPath, normalizing slashes. */
export function joinContentUrl(base: string, relPath: string): string {
	return `${base.replace(/\/+$/, '')}/${relPath.replace(/^\/+/, '')}`;
}

/** Resolve a content-relative path to a full URL using PUBLIC_CONTENT_BASE_URL. */
export function resolveContentUrl(relPath: string): string {
	const base = env.PUBLIC_CONTENT_BASE_URL || '/content';
	return joinContentUrl(base, relPath);
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `bun run test:unit -- --run src/lib/content/contentUrl.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/contentUrl.ts src/lib/content/contentUrl.test.ts
git commit -m "feat: add resolveContentUrl content base helper"
```

---

### Task 5: MarkdownView component

**Files:**
- Create: `src/lib/components/content/MarkdownView.svelte`, `src/lib/components/content/renderMarkdown.ts`, `src/lib/components/content/renderMarkdown.test.ts`

Λογική parse/sanitize σε ξεχωριστό module (testable), component μόνο για fetch+render.

- [ ] **Step 1: Write failing test for renderMarkdown**

```typescript
// src/lib/components/content/renderMarkdown.test.ts
import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './renderMarkdown';

describe('renderMarkdown', () => {
	it('renders headings and links', () => {
		const html = renderMarkdown('# Τίτλος\n\n[link](https://x.gr)');
		expect(html).toContain('<h1');
		expect(html).toContain('href="https://x.gr"');
	});
	it('keeps images', () => {
		const html = renderMarkdown('![alt](https://courses.nadia.gov.gr/a.webp)');
		expect(html).toContain('<img');
		expect(html).toContain('src="https://courses.nadia.gov.gr/a.webp"');
	});
	it('strips script tags (sanitize)', () => {
		const html = renderMarkdown('ok <script>alert(1)</script>');
		expect(html).not.toContain('<script');
	});
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `bun run test:unit -- --run src/lib/components/content/renderMarkdown.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement renderMarkdown**

```typescript
// src/lib/components/content/renderMarkdown.ts
import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ gfm: true, breaks: false });

/** Parse markdown to sanitized HTML. Safe for {@html}. */
export function renderMarkdown(src: string): string {
	const raw = marked.parse(src, { async: false }) as string;
	return DOMPurify.sanitize(raw, { ADD_ATTR: ['target', 'rel'] });
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `bun run test:unit -- --run src/lib/components/content/renderMarkdown.test.ts`
Expected: PASS (3 tests). (Αν `DOMPurify` χρειάζεται DOM στο vitest: το vitest config εδώ τρέχει browser provider — βλ. `@vitest/browser-playwright` στο package.json — οπότε υπάρχει DOM.)

- [ ] **Step 5: Implement MarkdownView component**

```svelte
<!-- src/lib/components/content/MarkdownView.svelte -->
<script lang="ts">
	import { resolveContentUrl } from '$lib/content/contentUrl';
	import { renderMarkdown } from './renderMarkdown';

	interface Props {
		mdPath: string;
		sourceUrl?: string;
	}
	let { mdPath, sourceUrl }: Props = $props();

	let html = $state('');
	let error = $state('');
	let loading = $state(true);

	$effect(() => {
		const url = resolveContentUrl(mdPath);
		loading = true;
		error = '';
		fetch(url)
			.then((r) => {
				if (!r.ok) throw new Error(`HTTP ${r.status}`);
				return r.text();
			})
			.then((txt) => {
				html = renderMarkdown(txt);
			})
			.catch((e) => {
				error = e.message;
			})
			.finally(() => {
				loading = false;
			});
	});
</script>

{#if loading}
	<div class="flex justify-center py-8">
		<div class="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
	</div>
{:else if error}
	<p class="text-red-500">Σφάλμα φόρτωσης περιεχομένου: {error}</p>
{:else}
	<article class="prose prose-slate dark:prose-invert max-w-none">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	</article>
	{#if sourceUrl}
		<p class="mt-8 border-t pt-4 text-sm text-muted-foreground">
			Πηγή: <a class="underline" href={sourceUrl} target="_blank" rel="noopener noreferrer"
				>Εθνική Ακαδημία Ψηφιακών Ικανοτήτων (nadia.gov.gr)</a
			>
		</p>
	{/if}
{/if}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/components/content/
git commit -m "feat: add MarkdownView component with sanitized rendering"
```

---

### Task 6: ReadingLesson component + register type

**Files:**
- Create: `src/lib/components/lessons/interactive/ReadingLesson.svelte`
- Modify: `src/lib/components/lessons/LessonRenderer.svelte` (~line 44)

- [ ] **Step 1: Implement ReadingLesson**

```svelte
<!-- src/lib/components/lessons/interactive/ReadingLesson.svelte -->
<script lang="ts">
	import MarkdownView from '$lib/components/content/MarkdownView.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { Lesson } from '$lib/db/schema';

	let { lesson, onComplete, onBack } = $props<{
		lesson: Lesson;
		onComplete: (score: number) => void;
		onBack: () => void;
	}>();

	const config = lesson.config as { mdPath: string; sourceUrl?: string };
</script>

<div class="mx-auto max-w-3xl p-4">
	<MarkdownView mdPath={config.mdPath} sourceUrl={config.sourceUrl} />
	<div class="mt-6 flex justify-between">
		<Button variant="outline" onclick={onBack}>Πίσω</Button>
		<Button onclick={() => onComplete(100)}>Το διάβασα ✓</Button>
	</div>
</div>
```

- [ ] **Step 2: Register `reading` in LessonRenderer**

Στο `lessonComponents` map (μετά τη γραμμή `quiz: () => import('./interactive/QuizLesson.svelte'),`) πρόσθεσε:

```typescript
			reading: () => import('./interactive/ReadingLesson.svelte'),
```

- [ ] **Step 3: Typecheck**

Run: `bun run check`
Expected: 0 errors (warnings OK).

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/lessons/interactive/ReadingLesson.svelte src/lib/components/lessons/LessonRenderer.svelte
git commit -m "feat: add reading lesson type + ReadingLesson component"
```

---

### Task 7: Manifest-driven reading-lessons seed

Generator (Python, μέρος του build) που διαβάζει `content/manifest.json` και γράφει `src/lib/db/seeds/eapsi-reading-lessons.ts`. Δημιουργεί ένα reading lesson ανά (subsection × module) όπου το `kind` περιέχει `theory` και υπάρχει τουλάχιστον 1 module.

**Files:**
- Modify: `exported_courses/build_manifest.py` (πρόσθεσε `write_seed()`)
- Create: `src/lib/db/seeds/eapsi-reading-lessons.ts` (generated)
- Modify: `src/lib/db/seeds/index.ts`

- [ ] **Step 1: Add seed generation to builder**

Στο τέλος της `main()` (πριν το print), πρόσθεσε κλήση `write_seed(manifest)` και όρισε:

```python
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
        lines.append(f'        descriptionKey: "Θεωρία ΕΑΨΙ",')
        lines.append(f'        difficulty: "beginner",')
        lines.append(f'        lessonType: "reading",')
        lines.append(f'        config: {{ mdPath: "{r["mdPath"]}", sourceUrl: "{r["sourceUrl"]}" }},')
        lines.append(f'        enabled: true,')
        lines.append("    },")
    lines.append("];")
    lines.append("")
    lines.append("// Group by module so autoOrder chains requiredLessonId within each module.")
    lines.append("export const eapsiReadingLessons: NewLesson[] = (() => {")
    lines.append("    const byModule = new Map<string, typeof _readingLessons>();")
    lines.append("    for (const l of _readingLessons) {")
    lines.append("        if (!byModule.has(l.moduleId)) byModule.set(l.moduleId, []);")
    lines.append("        byModule.get(l.moduleId)!.push(l);")
    lines.append("    }")
    lines.append("    return [...byModule.values()].flatMap((group) => autoOrder(group));")
    lines.append("})();")
    lines.append("")
    out = os.path.join(REPO, "src", "lib", "db", "seeds", "eapsi-reading-lessons.ts")
    open(out, "w", encoding="utf-8").write("\n".join(lines))
```

> Σημ.: `orderIndex` ανά module είναι σχετικό — οι reading lessons θα συνυπάρχουν με υπάρχοντα lessons του ίδιου module. Επειδή το seed κάνει upsert ανά (moduleId, lessonKey) και ταξινόμηση γίνεται με `orderBy(orderIndex)`, για να μην συγκρούονται, οι reading lessons θα πάρουν μεγάλο offset. Άλλαξε στο generator το `autoOrder(group)` wrap ώστε orderIndex να ξεκινά από 1000:

Στο `write_seed`, αντικατέστησε τη γραμμή `return [...byModule.values()].flatMap((group) => autoOrder(group));` με:

```python
    lines[-1] = "    return [...byModule.values()].flatMap((group) => autoOrder(group).map((l) => ({ ...l, orderIndex: l.orderIndex + 1000 })));"
```

(δηλαδή στο παραγόμενο TS η τελευταία επιστροφή κάνει `orderIndex + 1000`).

- [ ] **Step 2: Re-run builder**

```bash
cd exported_courses && .venv/bin/python build_manifest.py && cd ..
```
Expected: ξαναγράφεται manifest + md + `src/lib/db/seeds/eapsi-reading-lessons.ts`.

- [ ] **Step 3: Wire into seeds/index.ts**

Στο `src/lib/db/seeds/index.ts`:
1. Πρόσθεσε import μετά το `import { wordLessons } ...`:
```typescript
import { eapsiReadingLessons } from './eapsi-reading-lessons';
```
2. Στο `_allLessons` array, πρόσθεσε στο τέλος (πριν το `]`):
```typescript
    ,...eapsiReadingLessons
```
3. Στο τελικό `export { ... }` block πρόσθεσε `eapsiReadingLessons`.

- [ ] **Step 4: Verify validation passes (no unknown goal)**

Run: `bun run check`
Expected: 0 errors. (Reading lessons δεν έχουν `config.goal`, οπότε `validateLessons` δεν τα αγγίζει.)

- [ ] **Step 5: Commit**

```bash
git add exported_courses/build_manifest.py src/lib/db/seeds/eapsi-reading-lessons.ts src/lib/db/seeds/index.ts
git commit -m "feat: generate + wire EAPSI reading lessons seed"
```

---

### Task 8: Library routes

**Files:**
- Create: `src/lib/content/manifest.ts`
- Create: `src/routes/library/+page.server.ts`, `src/routes/library/+page.svelte`
- Create: `src/routes/library/[course]/[sub]/+page.server.ts`, `src/routes/library/[course]/[sub]/+page.svelte`

- [ ] **Step 1: Manifest types + loader**

```typescript
// src/lib/content/manifest.ts
import { resolveContentUrl } from './contentUrl';

export interface Subsection {
	id: string;
	title: string;
	mdPath: string;
	sourceUrl: string;
	modules: string[];
	kind: string;
}
export interface Chapter { title: string; subsections: Subsection[]; }
export interface Course { id: string; moduleNumber: number; title: string; courseUrl: string; chapters: Chapter[]; }
export interface Manifest { courses: Course[]; }

export async function loadManifest(fetchFn: typeof fetch): Promise<Manifest> {
	const res = await fetchFn(resolveContentUrl('manifest.json'));
	if (!res.ok) throw new Error(`manifest HTTP ${res.status}`);
	return (await res.json()) as Manifest;
}

export function findSubsection(manifest: Manifest, courseId: string, subId: string) {
	const course = manifest.courses.find((c) => c.id === courseId);
	if (!course) return null;
	for (const ch of course.chapters) {
		const sub = ch.subsections.find((s) => s.id === subId);
		if (sub) return { course, chapter: ch, sub };
	}
	return null;
}
```

- [ ] **Step 2: Library index server load**

```typescript
// src/routes/library/+page.server.ts
import type { PageServerLoad } from './$types';
import { loadManifest } from '$lib/content/manifest';

export const load: PageServerLoad = async ({ fetch }) => {
	const manifest = await loadManifest(fetch);
	return { manifest };
};
```

- [ ] **Step 3: Library index page**

```svelte
<!-- src/routes/library/+page.svelte -->
<script lang="ts">
	let { data } = $props();
</script>

<div class="mx-auto max-w-3xl p-6">
	<h1 class="mb-6 text-3xl font-bold">Βιβλιοθήκη Θεωρίας</h1>
	{#each data.manifest.courses as course}
		<section class="mb-8">
			<h2 class="mb-2 text-2xl font-semibold">{course.title}</h2>
			{#each course.chapters as chapter}
				<h3 class="mt-4 mb-1 text-lg font-medium text-muted-foreground">{chapter.title}</h3>
				<ul class="ml-4 list-disc space-y-1">
					{#each chapter.subsections as sub}
						<li>
							<a class="underline hover:text-primary" href="/library/{course.id}/{sub.id}">{sub.title}</a>
						</li>
					{/each}
				</ul>
			{/each}
		</section>
	{/each}
</div>
```

- [ ] **Step 4: Subsection server load**

```typescript
// src/routes/library/[course]/[sub]/+page.server.ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { loadManifest, findSubsection } from '$lib/content/manifest';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const manifest = await loadManifest(fetch);
	const found = findSubsection(manifest, params.course, params.sub);
	if (!found) throw error(404, 'Δεν βρέθηκε η υποενότητα');
	return { sub: found.sub, courseTitle: found.course.title, chapterTitle: found.chapter.title };
};
```

- [ ] **Step 5: Subsection page**

```svelte
<!-- src/routes/library/[course]/[sub]/+page.svelte -->
<script lang="ts">
	import MarkdownView from '$lib/components/content/MarkdownView.svelte';
	let { data } = $props();
</script>

<div class="mx-auto max-w-3xl p-6">
	<a class="text-sm underline" href="/library">← Βιβλιοθήκη</a>
	<MarkdownView mdPath={data.sub.mdPath} sourceUrl={data.sub.sourceUrl} />
	{#if data.sub.modules.length}
		<div class="mt-8 border-t pt-4">
			<h3 class="mb-2 font-semibold">Σχετικές ασκήσεις</h3>
			<ul class="flex flex-wrap gap-2">
				{#each data.sub.modules as mod}
					<li><a class="rounded bg-secondary px-3 py-1 text-sm underline" href="/modules/{mod}">{mod}</a></li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
```

- [ ] **Step 6: Typecheck + commit**

Run: `bun run check`
Expected: 0 errors.

```bash
git add src/lib/content/manifest.ts src/routes/library
git commit -m "feat: add Theory Library routes (index + subsection reader)"
```

---

### Task 9: Smoke-run + pre-public safety scan

**Files:** none (verification)

- [ ] **Step 1: Seed local DB + run dev**

```bash
bun run db:seed
bun run dev &
sleep 4
curl -s localhost:5173/library | grep -q "Βιβλιοθήκη Θεωρίας" && echo "LIBRARY OK"
kill %1
```
Expected: `LIBRARY OK`.

- [ ] **Step 2: Run full unit tests**

Run: `bun run test:unit -- --run`
Expected: όλα PASS (συμπεριλαμβανομένων contentUrl, renderMarkdown, υπαρχόντων goalHandlers).

- [ ] **Step 3: Pre-public secret scan**

```bash
git ls-files | grep -iE "\.env$|local\.db|\.dolt|secret|token" || echo "no tracked secrets"
git log --all -p | grep -iE "TURSO_AUTH_TOKEN|api[_-]?key|secret" | head || echo "no secrets in history"
```
Expected: `no tracked secrets` και κανένα πραγματικό token στο history. Αν βρεθεί κάτι → σταμάτα, ανέφερε στον χρήστη πριν το repo γίνει public.

- [ ] **Step 4: Final commit (αν υπάρχουν αλλαγές)**

```bash
git add -A && git commit -m "chore: EAPSI content integration verification" || echo "nothing to commit"
```

---

## Self-Review

- **Spec coverage:** §3.1 manifest → Task 2/3· §3.2 base URL/env → Task 1/4· §3.3 rendering → Task 5· §3.4 reading lessons → Task 6/7· §3.5 library → Task 8· §6 safety → Task 9. §4 (νέα quizzes/challenges) = εκτός scope (επόμενα plans, δηλωμένο). §5 mapping → CHAPTER_MAP/OVERRIDES στο Task 2.
- **Placeholder scan:** όλα τα code blocks πλήρη· καμία TODO/TBD.
- **Type consistency:** `mdPath`/`sourceUrl`/`modules`/`kind` συνεπή σε manifest.ts ↔ build script ↔ ReadingLesson config. `joinContentUrl`/`resolveContentUrl`/`renderMarkdown`/`loadManifest`/`findSubsection` συνεπή στα tasks.
- **Απόκλιση από spec:** το spec §3.4 ανέφερε goal `read-content`· το reading lesson υλοποιείται standalone (όπως QuizLesson) χωρίς goal — απλούστερο, λιγότερος κώδικας. Ενημέρωσε το spec αναλόγως.
