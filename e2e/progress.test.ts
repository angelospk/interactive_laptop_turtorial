import { expect, test } from '@playwright/test';

const loginButton = /Σύνδεση \/ Δημιουργία/;

test('user progress persistence', async ({ page }) => {
	// 1. Login as a new user (username-only, no password)
	const username = `testuser_${Date.now()}`;
	await page.goto('/login');
	await page.fill('#username', username);
	await page.getByRole('button', { name: loginButton }).click();
	await expect(page).toHaveURL('/');

	// 2. Verify welcome message
	await expect(page.getByText(new RegExp(username)).first()).toBeVisible();

	// 3. Logout
	await page.getByRole('button', { name: /Αποσύνδεση/ }).click();
	await expect(page).toHaveURL('/login');

	// 4. Login again with same username
	await page.fill('#username', username);
	await page.getByRole('button', { name: loginButton }).click();
	await expect(page).toHaveURL('/');

	// 5. Verify user is recognized again
	await expect(page.getByText(new RegExp(username)).first()).toBeVisible();
});
