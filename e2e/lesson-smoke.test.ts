import { expect, test, type Page } from '@playwright/test';

// Every quiz lesson used to crash on open (a Svelte props_invalid_value in the
// answer binding) and no test noticed, because none opened a quiz. This opens
// one lesson of every type a learner can reach from a deep link: it must stay
// on that URL, show the lesson, and throw nothing. (The only scroll drill is
// disabled in the seeds, so there is no scroll lesson to open.)
const oneOfEachType: [type: string, lesson: string][] = [
	['hover', 'module1/hover-balloons'],
	['click', 'module1/click-mole'],
	['double-click', 'module1/double-click-chests'],
	['drag', 'module1/drag-recycle'],
	['right-click', 'module1/right-click-mystery'],
	['typing', 'module2/basic-typing'],
	['keyboard-action', 'module2/language-switch'],
	['desktop-simulation', 'module3/open-application'],
	['browser', 'module5/new-tab'],
	['quiz', 'module8/quiz-https'],
	['scam-spotter', 'module10/scam-spotter-email'],
	['reading', 'module3/read-esm001-c1-s3'],
	['mobile-tap', 'android/open-viber'],
	['mobile-sim', 'android/call-number'],
	['mac-simulation', 'mac/open-dock'],
	['gov-simulation', 'gov/gov-login'],
	['health-simulation', 'health/read-sms-code']
];

async function login(page: Page) {
	await page.goto('/login');
	await page.fill('#username', `smoke_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
	await page.getByRole('button', { name: /Σύνδεση \/ Δημιουργία/ }).click();
	await expect(page).toHaveURL('/');
	const picker = page.getByRole('dialog').filter({ hasText: 'Τι θέλεις να μάθεις' });
	await picker.getByRole('button', { name: /Υπολογιστής Windows/ }).click();
	await expect(picker).toBeHidden();
}

test.describe('every lesson type opens from a deep link', () => {
	for (const [type, lesson] of oneOfEachType) {
		test(`${type}: ${lesson}`, async ({ page }) => {
			const errors: string[] = [];
			page.on('pageerror', (e) => errors.push(e.message));
			await login(page);
			await page.goto(`/modules/${lesson}`);
			await page.waitForLoadState('networkidle');
			await expect(page).toHaveURL(`/modules/${lesson}`);
			// Anchored: the slim strip above the lesson also names the lesson after the count.
			await expect(page.getByText(/^Μάθημα \d+ από \d+$/)).toBeVisible();
			expect(errors).toEqual([]);
		});
	}
});
