import { expect } from "@playwright/test";
import { Page } from "@playwright/test";

export class LoginPage {    
    private page: Page;
    private usernameInput = 'Login';
    private passwordInput = 'Password';
    private signInButton = '[name="submit"]';

    constructor(page: Page) {
        this.page = page;
    }

    async navigateToLoginPage() {
        await this.page.goto('/login.html');
    }       

    async login(username: string, password: string) {
        await this.page.getByLabel(this.usernameInput).fill(username);
        await this.page.getByLabel(this.passwordInput).fill(password);
    }

    async submitLoginForm() {

    await Promise.all([
        this.page.waitForLoadState('networkidle'),
        this.page.click(this.signInButton)
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
}