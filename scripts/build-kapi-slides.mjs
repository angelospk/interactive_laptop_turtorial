// Γεννήτρια 4 αυτόνομων παρουσιάσεων ΚΑΠΗ (offline-ready, file://).
// Κάθε μάθημα -> ξεχωριστό HTML με πολλές αναλυτικές διαφάνειες.
// Τρέξε:  node scripts/build-kapi-slides.mjs   (ή: bun run scripts/build-kapi-slides.mjs)
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'static', 'kapi');
mkdirSync(OUT, { recursive: true });

/* ---------------- helpers (παράγουν HTML) ---------------- */
const esc = (s) => s; // περιεχόμενο γραμμένο ήδη ασφαλές/σκόπιμο
const card = (icon, title, body, extra = '', style = '') =>
	`<div class="card ${extra}" ${style ? `style="${style}"` : ''}><h2><span class="ic">${icon}</span> ${title}</h2>${body}</div>`;
const tips = (items) =>
	`<ul class="tips">${items.map((t) => `<li>${t}</li>`).join('')}</ul>`;
const plainList = (items) =>
	`<ul class="tips plain">${items.map((t) => `<li>${t}</li>`).join('')}</ul>`;
const steps = (items) =>
	`<ol class="steps">${items.map((t) => `<li>${t}</li>`).join('')}</ol>`;
const etym = (rows) =>
	`<div class="etym">${rows.map(([a, b]) => `<div class="row"><b>${a}</b> ${b}</div>`).join('')}</div>`;
const check = (qs) =>
	card('❓', 'Ερωτήσεις ελέγχου', `<ul class="qs">${qs.map((q) => `<li>${q}</li>`).join('')}</ul>`, 'check');
const goalCard = (text) =>
	card('🎯', 'Στόχος', `<p class="big">${text}</p>`);
const rule = (text, warn = false) =>
	`<div class="rule ${warn ? 'warn' : ''}">${text}</div>`;
const refs = (rowsHtml) =>
	`<div class="refs"><span class="lbl">Δείτε / εξασκηθείτε στην εφαρμογή</span>${rowsHtml}</div>`;
const ref = (label, code) => `<span class="ref"><b>${label}</b> <code>${code}</code></span>`;
const grid = (a, b, ratio = '1.4fr 1fr') => `<div class="grid" style="--cols:${ratio}">${a}${b}</div>`;
const stack = (...els) => els.join('');

/* ---------------- shared CSS + JS (inline για 100% offline) ---------------- */
const CSS = `
:root{
  --bg:#f4f1ea; --ink:#1d2433; --muted:#5a6478; --card:#fff; --line:#e2ddd2;
  --accent:#2f6f6b; --accent-soft:#e7f0ef; --warn:#a81b28;
  --shadow:0 10px 30px rgba(20,28,46,.10); --radius:18px;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{font-family:-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;line-height:1.45;overflow:hidden}
.deck{height:100vh;width:100vw;position:relative}
.slide{position:absolute;inset:0;display:none;padding:clamp(18px,3vw,52px) clamp(18px,4vw,76px) 92px;overflow-y:auto;animation:fade .35s ease}
.slide.active{display:block}
@keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.head{display:flex;align-items:center;gap:clamp(14px,1.6vw,24px);border-bottom:4px solid var(--accent);
  padding-bottom:clamp(10px,1.3vw,18px);margin-bottom:clamp(14px,1.7vw,24px)}
.badge{flex:none;width:clamp(54px,5vw,84px);height:clamp(54px,5vw,84px);border-radius:20px;background:var(--accent);
  color:#fff;display:grid;place-items:center;font-weight:800;font-size:clamp(24px,2.5vw,40px);box-shadow:var(--shadow)}
.head h1{font-size:clamp(24px,2.9vw,46px);letter-spacing:-.5px;line-height:1.1}
.head .kicker{color:var(--accent);font-weight:700;font-size:clamp(13px,1.25vw,19px);text-transform:uppercase;letter-spacing:1px}
.grid{display:grid;grid-template-columns:var(--cols,1.4fr 1fr);gap:clamp(14px,1.6vw,26px);align-items:start}
@media (max-width:880px){.grid{grid-template-columns:1fr!important}}
.card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:clamp(16px,1.6vw,26px);box-shadow:var(--shadow)}
.card + .card{margin-top:clamp(12px,1.4vw,20px)}
.card h2{font-size:clamp(18px,1.7vw,27px);margin-bottom:.55em;display:flex;align-items:center;gap:.5em}
.card h2 .ic{font-size:1.15em}
.big{font-size:clamp(16px,1.5vw,24px)}
ul.tips{list-style:none;display:grid;gap:clamp(9px,.9vw,15px)}
ul.tips li{position:relative;padding-left:1.9em;font-size:clamp(16px,1.45vw,23px)}
ul.tips li::before{content:"✓";position:absolute;left:0;top:.02em;color:var(--accent);font-weight:900;font-size:1.05em}
ul.tips.plain li::before{content:"•";font-size:1.3em;top:-.05em}
ul.tips li b{color:var(--ink)}
ol.steps{list-style:none;counter-reset:s;display:grid;gap:clamp(9px,.9vw,14px)}
ol.steps li{position:relative;padding-left:2.4em;font-size:clamp(16px,1.45vw,23px);min-height:1.6em}
ol.steps li::before{counter-increment:s;content:counter(s);position:absolute;left:0;top:0;width:1.7em;height:1.7em;
  border-radius:50%;background:var(--accent);color:#fff;font-weight:800;display:grid;place-items:center;font-size:.8em}
.muted{color:var(--muted)}
.rule{background:var(--accent-soft);border:2px solid var(--accent);border-radius:14px;
  padding:clamp(12px,1.2vw,18px) clamp(14px,1.4vw,22px);font-size:clamp(16px,1.5vw,24px);font-weight:700;color:var(--accent);
  margin-bottom:clamp(14px,1.6vw,22px);display:flex;gap:.6em;align-items:flex-start}
.rule.warn{background:#fbecee;border-color:var(--warn);color:var(--warn)}
.etym{display:grid;gap:clamp(8px,.8vw,13px)}
.etym .row{font-size:clamp(15px,1.35vw,21px)}
.etym .row b{color:var(--accent)}
.check{background:#fff7e8;border-color:#f0dcab}
.check h2{color:#9a6b00}
.check .qs{list-style:none;display:grid;gap:clamp(8px,.8vw,13px)}
.check .qs li{font-size:clamp(15px,1.35vw,22px);padding-left:1.6em;position:relative}
.check .qs li::before{content:"?";position:absolute;left:0;font-weight:900;color:#c98a00}
.scam{background:#fbecee;border-color:#e7b9c0}
.scam .msg{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:clamp(14px,1.25vw,20px);background:#fff;
  border:1px dashed #d99;border-radius:10px;padding:.7em .9em;margin:.2em 0 .7em;color:#7a1420;white-space:pre-wrap}
.tag{display:inline-block;font-size:.78em;font-weight:800;text-transform:uppercase;letter-spacing:.5px;
  padding:.18em .6em;border-radius:999px;margin-bottom:.4em}
.tag.bad{background:var(--warn);color:#fff}.tag.ok{background:#2f6f6b;color:#fff}
.refs{margin-top:clamp(14px,1.6vw,24px);background:#eef1f6;border:1px dashed #b9c2d4;border-radius:14px;
  padding:clamp(12px,1.2vw,18px) clamp(14px,1.4vw,22px);font-size:clamp(13px,1.15vw,18px)}
.refs .lbl{font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;font-size:.82em;margin-bottom:.4em;display:block}
.refs code{font-family:"SF Mono",ui-monospace,Menlo,Consolas,monospace;background:#fff;border:1px solid #d6dce8;border-radius:6px;padding:.08em .45em}
.refs .ref{display:inline-block;margin:.18em .55em .18em 0}
.refs .ref b{color:var(--ink)}
.hint{position:fixed;top:12px;left:16px;font-size:13px;color:var(--muted);z-index:5}
.counter{position:fixed;top:12px;right:16px;font-size:14px;font-weight:700;color:var(--accent);z-index:5}
.home{position:fixed;top:10px;right:96px;z-index:5;font-size:13px;font-weight:700;color:var(--accent);text-decoration:none;
  background:#fff;border:1px solid var(--line);border-radius:8px;padding:.3em .7em}
.nav{position:fixed;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;gap:14px;
  padding:12px;background:linear-gradient(transparent,rgba(244,241,234,.92) 40%);z-index:5}
.nav button{font-size:16px;font-weight:700;border:1px solid var(--line);background:#fff;color:var(--ink);
  border-radius:10px;padding:.55em 1.1em;cursor:pointer;box-shadow:var(--shadow)}
.nav button:disabled{opacity:.4;cursor:default}
.dots{display:flex;gap:7px;flex-wrap:wrap;max-width:60vw;justify-content:center}
.dot{width:11px;height:11px;border-radius:50%;border:none;background:#cdd3df;cursor:pointer}
.dot.active{background:var(--accent);transform:scale(1.25)}
@media print{
  body{overflow:visible}.hint,.counter,.home,.nav{display:none}
  .deck{height:auto}.slide{position:static;display:block!important;page-break-after:always;min-height:96vh}
}
`;

