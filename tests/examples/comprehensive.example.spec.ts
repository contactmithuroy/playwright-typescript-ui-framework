import { test, expect } from '../fixtures/customFixtures';
import { NavigationPage } from '../../pages/MainPages/NavigationPage';
import { MoneyTransferPage } from '../../pages/MainPages/MoneyTransferPage';
import { LoginPage } from '../../pages/Common/LoginPage';
import { TestFactory } from '../factories/testFactory';
import { TransferData, LoginCredentials } from '../../data-models/interfaces';
import { DataStore } from '../../data-models/dataStore';

/**
 * ====================================================================
 * COMPREHENSIVE EXAMPLE TEST FILE
 * ====================================================================
 * 
 * This file demonstrates all the advanced features of the framework:
 * 1. Custom Fixtures (authenticatedPage, testContext, loginPage)
 * 2. CSV-driven testing with Test Factory
 * 3. Data filtering and validation
 * 4. Grouped tests
 * 5. Custom title generators
 * 6. Before/After hooks
 * 7. Performance testing
 * 8. Error handling
 * 
 * Use this as a reference for creating your own tests!
 */

// ====================================================================
// EXAMPLE 1: Using authenticatedPage Fixture
// ====================================================================
test.describe('Example 1: Using Fixtures', () => {
  test('example with auto-login fixture', async ({ authenticatedPage, testContext }) => {
    // The authenticatedPage fixture has already logged us in!
    expect(testContext.authenticated).toBe(true);
    console.log(`Logged in as: ${testContext.username}`);

    // Now we can directly perform actions
    const navigationPage = new NavigationPage(authenticatedPage);
    await navigationPage.navigateToAccountSummary();

    expect(authenticatedPage.url()).toContain('account-summary');
    
    // No need to logout - fixture handles it automatically!
  });

  test('example with login page fixture', async ({ page, loginPage }) => {
    // loginPage fixture provides a pre-configured LoginPageEnhanced instance
    await page.goto('/login.html');
    await loginPage.login('username', 'password');
    await loginPage.submitLoginForm();

    const isLoggedIn = await loginPage.verifyLoginSuccess();
    expect(isLoggedIn).toBe(true);

    await loginPage.logout();
  });
});

// ====================================================================
// EXAMPLE 2: Basic CSV-Driven Test with Test Factory
// ====================================================================
TestFactory.createDataDrivenSuite<TransferData>(
  'Example 2: Basic CSV-Driven Tests',
  'MakeATransferData',
  async function (this: { page: any; expect: any }, data: TransferData, index: number) {
    console.log(`\n=== Test ${index + 1} ===`);
    console.log(`Data:`, data);

    const navigationPage = new NavigationPage(this.page);
    const transferPage = new MoneyTransferPage(this.page);

    // Navigate to transfer page
    await navigationPage.navigateToTransferFunds();

    // Perform transfer
    await transferPage.fillTransferDetails(
      data.FromAccount,
      data.ToAccount,
      data.Amount,
      data.Description
    );
    await transferPage.continueTransfer();
    await transferPage.submitTransfer();

    // Verify success
    const isSuccess = await transferPage.verifyTransferSuccess();
    expect(isSuccess).toBe(true);
  },
  {
    // Custom test title
    titleGenerator: (data, index) => 
      `Test ${index + 1}: Transfer $${data.Amount} - ${data.Description}`,
    
    // Use authenticated fixture (auto-login)
    useAuthentication: true,
  }
);

// ====================================================================
// EXAMPLE 3: CSV Test with Before/After Hooks
// ====================================================================
TestFactory.createDataDrivenSuite<TransferData>(
  'Example 3: Tests with Hooks',
  'MakeATransferData',
  async function (this: { page: any; expect: any }, data: TransferData, index: number) {
    const navigationPage = new NavigationPage(this.page);
    const transferPage = new MoneyTransferPage(this.page);

    await navigationPage.navigateToTransferFunds();
    await transferPage.performTransfer(
      data.FromAccount,
      data.ToAccount,
      data.Amount,
      data.Description
    );

    const isSuccess = await transferPage.verifyTransferSuccess();
    expect(isSuccess).toBe(true);
  },
  {
    titleGenerator: (data) => `Transfer: ${data.Description}`,
    useAuthentication: true,
    
    // Before each test hook
    beforeEachTest: async (data) => {
      console.log('\n=================================');
      console.log('🚀 Starting Transfer Test');
      console.log(`   Amount: $${data.Amount}`);
      console.log(`   From: ${data.FromAccount.split('(')[0].trim()}`);
      console.log(`   To: ${data.ToAccount.split('(')[0].trim()}`);
      console.log('=================================');
    },
    
    // After each test hook
    afterEachTest: async (data) => {
      console.log('\n=================================');
      console.log('✅ Transfer Test Completed');
      console.log(`   Description: ${data.Description}`);
      console.log('=================================\n');
    },
  }
);

