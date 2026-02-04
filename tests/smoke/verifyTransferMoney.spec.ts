import { test, expect } from '../fixtures/customFixtures';
import { NavigationPage } from '../../pages/MainPages/NavigationPage';
import { MoneyTransferPage } from '../../pages/MainPages/MoneyTransferPage';
import { TestFactory } from '../factories/testFactory';
import { TransferData } from '../../data-models/interfaces';


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