const JS = `
const slides=[...document.querySelectorAll('.slide')];
const dotsWrap=document.getElementById('dots'),cur=document.getElementById('cur');
const prevBtn=document.getElementById('prev'),nextBtn=document.getElementById('next');
let i=0;
slides.forEach((_,n)=>{const d=document.createElement('button');d.className='dot'+(n===0?' active':'');
  d.setAttribute('aria-label','Διαφάνεια '+(n+1));d.addEventListener('click',()=>go(n));dotsWrap.appendChild(d)});
const dots=[...dotsWrap.children];
function go(n){i=Math.max(0,Math.min(slides.length-1,n));
  slides.forEach((s,k)=>s.classList.toggle('active',k===i));
  dots.forEach((d,k)=>d.classList.toggle('active',k===i));
  cur.textContent=i+1;prevBtn.disabled=i===0;nextBtn.disabled=i===slides.length-1;slides[i].scrollTop=0}
prevBtn.addEventListener('click',()=>go(i-1));nextBtn.addEventListener('click',()=>go(i+1));
document.addEventListener('keydown',e=>{
  const t=e.target;
  if(t instanceof HTMLElement && (t.isContentEditable || ['INPUT','TEXTAREA','SELECT','BUTTON','A'].includes(t.tagName))) return;
  if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '){go(i+1);e.preventDefault()}
  if(e.key==='ArrowLeft'||e.key==='PageUp'){go(i-1);e.preventDefault()}
  if(e.key==='Home')go(0);if(e.key==='End')go(slides.length-1)});
let x0=null,y0=null;
document.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
document.addEventListener('touchend',e=>{if(x0===null)return;
  const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;
  if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)*1.5)go(i+(dx<0?1:-1));
  x0=null;y0=null},{passive:true});
go(0);
`;

/* ---------------- σκελετός αρχείου ---------------- */
function deck({ file, title, accent, slidesHtml }) {
	const html = `<!DOCTYPE html>
<html lang="el">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<style>${CSS}
:root{--accent:${accent}}
</style>
</head>
<body>
<div class="hint">← → ή σάρωση για αλλαγή · Ctrl+P για εκτύπωση</div>
<a class="home" href="index.html" title="Όλα τα μαθήματα">☰ Μαθήματα</a>
<div class="counter"><span id="cur">1</span> / ${slidesHtml.length}</div>
<div class="deck">
${slidesHtml.join('\n')}
</div>
<nav class="nav">
  <button id="prev">← Προηγούμενο</button>
  <div class="dots" id="dots"></div>
  <button id="next">Επόμενο →</button>
</nav>
<script>${JS}</script>
</body>
</html>`;
	writeFileSync(join(OUT, file), html, 'utf8');
	console.log('✔', file, '—', slidesHtml.length, 'διαφάνειες');
}

// slide(num, kicker, h1, body) -> <section>
function slide(num, kicker, h1, body) {
	return `<section class="slide${num === 1 ? ' active' : ''}">
  <div class="head"><div class="badge">${num}</div><div><div class="kicker">${kicker}</div><h1>${h1}</h1></div></div>
  ${body}
</section>`;
}

/* =====================================================================
   ΜΑΘΗΜΑ 1 — Τα πρώτα βήματα
   ===================================================================== */
