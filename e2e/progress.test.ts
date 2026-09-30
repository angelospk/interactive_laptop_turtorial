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

test('resetting all progress asks first, and Cancel keeps it', async ({ page }) => {
	await page.goto('/login');
	await page.fill('#username', `reset_${Date.now()}`);
	await page.getByRole('button', { name: loginButton }).click();
	await expect(page).toHaveURL('/');
	const picker = page.getByRole('dialog').filter({ hasText: 'Τι θέλεις να μάθεις' });
	await picker.getByRole('button', { name: /Υπολογιστής Windows/ }).click();
	await expect(picker).toBeHidden();

	const resets: string[] = [];
	page.on('request', (r) => {
		if (r.url().includes('/api/lessons/reset')) resets.push(r.url());
	});

	// One stray click must not wipe months of work.
	await page.getByRole('button', { name: 'Επανέναρξη Προόδου' }).click();
	const confirm = page.getByRole('alertdialog');
	await expect(confirm).toBeVisible();
	await confirm.getByRole('button', { name: 'Άκυρο' }).click();
	await expect(confirm).toBeHidden();
	expect(resets).toHaveLength(0);

	await page.getByRole('button', { name: 'Επανέναρξη Προόδου' }).click();
	await page
		.getByRole('alertdialog')
		.getByRole('button', { name: /Ναι, διαγραφή/ })
		.click();
	await expect(page.getByText('Η πρόοδός σας διαγράφηκε')).toBeVisible();
	expect(resets).toHaveLength(1);
});
