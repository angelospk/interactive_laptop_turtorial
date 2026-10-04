import { expect, test, type Page } from '@playwright/test';

// The learners this is built for do not scroll to look for the button that
// starts the lesson — they conclude the lesson is broken. On a 1280x800 laptop
// the page spent 213px on chrome above the lesson and another 227px on the
// lesson's own header, leaving 464px for the lesson itself and a page that
// scrolled. A lesson has to fit.

async function login(page: Page, username: string) {
	await page.goto('/login');
	await page.fill('#username', username);
	await page.getByRole('button', { name: /Σύνδεση \/ Δημιουργία/ }).click();
	await expect(page).toHaveURL('/');

	const picker = page.getByRole('dialog').filter({ hasText: 'Τι θέλεις να μάθεις' });
	if (await picker.isVisible().catch(() => false)) {
		await picker.getByRole('button', { name: /Υπολογιστής Windows/ }).click();
		await expect(picker).toBeHidden();
	}
}

async function openLesson(page: Page, moduleId: string, key: string) {
	await page.goto(`/modules/${moduleId}/${key}`);
	await page.waitForFunction(() => {
		const btn = Array.from(document.querySelectorAll('button')).find(
			(b) => b.textContent?.trim() === 'Επόμενο'
		);
		return !!(btn && '__click' in btn);
	});
	// The lesson body itself is a lazy import; measuring before it lands makes an
	// overflowing page look like it fits.
	await page.locator('.lesson-content').waitFor();
	await page.waitForLoadState('networkidle');
}

const fitsWithoutScrolling = (page: Page) =>
	page.evaluate(() => {
		const doc = document.documentElement;
		return doc.scrollHeight <= doc.clientHeight + 2;
	});

test.describe('a lesson fits the screen', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	test('an interactive lesson needs no page scrolling on a laptop screen', async ({ page }) => {
		await login(page, `fit_${Date.now()}_a`);
		await openLesson(page, 'module1', 'hover-balloons');

		expect(await fitsWithoutScrolling(page)).toBe(true);
	});

	test('the whole lesson body is visible without scrolling', async ({ page }) => {
		await login(page, `fit_${Date.now()}_b`);
		await openLesson(page, 'module1', 'hover-balloons');

		// There is no "start the lesson" button any more — the exercise is live —
		// so what has to be fully on screen is the play area itself.
		await expect(page.locator('.lesson-content')).toBeInViewport({ ratio: 1 });
	});

	test('a simulation lesson gives its screen most of the height', async ({ page }) => {
		await login(page, `fit_${Date.now()}_c`);
		await openLesson(page, 'mac', 'open-dock');

		expect(await fitsWithoutScrolling(page)).toBe(true);

		// The simulated screen is sized by its container, so the Dock at its bottom
		// edge must be on screen — a fixed 600px frame used to be cut off.
		const sim = page.locator('.lesson-content');
		const simScrolls = await sim.evaluate((el) => el.scrollHeight > el.clientHeight + 2);
		expect(simScrolls).toBe(false);
		await expect(page.getByRole('button', { name: /Safari/ }).first()).toBeInViewport({ ratio: 1 });
	});
});

test.describe('a lesson fits a narrow screen', () => {
	test.use({ viewport: { width: 390, height: 780 } });

	test('the lesson controls stay reachable on a phone-sized window', async ({ page }) => {
		await login(page, `fit_${Date.now()}_d`);
		await openLesson(page, 'module1', 'hover-balloons');

		// Nothing may overflow sideways — horizontal scrolling loses elderly users.
		const overflowsSideways = await page.evaluate(
			() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
		);
		expect(overflowsSideways).toBe(false);
	});
});

test.describe('keyboard users can see where they are', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	test('every lesson control shows a focus ring and meets the 48px target', async ({ page }) => {
		await login(page, `kbd_${Date.now()}`);
		await openLesson(page, 'module1', 'hover-balloons');

		for (const name of ['Προηγούμενο', 'Επόμενο']) {
			const button = page.getByRole('button', { name, exact: true });
			await button.focus();

			const box = await button.boundingBox();
			expect(box!.height).toBeGreaterThanOrEqual(48);

			// The shared button carries `transition-all`, so the outline animates from
			// 0 and reading it immediately reports the start of the transition.
			await page.waitForTimeout(400);

			// The shadcn ring resolves to a fully transparent box-shadow here, so the
			// lesson controls carry an explicit outline instead of relying on it.
			const outline = await button.evaluate((el) => {
				const st = getComputedStyle(el);
				return { style: st.outlineStyle, width: parseFloat(st.outlineWidth) };
			});
			expect(outline.style, `${name} must show a visible focus outline`).not.toBe('none');
			expect(outline.width).toBeGreaterThanOrEqual(2);
		}
	});
});

// The simulation is the lesson: on a 1280x720 laptop it used to get a 600px box
// inside ~240px of chrome and a purple margin. Now a slim strip is all that
// stays above it once the learner starts.
test.describe('the simulation takes the screen', () => {
	test.use({ viewport: { width: 1280, height: 720 } });

	test('a Windows lesson fills the screen once the learner starts', async ({ page }) => {
		await login(page, `full_${Date.now()}_a`);
		await openLesson(page, 'module6', 'open-email');
		await page.locator('[data-desktop]').click({ position: { x: 300, y: 300 } });
		await expect(page.getByRole('button', { name: /Μενού μαθήματος/ })).toBeVisible();

		const desktop = (await page.locator('[data-desktop]').boundingBox())!;
		expect(desktop.height).toBeGreaterThanOrEqual(720 * 0.85);
		await expect(page.locator('[data-taskbar]')).toBeInViewport({ ratio: 1 });
		expect(await fitsWithoutScrolling(page)).toBe(true);
	});

	test('the download button is above the taskbar, not behind it', async ({ page }) => {
		await login(page, `full_${Date.now()}_b`);
		await openLesson(page, 'module5', 'download-file');
		const button = (await page.getByRole('button', { name: 'Λήψη' }).boundingBox())!;
		const taskbar = (await page.locator('[data-taskbar]').boundingBox())!;
		expect(button.y + button.height).toBeLessThanOrEqual(taskbar.y);
	});

	test('moving the mouse to the top brings the bar back', async ({ page }) => {
		await login(page, `full_${Date.now()}_c`);
		await openLesson(page, 'module6', 'open-email');
		await page.locator('[data-desktop]').click({ position: { x: 300, y: 300 } });
		const next = page.getByRole('button', { name: 'Επόμενο', exact: true });
		await expect(next).toBeHidden();
		await page.mouse.move(640, 300);
		await page.mouse.move(640, 2);
		await expect(next).toBeVisible();
	});
});

test.describe('the lesson bar on a phone', () => {
	test.use({ viewport: { width: 390, height: 780 }, hasTouch: true, isMobile: true });

	test('the Menu button opens the bar with a tap', async ({ page }) => {
		await login(page, `full_${Date.now()}_d`);
		await openLesson(page, 'module1', 'hover-balloons');
		await page.locator('.lesson-card').tap({ position: { x: 10, y: 10 } });
		const menu = page.getByRole('button', { name: /Μενού μαθήματος/ });
		await expect(menu).toBeVisible();
		await menu.tap();
		await expect(page.getByRole('button', { name: 'Επόμενο', exact: true })).toBeVisible();
	});
});
