import { expect, test, type Page } from '@playwright/test';

// The lesson runner used to disagree with the address bar: `replaceState` keeps
// the URL current but leaves `params.lesson` behind, so every `invalidateAll()`
// re-served the lesson the learner had arrived on. Finishing a lesson teleported
// them backwards and the auto-advance countdown then fired from the wrong place.
// These walk the transitions a learner actually performs.

async function login(page: Page, username: string) {
	await page.goto('/login');
	await page.fill('#username', username);
	await page.getByRole('button', { name: /Σύνδεση \/ Δημιουργία/ }).click();
	await expect(page).toHaveURL('/');

	// First-run device picker; it blocks the page until answered.
	const picker = page.getByRole('dialog').filter({ hasText: 'Τι θέλεις να μάθεις' });
	if (await picker.isVisible().catch(() => false)) {
		await picker.getByRole('button', { name: /Υπολογιστής Windows/ }).click();
		await expect(picker).toBeHidden();
	}
}

const lessonKey = (page: Page) => new URL(page.url()).pathname.split('/').pop();

/**
 * Open a lesson and wait until it is actually interactive. The markup is
 * server-rendered, so Playwright will happily click a button that Svelte has not
 * wired up yet and the click is simply lost. `__click` is the delegated handler
 * Svelte attaches during hydration.
 */
async function openLesson(page: Page, moduleId: string, key: string) {
	await page.goto(`/modules/${moduleId}/${key}`);
	await page.waitForFunction(() => {
		const btn = Array.from(document.querySelectorAll('button')).find(
			(b) => b.textContent?.trim() === 'Επόμενο'
		);
		return !!(btn && '__click' in btn);
	});
}

/** The lesson counter is the runner's own idea of where it is. */
async function counter(page: Page) {
	const text = await page
		.getByText(/Μάθημα \d+ από \d+/)
		.first()
		.textContent();
	return text?.match(/Μάθημα (\d+) από (\d+)/)?.[1];
}

const MODULE = 'module1';
const FIRST = 'read-esm001-c1-s3';
const SECOND = 'hover-balloons';
const THIRD = 'click-mole';

// Five reading lessons in a row: the only module where a learner can walk
// forward and then *complete* a lesson without playing a mini-game.
const READING_MODULE = 'module11';
const READING_LESSONS = [
	'read-eapsi001-c1-s4',
	'read-eapsi001-c1-s5',
	'read-eapsi001-c3-s3',
	'read-eapsi001-c3-s4'
];

test.describe('lesson transitions stay in sync with the URL', () => {
	test('deep link then refresh keeps the same lesson', async ({ page }) => {
		await login(page, `nav_${Date.now()}_a`);
		await openLesson(page, MODULE, SECOND);
		expect(await counter(page)).toBe('2');

		await page.reload();
		expect(lessonKey(page)).toBe(SECOND);
		expect(await counter(page)).toBe('2');
	});

	test('Next moves exactly one lesson and the URL follows', async ({ page }) => {
		await login(page, `nav_${Date.now()}_b`);
		await openLesson(page, MODULE, FIRST);
		expect(await counter(page)).toBe('1');

		await page.getByRole('button', { name: 'Επόμενο', exact: true }).click();
		await expect(page).toHaveURL(`/modules/${MODULE}/${SECOND}`);
		expect(await counter(page)).toBe('2');
	});

	test('Previous moves exactly one lesson back and the URL follows', async ({ page }) => {
		await login(page, `nav_${Date.now()}_c`);
		await openLesson(page, MODULE, THIRD);
		expect(await counter(page)).toBe('3');

		await page.getByRole('button', { name: 'Προηγούμενο', exact: true }).click();
		await expect(page).toHaveURL(`/modules/${MODULE}/${SECOND}`);
		expect(await counter(page)).toBe('2');
	});

	test('three quick Next clicks advance exactly three lessons', async ({ page }) => {
		await login(page, `nav_${Date.now()}_d`);
		await openLesson(page, MODULE, FIRST);

		const next = page.getByRole('button', { name: 'Επόμενο', exact: true });
		await next.click();
		await next.click();
		await next.click();

		await expect(page).toHaveURL(`/modules/${MODULE}/double-click-chests`);
		expect(await counter(page)).toBe('4');
	});

	test('refreshing after Next lands on the lesson that was on screen', async ({ page }) => {
		await login(page, `nav_${Date.now()}_e`);
		await openLesson(page, MODULE, FIRST);
		await page.getByRole('button', { name: 'Επόμενο', exact: true }).click();
		await page.getByRole('button', { name: 'Επόμενο', exact: true }).click();
		expect(await counter(page)).toBe('3');

		await page.reload();
		expect(lessonKey(page)).toBe(THIRD);
		expect(await counter(page)).toBe('3');
	});
});

