import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/MainPages/LoginPage";
import { loadLoginCredentials } from "../../utils/csvDataLoader";

test("Login with valid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const credentials = loadLoginCredentials();

    const loginData = credentials[0].Login;
    const passwordData = credentials[0].Password;

    await loginPage.navigateToLoginPage();
    await loginPage.login(loginData, passwordData);
    await loginPage.submitLoginForm();
    const title = await loginPage.getPageTitle();
    expect(title).toContain("Zero - Account Summary");

});
