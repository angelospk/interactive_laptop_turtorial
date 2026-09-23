import { expect, test, type Page } from '@playwright/test';

// A short laptop screen, or a learner who zoomed the browser in, leaves less
// height than a quiz needs. The lesson card clipped whatever did not fit, so the
// "Υποβολή" button was cut off with no way to scroll to it.
async function login(page: Page) {
	await page.goto('/login');
	await page.fill('#username', `short_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
	await page.getByRole('button', { name: /Σύνδεση \/ Δημιουργία/ }).click();
	await expect(page).toHaveURL('/');
	const picker = page.getByRole('dialog').filter({ hasText: 'Τι θέλεις να μάθεις' });
	await picker.getByRole('button', { name: /Υπολογιστής Windows/ }).click();
	await expect(picker).toBeHidden();
}

test.describe('a lesson taller than the screen can still be finished', () => {
	test.use({ viewport: { width: 1280, height: 600 } });

	// The control that finishes the step: the quiz's submit, the scam card's answers.
	const lessons: [lesson: string, control: RegExp][] = [
		['module8/quiz-https', /^Υποβολή$/],
		['module10/scam-spotter-email', /Απάτη/]
	];

	for (const [lesson, control] of lessons) {
		test(lesson, async ({ page }) => {
			await login(page);
			await page.goto(`/modules/${lesson}`);
			await page.waitForLoadState('networkidle');
			const target = page.locator('.lesson-card').getByRole('button', { name: control }).last();
			// Scroll the way a learner does, with the wheel over the lesson. (Playwright's
			// scrollIntoView would also scroll an overflow:hidden box, which no person can.)
			const card = await page.locator('.lesson-card').boundingBox();
			await page.mouse.move(card!.x + card!.width / 2, card!.y + card!.height / 2);
			await page.mouse.wheel(0, 2000);
			await expect(target).toBeInViewport({ ratio: 1 });
			const box = await target.boundingBox();
			expect(box!.y + box!.height).toBeLessThanOrEqual(card!.y + card!.height + 1);
		});
	}
});