const L1 = '#2f6f6b';
const lesson1 = [
	slide(1, 'Μάθημα 1 · Τα πρώτα βήματα', 'Ποντίκι, Πληκτρολόγιο &amp; Οθόνη',
		stack(
			rule('🖐️ Χρυσός κανόνας: <b>Δεν χαλάει τίποτα.</b> Ο υπολογιστής περιμένει <b>εσάς</b> — χωρίς βιασύνη, χωρίς άγχος.'),
			grid(
				card('👋', 'Καλώς ήρθατε', `<p class="big">Σήμερα πιάνουμε στα χέρια μας τα τρία βασικά εργαλεία: το <b>ποντίκι</b>, το <b>πληκτρολόγιο</b> και την <b>οθόνη</b>. Θα τα δοκιμάσουμε ένα-ένα, με την ησυχία μας.</p>`),
				card('🧭', 'Πώς θα πάμε', plainList([
					'Πρώτα κοιτάμε, μετά δοκιμάζουμε μαζί.',
					'Ό,τι δεν βγαίνει, το ξαναπροσπαθούμε — κανείς δεν βιάζεται.',
					'Ρωτάτε ελεύθερα· δεν υπάρχει «χαζή» ερώτηση.'
				]))
			)
		)
	),
	slide(2, 'Μάθημα 1 · Προσανατολισμός', 'Τι θα μάθουμε σήμερα',
		grid(
			card('🎯', 'Στόχοι', tips([
				'Να κρατάμε άνετα το <b>ποντίκι</b> και να ξεχωρίζουμε τα κλικ.',
				'Να γράφουμε με το <b>πληκτρολόγιο</b>: πεζά, κεφαλαία, τόνους.',
				'Να ρυθμίζουμε την <b>οθόνη</b> για να βλέπουμε ξεκούραστα.',
				'Να βρίσκουμε το κουμπί <b>Έναρξη</b> των Windows.'
			])),
			card('💬', 'Λεξιλόγιο της ημέρας', etym([
				['Υλικό (hardware):', 'τα μέρη που πιάνεις — οθόνη, ποντίκι.'],
				['Λογισμικό (software):', 'τα προγράμματα μέσα στον υπολογιστή.'],
				['Επιφάνεια εργασίας:', 'η «πρώτη» οθόνη με τα εικονίδια.']
			]))
		)
	),
	slide(3, 'Μάθημα 1 · Τα μέρη', 'Από τι αποτελείται ο υπολογιστής',
		grid(
			card('🖥️', 'Τα βασικά μέρη', tips([
				'<b>Οθόνη:</b> εκεί βλέπουμε ό,τι κάνουμε.',
				'<b>Κουτί / πύργος (ή laptop):</b> ο «εγκέφαλος» — εκεί δουλεύουν όλα.',
				'<b>Ποντίκι:</b> δείχνει και επιλέγει.',
				'<b>Πληκτρολόγιο:</b> γράφει γράμματα και αριθμούς.'
			])),
			card('📖', 'Από πού πήραν το όνομα', etym([
				['Ποντίκι (mouse):', 'από το σχήμα του — με «ουρά» το καλώδιο.'],
				['Πληκτρολόγιο:', 'από τα «πλήκτρα» που πατάμε.'],
				['Δρομέας (cursor):', 'λατινικά «αυτός που τρέχει» στην οθόνη.']
			]))
		)
	),
	slide(4, 'Μάθημα 1 · Το ποντίκι', 'Τα τρία κλικ &amp; το σύρσιμο',
		grid(
			card('🖱️', 'Τι κάνει κάθε κίνηση', tips([
				'<b>Αριστερό κλικ</b> = επιλέγω / ανοίγω.',
				'<b>Διπλό κλικ</b> (γρήγορα δύο φορές) = ανοίγω αρχείο ή πρόγραμμα.',
				'<b>Δεξί κλικ</b> = εμφανίζει <b>μενού</b> με επιλογές.',
				'<b>Σύρσιμο (drag):</b> κρατάω πατημένο και μετακινώ.',
				'<b>Ροδέλα:</b> την γυρνάω για να «κατεβαίνει» η σελίδα.'
			])),
			stack(
				goalCard('Να νιώσουμε το χέρι στο ποντίκι: πού ακουμπάει, πώς πατάμε χωρίς να το κουνάμε.'),
				card('💡', 'Μικρό μυστικό', `<p class="big">Λάθος; Το <b>«Αναίρεση» (Ctrl + Z)</b> το επαναφέρει αμέσως.</p>`)
			)
		)
	),
	slide(5, 'Μάθημα 1 · Εξάσκηση', 'Παίζουμε με το ποντίκι',
		stack(
			rule('🎮 Η εφαρμογή έχει παιχνίδια — μαθαίνουμε παίζοντας, χωρίς φόβο.'),
			grid(
				card('🎈', 'Ασκήσεις στην εφαρμογή', tips([
					'<b>Μπαλόνια:</b> περνάω το ποντίκι από πάνω (hover).',
					'<b>Τυφλοπόντικες:</b> κλικ πριν κρυφτούν.',
					'<b>Σεντούκια:</b> διπλό κλικ για να ανοίξουν.',
					'<b>Ανακύκλωση:</b> σύρω τα σκουπίδια στον σωστό κάδο.'
				])),
				check([
					'Έχετε ξαναπιάσει ποντίκι;',
					'Ξεχωρίζετε αριστερό από δεξί κλικ;',
					'Σας βγαίνει το διπλό κλικ;'
				])
			),
			refs(stack(ref('Εξάσκηση ποντικιού:', '/modules/module1')))
		)
	),
	slide(6, 'Μάθημα 1 · Το πληκτρολόγιο', 'Γράφουμε γράμματα',
		grid(
			card('⌨️', 'Τα βασικά πλήκτρα', tips([
				'<b>Κεφαλαία:</b> κρατάω <b>Shift</b> + το γράμμα. Για όλα κεφαλαία: <b>Caps Lock</b>.',
				'<b>Τόνος:</b> πατάω πρώτα το <b>;</b> και μετά το φωνήεν (ά, έ, ή…).',
				'<b>Κενό:</b> η μεγάλη μπάρα κάτω (Space).',
				'<b>Σβήσιμο:</b> <b>Backspace</b> σβήνει το γράμμα πριν.',
				'<b>Νέα γραμμή / «ΟΚ»:</b> <b>Enter</b>.'
			])),
			card('🔤', 'Ελληνικά ↔ Αγγλικά', stack(
				`<p class="big">Αλλάζω γλώσσα με <b>Alt + Shift</b>. Κάτω δεξιά γράφει <b>ΕΛ</b> ή <b>EN</b>.</p>`,
				etym([['Πεζά:', 'τα μικρά γράμματα.'], ['Κεφαλαία:', 'τα μεγάλα.']])
			))
		)
	),
	slide(7, 'Μάθημα 1 · Συντομεύσεις', 'Τρία κόλπα που σώζουν χρόνο',
		grid(
			card('⚡', 'Οι 3 χρυσές συντομεύσεις', tips([
				'<b>Ctrl + Z</b> — Αναίρεση (πίσω από το λάθος).',
				'<b>Ctrl + C</b> — Αντιγραφή (κρατάω ένα αντίγραφο).',
				'<b>Ctrl + V</b> — Επικόλληση (το «κολλάω» αλλού).'
			])),
			stack(
				card('🧩', 'Πώς δουλεύει', `<p class="big">Επιλέγω κείμενο → <b>Ctrl+C</b> → πάω εκεί που θέλω → <b>Ctrl+V</b>. Το ίδιο κείμενο, χωρίς να το ξαναγράψω.</p>`),
				goalCard('Να μη φοβόμαστε το λάθος: σχεδόν όλα διορθώνονται.')
			)
		)
	),
	slide(8, 'Μάθημα 1 · Η οθόνη', 'Βλέπω καθαρά &amp; ξεκούραστα',
		stack(
			rule('👓 Αν δεν βλέπετε καλά, <b>δεν φταίτε εσείς</b> — μεγαλώνουμε τα γράμματα.'),
			grid(
				card('🔍', 'Προσβασιμότητα', tips([
					'<b>Μεγάλα γράμματα:</b> Ρυθμίσεις → Προσβασιμότητα → Μέγεθος κειμένου (έως 225%).',
					'<b>Μεγεθυντικός φακός:</b> πλήκτρο <b>⊞ Windows</b> μαζί με <b>+</b>.',
					'<b>Υψηλή αντίθεση:</b> πιο έντονα χρώματα για τα μάτια.',
					'<b>Μεγέθυνση σελίδας:</b> <b>Ctrl +</b> μεγαλώνει, <b>Ctrl −</b> μικραίνει.'
				])),
				check([
					'Βλέπετε καθαρά τα γράμματα τώρα;',
					'Θέλουμε να τα μεγαλώσουμε λίγο;',
					'Σας βολεύει το φως της οθόνης;'
				])
			)
		)
	),
	slide(9, 'Μάθημα 1 · Windows', 'Η επιφάνεια εργασίας',
		grid(
			card('🪟', 'Τα Windows με απλά λόγια', steps([
				'Κάτω αριστερά είναι το κουμπί <b>Έναρξη</b> (το μπλε εικονίδιο). Κλικ για το μενού.',
				'Τα <b>εικονίδια</b> στην επιφάνεια ανοίγουν με <b>διπλό κλικ</b>.',
				'Το <b>«Προβολή Εργασιών»</b> δείχνει όλα τα ανοιχτά παράθυρα.',
				'Πάνω δεξιά κάθε παραθύρου: <b>−</b> ελαχιστοποίηση, <b>▢</b> μεγέθυνση, <b>✕</b> κλείσιμο.'
			])),
			card('📖', 'Ετυμολογία', etym([
				['Windows:', '«παράθυρα» — κάθε πρόγραμμα ανοίγει στο δικό του.'],
				['Εικονίδιο (icon):', 'μικρή εικόνα-συντόμευση.'],
				['Μενού:', 'λίστα με επιλογές, όπως στο εστιατόριο.']
			]))
		)
	),
	slide(10, 'Μάθημα 1 · Ανακεφαλαίωση', 'Τι κρατάμε από σήμερα',
		grid(
			card('✅', 'Τα πήραμε', tips([
				'Ξεχωρίζω αριστερό / διπλό / δεξί κλικ.',
				'Γράφω κεφαλαία, τόνους και σβήνω λάθη.',
				'Μεγαλώνω τα γράμματα όταν χρειάζεται.',
				'Βρίσκω το κουμπί Έναρξη.'
			])),
			stack(
				goalCard('Πετύχαμε αν νιώθουμε λίγο πιο άνετα — όχι τέλεια. Η άνεση έρχεται με την επανάληψη.'),
				refs(stack(
					ref('Ποντίκι:', '/modules/module1'),
					ref('Πληκτρολόγιο:', '/modules/module2'),
					ref('Windows:', '/modules/module3'),
					ref('Βιβλιοθήκη — Προσβασιμότητα:', '/library/esm001/esm001-c1-s4')
				))
			)
		)
	)
];

