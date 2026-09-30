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

// Keyboard and screen-reader users must not be dropped at the top of the page
// every time the screen changes under them.
test('focus follows the learner through the drill and back', async ({ page }) => {
	await page.goto('/apates', { waitUntil: 'networkidle' });
	const focusedText = () =>
		page.evaluate(() => {
			const el = document.activeElement;
			return el && el !== document.body ? (el.textContent ?? '').trim() : '';
		});

	await page.getByRole('button', { name: 'Ξεκινήστε' }).nth(1).focus();
	await page.keyboard.press('Enter');
	await expect.poll(focusedText).toMatch(/Απάτη ή Όχι/);

	await page.getByRole('button', { name: /Απάτη$/ }).focus();
	await page.keyboard.press('Enter');
	await expect.poll(focusedText).toMatch(/Σωστά|Λάθος/);

	const next = page.getByRole('button', { name: /^(Επόμενο|Ολοκλήρωση)$/ });
	await next.focus();
	await page.keyboard.press('Enter');
	await expect.poll(focusedText).toMatch(/Απάτη ή Όχι|Ολοκληρώθηκε/);

	await page.getByRole('button', { name: /^Πίσω$|Επιστροφή στις ασκήσεις/ }).focus();
	await page.keyboard.press('Enter');
	// Back on the list, on the exercise they came from.
	await expect(page.getByRole('button', { name: 'Ξεκινήστε' }).nth(1)).toBeFocused();
});
