import { expect, test, type Page } from '@playwright/test';

const loginButton = /Σύνδεση \/ Δημιουργία/;

async function loginFresh(page: Page, prefix: string) {
	await page.goto('/login');
	await page.fill('#username', `${prefix}_${Date.now()}`);
	await page.getByRole('button', { name: loginButton }).click();
	await expect(page).toHaveURL('/');
}

test.describe('device choice', () => {
	test('first-run picker fits a small phone: every choice reachable', async ({ page }) => {
		await page.setViewportSize({ width: 360, height: 640 });
		await loginFresh(page, 'small');
		const picker = page.getByRole('dialog').filter({ hasText: 'Τι θέλεις να μάθεις' });
		await expect(picker).toBeVisible();

		// The dialog may scroll inside itself, but it must never extend past the screen.
		const box = await picker.boundingBox();
		expect(box!.y).toBeGreaterThanOrEqual(0);
		expect(box!.y + box!.height).toBeLessThanOrEqual(640);

		const help = picker.getByRole('button', { name: /Δεν ξέρω τι συσκευή έχω/ });
		await help.scrollIntoViewIfNeeded();
		await help.click();
		// Reachable by scrolling the dialog, which a clipped dialog would not allow.
		const clue = picker.getByText(/μαύρο μήλο/);
		await clue.scrollIntoViewIfNeeded();
		await expect(clue).toBeInViewport();

		await picker.getByRole('button', { name: /Υπολογιστής Mac/ }).click();
		await expect(picker).toBeHidden();
	});

	test('the device can be changed twice without reloading', async ({ page }) => {
		await loginFresh(page, 'twice');
		const picker = page.getByRole('dialog').filter({ hasText: 'Τι θέλεις να μάθεις' });
		await picker.getByRole('button', { name: /Υπολογιστής Windows/ }).click();
		await expect(picker).toBeHidden();

		const change = page.getByRole('button', { name: 'Αλλαγή συσκευής' });
		const size = await change.boundingBox();
		expect(size!.height).toBeGreaterThanOrEqual(44);

		await change.click();
		const dialog = page.getByRole('dialog').filter({ hasText: 'Άλλαξε συσκευή μαθημάτων' });
		await dialog.getByRole('button', { name: /Υπολογιστής Mac/ }).click();
		await expect(dialog).toBeHidden();
		await expect(page.getByRole('heading', { name: /Για τη συσκευή σου · Mac/ })).toBeVisible();

		// Second change in the same page: the choices must not still be "saving".
		await change.click();
		const again = page.getByRole('dialog').filter({ hasText: 'Άλλαξε συσκευή μαθημάτων' });
		const android = again.getByRole('button', { name: /Κινητό Android/ });
		await expect(android).toBeEnabled();
		await expect(again.getByText('Αποθήκευση…')).toHaveCount(0);
		await android.click();
		await expect(again).toBeHidden();
		await expect(page.getByRole('heading', { name: /Για τη συσκευή σου · Android/ })).toBeVisible();
	});
});

test('a login mistake stays on screen next to the name field', async ({ page }) => {
	await page.goto('/login');
	await page.fill('#username', 'a');
	await page.getByRole('button', { name: loginButton }).click();

	const input = page.locator('#username');
	await expect(input).toHaveAttribute('aria-invalid', 'true');
	const errorId = (await input.getAttribute('aria-describedby'))!.split(' ');
	const error = page.locator(`#${errorId.find((id) => id.includes('error'))}`);
	await expect(error).toBeVisible();
	await expect(error).toContainText(/τουλάχιστον 2/);

	// Fixing the name clears the error before the next try.
	await page.fill('#username', `fixed_${Date.now()}`);
	await expect(input).not.toHaveAttribute('aria-invalid', 'true');
	await page.getByRole('button', { name: loginButton }).click();
	await expect(page).toHaveURL('/');
});