/* =====================================================================
   ΜΑΘΗΜΑ 2 — Διαδίκτυο & Επικοινωνία
   ===================================================================== */
const L2 = '#1f5fa8';
const lesson2 = [
	slide(1, 'Μάθημα 2 · Διαδίκτυο &amp; Επικοινωνία', 'Google, Email &amp; Βιντεοκλήση',
		stack(
			rule('📶 Με <b>Wi-Fi</b> στο σπίτι το ίντερνετ είναι δωρεάν — δεν ξοδεύετε δεδομένα από το κινητό.'),
			grid(
				card('🌍', 'Τι ανοίγει το διαδίκτυο', `<p class="big">Με μία σύνδεση μπορούμε να <b>ψάχνουμε</b> πληροφορίες, να <b>γράφουμε</b> σε δικούς μας και να τους <b>βλέπουμε</b> με βιντεοκλήση — από το σπίτι.</p>`),
				card('🧭', 'Πώς θα πάμε', plainList([
					'Δοκιμάζουμε μαζί μια αναζήτηση στο Google.',
					'Ανοίγουμε ένα email βήμα-βήμα.',
					'Κάνουμε μια δοκιμαστική βιντεοκλήση.'
				]))
			)
		)
	),
	slide(2, 'Μάθημα 2 · Προσανατολισμός', 'Τι θα μάθουμε σήμερα',
		grid(
			card('🎯', 'Στόχοι', tips([
				'Να <b>ψάχνω στο Google</b> με απλές λέξεις.',
				'Να χρησιμοποιώ τον <b>φυλλομετρητή</b>: καρτέλες, αγαπημένα.',
				'Να <b>διαβάζω &amp; στέλνω email</b>.',
				'Να κάνω <b>βιντεοκλήση</b> με τους δικούς μου.'
			])),
			card('💬', 'Λεξιλόγιο της ημέρας', etym([
				['Διαδίκτυο (Internet):', 'δια + δίκτυο = «ανάμεσα στα δίκτυα».'],
				['Φυλλομετρητής (browser):', 'το πρόγραμμα που ανοίγει ιστοσελίδες.'],
				['Wi-Fi:', 'η ασύρματη σύνδεση στο σπίτι.']
			]))
		)
	),
	slide(3, 'Μάθημα 2 · Ο φυλλομετρητής', 'Το «παράθυρο» στο διαδίκτυο',
		grid(
			card('🧭', 'Τι βλέπω πάνω-πάνω', tips([
				'<b>Γραμμή διευθύνσεων:</b> εκεί γράφω πού θέλω να πάω (π.χ. <i>news.gr</i>) και <b>Enter</b>.',
				'<b>Καρτέλες:</b> με το <b>+</b> ανοίγω νέα· με το <b>✕</b> κλείνω μία.',
				'<b>Αγαπημένα (αστέρι ★):</b> κρατάω μια σελίδα για να τη βρίσκω εύκολα.',
				'<b>Ιστορικό (ρολόι):</b> πού έχω ξαναπάει.',
				'<b>Μεγέθυνση:</b> <b>Ctrl +</b> / <b>Ctrl −</b>.'
			])),
			card('📖', 'Ετυμολογία', etym([
				['Browser:', 'από το «browse» = ξεφυλλίζω, περιηγούμαι.'],
				['Καρτέλα (tab):', 'σαν τα χωρίσματα σε ντοσιέ.'],
				['Σύνδεσμος (link):', 'γαλάζιο κείμενο που με πάει αλλού.']
			]))
		)
	),
	slide(4, 'Μάθημα 2 · Αναζήτηση', 'Ψάχνω στο Google',
		stack(
			rule('🔎 Δεν χρειάζεται να ξέρω διεύθυνση. Γράφω <b>λέξεις</b> και το Google βρίσκει.'),
			grid(
				card('💡', 'Πώς ρωτάω', tips([
					'Γράφω ό,τι θέλω και πατάω <b>Enter</b>.',
					'Παραδείγματα: «<i>εφημερεύον φαρμακείο</i>», «<i>καιρός αύριο</i>», «<i>δρομολόγια ΚΤΕΛ</i>».',
					'Διαβάζω τα πρώτα αποτελέσματα και πατάω αυτό που ταιριάζει.',
					'Δεν βρήκα; Αλλάζω λίγο τις λέξεις και ξαναψάχνω.'
				])),
				check([
					'Έχετε ψάξει ποτέ κάτι μόνοι σας;',
					'Τι θα θέλατε να βρείτε τώρα;',
					'Ξεχωρίζετε τη γραμμή αναζήτησης;'
				])
			),
			refs(stack(ref('Περιήγηση &amp; αναζήτηση:', '/modules/module5')))
		)
	),
	slide(5, 'Μάθημα 2 · Email', 'Το ηλεκτρονικό ταχυδρομείο',
		grid(
			card('✉️', 'Τι είναι &amp; πώς διαβάζεται', tips([
				'Το <b>@</b> χωρίζει το όνομα από την εταιρεία: <i>onoma@gmail.com</i>.',
				'Τα <b>αδιάβαστα</b> μηνύματα είναι με <b>έντονα</b> γράμματα.',
				'<b>Απάντηση:</b> γράφω πίσω σε αυτόν που μου έστειλε.',
				'<b>Προώθηση:</b> στέλνω το μήνυμα σε άλλον.',
				'<b>Συνημμένο (📎):</b> στέλνω αρχείο ή φωτογραφία.'
			])),
			card('📖', 'Ετυμολογία', etym([
				['Email:', 'electronic mail = ηλεκτρονικό ταχυδρομείο.'],
				['@ (παπάκι):', 'σημαίνει «at» — «στο».'],
				['Συνημμένο:', '«συν-ημμένο» = κάτι που επισυνάπτεται.']
			]))
		)
	),
	slide(6, 'Μάθημα 2 · Email στην πράξη', 'Στέλνω το πρώτο μου μήνυμα',
		grid(
			card('📝', 'Βήμα-βήμα', steps([
				'Πατάω <b>«Σύνταξη»</b> (ή «Νέο μήνυμα»).',
				'Στο <b>«Προς»</b> γράφω τη διεύθυνση του παραλήπτη.',
				'Γράφω <b>θέμα</b> και το <b>μήνυμα</b>.',
				'Θέλω φωτογραφία; Πατάω τον <b>συνδετήρα 📎</b> και την επιλέγω.',
				'Πατάω <b>«Αποστολή»</b>.'
			])),
			stack(
				goalCard('Να στείλουμε ένα απλό email σε δικό μας άνθρωπο — και να πάρουμε απάντηση.'),
				refs(stack(ref('Email στην εφαρμογή:', '/modules/module6')))
			)
		)
	),
	slide(7, 'Μάθημα 2 · Βιντεοκλήση', 'Βλέπω τους δικούς μου',
		stack(
			rule('💙 Δωρεάν, και βλέπετε <b>πρόσωπα</b> — ιδανικό για παιδιά &amp; εγγόνια μακριά.'),
			grid(
				card('📹', 'Με Viber / Messenger', steps([
					'Ανοίγω το <b>Viber</b> (διπλό κλικ στο εικονίδιο).',
					'Επιλέγω την <b>επαφή</b> και πατάω το εικονίδιο <b>βιντεοκλήσης 📹</b>.',
					'Θέλω ησυχία; Πατάω το <b>μικρόφωνο 🎤</b> για σίγαση.',
					'Τέλος: το <b>κόκκινο κουμπί 📵</b> κλείνει την κλήση.'
				])),
				check([
					'Μιλάτε με βιντεοκλήση τώρα; Σε ποια εφαρμογή;',
					'Με ποιον θα θέλατε να μιλήσετε;',
					'Έχετε εγκατεστημένο Viber/Messenger;'
				])
			)
		)
	),
	slide(8, 'Μάθημα 2 · Ανακεφαλαίωση', 'Τι κρατάμε από σήμερα',
		grid(
			card('✅', 'Τα πήραμε', tips([
				'Ψάχνω στο Google με λέξεις.',
				'Ανοίγω καρτέλες &amp; κρατάω αγαπημένα.',
				'Διαβάζω &amp; στέλνω ένα email.',
				'Κάνω βιντεοκλήση με δικούς μου.'
			])),
			stack(
				goalCard('Το διαδίκτυο μάς φέρνει πιο κοντά στους ανθρώπους και τις πληροφορίες — με ασφάλεια, που θα δούμε στο επόμενο μάθημα.'),
				refs(stack(
					ref('Περιήγηση:', '/modules/module5'),
					ref('Email:', '/modules/module6'),
					ref('Βιντεοκλήση:', '/modules/module11'),
					ref('Βιβλιοθήκη — Διαδίκτυο:', '/library/esm002/esm002-c1-s2')
				))
			)
		)
	)
];

