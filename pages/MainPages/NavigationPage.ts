import { Page, Locator } from '@playwright/test';
import { BasePage } from '../Common/basePage';


export class NavigationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate through menu system
   */
  async navigationMenu(mainMenu: string, subMenu?: string): Promise<void> {
    this.log(`Navigating to: ${mainMenu}${subMenu ? ' > ' + subMenu : ''}`);

    try {
      // Click main menu
      const mainMenuLocator = this.page.getByText(mainMenu, { exact: false });
      await this.waitForElement(mainMenuLocator);
      await this.safeClick(mainMenuLocator);

      // Click sub-menu if provided
      if (subMenu) {
        const subMenuLocator = this.page.getByText(subMenu, { exact: false });
        await this.waitForElement(subMenuLocator);
        await this.safeClick(subMenuLocator);
        this.log(`Sub-menu clicked: ${subMenu}`);
      }

      await this.waitForPageLoad('networkidle');
      this.log('Navigation completed successfully');
    } catch (error) {
      this.logError(
        `Navigation failed for menu ${mainMenu}${subMenu ? ' > ' + subMenu : ''}`,
        error
      );
      throw error;
    }
  }

  /**
   * Navigate by menu path (e.g., "Account Activity > Find Transactions")
   */
  async navigateByPath(menuPath: string): Promise<void> {
    const menuItems = menuPath.split('>').map(item => item.trim());

    if (menuItems.length === 0) {
      throw new Error('Menu path cannot be empty');
    }

    const [mainMenu, ...subMenus] = menuItems;
    await this.navigationMenu(mainMenu, subMenus.join(' > '));
  }


  /**
   * Navigate to specific pages directly
   */
  async navigateToAccountSummary(): Promise<void> {
    await this.navigationMenu('Account Summary');
  }

  async navigateToAccountActivity(): Promise<void> {
    await this.navigationMenu('Account Activity');
  }

  async navigateToTransferFunds(): Promise<void> {
    await this.navigationMenu('Transfer Funds');
  }

  async navigateToPayBills(): Promise<void> {
    await this.navigationMenu('Pay Bills');
  }

  async navigateToMyMoneyMap(): Promise<void> {
    await this.navigationMenu('My Money Map');
  }

  async navigateToOnlineStatements(): Promise<void> {
    await this.navigationMenu('Online Statements');
  }
}