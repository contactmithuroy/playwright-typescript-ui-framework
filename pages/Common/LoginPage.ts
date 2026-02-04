import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './basePage';


export class LoginPage extends BasePage {
  // Locators
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly userIcon: Locator;
  readonly logoutButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByLabel('Login');
    this.passwordInput = page.getByLabel('Password');
    this.signInButton = page.locator('[name="submit"]');
    this.userIcon = page.locator('#settingsBox > ul > li:nth-child(3) > a');
    this.logoutButton = page.getByText('Logout');
    this.errorMessage = page.locator('.alert-error');
  }

  /**
   * Navigate to login page
   */
  async navigateToLoginPage(): Promise<void> {
    await this.navigateTo('/login.html');
    await this.waitForElement(this.usernameInput);
  }

  /**
   * Perform login with credentials
   */
  async login(username: string, password: string): Promise<void> {
    this.log(`Attempting login with username: ${username}`);

    try {
      await this.safeFill(this.usernameInput, username);
      await this.safeFill(this.passwordInput, password);
      this.log('Credentials entered successfully');
    } catch (error) {
      this.logError('Failed to enter credentials', error);
      throw error;
    }
  }

  /**
   * Submit login form with validation
   */
  async submitLoginForm(): Promise<void> {
    this.log('Submitting login form');

    try {
      await Promise.all([
        this.page.waitForLoadState('networkidle', { timeout: 30000 }),
        this.safeClick(this.signInButton),
      ]);

      // Handle redirect issues
      const currentUrl = this.page.url();
      if (currentUrl.includes('login.html') || currentUrl.includes('error')) {
        this.log('Detected redirect issue, forcing navigation to dashboard');
        await this.navigateTo('/bank/account-summary.html');
      }

      // Wait for successful login indicator
      await this.page.waitForSelector('#account_summary_tab', { 
        timeout: 10000,
        state: 'visible'
      });

      this.log('Login successful');
    } catch (error) {
      this.logError('Login submission failed', error);
      
      // Check for error message
      const hasError = await this.elementExists(this.errorMessage);
      if (hasError) {
        const errorText = await this.getElementText(this.errorMessage);
        this.logError('Login error message displayed', errorText);
      }

      throw error;
    }
  }

  /**
   * Complete login flow (navigate + login + submit)
   */
  async performLogin(username: string, password: string): Promise<void> {
    await this.navigateToLoginPage();
    await this.login(username, password);
    await this.submitLoginForm();
  }

  /**
   * Verify successful login
   */
  async verifyLoginSuccess(): Promise<boolean> {
    try {
      const currentUrl = this.getCurrentUrl();
      const isOnDashboard = currentUrl.includes('account-summary.html');
      const userIconVisible = await this.elementExists(this.userIcon);

      return isOnDashboard && userIconVisible;
    } catch {
      return false;
    }
  }

  /**
   * Logout from application
   */
  async logout(): Promise<void> {
    this.log('Attempting logout');

    try {
      await this.safeClick(this.userIcon);
      await this.waitForElement(this.logoutButton);
      await this.safeClick(this.logoutButton);
      await this.waitForPageLoad('networkidle');

      this.log('Logout successful');
    } catch (error) {
      this.logError('Logout failed', error);
      throw error;
    }
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.elementExists(this.userIcon);
  }

  /**
   * Get login error message
   */
  async getLoginError(): Promise<string> {
    if (await this.elementExists(this.errorMessage)) {
      return await this.getElementText(this.errorMessage);
    }
    return '';
  }
}