import { Page, Locator } from '@playwright/test';
import { DownloadUtil } from '../../utils/downloadUtil';
import { BasePage } from '../Common/basePage';

export class OnlineStatementsPage extends BasePage {
    // Locators
    readonly accountSelect: Locator;
    readonly yearSelect: Locator;

    constructor(page: Page) {
        super(page);
        this.accountSelect = page.locator('#os_accountId');
        this.yearSelect = page.locator('#os_year');
    }

    async downloadStatement(account: string, year: string): Promise<string> {
        this.log(`Downloading statement for account: ${account}, year: ${year}`);
        
        try {
            // Step 1: Select account first
            await this.selectAccount(account);
            
            // Step 2: Wait a bit for the page to update after account selection
            await this.page.waitForTimeout(1000);
            
            // Step 3: Select year
            await this.selectYear(year);
            
            // Step 4: Wait for the page to stabilize and statements to load
            await this.page.waitForTimeout(1000);
            
            // Step 5: Get the specific download button for this year
            const downloadButton = await this.getDownloadButtonForYear(year);
            
            // Step 6: Download the file
            const filePath = await DownloadUtil.downloadFile(this.page, async () => {
                await this.safeClick(downloadButton);
            });
            
            this.log(`Statement downloaded successfully: ${filePath}`);
            return filePath;
            
        } catch (error) {
            this.logError('Failed to download statement', error);
            throw error;
        }
    }

    /**
     * Get the download button for a specific year
     * Handles the format: "Statement 31/11/09(57K)" or "Statement 16/10/09(57K)"
     */
    private async getDownloadButtonForYear(year: string): Promise<Locator> {
        // Convert year to last 2 digits format (e.g., "2009" -> "09")
        const yearShort = year.slice(-2);
        
        // Find the link that contains "Statement" and ends with the year pattern
        // Pattern: Statement DD/MM/YY where YY matches our year
        const statementLink = this.page.locator(`//tbody//a[contains(text(),"Statement") and contains(text(),"/${yearShort}(")]`).first();
        
        // Verify it exists
        await statementLink.waitFor({ state: 'visible', timeout: 5000 });
        
        this.log(`Found statement link for year ${year}`);
        
        return statementLink;
    }

    async selectAccount(account: string): Promise<void> {
        this.log(`Selecting account: ${account}`);
        
        try {
            await this.waitForElement(this.accountSelect);
            
            // Get the option value by text
            const optionValue = await this.accountSelect
                .locator('option')
                .filter({ hasText: account })
                .first()
                .getAttribute('value');
            
            if (!optionValue) {
                throw new Error(`Account option not found for label: ${account}`);
            }
            
            // Select the option
            await this.accountSelect.selectOption({ value: optionValue });
            
            this.log(`Account selected: ${account}`);
        } catch (error) {
            this.logError('Failed to select account', error);
            throw error;
        }
    }

    async selectYear(year: string | number): Promise<void> {
        this.log(`Selecting year: ${year}`);
        
        try {
            // Wait for year links to be available
            await this.page.waitForSelector(`a:has-text("${String(year)}")`, { 
                state: 'visible',
                timeout: 5000 
            });
            
            // Click the year link
            await this.page.getByRole('link', { name: String(year) }).click();
            
            // Wait for navigation or content update
            await this.page.waitForLoadState('networkidle');
            
            this.log(`Year selected: ${year}`);
        } catch (error) {
            this.logError('Failed to select year', error);
            throw error;
        }
    }

    async deleteDownloadedStatement(filePath: string): Promise<void> {
        this.log(`Deleting downloaded statement: ${filePath}`);
        
        try {
            DownloadUtil.deleteFile(filePath);
            this.log(`Statement deleted successfully: ${filePath}`);
        } catch (error) {
            this.logError('Failed to delete downloaded statement', error);
            throw error;
        }
    }
}