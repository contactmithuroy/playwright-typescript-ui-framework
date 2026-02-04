import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/Common/LoginPage';

test.describe('Account Summary', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        const path = process.env.PLAYWRIGHT_TEST_PATH || '/login.html';
        const username = process.env.PLAYWRIGHT_TEST_USERNAME || 'username';
        const password = process.env.PLAYWRIGHT_TEST_PASSWORD || 'password';

        await page.goto(path);
        await loginPage.login(username, password);
        await loginPage.submitLoginForm();
        await expect(page).toHaveURL(/.*account-summary.html/);
    });

    test.afterEach(async ({ page }) => {
        await loginPage.logout();
    });

    test('placeholder: verify login resulted in navigation away from login', async ({ page }) => {
        expect(page.url()).not.toContain('/login');
    });
});