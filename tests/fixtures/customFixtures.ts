import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../../pages/Common/LoginPage';
import { TestContext } from '../../data-models/interfaces';

/**
 * Custom fixture types
 */
type CustomFixtures = {
  authenticatedPage: Page;
  loginPage: LoginPage;
  testContext: TestContext;
};

/**
 * Extended test with custom fixtures
 * This provides Cucumber-style hooks functionality
 */
export const test = base.extend<CustomFixtures>({
  /**
   * Test context fixture - provides test-level state management
   */
  testContext: async ({}, use) => {
    const context: TestContext = {
      authenticated: false,
      sessionData: {},
    };

    await use(context);

    // Cleanup after test
    context.sessionData = {};
  },

  /**
   * Login page fixture - provides a configured login page instance
   */
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  /**
   * Authenticated page fixture - automatically logs in before each test
   * This is like a Cucumber @Before hook
   */
  authenticatedPage: async ({ page, testContext }, use, testInfo) => {
    const loginPage = new LoginPage(page);
    
    // Get credentials from environment or use defaults
    const path = process.env.PLAYWRIGHT_TEST_PATH || '/login.html';
    const username = process.env.PLAYWRIGHT_TEST_USERNAME || 'username';
    const password = process.env.PLAYWRIGHT_TEST_PASSWORD || 'password';

    console.log(`[${testInfo.title}] Setting up authentication...`);

    try {
      // Navigate and login
      await page.goto(path);
      await loginPage.login(username, password);
      await loginPage.submitLoginForm();

      // Verify successful login and wait for dashboard
      await page.waitForURL(/.*account-summary.html/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      
      // Update test context
      testContext.authenticated = true;
      testContext.username = username;
      
      console.log(`[${testInfo.title}] Authentication successful`);
    } catch (error) {
      console.error(`[${testInfo.title}] Authentication failed:`, error);
      throw error;
    }

    // Provide the authenticated page to the test
    await use(page);

    // Cleanup - this is like a Cucumber @After hook
    console.log(`[${testInfo.title}] Cleaning up...`);
    
    try {
      if (testContext.authenticated) {
        await loginPage.logout();
        testContext.authenticated = false;
        console.log(`[${testInfo.title}] Logout successful`);
      }
    } catch (error) {
      console.error(`[${testInfo.title}] Logout failed:`, error);
      // Don't throw here - we want cleanup to continue
    }
  },
});

/**
 * Export expect for convenience
 */
export { expect } from '@playwright/test';

/**
 * Custom test tags for organizing tests
 */
export const tags = {
  smoke: '@smoke',
  regression: '@regression',
  critical: '@critical',
  skip: '@skip',
};

/**
 * Helper function to skip tests conditionally
 */
export function skipIf(condition: boolean, reason: string) {
  return condition ? test.skip : test;
}

/**
 * Helper function to run tests only in specific environments
 */
export function onlyInEnv(envName: string) {
  const currentEnv = process.env.TEST_ENV || 'development';
  return currentEnv === envName ? test : test.skip;
}