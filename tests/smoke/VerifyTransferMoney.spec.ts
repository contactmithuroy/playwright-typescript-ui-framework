import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/Common/LoginPage';
import { NavigationPage } from '../../pages/MainPages/NevigationPage';
import { MoneyTransferPage } from '../../pages/MainPages/MoneyTransferPage';
import { DataStore } from '../../data-models/dataStore';

test.describe('Transfer Money', () => {
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

    DataStore.getAll("MakeATransferData")
    .filter((row: Record<string, string>) => row.Test === "true")
    .forEach((data: Record<string, string>, index: number) => {
        console.log(data);

        test(`Transfer Money: from ${data.FromAccount} to ${data.ToAccount}`, async ({ page }) => {
            const navigationPage = new NavigationPage(page);
            await navigationPage.navigationMenu('Transfer Funds');    

            const moneyTransferPage = new MoneyTransferPage(page);
            await moneyTransferPage.fillTransferDetails(
                data.FromAccount,
                data.ToAccount,
                data.Amount,
                data.Description
            );

            await moneyTransferPage.continueTransfer();
            await moneyTransferPage.submitTransfer();

            const isSuccess = await moneyTransferPage.verifyTransferSuccess();
            expect(isSuccess).toBeTruthy();
        });
    });
 
});