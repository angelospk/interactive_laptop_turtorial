import { expect, test } from '@playwright/test';

// Logs in via the username-only login form (no password).
async function login(page: import('@playwright/test').Page, username: string) {
	await page.fill('#username', username);
	await page.getByRole('button', { name: /Σύνδεση \/ Δημιουργία/ }).click();
}

test.describe('A — lesson deep-linking', () => {
	test('direct URL to a valid lesson renders the lesson page', async ({ page }) => {
		await page.goto('/login');
		await login(page, `dl_${Date.now()}`);
		await expect(page).toHaveURL('/');

		await page.goto('/modules/module1/hover-balloons');
		await expect(page).toHaveURL('/modules/module1/hover-balloons');
		// Breadcrumb anchors the user (accessibility for the target audience).
		await expect(page.getByRole('navigation', { name: 'Διαδρομή' })).toBeVisible();
	});

	test('unknown lesson redirects to the grid with a notice', async ({ page }) => {
		await page.goto('/login');
		await login(page, `dl_${Date.now()}`);
		await expect(page).toHaveURL('/');

		await page.goto('/modules/module1/does-not-exist');
		await expect(page).toHaveURL('/modules/module1?notice=missing');
		await expect(page.getByText('Το μάθημα που ζητήσατε δεν βρέθηκε')).toBeVisible();
	});

	test('old /modules/[id] URL still shows the grid', async ({ page }) => {
		await page.goto('/login');
		await login(page, `dl_${Date.now()}`);
		await expect(page).toHaveURL('/');
		await page.goto('/modules/module1');
		await expect(page).toHaveURL('/modules/module1');
		// A lesson card links into a deep URL.
		await expect(page.locator('a[href^="/modules/module1/"]').first()).toBeVisible();
	});
});

test.describe('B — redirect after login', () => {
	test('deep link while logged out returns the user to the lesson after login', async ({
		page
	}) => {
		await page.goto('/modules/module1/hover-balloons');
		// hooks.server.ts bounced us to login, remembering the target.
		await expect(page).toHaveURL(/\/login\?redirectTo=%2Fmodules%2Fmodule1%2Fhover-balloons/);

		await login(page, `rd_${Date.now()}`);
		await expect(page).toHaveURL('/modules/module1/hover-balloons');
	});
});

test.describe('D — library to lesson bridge', () => {
	test('a subsection links straight to specific lessons', async ({ page }) => {
		// Library is public — no login needed.
		await page.goto('/library/esm005/esm005-c1-s2');
		await expect(page.getByRole('heading', { name: 'Δοκιμάστε το στην πράξη' })).toBeVisible();
		const link = page.locator('a[href="/modules/module10/scam-spotter-email"]');
		await expect(link).toBeVisible();
	});
});
