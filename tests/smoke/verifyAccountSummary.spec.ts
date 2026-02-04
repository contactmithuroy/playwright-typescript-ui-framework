import { test, expect } from '../fixtures/customFixtures';
import { NavigationPage } from '../../pages/MainPages/NavigationPage';
import { BasePage } from '../../pages/Common/basePage';

/**
 * Enhanced Account Summary Tests
 */
test.describe('Account Summary Verification', () => {
  /**
   * Test using authenticated fixture
   */
  test('should display account summary after login', async ({
    authenticatedPage,
    testContext,
  }) => {
    // Already authenticated
    expect(testContext.authenticated).toBe(true);
    expect(authenticatedPage.url()).toContain('account-summary.html');

    // Verify page elements
    const accountSummaryTab = authenticatedPage.locator('#account_summary_tab');
    await expect(accountSummaryTab).toBeVisible();

    // Check for account tables
    const accountTables = authenticatedPage.locator('.table');
    await expect(accountTables.first()).toBeVisible();
  });

  /**
   * Test navigation between pages
   */
  test('should navigate between different pages', async ({
    authenticatedPage,
  }) => {
    const navigationPage = new NavigationPage(authenticatedPage);

    // Navigate to Account Activity
    await navigationPage.navigateToAccountActivity();
    expect(authenticatedPage.url()).toContain('account-activity.html');

    // Navigate to Transfer Funds
    await navigationPage.navigateToTransferFunds();
    expect(authenticatedPage.url()).toContain('transfer-funds.html');

    // Navigate back to Account Summary
    await navigationPage.navigateToAccountSummary();
    expect(authenticatedPage.url()).toContain('account-summary.html');
  });

  /**
   * Test menu availability
   */
  test('should have all required menu items', async ({
    authenticatedPage,
  }) => {
    const navigationPage = new NavigationPage(authenticatedPage);

    const menus = await navigationPage.getAvailableMenus();
    
    expect(menus.length).toBeGreaterThan(0);
    console.log('Available menus:', menus);

    // Check for specific menus
    const transferFundsExists = await navigationPage.menuExists('Transfer Funds');
    expect(transferFundsExists).toBe(true);
  });

  /**
   * Test page performance
   */
  test('should load account summary within acceptable time', async ({
    authenticatedPage,
  }) => {
    const basePage = new BasePage(authenticatedPage);
    const metrics = await basePage.getPerformanceMetrics();

    console.log('Performance Metrics:', metrics);

    // Assert load time is reasonable (e.g., less than 5 seconds)
    expect(metrics.loadTime).toBeLessThan(5000);
  });

  /**
   * Test account balance visibility
   */
  test('should display account balances', async ({ authenticatedPage }) => {
    // Wait for balance elements
    const balanceElements = authenticatedPage.locator('.balance');
    
    // Check if at least one balance is visible
    const count = await balanceElements.count();
    expect(count).toBeGreaterThan(0);

    // Log balances for verification
    for (let i = 0; i < count; i++) {
      const balance = await balanceElements.nth(i).textContent();
      console.log(`Balance ${i + 1}:`, balance);
    }
  });
});

/**
 * Account Summary - Without Auto-Login
 */
test.describe('Account Summary - Manual Setup', () => {
  test('should access account summary after manual login', async ({ page }) => {
    const LoginPage = require('../../pages/Common/LoginPage').LoginPage;
    const loginPage = new LoginPage(page);

    // Manual login
    await page.goto('/login.html');
    await loginPage.login('username', 'password');
    await loginPage.submitLoginForm();

    // Verify on account summary
    expect(page.url()).toContain('account-summary.html');

    // Cleanup
    await loginPage.logout();
  });
});