import { expect, test, type Page } from '@playwright/test';

// Onboarding asks which device the learner wants to learn. The keyboard lessons
// ignored the answer: a learner who chose Mac was still told to press "Ctrl + C"
// — a key their keyboard does not have — and the exercise refused ⌘C.

async function loginWithDevice(page: Page, username: string, device: RegExp) {
	await page.goto('/login');
	await page.fill('#username', username);
	await page.getByRole('button', { name: /Σύνδεση \/ Δημιουργία/ }).click();
	await expect(page).toHaveURL('/');

	const picker = page.getByRole('dialog').filter({ hasText: 'Τι θέλεις να μάθεις' });
	await picker.getByRole('button', { name: device }).click();
	await expect(picker).toBeHidden();
}

test.describe('onboarding helps a learner who does not know their device', () => {
	test('the picker can explain how to recognise each device', async ({ page }) => {
		await page.goto('/login');
		await page.fill('#username', `help_${Date.now()}`);
		await page.getByRole('button', { name: /Σύνδεση \/ Δημιουργία/ }).click();
		await expect(page).toHaveURL('/');

		const picker = page.getByRole('dialog').filter({ hasText: 'Τι θέλεις να μάθεις' });
		const help = picker.getByRole('button', { name: /Δεν ξέρω τι συσκευή έχω/ });
		await expect(help).toBeVisible();
		await expect(help).toHaveAttribute('aria-expanded', 'false');

		await help.click();
		await expect(help).toHaveAttribute('aria-expanded', 'true');
		// Concrete, recognisable clues — not a user-agent guess.
		const clues = picker.getByRole('listitem');
		await expect(clues).toHaveCount(4);
		await expect(clues.filter({ hasText: 'μήλο' }).first()).toBeVisible();
		await expect(clues.filter({ hasText: 'λογότυπο των Windows' })).toBeVisible();

		// The picker still works after asking for help.
		await picker.getByRole('button', { name: /Υπολογιστής Windows/ }).click();
		await expect(picker).toBeHidden();
	});
});

test.describe('keyboard shortcuts follow the chosen device', () => {
	test('a Mac learner is taught the Command key', async ({ page }) => {
		await loginWithDevice(page, `sc_${Date.now()}_mac`, /Υπολογιστής Mac/);
		await page.goto('/modules/module2/shortcuts');

		await expect(page.getByText('⌘ + C').first()).toBeVisible();
		await expect(page.getByText('Ctrl + C')).toHaveCount(0);
	});

	test('a Mac learner is taught the real Mac redo, not ⌘ + Y', async ({ page }) => {
		await loginWithDevice(page, `sc_${Date.now()}_redo`, /Υπολογιστής Mac/);
		await page.goto('/modules/module2/shortcuts');

		await expect(page.getByText('⌘ + Shift + Z').first()).toBeVisible();
		await expect(page.getByText('⌘ + Y')).toHaveCount(0);
	});

	test('a Mac learner switches keyboard language with Control + Space', async ({ page }) => {
		await loginWithDevice(page, `sc_${Date.now()}_lang`, /Υπολογιστής Mac/);
		await page.goto('/modules/module2/language-switch');

		await expect(page.getByText('⌃ (Control) + Space').first()).toBeVisible();
		await expect(page.getByText('Alt + Shift')).toHaveCount(0);
	});

	test('a Windows learner is taught Ctrl', async ({ page }) => {
		await loginWithDevice(page, `sc_${Date.now()}_win`, /Υπολογιστής Windows/);
		await page.goto('/modules/module2/shortcuts');

		await expect(page.getByText('Ctrl + C').first()).toBeVisible();
		await expect(page.getByText('⌘ + C')).toHaveCount(0);
	});

	test('the copy/paste drill follows the same device', async ({ page }) => {
		await loginWithDevice(page, `sc_${Date.now()}_cp`, /Υπολογιστής Mac/);
		await page.goto('/modules/module2/copy-paste-basic');

		await expect(page.getByText('⌘+C')).toBeVisible();
	});
});

// The browser lessons said "Ctrl+" and ignored the keyboard, so a Mac learner
// pressing ⌘+ zoomed the real browser and the lesson never noticed.
test.describe('browser lessons follow the chosen keyboard', () => {
	const done = (page: Page) => page.getByRole('heading', { name: /Μπράβο|ολοκληρώθηκε/ });

	test('a Mac learner is told ⌘ and zooms with ⌘ +', async ({ page }) => {
		await loginWithDevice(page, `sc_${Date.now()}_zoom`, /Υπολογιστής Mac/);
		await page.goto('/modules/module5/zoom-page');
		await expect(
			page.getByText(/κρατήστε πατημένο το ⌘ και πατήστε το \+ για μεγέθυνση/)
		).toBeVisible();
		await expect(page.getByText(/Ctrl/)).toHaveCount(0);
		const zoomBefore = await page.evaluate(() => window.devicePixelRatio);
		await page.keyboard.press('Meta+Equal');
		await expect(done(page)).toBeVisible();
		expect(await page.evaluate(() => window.devicePixelRatio)).toBe(zoomBefore);
	});

	test('the zoom buttons are big enough to hit', async ({ page }) => {
		await loginWithDevice(page, `sc_${Date.now()}_zbtn`, /Υπολογιστής Windows/);
		await page.goto('/modules/module5/zoom-page');
		for (const name of ['Μεγέθυνση', 'Σμίκρυνση']) {
			const box = await page.getByRole('button', { name, exact: true }).boundingBox();
			expect(box?.width).toBeGreaterThanOrEqual(44);
			expect(box?.height).toBeGreaterThanOrEqual(44);
		}
	});

	test('a Windows learner opens the find field with Ctrl + F', async ({ page }) => {
		await loginWithDevice(page, `sc_${Date.now()}_find`, /Υπολογιστής Windows/);
		await page.goto('/modules/module5/find-on-page');
		await expect(page.getByText(/πατήστε Ctrl \+ F/)).toBeVisible();
		await page.locator('body').click({ position: { x: 5, y: 5 } });
		await page.keyboard.press('Control+f');
		const field = page.getByPlaceholder('Αναζήτηση στη σελίδα...');
		await expect(field).toBeFocused();
		await page.keyboard.type('καιρός');
		await page.keyboard.press('Enter');
		await expect(done(page)).toBeVisible();
	});
});
