import { describe, it, expect } from 'vitest';
import { allLessons } from './index';
import theoryManifest from '../../../../content/manifest.json';
import type { Manifest } from '$lib/content/manifest';

/**
 * Lessons that mirror a concrete scenario from the theory (docs/theory-exercise-mapping.md).
 * Each block pins the scenario the lesson must practise and that the theory
 * subsection links to it, so the two cannot drift apart silently.
 */

const byId = new Map(allLessons.map((l) => [l.id, l]));
const config = (id: string) => (byId.get(id)?.config ?? {}) as Record<string, unknown>;

const subsections = (theoryManifest as Manifest).courses.flatMap((c) =>
	c.chapters.flatMap((ch) => ch.subsections)
);
const linksOf = (subId: string) =>
	(subsections.find((s) => s.id === subId)?.lessonLinks ?? []).map(
		(l) => `${l.module}/${l.lesson}`
	);

describe('P1 — gov.gr: κάρτα ανεργίας & θυρίδα πολίτη (esm002-c3-s3)', () => {
	it('finds the unemployment-card service among decoys', () => {
		const c = config('gov-find-unemployment-card');
		expect(c.goal).toBe('gov-find-service');
		expect(c.targetServiceId).toBe('unemployment-card');
		expect((c.services as unknown[]).length).toBeGreaterThanOrEqual(3);
	});

	it('downloads the unemployment card as a PDF', () => {
		const c = config('gov-download-unemployment-card');
		expect(c.goal).toBe('download-file');
		expect((c.certificate as { filename: string }).filename).toMatch(/\.pdf$/);
	});

	it('finds the citizen mailbox', () => {
		expect(config('gov-find-citizen-mailbox').targetServiceId).toBe('citizen-mailbox');
	});

	it('is linked from the public-services theory section', () => {
		expect(linksOf('esm002-c3-s3')).toEqual(
			expect.arrayContaining(['gov/gov-find-unemployment-card', 'gov/gov-find-citizen-mailbox'])
		);
	});
});

describe('P5 — κατεβάζω και εγκαθιστώ πρόγραμμα περιήγησης (esm001-c1-s2, esm002-c1-s3)', () => {
	it('first downloads the browser installer from the web', () => {
		const c = config('module9-lesson10');
		expect(c.goal).toBe('download-file');
		expect(c.initialApps).toEqual(['browser']);
		expect(c.targetFilename).toMatch(/setup\.exe$/i);
	});

	it('then installs that same browser', () => {
		const c = config('module9-lesson11');
		expect(c.goal).toBe('install-app');
		expect(c.appName).toBe('Google Chrome');
		expect(byId.get('module9-lesson11')?.requiredLessonId).toBe('module9-lesson10');
	});

	it('is linked from both theory sections', () => {
		for (const sub of ['esm001-c1-s2', 'esm002-c1-s3']) {
			expect(linksOf(sub)).toEqual(
				expect.arrayContaining(['module9/download-browser', 'module9/install-browser'])
			);
		}
	});
});

describe('P4 — μήνυμα στην ομάδα της οικογένειας στο Viber (eapsi001-c1-s5)', () => {
	it.each(['android', 'iphone'])('%s: sends to the family group, not to a single person', (mod) => {
		const c = config(`${mod}-viber-group`);
		expect(c.goal).toBe('mobile-send-chat');
		expect(c.targetAppId).toBe('viber');
		const conversations = c.conversations as { id: string; name: string }[];
		const target = conversations.find((t) => t.id === c.targetConversationId);
		expect(target?.name).toMatch(/Οικογένεια/);
		// The single family members are still there, so the learner must pick the group.
		expect(conversations.length).toBeGreaterThanOrEqual(3);
	});

	it('is linked from the Viber theory section', () => {
		expect(linksOf('eapsi001-c1-s5')).toEqual(
			expect.arrayContaining(['android/viber-group', 'iphone/viber-group'])
		);
	});
});

type QuizConfig = { questions: { text: string; options: { correct?: boolean }[] }[] };
const quizQuestions = (id: string) => (config(id) as unknown as QuizConfig).questions ?? [];

describe('P2 — καλή συμπεριφορά στο διαδίκτυο (eapsi001-c4-s3)', () => {
	it('is a multi-question quiz with exactly one right answer per question', () => {
		expect(byId.get('module8-lesson12')?.lessonType).toBe('quiz');
		const qs = quizQuestions('module8-lesson12');
		expect(qs.length).toBeGreaterThanOrEqual(3);
		for (const q of qs) expect(q.options.filter((o) => o.correct)).toHaveLength(1);
	});

	it('is linked from the netiquette theory section', () => {
		expect(linksOf('eapsi001-c4-s3')).toContain('module8/netiquette');
	});
});

describe('P3 — «μπήκε κάποιος στον λογαριασμό μου» (esm005-c1-s4)', () => {
	it('walks sign → first move → who to tell, one right answer each', () => {
		expect(byId.get('module8-lesson13')?.lessonType).toBe('quiz');
		const qs = quizQuestions('module8-lesson13');
		expect(qs).toHaveLength(3);
		for (const q of qs) expect(q.options.filter((o) => o.correct)).toHaveLength(1);
	});

	it('is linked from the breach-response theory section', () => {
		expect(linksOf('esm005-c1-s4')).toContain('module8/breach-response');
	});
});

