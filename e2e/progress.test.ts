import { expect, test } from '@playwright/test';

const loginButton = /Σύνδεση \/ Δημιουργία/;

test('user progress persistence', async ({ page }) => {
	// 1. Login as a new user (username-only, no password)
	const username = `testuser_${Date.now()}`;
	await page.goto('/login');
	await page.fill('#username', username);
	await page.getByRole('button', { name: loginButton }).click();
	await expect(page).toHaveURL('/');

	// 2. First run asks which device to learn; it blocks the page until answered.
	const picker = page.getByRole('dialog').filter({ hasText: 'Τι θέλεις να μάθεις' });
	await picker.getByRole('button', { name: /Υπολογιστής Windows/ }).click();
	await expect(picker).toBeHidden();

	// 3. Verify welcome message
	await expect(page.getByText(new RegExp(username)).first()).toBeVisible();

	// 4. Logout
	await page.getByRole('button', { name: /Αποσύνδεση/ }).click();
	await expect(page).toHaveURL('/login');

	// 5. Login again with same username
	await page.fill('#username', username);
	await page.getByRole('button', { name: loginButton }).click();
	await expect(page).toHaveURL('/');

	// 6. Verify user is recognized again
	await expect(page.getByText(new RegExp(username)).first()).toBeVisible();
});
