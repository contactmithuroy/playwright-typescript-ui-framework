import { test, expect } from '../fixtures/customFixtures';
import { NavigationPage } from '../../pages/MainPages/NavigationPage';
import { MoneyTransferPage } from '../../pages/MainPages/MoneyTransferPage';
import { TestFactory } from '../factories/testFactory';
import { TransferData } from '../../data-models/interfaces';

/**
 *  Money Transfer Tests - Using Custom Fixtures
 */
test.describe('Money Transfer Functionality', () => {
  /**
   * Simple transfer test using fixtures
   */
  test('should transfer money successfully using fixtures', async ({
    authenticatedPage,
    testContext,
  }) => {
    // Already authenticated via fixture
    expect(testContext.authenticated).toBe(true);

    const navigationPage = new NavigationPage(authenticatedPage);
    const transferPage = new MoneyTransferPage(authenticatedPage);

    // Navigate to transfer page
    await navigationPage.navigateToTransferFunds();

    // Perform transfer
    await transferPage.performTransfer(
      'Savings(Avail. balance = $ 1548)',
      'Checking(Avail. balance = $ 1000)',
      '50',
      'Test transfer'
    );

    // Verify success
    const isSuccess = await transferPage.verifyTransferSuccess();
    expect(isSuccess).toBe(true);
  });
});

/**
 * CSV-Driven Money Transfer Tests - Using Test Factory
 */
TestFactory.createDataDrivenSuite<TransferData>(
  'CSV-Driven Money Transfer Tests',
  'MakeATransferData',
  async function (this: { page: any; expect: any }, data: TransferData, index: number) {
    const navigationPage = new NavigationPage(this.page);
    const transferPage = new MoneyTransferPage(this.page);

    // Validate amount
    const isValidAmount = transferPage.validateAmount(data.Amount);
    (this.expect as any)(isValidAmount).toBe(true);

    // Navigate to transfer page
    await navigationPage.navigateToTransferFunds();

    // Fill transfer details
    await transferPage.fillTransferDetails(
      data.FromAccount,
      data.ToAccount,
      data.Amount,
      data.Description
    );

    // Continue to confirmation
    await transferPage.continueTransfer();

    // Submit transfer
    await transferPage.submitTransfer();

    // Verify success
    const isSuccess = await transferPage.verifyTransferSuccess();
    (this.expect as any)(isSuccess).toBe(true);
  },
  {
    titleGenerator: (data, index) =>
      `Transfer ${data.Amount} from ${data.FromAccount.split('(')[0].trim()} to ${data.ToAccount.split('(')[0].trim()}`,
    useAuthentication: true, // Use the authenticated fixture
    beforeEachTest: async (data) => {
      console.log(`\n=== Starting Transfer Test ===`);
      console.log(`Amount: $${data.Amount}`);
      console.log(`From: ${data.FromAccount}`);
      console.log(`To: ${data.ToAccount}`);
      console.log(`Description: ${data.Description}`);
    },
    afterEachTest: async (data) => {
      console.log(`Transfer test completed for $${data.Amount}`);
      console.log(`=== End Transfer Test ===\n`);
    },
  }
);

/**
 * Grouped Transfer Tests - By Source Account
 */
TestFactory.createGroupedTests<TransferData>(
  'Money Transfers Grouped by Source Account',
  'MakeATransferData',
  'FromAccount',
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

/**
 * Custom Filtered Transfer Tests - High Value Transfers Only
 */
TestFactory.createDataDrivenSuite<TransferData>(
  'High Value Transfer Tests (Amount > 100)',
  'MakeATransferData',
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
    titleGenerator: (data) => `High value transfer: $${data.Amount}`,
    filter: (data) =>
      data.Test?.toLowerCase() === 'true' && parseFloat(data.Amount) > 100,
    useAuthentication: true,
  }
);

/**
 * Individual Test with Manual Control
 */
test.describe('Manual Transfer Tests', () => {
  test('should handle transfer with detailed validation', async ({
    authenticatedPage,
  }) => {
    const navigationPage = new NavigationPage(authenticatedPage);
    const transferPage = new MoneyTransferPage(authenticatedPage);

    // Navigate
    await navigationPage.navigateToTransferFunds();

    // Fill details step by step
    await transferPage.fromAccount.selectOption({
      label: 'Savings(Avail. balance = $ 1548)',
    });
    await transferPage.toAccount.selectOption({
      label: 'Checking(Avail. balance = $ 1000)',
    });
    await transferPage.amountInput.fill('75');
    await transferPage.descriptionInput.fill('Manual test transfer');

    // Take screenshot before submission
    await authenticatedPage.screenshot({
      path: 'screenshots/transfer-before-submit.png',
    });

    // Continue
    await transferPage.continueTransfer();

    // Submit
    await transferPage.submitTransfer();

    // Verify
    const isSuccess = await transferPage.verifyTransferSuccess();
    expect(isSuccess).toBe(true);

    // Take screenshot after success
    await authenticatedPage.screenshot({
      path: 'screenshots/transfer-success.png',
    });
  });
});