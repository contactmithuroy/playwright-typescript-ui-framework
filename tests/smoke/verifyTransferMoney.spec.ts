import { test } from '../fixtures/customFixtures';
import { NavigationPage } from '../../pages/MainPages/NavigationPage';
import { MoneyTransferPage } from '../../pages/MainPages/MoneyTransferPage';
import { TestFactory } from '../factories/testFactory';
import { TransferData } from '../../data-models/interfaces';

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

    // Navigate to transfer page - use MainMenu and optional SubMenu from CSV
    if (data.SubMenu && data.SubMenu.trim()) {
      await navigationPage.navigationMenu(data.MainMenu, data.SubMenu);
    } else {
      await navigationPage.navigationMenu(data.MainMenu);
    }

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
      `${data.TestId}: ${data.TestTitle}`,
    useAuthentication: true,
  }
);

