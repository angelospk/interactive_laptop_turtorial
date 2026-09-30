import { expect, test } from '@playwright/test';

// The public scam drill: no account, read at the learner's pace.
test('the result stays until the learner leaves it, and sender details are whole', async ({
	page
}) => {
	await page.setViewportSize({ width: 360, height: 740 });
	await page.goto('/apates', { waitUntil: 'networkidle' });
	const start = page.getByRole('button', { name: 'Ξεκινήστε' }).first();
	const size = await start.boundingBox();
	expect(size!.height).toBeGreaterThanOrEqual(44);
	await start.click();

	// Every sender detail is readable in full: the tell is often the last few characters.
	const clipped = await page.evaluate(() =>
		[...document.querySelectorAll('.sender-detail')].some(
			(el) => getComputedStyle(el).textOverflow === 'ellipsis' || el.scrollWidth > el.clientWidth
		)
	);
	expect(clipped).toBe(false);

	for (;;) {
		await page.getByRole('button', { name: /Απάτη$/ }).click();
		const finish = page.getByRole('button', { name: 'Ολοκλήρωση' });
		if (await finish.isVisible()) {
			await finish.click();
			break;
		}
		await page.getByRole('button', { name: 'Επόμενο' }).click();
	}

	await expect(page.getByText(/Σωστές απαντήσεις/)).toBeVisible();
	await page.waitForTimeout(3000);
	await expect(page.getByText(/Σωστές απαντήσεις/)).toBeVisible();

	await page.getByRole('button', { name: 'Επιστροφή στις ασκήσεις' }).click();
	await expect(page.getByRole('status')).toContainText(/σκορ/);
});