/* =====================================================================
   ΜΑΘΗΜΑ 3 — Ασφάλεια & Απάτες
   ===================================================================== */
const L3 = '#a81b28';
const scamCard = (tag, label, msg, why) =>
	card('🚩', label, stack(
		`<span class="tag ${tag === 'ok' ? 'ok' : 'bad'}">${tag === 'ok' ? 'Νόμιμο' : 'Απάτη'}</span>`,
		`<div class="msg">${msg}</div>`,
		`<p class="big"><b>Γιατί:</b> ${why}</p>`
	), 'scam');
const lesson3 = [
	slide(1, 'Μάθημα 3 · Ασφάλεια &amp; Απάτες', 'Πώς να μην σας εξαπατήσουν',
		stack(
			rule('🛡️ Ο χρυσός κανόνας: Τράπεζα, ΑΑΔΕ, ΔΕΗ <b>ΠΟΤΕ</b> δεν ζητούν κωδικό, PIN ή OTP από μήνυμα ή τηλέφωνο.', true),
			grid(
				card('🎯', 'Γιατί αυτό το μάθημα', `<p class="big">Οι απατεώνες δεν «σπάνε» τον υπολογιστή — προσπαθούν να <b>ξεγελάσουν εσάς</b>. Αν ξέρετε τα σημάδια, δεν περνάνε.</p>`),
				card('💬', 'Λεξιλόγιο', etym([
					['Phishing:', 'από το «fishing» (ψάρεμα) — σας ρίχνουν «δόλωμα».'],
					['OTP:', 'One-Time Password = κωδικός <b>μιας χρήσης</b>.'],
					['Password:', 'λέξη-κλειδί / κωδικός.']
				]))
			)
		)
	),
	slide(2, 'Μάθημα 3 · Τα σημάδια', 'Τέσσερα κόκκινα σημάδια',
		grid(
			card('🚩', 'Πότε να υποψιαστώ', tips([
				'<b>Βιασύνη &amp; φόβος:</b> «μέσα σε 48 ώρες», «θα κοπεί σήμερα», «μπλοκάρεται ο λογαριασμός».',
				'<b>Σύνδεσμος</b> που ζητά κωδικούς ή μια «μικρή πληρωμή» (π.χ. 0,79€ για δέμα).',
				'<b>Παράξενη διεύθυνση:</b> π.χ. <i>aade-epistrofi.gr</i> αντί για <i>gov.gr</i>.',
				'<b>Πολύ καλό για να είναι αληθινό:</b> δώρα, λαχεία, «εγγυημένα κέρδη».'
			])),
			check([
				'Σας έχει έρθει ποτέ ύποπτο μήνυμα; Τι κάνατε;',
				'Πατάτε συνδέσμους από SMS/Viber;',
				'Ξέρετε τι είναι το OTP;'
			])
		)
	),
	slide(3, 'Μάθημα 3 · Παράδειγμα', 'SMS «ΔΕΗ» — λογαριασμός',
		grid(
			scamCard('bad', 'Μήνυμα που φοβίζει',
				'ΔΕΗ: Ο λογαριασμός σας είναι ληξιπρόθεσμος. Το ρεύμα θα διακοπεί σήμερα. Πληρώστε άμεσα: deh-pay.gr/ofeili',
				'Σας τρομάζει με «σήμερα» και σας στέλνει σε <b>παράξενη διεύθυνση</b> (deh-pay.gr). Η ΔΕΗ δεν κόβει ρεύμα με ένα SMS.'),
			stack(
				card('✅', 'Τι κάνω σωστά', `<p class="big">Δεν πατάω τον σύνδεσμο. Μπαίνω <b>μόνος μου</b> στην επίσημη εφαρμογή/σελίδα της ΔΕΗ ή τηλεφωνώ στο επίσημο νούμερο.</p>`),
				goalCard('Ο φόβος και η βιασύνη είναι το «δόλωμα». Σταματώ και σκέφτομαι.')
			)
		)
	),
	slide(4, 'Μάθημα 3 · Παράδειγμα', 'SMS «ΑΑΔΕ» — επιστροφή φόρου',
		grid(
			scamCard('bad', 'Δόλωμα με «δώρο»',
				'ΑΑΔΕ: Δικαιούστε επιστροφή φόρου 384€. Συμπληρώστε τα στοιχεία σας εδώ: aade-epistrofi.gr',
				'Σας τάζει χρήματα για να δώσετε <b>στοιχεία κάρτας/κωδικούς</b>. Η ΑΑΔΕ επικοινωνεί μόνο μέσα από το <b>gov.gr</b>.'),
			stack(
				card('✅', 'Τι κάνω σωστά', `<p class="big">Αμφιβάλλω; Μπαίνω <b>μόνος μου</b> γράφοντας <i>gov.gr</i> — <b>όχι</b> από τον σύνδεσμο του μηνύματος.</p>`),
				refs(stack(ref('Απάτες SMS:', '/modules/module10/scam-spotter-sms')))
			)
		)
	),
	slide(5, 'Μάθημα 3 · Παράδειγμα', '«Γεια μαμά, άλλαξα νούμερο»',
		grid(
			scamCard('bad', 'Απάτη «παιδιού» (Viber/SMS)',
				'Γεια μαμά/μπαμπά, έσπασε το κινητό μου, αυτό είναι το νέο μου νούμερο. Μπορείς να πληρώσεις έναν λογαριασμό για μένα; 🙏',
				'Από <b>άγνωστο αριθμό</b>, ζητά <b>χρήματα</b> και αποφεύγει την κλήση. Ακόμη κι αν φαίνεται γνωστή επαφή, μπορεί να έχει παραβιαστεί.'),
			stack(
				card('📞', 'Ο κανόνας', `<p class="big">Τηλεφωνήστε <b>πρώτα</b> στον <b>πραγματικό</b>, παλιό αριθμό του παιδιού σας και επιβεβαιώστε. Μία κλήση λύνει την απορία.</p>`),
				check(['Θα ξέρατε να τηλεφωνήσετε για επιβεβαίωση;', 'Έχετε λάβει τέτοιο μήνυμα;'])
			)
		)
	),
	slide(6, 'Μάθημα 3 · Παράδειγμα', '«Κερδίσατε!» — πολύ καλό για να ισχύει',
		grid(
			scamCard('bad', 'Λαχειοφόρος / δωροεπιταγή',
				'Συγχαρητήρια! Κερδίσατε δωροεπιταγή 500€. Για παραλαβή, πληρώστε 2€ μεταφορικά με την κάρτα σας εδώ ➜',
				'Αν πρέπει να <b>πληρώσετε για να «κερδίσετε»</b>, είναι απάτη. Κανένα νόμιμο δώρο δεν ζητά τα στοιχεία της κάρτας σας.'),
			stack(
				card('🧠', 'Η σκέψη-κλειδί', `<p class="big">«Αν ακούγεται πολύ καλό για να είναι αληθινό, <b>είναι απάτη</b>.» Δεν δίνω ποτέ στοιχεία κάρτας για να «παραλάβω» δώρο.</p>`),
				refs(stack(ref('Απάτες Email:', '/modules/module10/scam-spotter-email')))
			)
		)
	),
	slide(7, 'Μάθημα 3 · Η σωστή συνήθεια', 'Μπαίνω πάντα μόνος μου',
		stack(
			rule('🔒 Πριν βάλω κωδικό, κοιτάω για το <b>λουκετάκι 🔒</b> και ότι η διεύθυνση αρχίζει με <b>https</b>.'),
			grid(
				card('✅', 'Η ασφαλής ρουτίνα', tips([
					'Δεν πατάω συνδέσμους από μηνύματα.',
					'Πληκτρολογώ <b>εγώ</b> τη διεύθυνση (π.χ. <i>gov.gr</i>) ή ανοίγω την <b>επίσημη εφαρμογή</b>.',
					'Ελέγχω το <b>λουκετάκι 🔒</b> στη γραμμή διεύθυνσης.',
					'Κανέναν κωδικό / OTP δεν τον λέω σε τηλέφωνο.'
				])),
				card('📖', 'Ετυμολογία', etym([
					['https / 🔒:', 'το «s» = secure (ασφαλής, κρυπτογραφημένη σύνδεση).'],
					['2FA:', 'διπλή επιβεβαίωση — κωδικός + ένα δεύτερο «κλειδί».']
				]))
			)
		)
	),
	slide(8, 'Μάθημα 3 · Κωδικοί', 'Δυνατοί κωδικοί &amp; διπλή προστασία',
		grid(
			card('🔑', 'Καλός κωδικός', tips([
				'<b>8+ χαρακτήρες</b>, με αριθμούς και σύμβολα (π.χ. <i>Kalimera!7</i>).',
				'<b>Διαφορετικός</b> για τράπεζα, email, gov.gr.',
				'Δεν τον γράφω σε αυτοκόλλητο στην οθόνη.',
				'<b>2FA (διπλή επιβεβαίωση):</b> ναι — δίνει επιπλέον ασφάλεια.'
			])),
			stack(
				goalCard('Ένας δυνατός κωδικός + προσοχή στα μηνύματα = ήσυχο κεφάλι.'),
				refs(stack(ref('e-Banking &amp; κωδικοί:', '/modules/module8')))
			)
		)
	),
	slide(9, 'Μάθημα 3 · Εξάσκηση', 'Παίζουμε «Απάτη ή Όχι;»',
		stack(
			rule('🎮 28 αληθοφανή σενάρια (email, SMS, Viber, τηλέφωνο). Μαθαίνουμε τα σημάδια παίζοντας.'),
			grid(
				card('🕵️', 'Πώς παίζεται', plainList([
					'Βλέπουμε ένα-ένα τα μηνύματα.',
					'Αποφασίζουμε: <b>απάτη</b> ή <b>νόμιμο;</b>',
					'Η εφαρμογή εξηγεί το «γιατί» σε κάθε περίπτωση.'
				])),
				check([
					'Θα ξεχωρίζατε ένα ψεύτικο SMS;',
					'Τι θα κάνατε αν δεν είστε σίγουροι;',
					'Σε ποιον θα ζητούσατε δεύτερη γνώμη;'
				])
			),
			refs(stack(
				ref('Εξάσκηση (δημόσιο, χωρίς σύνδεση):', '/apates'),
				ref('Βιβλιοθήκη — Κυβερνοασφάλεια:', '/library/esm005/esm005-c1-s2')
			))
		)
	),
	slide(10, 'Μάθημα 3 · Ανακεφαλαίωση', 'Τι κρατάμε από σήμερα',
		grid(
			card('✅', 'Οι 3 χρυσοί κανόνες', tips([
				'<b>Σταμάτα</b> τη βιασύνη — κανείς σοβαρός δεν πιέζει «τώρα».',
				'<b>Μην πατάς</b> συνδέσμους — μπες μόνος σου.',
				'<b>Ποτέ</b> κωδικό / OTP σε μήνυμα ή τηλέφωνο.'
			])),
			goalCard('Η καλύτερη προστασία είναι η ηρεμία: μια ανάσα πριν πατήσετε οτιδήποτε.')
		)
	)
];

