import { expect, test } from '@playwright/test';

// Choosing English must not leave the learner half in Greek: the first-run
// question, the device names, the module groups and the text-size switch all
// follow the language. Lesson content itself is Greek by design.
test('English is English from the device question to the module groups', async ({ page }) => {
	await page.goto('/login', { waitUntil: 'networkidle' });
	// Switching language reloads the page.
	await Promise.all([
		page.waitForEvent('load'),
		page.getByRole('button', { name: 'English' }).click()
	]);
	await page.waitForLoadState('networkidle');
	await expect(page.getByRole('button', { name: 'English' })).toHaveAttribute(
		'aria-pressed',
		'true'
	);

	await page.fill('#username', `en_${Date.now()}`);
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL('/');

	const picker = page
		.getByRole('dialog')
		.filter({ hasText: 'What would you like to learn to use?' });
	await expect(picker).toBeVisible();
	await picker.getByRole('button', { name: /I don't know which device I have/ }).click();
	await expect(picker.getByText(/black apple/)).toBeVisible();
	await picker.getByRole('button', { name: /Windows computer/ }).click();
	await expect(picker).toBeHidden();

	await expect(page.getByRole('heading', { name: 'First steps' })).toBeVisible();
	await expect(page.getByRole('heading', { name: /For your device · Windows/ })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Change device' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Larger text' })).toBeVisible();
});
