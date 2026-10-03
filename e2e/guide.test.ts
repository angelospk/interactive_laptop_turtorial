import { expect, test } from '@playwright/test';

// The guide end to end: «Το ξέρω» on two steps turns those two exercises green,
// and Next after the guide skips straight past them.
test('a guide marks what you know, and Next skips it', async ({ page }) => {
	// Eleven steps, each with ~2.5s of muted feedback.
	test.setTimeout(120_000);
	await page.goto('/login');
	await page.fill('#username', `guide_${Date.now()}`);
	await page.getByRole('button', { name: /Σύνδεση \/ Δημιουργία/ }).click();
	await expect(page).toHaveURL('/');
	const picker = page.getByRole('dialog').filter({ hasText: 'Τι θέλεις να μάθεις' });
	await picker.getByRole('button', { name: /Υπολογιστής Windows/ }).click();
	await expect(picker).toBeHidden();

	// Silent: the clips "end" after their reading time, which keeps this short.
	await page.evaluate(() => localStorage.setItem('guide-muted', '1'));
	await page.goto('/modules/module5/guide');

	await page.getByRole('button', { name: 'Ξεκινάμε' }).click();
	await page.getByRole('button', { name: 'Πάμε!' }).click();
	await expect(page.getByTestId('guide-spotlight')).toHaveAttribute('data-target', 'tabs');

	const known = page.getByRole('button', { name: /Το ξέρω/ });
	const unknown = page.getByRole('button', { name: 'Δεν το ξέρω' });
	// Step 1 (tabs → lesson4) and step 2 (new tab → lesson1): known. The rest: not.
	for (let i = 1; i <= 11; i++) {
		await expect(page.getByText(`Βήμα ${i} από 11`)).toBeVisible({ timeout: 15_000 });
		await expect(known).toBeEnabled({ timeout: 15_000 });
		await (i <= 2 ? known : unknown).click();
	}
	await expect(page.getByRole('heading', { name: 'Ξέρατε 2 από τα 11' })).toBeVisible({
		timeout: 15_000
	});
	await page.getByRole('button', { name: 'Συνέχεια' }).click();

	// lesson1 is known, so the next unfinished exercise is lesson2.
	await page.getByRole('button', { name: /Επόμενο Μάθημα/ }).click();
	await expect(page).toHaveURL(/\/modules\/module5\/address-bar/);

	await page.goto('/modules/module5');
	await expect(page.getByText('Το ήξερες')).toHaveCount(2);
});