/* =====================================================================
   ΜΑΘΗΜΑ 4 — Ψηφιακή καθημερινότητα
   ===================================================================== */
const L4 = '#6b3fa0';
const lesson4 = [
	slide(1, 'Μάθημα 4 · Ψηφιακή καθημερινότητα', 'gov.gr, Υπηρεσίες &amp; Βοήθεια (AI)',
		stack(
			rule('🔄 Όταν κάτι «κολλάει»: σβήστε &amp; ανοίξτε ξανά (restart) — λύνει τα μισά προβλήματα.'),
			grid(
				card('🏛️', 'Τι θα πετύχουμε', `<p class="big">Να βγάζουμε <b>μόνοι μας</b> απλές δουλειές online — ραντεβού, πιστοποιητικά — και να ξέρουμε <b>πού να ζητάμε βοήθεια</b> όταν κολλάμε.</p>`),
				card('🧭', 'Πώς θα πάμε', plainList([
					'Μπαίνουμε μαζί στο gov.gr.',
					'Ρυθμίζουμε Wi-Fi / εκτυπωτή / οθόνη.',
					'Ρωτάμε έναν βοηθό AI για βοήθεια.'
				]))
			)
		)
	),
	slide(2, 'Μάθημα 4 · gov.gr', 'Οι υπηρεσίες του κράτους online',
		grid(
			card('📋', 'Τι κάνω στο gov.gr', tips([
				'<b>Ραντεβού</b> (π.χ. ΚΕΠ, εμβόλια), <b>πιστοποιητικά</b>, <b>συνταγές</b>.',
				'<b>Υπεύθυνη δήλωση</b> &amp; <b>εξουσιοδότηση</b> χωρίς ουρές.',
				'Χρειάζομαι τους κωδικούς <b>Taxisnet</b>.',
				'Μπαίνω <b>πάντα</b> γράφοντας εγώ <i>gov.gr</i> (και ελέγχω το 🔒).'
			])),
			card('📖', 'Ετυμολογία', etym([
				['gov.gr:', 'government (κυβέρνηση) + .gr (Ελλάδα).'],
				['Taxisnet:', 'το σύστημα της εφορίας — οι «κωδικοί» σας.'],
				['Πιστοποιητικό:', 'επίσημο χαρτί που «πιστοποιεί» κάτι.']
			]))
		)
	),
	slide(3, 'Μάθημα 4 · Στην πράξη', 'Παράδειγμα: Υπεύθυνη Δήλωση',
		grid(
			card('📝', 'Βήμα-βήμα', steps([
				'Γράφω <b>gov.gr</b> στη γραμμή διεύθυνσης και <b>Enter</b>.',
				'Επιλέγω <b>«Υπεύθυνη Δήλωση»</b> από τη λίστα.',
				'Συνδέομαι με τους κωδικούς <b>Taxisnet</b>.',
				'Συμπληρώνω <b>Ονοματεπώνυμο</b> και <b>ΑΦΜ</b> (9 ψηφία).',
				'Πατάω <b>«Υποβολή»</b> — έρχεται με email/SMS.'
			])),
			stack(
				goalCard('Μία δουλειά που παλιά ήθελε ουρά στο ΚΕΠ, τώρα γίνεται από το σπίτι.'),
				refs(stack(ref('Κρατικές υπηρεσίες:', '/modules/module12')))
			)
		)
	),
	slide(4, 'Μάθημα 4 · Συσκευές', 'Wi-Fi, εκτυπωτής &amp; εφαρμογές',
		grid(
			card('⚙️', 'Καθημερινές ρυθμίσεις', tips([
				'<b>Σύνδεση Wi-Fi:</b> επιλέγω το δίκτυο του σπιτιού και βάζω τον κωδικό.',
				'<b>Εκτυπωτής:</b> Ρυθμίσεις → «Προσθήκη εκτυπωτή».',
				'<b>Νέα εφαρμογή:</b> εγκατάσταση από επίσημο κατάστημα· <b>απεγκατάσταση</b> ό,τι δεν θέλω.',
				'<b>Ενημερώσεις:</b> Ρυθμίσεις → Εφαρμογές → έλεγχος για updates.',
				'<b>Bluetooth:</b> για ακουστικά/ηχείο, από τις Ρυθμίσεις.'
			])),
			check([
				'Συνδέεστε μόνοι σας στο Wi-Fi;',
				'Έχετε τυπώσει ποτέ κάτι;',
				'Ξέρετε να σβήνετε μια εφαρμογή που δεν θέλετε;'
			])
		)
	),
	slide(5, 'Μάθημα 4 · Ρυθμίσεις', 'Φτιάχνω τη συσκευή στα μέτρα μου',
		grid(
			card('🔧', 'Άνεση &amp; προσβασιμότητα', tips([
				'<b>Οθόνη:</b> φωτεινότητα &amp; μέγεθος κειμένου.',
				'<b>Ήχος:</b> ένταση &amp; ειδοποιήσεις.',
				'<b>Προσβασιμότητα:</b> μεγαλύτερα γράμματα, υψηλή αντίθεση.'
			])),
			stack(
				card('🔄', 'Όταν κάτι κολλάει', steps([
					'Κάνω <b>restart</b> (σβήσιμο &amp; άνοιγμα).',
					'Ελέγχω τη <b>σύνδεση</b> στο διαδίκτυο.',
					'Δοκιμάζω <b>ξανά αργά</b>, βήμα-βήμα.'
				])),
				refs(stack(ref('Επίλυση προβλημάτων:', '/modules/module9')))
			)
		)
	),
	slide(6, 'Μάθημα 4 · Βοηθός AI', 'Ρωτάω σαν να μιλάω σε άνθρωπο',
		stack(
			rule('🤖 Ο βοηθός AI (π.χ. ChatGPT) απαντά σε απλές ερωτήσεις — του μιλάτε με <b>κανονικά λόγια</b>.'),
			grid(
				card('💬', 'Πώς τον χρησιμοποιώ', tips([
					'Γράφω την ερώτηση όπως θα τη ρωτούσα έναν φίλο.',
					'Π.χ. «<i>Πώς στέλνω φωτογραφία στο Viber;</i>» ή «<i>Πώς ανανεώνω το ΑΜΚΑ μου;</i>».',
					'Μπορώ να μιλήσω και με <b>φωνή</b> (εικονίδιο μικροφώνου).',
					'Δεν κατάλαβα; Του λέω «<i>πες το πιο απλά</i>».'
				])),
				card('📖', 'Ετυμολογία', etym([
					['Τεχνητή Νοημοσύνη (AI):', '«τεχνητή» = φτιαγμένη από άνθρωπο.'],
					['Λογισμικό (software):', 'τα προγράμματα — το «μαλακό» μέρος.'],
					['Ρομπότ:', 'από το τσέχικο «robota» = εργασία.']
				]))
			)
		)
	),
	slide(7, 'Μάθημα 4 · Όρια &amp; κρίση', 'Ο AI βοηθάει — αλλά τσεκάρω',
		grid(
			card('⚠️', 'Τι να προσέχω', tips([
				'<b>Μπορεί να κάνει λάθος</b> — διπλοτσεκάρω ό,τι σημαντικό (ποσά, ημερομηνίες, φάρμακα).',
				'<b>AI ή Google;</b> Ο AI εξηγεί &amp; συνοψίζει· το Google δίνει επίσημες σελίδες.',
				'Για επίσημα θέματα, επιβεβαιώνω στο <b>gov.gr</b> ή σε άνθρωπο.',
				'Δεν δίνω στον AI κωδικούς ή προσωπικά στοιχεία.'
			])),
			check([
				'Έχετε δοκιμάσει βοηθό AI;',
				'Για τι θα τον θέλατε;',
				'Θα θυμόσασταν να τσεκάρετε ό,τι σας πει;'
			])
		)
	),
	slide(8, 'Μάθημα 4 · Ανακεφαλαίωση', 'Τι κρατάμε — και πού ζητάμε βοήθεια',
		grid(
			card('✅', 'Τα πήραμε', tips([
				'Μπαίνω στο gov.gr με τους κωδικούς μου.',
				'Ρυθμίζω Wi-Fi, εκτυπωτή, οθόνη.',
				'Κάνω restart όταν κάτι κολλάει.',
				'Ρωτάω βοηθό AI — και τσεκάρω την απάντηση.'
			])),
			stack(
				card('🤝', 'Χωρίς ντροπή', `<p class="big">Ζητήστε βοήθεια ελεύθερα — <b>κάθε αρχάριος ξεκίνησε από εδώ</b>. Στο ΚΑΠΗ είμαστε εδώ για εσάς.</p>`),
				refs(stack(
					ref('Βοηθοί AI:', '/modules/module13'),
					ref('Επίλυση:', '/modules/module9'),
					ref('Βιβλιοθήκη — Χρήσιμοι τόποι:', '/library/esm002/esm002-c3-s3')
				))
			)
		)
	)
];

