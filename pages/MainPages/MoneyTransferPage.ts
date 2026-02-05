import { Locator, Page } from '@playwright/test';
import { BasePage } from '../Common/basePage';

/**
 * Enhanced Money Transfer Page Object
 */
export class MoneyTransferPage extends BasePage {
  // Locators
  readonly fromAccount: Locator;
  readonly toAccount: Locator;
  readonly amountInput: Locator;
  readonly descriptionInput: Locator;
  readonly continueButton: Locator;
  readonly submitButton: Locator;
  readonly transferCompleteMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.fromAccount = page.locator('#tf_fromAccountId');
    this.toAccount = page.locator('#tf_toAccountId');
    this.amountInput = page.locator('#tf_amount');
    this.descriptionInput = page.locator('#tf_description');
    this.continueButton = page.locator('#btn_submit');
    this.submitButton = page.locator('#btn_submit');
    this.transferCompleteMessage = page.getByText(
      'You successfully submitted your transaction.'
    );
    this.errorMessage = page.locator('.alert-error');
  }

  /**
   * Fill transfer details
   */
  async fillTransferDetails(
    fromAccount: string,
    toAccount: string,
    amount: string,
    description: string
  ): Promise<void> {
    this.log(
      `Filling transfer: ${amount} from ${fromAccount} to ${toAccount}`
    );

    try {
      await this.waitForElement(this.fromAccount);

      // Select accounts
      await this.fromAccount.selectOption({ label: fromAccount });
      await this.toAccount.selectOption({ label: toAccount });

      // Fill amount and description
      await this.safeFill(this.amountInput, amount);
      await this.safeFill(this.descriptionInput, description);

      this.log('Transfer details filled successfully');
    } catch (error) {
      this.logError('Failed to fill transfer details', error);
      throw error;
    }
  }

  /**
   * Continue to transfer confirmation
   */
  async continueTransfer(): Promise<void> {
    this.log('Proceeding to confirmation');

    try {
      await Promise.all([
        this.page.waitForLoadState('networkidle', { timeout: 30000 }),
        this.safeClick(this.continueButton),
      ]);

      this.log('Navigated to confirmation page');
    } catch (error) {
      this.logError('Failed to continue transfer', error);
      throw error;
    }
  }

  /**
   * Submit transfer
   */
  async submitTransfer(): Promise<void> {
    this.log('Submitting transfer');

    try {
      await Promise.all([
        this.page.waitForLoadState('networkidle', { timeout: 30000 }),
        this.safeClick(this.submitButton),
      ]);

      this.log('Transfer submitted');
    } catch (error) {
      this.logError('Failed to submit transfer', error);
      throw error;
    }
  }

  /**
   * Verify transfer success
   */
  async verifyTransferSuccess(): Promise<boolean> {
    try {
      await this.waitForElement(this.transferCompleteMessage, { timeout: 10000 });
      const isVisible = await this.transferCompleteMessage.isVisible();

      if (isVisible) {
        this.log('Transfer completed successfully');
      }

      return isVisible;
    } catch (error) {
      this.logError('Transfer verification failed', error);

      // Check for error message
      const hasError = await this.elementExists(this.errorMessage);
      if (hasError) {
        const errorText = await this.getElementText(this.errorMessage);
        this.logError('Transfer error message', errorText);
      }

      return false;
    }
  }

  /**
   * Complete transfer flow (fill + continue + submit)
   */
  async performTransfer(
    fromAccount: string,
    toAccount: string,
    amount: string,
    description: string
  ): Promise<void> {
    await this.fillTransferDetails(fromAccount, toAccount, amount, description);
    await this.continueTransfer();
    await this.submitTransfer();
  }

  /**
   * Get transfer error message
   */
  async getTransferError(): Promise<string> {
    if (await this.elementExists(this.errorMessage)) {
      return await this.getElementText(this.errorMessage);
    }
    return '';
  }

  /**
   * Validate transfer amount format
   */
  validateAmount(amount: string): boolean {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0;
  }
}