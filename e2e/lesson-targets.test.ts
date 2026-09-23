import { expect, test, type Page } from '@playwright/test';

// A lesson that asks an older learner to click something must make that thing
// easy to hit. The simulated browser, word processor and Mac menu bar copied
// real-world sizes — a 16px tab close, a 24px star, 28px Bold/Italic buttons —
// and those were exactly the controls the lessons asked for. 44px is the
// WCAG 2.5.5 target size.
const MIN = 44;

async function login(page: Page) {
	await page.goto('/login');
	await page.fill('#username', `tgt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
	await page.getByRole('button', { name: /Σύνδεση \/ Δημιουργία/ }).click();
	await expect(page).toHaveURL('/');
	const picker = page.getByRole('dialog').filter({ hasText: 'Τι θέλεις να μάθεις' });
	await picker.getByRole('button', { name: /Υπολογιστής Windows/ }).click();
	await expect(picker).toBeHidden();
}

const targets: [lesson: string, control: string][] = [
	['module5/new-tab', 'Νέα καρτέλα'],
	['module5/close-tab', 'Κλείσιμο καρτέλας'],
	['module5/bookmarks', 'Προσθήκη στα Αγαπημένα'],
	['word/bold-title', 'Έντονα (Bold)'],
	['word/italic-date', 'Πλάγια (Italic)'],
	['word/underline-name', 'Υπογράμμιση (Underline)'],
	['word/center-title', 'Κέντρο'],
	['word/font-size', 'Μέγεθος γραμματοσειράς'],
	['mac/spotlight', 'Spotlight αναζήτηση'],
	['android/call-contact', 'Αρχική οθόνη'],
	['android/force-close', 'Πρόσφατες εφαρμογές']
];

test.describe('the control a lesson asks for is big enough to hit', () => {
	test.use({ viewport: { width: 1280, height: 800 } });

	for (const [lesson, control] of targets) {
		test(`${lesson}: ${control}`, async ({ page }) => {
			await login(page);
			await page.goto(`/modules/${lesson}`);
			const target = page
				.getByRole('button', { name: control, exact: true })
				.or(page.getByRole('combobox', { name: control, exact: true }));
			await expect(target.first()).toBeVisible();
			// Not just present: visible without hovering first (the tab close used to fade in).
			await expect(target.first()).toHaveCSS('opacity', '1');
			const box = await target.first().boundingBox();
			expect(box?.width, 'width').toBeGreaterThanOrEqual(MIN);
			expect(box?.height, 'height').toBeGreaterThanOrEqual(MIN);
		});
	}
});