// ====================================================================
// EXAMPLE 4: Filtered CSV Tests
// ====================================================================
TestFactory.createDataDrivenSuite<TransferData>(
  'Example 4: High Value Transfers (> $150)',
  'MakeATransferData',
  async function (this: { page: any; expect: any }, data: TransferData) {
    const navigationPage = new NavigationPage(this.page);
    const transferPage = new MoneyTransferPage(this.page);

    // Validate amount is indeed high value
    const amount = parseFloat(data.Amount);
    (this.expect as any)(amount).toBeGreaterThan(150);

    await navigationPage.navigateToTransferFunds();
    await transferPage.performTransfer(
      data.FromAccount,
      data.ToAccount,
      data.Amount,
      data.Description
    );

    const isSuccess = await transferPage.verifyTransferSuccess();
    (this.expect as any)(isSuccess).toBe(true);
  },
  {
    titleGenerator: (data) => `High Value: $${data.Amount}`,
    useAuthentication: true,
    
    // Custom filter - only high value transfers
    filter: (data) => 
      data.Test?.toLowerCase() === 'true' && parseFloat(data.Amount) > 150,
  }
);

// ====================================================================
// EXAMPLE 5: Grouped Tests
// ====================================================================
TestFactory.createGroupedTests<TransferData>(
  'Example 5: Transfers Grouped by Source Account',
  'MakeATransferData',
  'FromAccount', // Group by this field
  async function (this: { page: any; expect: any }, data: TransferData) {
    const navigationPage = new NavigationPage(this.page);
    const transferPage = new MoneyTransferPage(this.page);

    await navigationPage.navigateToTransferFunds();
    await transferPage.performTransfer(
      data.FromAccount,
      data.ToAccount,
      data.Amount,
      data.Description
    );

    const isSuccess = await transferPage.verifyTransferSuccess();
    (this.expect as any)(isSuccess).toBe(true);
  },
  {
    useAuthentication: true,
  }
);

// ====================================================================
// EXAMPLE 6: Manual DataStore Usage
// ====================================================================
test.describe('Example 6: Manual DataStore Usage', () => {
  // Get all runnable tests
  const transfers = DataStore.getRunnableTests<TransferData>('MakeATransferData');

  // Create tests manually
  transfers.forEach((data, index) => {
    test(`Manual test ${index + 1}: ${data.Description}`, async ({ authenticatedPage }) => {
      const navigationPage = new NavigationPage(authenticatedPage);
      const transferPage = new MoneyTransferPage(authenticatedPage);

      await navigationPage.navigateToTransferFunds();
      await transferPage.performTransfer(
        data.FromAccount,
        data.ToAccount,
        data.Amount,
        data.Description
      );

      const isSuccess = await transferPage.verifyTransferSuccess();
      expect(isSuccess).toBe(true);
    });
  });
});

// ====================================================================
// EXAMPLE 7: Custom Data Filtering
// ====================================================================
test.describe('Example 7: Custom Filtering', () => {
  // Filter for savings account transfers only
  const savingsTransfers = DataStore.getFiltered<TransferData>(
    'MakeATransferData',
    (row) => 
      row.Test === 'true' && 
      row.FromAccount.toLowerCase().includes('savings')
  );

  savingsTransfers.forEach((data, index) => {
    test(`Savings transfer ${index + 1}: ${data.Description}`, async ({ authenticatedPage }) => {
      const transferPage = new MoneyTransferPage(authenticatedPage);
      const navigationPage = new NavigationPage(authenticatedPage);

      await navigationPage.navigateToTransferFunds();
      await transferPage.performTransfer(
        data.FromAccount,
        data.ToAccount,
        data.Amount,
        data.Description
      );

      expect(await transferPage.verifyTransferSuccess()).toBe(true);
    });
  });
});

// ====================================================================
// EXAMPLE 8: Login Tests with Multiple Credentials
// ====================================================================
TestFactory.createDataDrivenSuite<LoginCredentials>(
  'Example 8: Login with Multiple Users',
  'loginCredentials',
  async function (this: { page: any; expect: any }, data: LoginCredentials, index: number) {
    const loginPage = new LoginPage(this.page);

    // Navigate to login
    await loginPage.navigateToLoginPage();

    // Perform login
    await loginPage.login(data.Login, data.Password);
    await loginPage.submitLoginForm();

    // Verify success
    const isLoggedIn = await loginPage.verifyLoginSuccess();
    (this.expect as any)(isLoggedIn).toBe(true);

    // Logout
    await loginPage.logout();
  },
  {
    titleGenerator: (data, index) => `Login as "${data.Login}"`,
    useAuthentication: false, // Don't use fixture for login tests
    beforeEachTest: async (data) => {
      console.log(`\n👤 Testing login for user: ${data.Login}`);
    },
  }
);

