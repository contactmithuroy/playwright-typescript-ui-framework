
import { expect, Locator } from "@playwright/test";
import { Page } from "@playwright/test";
import { BasePage } from "../Common/base.page";

export class MoneyTransferPage extends BasePage {
    readonly fromAccount: Locator;
    readonly toAccount: Locator;
    readonly amountInput: Locator;
    readonly descriptionInput: Locator  
    readonly continueButton: Locator;
    readonly submitButton: Locator; 
    readonly transferCompleteMessage: Locator;


    constructor(page: Page) {
        super(page);
        this.fromAccount = page.locator("#tf_fromAccountId");
        this.toAccount = page.locator("#tf_toAccountId");
        this.amountInput = page.locator("#tf_amount");
        this.descriptionInput = page.locator("#tf_description");   
        this.continueButton = page.locator("#btn_submit");
        this.submitButton = page.locator("#btn_submit");
        this.transferCompleteMessage = page.getByText('You successfully submitted your transaction.');
    }

    async fillTransferDetails(fromAccount: string, toAccount: string, amount: string, description: string): Promise<void> {
        await this.fromAccount.selectOption({ label: fromAccount });
        await this.toAccount.selectOption({ label: toAccount });
        await this.amountInput.fill(amount);
        await this.descriptionInput.fill(description);
    }

    async continueTransfer(): Promise<void> {
        const continueButton = this.continueButton;

        await Promise.all([
            this.page.waitForLoadState('networkidle'),
            continueButton.click()
        ]);
    }

    async submitTransfer(): Promise<void> {
        const submitButton = this.submitButton;

        await Promise.all([
            this.page.waitForLoadState('networkidle'),
            submitButton.click()
        ]);
    }

    async verifyTransferSuccess(): Promise<boolean> {
        return this.transferCompleteMessage.isVisible();
    }

}
