import { test, expect } from '../fixtures/customFixtures';
import { LoginPage } from '../../pages/Common/LoginPage';
import { TestFactory } from '../factories/testFactory';
import { LoginCredentials } from '../../data-models/interfaces';

// NOTE: This file contains only the Data-Driven login suites.
// Other tests that require an authenticated session should use the
// `authenticatedPage` fixture (see `tests/fixtures/customFixtures.ts`).

/**
 * Data-Driven Login Tests - Using CSV and Test Factory
 */
TestFactory.createDataDrivenSuite<LoginCredentials>(
  'CSV-Driven Login Tests',
  'loginCredentials',
  async function (this: { page: any; expect: any }, data: LoginCredentials, index: number) {
    const loginPage = new LoginPage(this.page);

    // Navigate to login page
    await loginPage.navigateToLoginPage();

    // Perform login
    await loginPage.login(data.Login, data.Password);
    await loginPage.submitLoginForm();

    // Verify login
    const isLoggedIn = await loginPage.verifyLoginSuccess();

    // Since we're filtering for Test=true, we expect successful login
    (this.expect as any)(isLoggedIn).toBe(true);
    (this.expect as any)(this.page.url()).toContain('account-summary');

    // Logout
    await loginPage.logout();
  },
  {
    titleGenerator: (data, index) =>
      `Login test ${index + 1}: User "${data.Login}" - Password "${data.Password}"`,
    useAuthentication: false, // We're testing login itself
    beforeEachTest: async (data) => {
      console.log(`Starting login test for user: ${data.Login}`);
    },
    afterEachTest: async (data) => {
      console.log(`Completed login test for user: ${data.Login}`);
    },
  }
);

/**
 * Negative Login Tests - Testing Invalid Credentials
 */
TestFactory.createDataDrivenSuite<LoginCredentials>(
  'Invalid Login Tests',
  'loginCredentials',
  async function (this: { page: any; expect: any }, data: LoginCredentials) {
    const loginPage = new LoginPage(this.page);

    await loginPage.navigateToLoginPage();
    await loginPage.login(data.Login, data.Password);

    // Click login but expect to stay on login page
    await (loginPage as any).signInButton.click();
    await this.page.waitForTimeout(2000);

    // Should still be on login page
    (this.expect as any)(this.page.url()).toContain('login');
  },
  {
    titleGenerator: (data, index) =>
      `Invalid login test ${index + 1}: User "${data.Login}" - Password "${data.Password}"`,
    filter: (data) => data.Test?.toLowerCase() === 'false', // Only false tests
    useAuthentication: false,
  }
);

/**
 * Grouped Login Tests - By Username Pattern
 */
TestFactory.createGroupedTests<LoginCredentials>(
  'Grouped Login Tests by Username',
  'loginCredentials',
  'Login',
  async function (this: { page: any; expect: any }, data: LoginCredentials) {
    const loginPage = new LoginPage(this.page);

    await loginPage.navigateToLoginPage();
    await loginPage.login(data.Login, data.Password);
    await loginPage.submitLoginForm();

    const isLoggedIn = await loginPage.verifyLoginSuccess();
    (this.expect as any)(isLoggedIn).toBe(true);

    await loginPage.logout();
  },
  {
    useAuthentication: false,
  }
);