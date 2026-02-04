import { Page, Locator } from '@playwright/test';
import { BasePage } from '../Common/basePage';

/**
 * Enhanced Navigation Page Object
 */
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
   * Get all available menu items
   */
  async getAvailableMenus(): Promise<string[]> {
    try {
      const menuLocators = await this.page.locator('#navbar li a').all();
      const menuTexts: string[] = [];

      for (const locator of menuLocators) {
        const text = await locator.textContent();
        if (text) {
          menuTexts.push(text.trim());
        }
      }

      return menuTexts;
    } catch (error) {
      this.logError('Failed to get available menus', error);
      return [];
    }
  }

  /**
   * Check if menu item exists
   */
  async menuExists(menuName: string): Promise<boolean> {
    try {
      const menuLocator = this.page.getByText(menuName, { exact: false });
      return await this.elementExists(menuLocator);
    } catch {
      return false;
    }
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