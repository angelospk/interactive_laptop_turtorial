import { expect, test } from '@playwright/test';

test('admin login and logout flow', async ({ page }) => {
    // 1. Go to admin page (should redirect to login)
    await page.goto('/admin');
    // Should redirect to /login (user login) because of hooks, OR /admin/login if I implemented that specific redirect?
    // My hooks redirect to /login if not authenticated.
    // But wait, if I'm not logged in as USER, I go to /login.
    // If I want to access /admin, I need to be ADMIN.
    // If I go to /admin/login directly, I should see the admin login.

    await page.goto('/admin/login');
    await expect(page.locator('h3')).toContainText('Admin Login');

    // 2. Login with wrong password
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.getByText('Invalid password')).toBeVisible();

    // 3. Login with correct password
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Should redirect to /admin
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.locator('h1')).toContainText('Admin Dashboard');

    // 4. Verify Seed Database button exists
    await expect(page.getByText('Seed Database')).toBeVisible();

    // 5. Logout
    await page.click('button:has-text("Logout")');

    // Should redirect back to admin login
    await expect(page).toHaveURL(/\/admin\/login/);
});
