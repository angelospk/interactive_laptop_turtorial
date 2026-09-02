// Dev utility: παράγει το docs/LESSON_REVIEW.md — checklist όλων των μαθημάτων
// για ανθρώπινο review (τίτλος, τύπος, οδηγία, deep link).
import { allModules } from '../src/lib/db/seeds/modules.js';
import { allLessons } from '../src/lib/db/seeds/index.js';
import el from '../messages/el.json';

// Μερικά seeds (π.χ. eapsi-reading) βάζουν τον ίδιο τον τίτλο αντί για i18n key.
const t = (key: string | null | undefined) => {
	if (!key) return '';
	const hit = (el as Record<string, string>)[key];
	if (hit) return hit;
	return /\s/.test(key) ? `${key} ⚑literal` : `⟨λείπει key: ${key}⟩`;
};

// Τα πεδία του config που περιέχουν κείμενο ορατό στον μαθητή.
const TEXT_FIELDS = ['instructions', 'goal', 'question', 'prompt', 'hint', 'explanation'] as const;

// `\n` also shows up as a literal two-character escape inside seed strings, not
// only as a real newline -- collapse both so a cell never breaks the table.
const oneLine = (s: unknown) =>
	String(s)
		.replace(/\\[rn]/g, ' ')
		.replace(/\s+/g, ' ')
		.replace(/\|/g, '\\|')
		.trim();

const lines: string[] = [
	'# Review μαθημάτων',
	'',
	'Σημείωσε δίπλα σε κάθε μάθημα: `❌` χαλασμένο/άχρηστο · `⚠️` θέλει δουλειά · `✅` εντάξει.',
	'Γράψε τη σκέψη σου στη στήλη «Σχόλιο». Ό,τι δεν αγγίξεις μένει κενό = δεν το κοίταξες.',
	'',
	`Σύνολο: **${allModules.length} ενότητες / ${allLessons.length} μαθήματα**.`,
	''
];

const byModule = new Map<string, typeof allLessons>();
for (const l of allLessons) {
	if (!byModule.has(l.moduleId)) byModule.set(l.moduleId, [] as never);
	byModule.get(l.moduleId)!.push(l);
}

for (const m of allModules) {
	const lessons = (byModule.get(m.id) ?? [])
		.slice()
		.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
	lines.push(`## ${t(m.titleKey)}  \`${m.id}\` — ${lessons.length} μαθήματα`, '');
	lines.push('| # | ✔ | Τίτλος | Τύπος | Οδηγία προς τον μαθητή | Σχόλιο |');
	lines.push('|---|---|---|---|---|---|');
	for (const l of lessons) {
		const cfg = (l.config ?? {}) as Record<string, unknown>;
		const parts = TEXT_FIELDS.map((f) => cfg[f]).filter(
			(v): v is string => typeof v === 'string' && v.length > 0
		);
		// Τύποι χωρίς `instructions`: δείξε ό,τι άλλο βλέπει ο μαθητής.
		if (typeof cfg.sampleText === 'string') parts.push(`κείμενο: «${cfg.sampleText}»`);
		if (Array.isArray(cfg.questions)) parts.push(`${cfg.questions.length} ερωτήσεις`);
		if (Array.isArray(cfg.shortcuts)) parts.push(`συντομεύσεις: ${cfg.shortcuts.length}`);
		if (typeof cfg.mdPath === 'string') parts.push(`κείμενο: ${cfg.mdPath}`);
		if (typeof cfg.text === 'string') parts.push(`preset: ${cfg.text}`);
		// Τελευταίο καταφύγιο: η περιγραφή του μαθήματος.
		if (parts.length === 0) parts.push(t(l.descriptionKey));
		const text = parts.map(oneLine).filter(Boolean).join(' · ');
		const disabled = l.enabled === false ? ' 🚫off' : '';
		lines.push(
			`| ${l.orderIndex} |  | ${oneLine(t(l.titleKey))}${disabled} | \`${l.lessonType}\` | ${text || '—'} |  |`
		);
	}
	lines.push('', `Άνοιγμα: \`/modules/${m.id}\``, '');
}

console.log(lines.join('\n'));