/* ---------------- launcher (index) ---------------- */
const LESSONS = [
	{ n: 1, file: 'mathima-1.html', accent: L1, kicker: 'Τα πρώτα βήματα', title: 'Ποντίκι, Πληκτρολόγιο &amp; Οθόνη', count: lesson1.length, emoji: '🖱️' },
	{ n: 2, file: 'mathima-2.html', accent: L2, kicker: 'Διαδίκτυο &amp; Επικοινωνία', title: 'Google, Email &amp; Βιντεοκλήση', count: lesson2.length, emoji: '🌍' },
	{ n: 3, file: 'mathima-3.html', accent: L3, kicker: 'Ασφάλεια &amp; Απάτες', title: 'Πώς να μην σας εξαπατήσουν', count: lesson3.length, emoji: '🛡️' },
	{ n: 4, file: 'mathima-4.html', accent: L4, kicker: 'Ψηφιακή καθημερινότητα', title: 'gov.gr, Υπηρεσίες &amp; AI', count: lesson4.length, emoji: '🏛️' }
];
function indexPage() {
	const cards = LESSONS.map((l) => `
    <a class="lcard" href="${l.file}" style="--accent:${l.accent}">
      <div class="num">${l.n}</div>
      <div class="emoji">${l.emoji}</div>
      <div class="kick">${l.kicker}</div>
      <div class="ttl">${l.title}</div>
      <div class="meta">${l.count} διαφάνειες →</div>
    </a>`).join('');
	const html = `<!DOCTYPE html>
<html lang="el">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Ψηφιακές Δεξιότητες — Μαθήματα ΚΑΠΗ</title>
<style>
${CSS}
body{overflow:auto;min-height:100vh}
.wrap{max-width:1100px;margin:0 auto;padding:clamp(24px,5vw,72px) clamp(18px,4vw,48px)}
.hero{text-align:center;margin-bottom:clamp(24px,4vw,48px)}
.hero h1{font-size:clamp(28px,4vw,52px);letter-spacing:-.5px;color:var(--ink)}
.hero p{font-size:clamp(16px,1.6vw,24px);color:var(--muted);margin-top:.5em}
.lgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:clamp(16px,2vw,28px)}
.lcard{display:block;text-decoration:none;color:var(--ink);background:#fff;border:1px solid var(--line);
  border-top:8px solid var(--accent);border-radius:var(--radius);padding:clamp(20px,2.4vw,32px);box-shadow:var(--shadow);
  transition:transform .15s,box-shadow .15s}
.lcard:hover{transform:translateY(-4px);box-shadow:0 18px 40px rgba(20,28,46,.18)}
.lcard .num{width:46px;height:46px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:24px;display:grid;place-items:center}
.lcard .emoji{font-size:clamp(34px,4vw,52px);margin:.3em 0 .1em}
.lcard .kick{color:var(--accent);font-weight:700;text-transform:uppercase;letter-spacing:1px;font-size:clamp(12px,1.1vw,15px)}
.lcard .ttl{font-size:clamp(19px,1.8vw,26px);font-weight:700;margin:.15em 0 .5em;line-height:1.2}
.lcard .meta{color:var(--muted);font-weight:700;font-size:clamp(14px,1.2vw,17px)}
.foot{margin-top:clamp(28px,4vw,52px);text-align:center;color:var(--muted);font-size:clamp(13px,1.2vw,17px)}
.foot a{color:var(--accent);font-weight:700}
</style>
</head>
<body>
<div class="wrap">
  <div class="hero">
    <h1>Ψηφιακές Δεξιότητες</h1>
    <p>Τέσσερα μαθήματα για το ΚΑΠΗ — με την ησυχία μας, βήμα-βήμα.</p>
  </div>
  <div class="lgrid">${cards}</div>
  <div class="foot">
    Συμβουλή: πατήστε ένα μάθημα και κινηθείτε με τα βελάκια <b>← →</b>. Για εκτύπωση: <b>Ctrl+P</b>.<br/>
    Σύνοψη «4 σε 1»: <a href="../slides-kapi.html">slides-kapi.html</a>
  </div>
</div>
</body>
</html>`;
	writeFileSync(join(OUT, 'index.html'), html, 'utf8');
	console.log('✔ index.html — launcher με', LESSONS.length, 'μαθήματα');
}

/* ---------------- build all ---------------- */
deck({ file: 'mathima-1.html', title: 'Μάθημα 1 — Ποντίκι, Πληκτρολόγιο & Οθόνη', accent: L1, slidesHtml: lesson1 });
deck({ file: 'mathima-2.html', title: 'Μάθημα 2 — Διαδίκτυο, Email & Βιντεοκλήση', accent: L2, slidesHtml: lesson2 });
deck({ file: 'mathima-3.html', title: 'Μάθημα 3 — Ασφάλεια & Απάτες', accent: L3, slidesHtml: lesson3 });
deck({ file: 'mathima-4.html', title: 'Μάθημα 4 — gov.gr, Υπηρεσίες & AI', accent: L4, slidesHtml: lesson4 });
indexPage();
console.log('\\n✅ Έτοιμα στο static/kapi/  (offline-ready, file://)');
