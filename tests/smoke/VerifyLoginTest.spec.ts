import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/Common/LoginPage";
import { loadLoginCredentials } from "../../utils/csvDataLoader";

test.describe("@Smoke", () => {

    test("Login with valid credentials", async ({ page }) => {
        const loginPage = new LoginPage(page);
        const credentials = loadLoginCredentials();

        const csvUsername = credentials[0].Login;
        const csvPassword = credentials[0].Password;

        const username = process.env.PLAYWRIGHT_TEST_USERNAME || csvUsername;
        const password = process.env.PLAYWRIGHT_TEST_PASSWORD || csvPassword;

        await loginPage.login(username, password);
        await loginPage.submitLoginForm();
        const title = await loginPage.getPageTitle();
        expect(title).toContain("Zero - Account Summary");
    });

    test("Logout after login", async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.logout();
        const title = await loginPage.getPageTitle();
        expect(title).toContain("Zero - Personal Banking - Loans - Credit Cards");
    });
}); 