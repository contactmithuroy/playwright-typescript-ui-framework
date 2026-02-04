import { test, expect } from '../fixtures/customFixtures';

test.describe('Account Summary Verification', () => {
 
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

});