describe('P13 — το κινητό δεν φορτίζει (esm006-c1-s3)', () => {
	it('orders the checks: charger/cable → port → when to ask a technician', () => {
		expect(byId.get('module9-lesson12')?.lessonType).toBe('quiz');
		const qs = quizQuestions('module9-lesson12');
		expect(qs).toHaveLength(3);
		for (const q of qs) expect(q.options.filter((o) => o.correct)).toHaveLength(1);
	});

	it('is linked from the phone-problems theory section', () => {
		expect(linksOf('esm006-c1-s3')).toContain('module9/phone-not-charging');
	});
});

describe('P6 — γράφω νέο email (eapsi001-c1-s3)', () => {
	it('asks for a new email to a named recipient', () => {
		const c = config('module6-lesson7');
		expect(c.goal).toBe('send-email');
		expect(c.targetRecipient).toMatch(/@/);
		expect(String(c.instructions)).toContain(String(c.targetRecipient));
	});

	it('is linked from the email theory section', () => {
		expect(linksOf('eapsi001-c1-s3')).toContain('module6/compose-email');
	});
});

describe('P8 — αναζήτηση συγκεκριμένης πληροφορίας (esm002-c2-s2)', () => {
	it('runs on the goal-checked desktop browser with concrete terms', () => {
		const lesson = byId.get('module5-lesson11');
		expect(lesson?.lessonType).toBe('desktop-simulation');
		const c = config('module5-lesson11');
		expect(c.goal).toBe('search-query');
		expect(c.initialApps).toEqual(['browser']);
		expect((c.targetQueryTerms as string[]).length).toBeGreaterThanOrEqual(2);
	});

	it('is linked from the search-engines theory section', () => {
		expect(linksOf('esm002-c2-s2')).toContain('module5/search-specific');
	});
});

describe('P9 — μεγαλύτερο κείμενο στα Windows (esm001-c1-s4)', () => {
	it('asks to switch on larger text from the accessibility settings', () => {
		const c = config('module9-lesson13');
		expect(c.goal).toBe('toggle-accessibility');
		expect(c.targetSetting).toBe('larger-text');
		expect(c.initialApps).toEqual(['settings']);
	});

	it('is linked from the desktop accessibility theory section', () => {
		expect(linksOf('esm001-c1-s4')).toContain('module9/larger-text');
	});
});

describe('P7 — μπαίνω σε σύσκεψη από την πρόσκληση (eapsi001-c3-s3..s5)', () => {
	it('opens the inbox with the invitation and the meeting app', () => {
		const c = config('module11-lesson7');
		expect(c.goal).toBe('join-meeting');
		expect(c.initialApps).toEqual(['meeting', 'email']);
		const emails = c.emails as { body: string }[];
		expect(emails.some((e) => e.body.includes(String(c.meetingCode)))).toBe(true);
	});

	it.each(['eapsi001-c3-s3', 'eapsi001-c3-s4', 'eapsi001-c3-s5'])('is linked from %s', (sub) => {
		expect(linksOf(sub)).toContain('module11/join-meeting');
	});
});

describe('P10 — εγκατάσταση εφαρμογής από το κατάστημα (esm001-c2-s5)', () => {
	it.each(['android', 'iphone'])('%s: installs the official app among look-alikes', (mod) => {
		const c = config(`${mod}-install-app`);
		expect(c.goal).toBe('mobile-install-app');
		const items = c.storeItems as { id: string; installed?: boolean }[];
		expect(items.find((i) => i.id === c.targetInstallId)?.installed).toBe(false);
		expect(items.filter((i) => i.installed === false).length).toBeGreaterThanOrEqual(2);
	});

	it('is linked from the app-management theory section', () => {
		expect(linksOf('esm001-c2-s5')).toEqual(
			expect.arrayContaining(['android/install-app', 'iphone/install-app'])
		);
	});
});

describe('P11 — κλείνω πρόγραμμα που κόλλησε (esm006-c1-s5)', () => {
	it('lists a not-responding program among running ones', () => {
		const c = config('module9-lesson14');
		expect(c.goal).toBe('end-task');
		const apps = c.taskManagerApps as { id: string; status: string }[];
		expect(apps.find((a) => a.id === c.targetTaskId)?.status).toBe('Δεν αποκρίνεται');
		expect(apps.length).toBeGreaterThanOrEqual(3);
	});

	it('is linked from the troubleshooting-tools theory section', () => {
		expect(linksOf('esm006-c1-s5')).toContain('module9/end-task');
	});
});

describe('P12 — γρήγορες ρυθμίσεις: ανάβω τον φακό (esm001-c2-s6)', () => {
	it.each(['android', 'iphone'])('%s: turns the torch on from the pull-down panel', (mod) => {
		const c = config(`${mod}-quick-torch`);
		expect(c.goal).toBe('mobile-quick-toggle');
		expect(c.targetTile).toBe('torch');
	});

	it('is linked from the quick-settings theory section', () => {
		expect(linksOf('esm001-c2-s6')).toEqual(
			expect.arrayContaining(['android/quick-torch', 'iphone/quick-torch'])
		);
	});
});