test.describe('completing a lesson advances once, forwards', () => {
	// A reading lesson completes with one button, so the completion path can be
	// exercised without playing a mini-game.
	test('completion keeps the learner in place until the countdown advances once', async ({
		page
	}) => {
		await login(page, `nav_${Date.now()}_f`);
		await openLesson(page, MODULE, FIRST);

		await page.getByRole('button', { name: /Το διάβασα/ }).click();

		// The result overlay belongs to the lesson just finished — no teleport.
		await expect(page.getByRole('heading', { name: /Μπράβο|ολοκληρώθηκε/ })).toBeVisible();
		await expect(page.getByText(/Επόμενο σε \d+ δευτερόλεπτα|Αυτόματη μετάβαση/)).toBeVisible();
		expect(lessonKey(page)).toBe(FIRST);

		// …and when it fires, it moves exactly one lesson forward.
		await expect(page).toHaveURL(`/modules/${MODULE}/${SECOND}`, { timeout: 15000 });
		expect(await counter(page)).toBe('2');
	});

	test('pressing "Επόμενο Μάθημα" during the countdown advances exactly once', async ({ page }) => {
		await login(page, `nav_${Date.now()}_g`);
		await openLesson(page, MODULE, FIRST);

		await page.getByRole('button', { name: /Το διάβασα/ }).click();
		await page.getByRole('button', { name: /Επόμενο Μάθημα/ }).click();

		await expect(page).toHaveURL(`/modules/${MODULE}/${SECOND}`);
		expect(await counter(page)).toBe('2');

		// The cancelled countdown must not fire a second transition afterwards.
		await page.waitForTimeout(7000);
		expect(lessonKey(page)).toBe(SECOND);
		expect(await counter(page)).toBe('2');
	});

	// The reported failure, end to end: walk forward first, *then* finish a
	// lesson. The forward walk is `replaceState`, so `params.lesson` still points
	// at the lesson the learner arrived on, and the `invalidateAll()` that saving
	// progress triggers used to re-serve that one — the learner finished lesson 3
	// and landed on lesson 1, with the countdown then carrying them to lesson 2.
	test('finishing a lesson reached with Next does not teleport the learner backwards', async ({
		page
	}) => {
		await login(page, `nav_${Date.now()}_i`);
		await openLesson(page, READING_MODULE, READING_LESSONS[0]);

		const next = page.getByRole('button', { name: 'Επόμενο', exact: true });
		await next.click();
		await next.click();
		await expect(page).toHaveURL(`/modules/${READING_MODULE}/${READING_LESSONS[2]}`);
		expect(await counter(page)).toBe('3');

		await page.getByRole('button', { name: /Το διάβασα/ }).click();

		// Still on lesson 3 while the countdown runs…
		await expect(page.getByText(/Επόμενο σε \d+ δευτερόλεπτα|Αυτόματη μετάβαση/)).toBeVisible();
		expect(await counter(page)).toBe('3');
		expect(lessonKey(page)).toBe(READING_LESSONS[2]);

		// …and it advances to lesson 4, not back to the start of the module.
		await expect(page).toHaveURL(`/modules/${READING_MODULE}/${READING_LESSONS[3]}`, {
			timeout: 15000
		});
		expect(await counter(page)).toBe('4');
	});

	test('walking into an already finished lesson does not cover it with the result overlay', async ({
		page
	}) => {
		await login(page, `nav_${Date.now()}_h`);
		await openLesson(page, MODULE, FIRST);
		await page.getByRole('button', { name: /Το διάβασα/ }).click();
		await expect(page).toHaveURL(`/modules/${MODULE}/${SECOND}`, { timeout: 15000 });

		await page.getByRole('button', { name: 'Προηγούμενο', exact: true }).click();
		await expect(page).toHaveURL(`/modules/${MODULE}/${FIRST}`);
		await expect(page.getByRole('button', { name: /Δοκίμασε ξανά/ })).toHaveCount(0);
	});
});
