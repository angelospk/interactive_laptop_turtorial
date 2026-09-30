import { expect, test } from '@playwright/test';

const rootFontSize = (page: import('@playwright/test').Page) =>
	page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));

// Reading glasses are not always at hand. One press makes every page larger,
// and it stays that way on the next visit.
test('larger text is one press away, and it is remembered', async ({ page }) => {
	await page.goto('/library', { waitUntil: 'networkidle' });
	const toggle = page.getByRole('button', { name: 'Μεγαλύτερα γράμματα' });
	await expect(toggle).toHaveAttribute('aria-pressed', 'false');
	const box = await toggle.boundingBox();
	expect(box!.height).toBeGreaterThanOrEqual(44);
	const normal = await rootFontSize(page);

	await toggle.click();
	await expect(toggle).toHaveAttribute('aria-pressed', 'true');
	expect(await rootFontSize(page)).toBeGreaterThanOrEqual(normal * 1.2);

	// Another page, a fresh load: still large, with no flash of small text.
	await page.goto('/apates');
	expect(await rootFontSize(page)).toBeGreaterThanOrEqual(normal * 1.2);
	await expect(page.getByRole('button', { name: 'Μεγαλύτερα γράμματα' })).toHaveAttribute(
		'aria-pressed',
		'true'
	);

	await page.getByRole('button', { name: 'Μεγαλύτερα γράμματα' }).click();
	expect(await rootFontSize(page)).toBe(normal);
});