// ====================================================================
// EXAMPLE 9: Data Validation
// ====================================================================
test.describe('Example 9: Data Validation', () => {
  test('validate transfer data has required fields', () => {
    const validation = DataStore.validateRequiredFields<TransferData>(
      'MakeATransferData',
      ['FromAccount', 'ToAccount', 'Amount', 'Description']
    );

    if (!validation.valid) {
      console.error('❌ Validation errors found:');
      validation.errors.forEach(error => console.error(`   - ${error}`));
    }

    expect(validation.valid).toBe(true);
  });

  test('validate login data has required fields', () => {
    const validation = DataStore.validateRequiredFields<LoginCredentials>(
      'loginCredentials',
      ['Login', 'Password']
    );

    expect(validation.valid).toBe(true);
  });
});

// ====================================================================
// EXAMPLE 10: Performance Testing
// ====================================================================
test.describe('Example 10: Performance Testing', () => {
  test('measure page load performance', async ({ authenticatedPage }) => {
    const { BasePage } = require('../../pages/Common/basePageEnhanced');
    const basePage = new BasePage(authenticatedPage);

    // Get performance metrics
    const metrics = await basePage.getPerformanceMetrics();

    console.log('\n📊 Performance Metrics:');
    console.log(`   Load Time: ${metrics.loadTime}ms`);
    console.log(`   DOM Ready: ${metrics.domReadyTime}ms`);
    console.log(`   Response Time: ${metrics.responseTime}ms`);

    // Assert performance thresholds
    expect(metrics.loadTime).toBeLessThan(5000); // 5 seconds
    expect(metrics.domReadyTime).toBeLessThan(3000); // 3 seconds
  });
});

// ====================================================================
// EXAMPLE 11: Negative Testing
// ====================================================================
TestFactory.createDataDrivenSuite<LoginCredentials>(
  'Example 11: Negative Login Tests',
  'loginCredentials',
  async function (this: { page: any; expect: any }, data: LoginCredentials) {
    const loginPage = new LoginPage(this.page);

    await loginPage.navigateToLoginPage();
    await loginPage.login(data.Login, data.Password);
    
    // Click login button
    await (loginPage as any).signInButton.click();
    await this.page.waitForTimeout(2000);

    // Should remain on login page
    (this.expect as any)(this.page.url()).toContain('login');
    
    // Should show error (if implemented)
    const error = await (loginPage as any).getLoginError?.() || 'No error';
    console.log(`Error message: ${error}`);
  },
  {
    titleGenerator: (data) => `Invalid login: "${data.Login}"`,
    filter: (data) => data.Test?.toLowerCase() === 'false', // Only invalid credentials
    useAuthentication: false,
  }
);

// ====================================================================
// EXAMPLE 12: Screenshot on Action
// ====================================================================
test.describe('Example 12: Screenshots', () => {
  test('take screenshots during transfer', async ({ authenticatedPage }) => {
    const { BasePage } = require('../../pages/Common/basePageEnhanced');
    const basePage = new BasePage(authenticatedPage);
    const navigationPage = new NavigationPage(authenticatedPage);
    const transferPage = new MoneyTransferPage(authenticatedPage);

    // Navigate
    await navigationPage.navigateToTransferFunds();
    await basePage.takeScreenshot('01-transfer-page');

    // Fill form
    await transferPage.fillTransferDetails(
      'Savings(Avail. balance = $ 1548)',
      'Checking(Avail. balance = $ 1000)',
      '25',
      'Screenshot test'
    );
    await basePage.takeScreenshot('02-form-filled');

    // Continue
    await transferPage.continueTransfer();
    await basePage.takeScreenshot('03-confirmation-page');

    // Submit
    await transferPage.submitTransfer();
    await basePage.takeScreenshot('04-success-page');

    expect(await transferPage.verifyTransferSuccess()).toBe(true);
  });
});

/**
 * ====================================================================
 * KEY TAKEAWAYS
 * ====================================================================
 * 
 * 1. Use `authenticatedPage` fixture for tests that need login
 * 2. Use TestFactory for CSV-driven tests
 * 3. Add custom filters for specific test scenarios
 * 4. Use beforeEachTest/afterEachTest for setup/cleanup
 * 5. Group tests logically with test.describe
 * 6. Use titleGenerator for meaningful test names
 * 7. Validate data before running tests
 * 8. Take screenshots for debugging
 * 9. Measure performance when needed
 * 10. Test both positive and negative scenarios
 * 
 * Happy Testing! 🚀
 */