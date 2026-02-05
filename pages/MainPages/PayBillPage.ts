import { Locator, Page } from '@playwright/test';
import { BasePage } from '../Common/basePage';
import { expect } from '@playwright/test';

export class PayBillPage extends BasePage {
    // Locators
    readonly payeeSelect: Locator;
    readonly accountSelect: Locator;
    readonly amountInput: Locator;
    readonly dateInput: Locator;
    readonly descriptionInput: Locator;
    readonly payButton: Locator;
    readonly successMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.payeeSelect = page.locator('#sp_payee');
        this.accountSelect = page.locator('#sp_account');
        this.amountInput = page.locator('#sp_amount');
        this.dateInput = page.locator('#sp_date');
        this.descriptionInput = page.locator('#sp_description');
        this.payButton = page.locator('#pay_saved_payees');
        this.successMessage = page.locator("#alert_content").getByText("The payment was successfully submitted.");
    }

    async fillPayBillDetails(
        payee: string,
        account: string,
        amount: string,
        date: string,
        description: string
    ): Promise<void> {
        this.log(`Filling pay bill details: ${amount} to ${payee} on ${date}`);

        try {
            await this.waitForElement(this.payeeSelect);

            await this.payeeSelect.selectOption({ value: payee });

            // await this.accountSelect.locator('option', { hasText: account }).first().click();
            const optionValue = await this.accountSelect
                .locator('option')
                .filter({ hasText: account })
                .first()
                .getAttribute('value');

            if (!optionValue) {
                throw new Error(`Account option not found for label: ${account}`);
            }
            await this.accountSelect.selectOption({ value: optionValue });

            await this.amountInput.fill(amount);
            await this.dateInput.fill(date);
            await this.descriptionInput.fill(description);

            this.log('Pay bill details filled successfully');
        } catch (error) {
            this.logError('Failed to fill pay bill details', error);
            throw error;
        }
    }

    async submitPayment(): Promise<void> {
        this.log('Submitting pay bill form');
        try {
            await Promise.all([
                this.page.waitForLoadState('networkidle', { timeout: 30000 }),
                this.safeClick(this.payButton),
            ]);
            this.log('Pay bill form submitted successfully');
        } catch (error) {
            this.logError('Failed to submit pay bill form', error);
            throw error;
        }
    }

    async verifyPayBillSuccess(): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: 5000 });
    }

}
