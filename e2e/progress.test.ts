import { expect, test } from '@playwright/test';

test('user progress persistence', async ({ page }) => {
    // 1. Login as a new user
    const username = `testuser_${Date.now()}`;
    await page.goto('/login');
    await page.fill('input[name="username"]', username);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // 2. Verify welcome message
    await expect(page.getByText(`Καλώς ήρθατε, ${username}!`)).toBeVisible();

    // 3. Logout
    // The logout button might be in a dropdown or header.
    // Based on LogoutButton.svelte, it's a button with text "Αποσύνδεση" (in Greek)
    await page.click('button:has-text("Αποσύνδεση")');

    await expect(page).toHaveURL('/login');

    // 4. Login again with same username
    await page.fill('input[name="username"]', username);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // 5. Verify user is recognized again
    await expect(page.getByText(`Καλώς ήρθατε, ${username}!`)).toBeVisible();
});
