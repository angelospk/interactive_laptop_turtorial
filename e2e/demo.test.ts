import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
	// Home is auth-protected; log in first, then assert the heading.
	await page.goto('/login');
	await page.fill('#username', `demo_${Date.now()}`);
	await page.getByRole('button', { name: /Σύνδεση \/ Δημιουργία/ }).click();
	await expect(page).toHaveURL('/');
	await expect(page.locator('h1')).toBeVisible();
});
