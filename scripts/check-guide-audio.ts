// Dev utility: which guide clips have an mp3 in static/audio/guides/, and which do not.
// Usage: bun run scripts/check-guide-audio.ts   (exit 1 if a clip the guide plays is missing)
// Workflow and naming rules: docs/guides/audio-workflow.md
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { guides, clipIdsFor, hintClip, COMMON_CLIPS } from '../src/lib/guides/index.js';
import { parseScript } from '../src/lib/guides/script.js';

const ROOT = join(import.meta.dir, '..');
const AUDIO_DIR = join(ROOT, 'static/audio/guides');
const SCRIPT_DIR = join(ROOT, 'docs/guides');

// Hints and idle nudges stay in the scripts (stable ids), but the guide no longer plays them.
const notPlayed = new Set<string>([
	...COMMON_CLIPS.idle,
	...Object.values(guides).flatMap((g) => g.steps.map((s) => hintClip(g, s)))
]);

const scripted = new Set<string>();
for (const file of readdirSync(SCRIPT_DIR).filter((f) => f.endsWith('.script.md'))) {
	for (const id of parseScript(readFileSync(join(SCRIPT_DIR, file), 'utf8'), file).keys()) {
		scripted.add(id);
	}
}

const files = existsSync(AUDIO_DIR) ? readdirSync(AUDIO_DIR) : [];
const mp3 = new Set(files.filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)));

const played = [...new Set(Object.values(guides).flatMap(clipIdsFor))].filter(
	(id) => !notPlayed.has(id)
);
const missing = played.filter((id) => !mp3.has(id));
const empty = played.filter(
	(id) => mp3.has(id) && statSync(join(AUDIO_DIR, `${id}.mp3`)).size === 0
);
const unknown = [...mp3].filter((id) => !scripted.has(id));
const optionalMissing = [...notPlayed].filter((id) => !mp3.has(id));

const list = (title: string, ids: string[]) => {
	if (ids.length === 0) return;
	console.log(`\n${title} (${ids.length}):`);
	for (const id of ids) console.log(`  static/audio/guides/${id}.mp3`);
};

console.log(`Φάκελος: ${AUDIO_DIR}${existsSync(AUDIO_DIR) ? '' : ' (δεν υπάρχει ακόμα)'}`);
console.log(
	`Clips που παίζει ο Οδηγός: ${played.length}, με αρχείο: ${played.length - missing.length}`
);
list('Λείπουν (ο Οδηγός θα δείξει μόνο λεζάντα)', missing);
list('Άδεια αρχεία (0 bytes)', empty);
list('Αρχεία χωρίς αντίστοιχο `## id` σε script (λάθος όνομα;)', unknown);
if (optionalMissing.length) {
	console.log(`\nΠροαιρετικά, δεν παίζουν σήμερα (hint/idle): λείπουν ${optionalMissing.length}.`);
}

process.exit(missing.length || empty.length ? 1 : 0);
