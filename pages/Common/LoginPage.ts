import { expect, Locator } from "@playwright/test";
import { Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class LoginPage extends BasePage {    

    readonly usernameInput:Locator;
    readonly passwordInput:Locator;
    readonly signInButton:Locator;
    readonly userIcon:Locator;
    readonly logoutButton:Locator;

    constructor(page: Page) {
        super(page);
            this.usernameInput =    page.getByLabel('Login');
            this.passwordInput =    page.getByLabel('Password');
            this.signInButton =     page.locator('[name="submit"]');

            this.userIcon =        page.locator('#settingsBox > ul > li:nth-child(3) > a');
            this.logoutButton =    page.getByText('Logout');
    }

    async navigateToLoginPage() {
        await this.navigateTo('/login.html');
    }       

    async login(username: string, password: string) {
        await this.usernameInput.click();
        await this.usernameInput.fill(username);
        await this.passwordInput.click();
        await this.passwordInput.fill(password);
    }

    async submitLoginForm() {
        await Promise.all([
            this.page.waitForLoadState('networkidle'),
            await this.signInButton.click()
        ]);

    const currentUrl = this.page.url();
    
    if (currentUrl.includes('login.html') || currentUrl.includes('error')) {
        console.log("Stuck on redirect/SSL page. Forcing navigation to dashboard.");
        await this.page.goto('/bank/account-summary.html'); 
    }

    await this.page.waitForSelector('#account_summary_tab', { timeout: 5000 });
    }

    async getPageTitle(): Promise<string> {
        return this.page.title();
    }   

    async logout() {
        await this.userIcon.click();
        await this.logoutButton.click();
        await this.page.waitForLoadState('networkidle');
    }
}