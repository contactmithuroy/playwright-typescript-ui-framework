import { Locator, Page } from '@playwright/test';
import { BasePage } from '../Common/basePage';

export class PurchaseCurrencyPage extends BasePage {

    readonly currencySelect: Locator;
    readonly amountInput: Locator;
    readonly purchaseButton: Locator;
    readonly successMessage: Locator;
    readonly usdRadioButton: Locator;
    readonly othersRadioButton: Locator;

    constructor(page: Page) {
        super(page);
        this.currencySelect = page.locator('#pc_currency'); 
        this.amountInput = page.locator('#pc_amount');
        this.purchaseButton = page.locator('#purchase_cash');
        this.usdRadioButton = page.locator('#pc_inDollars_true');
        this.othersRadioButton = page.locator('#pc_inDollars_false');
        this.successMessage = page.locator("#alert_content").getByText("Foreign currency cash was successfully purchased.");
    }

    async fillPurchaseCurrencyDetails(
        currency: string,
        amount: string,
        currencyInUSDorOthers: string
    ): Promise<void> {
        this.log(`Filling purchase currency details: ${amount} of ${currency}`);
        await this.currencySelect.selectOption(currency);
        await this.amountInput.fill(amount);
        // Handle currency type selection if needed
        if (currencyInUSDorOthers.toLowerCase() === 'usd') {
            await this.usdRadioButton.check();
        } else {
            await this.othersRadioButton.check();
        }
    }
    async submitPurchase(): Promise<void> {
        this.log('Submitting purchase currency form');
        await this.purchaseButton.click();
    }
    async verifyPurchaseSuccess(): Promise<boolean> {
        this.log('Verifying purchase currency success message');
        try {
            await this.waitForElement(this.successMessage);
            return await this.successMessage.isVisible();
        } catch (error) {
            this.logError('Purchase currency success message not found', error);
            return false;
        }
    }
}   