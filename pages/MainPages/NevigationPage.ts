import { expect, Locator } from "@playwright/test";
import { Page } from "@playwright/test";
import { BasePage } from "../Common/base.page";

export class NavigationPage extends BasePage {
 
    constructor(page: Page) {
        super(page);
    }

    async navigationMenu(mainMenu: string, subMenu?: string): Promise<void> {
    try {
        const mainMenuLocator = this.page.getByText(mainMenu);
        await mainMenuLocator.click();

        if (subMenu) {
        const subMenuLocator = this.page.getByText(subMenu);
        await subMenuLocator.click();
        } else {
        console.log(`No sub-menu to click for main menu: ${mainMenu}`);
        }

    } catch (error) {
        console.error(
        `Error navigating to menu ${mainMenu}${subMenu ? ' > ' + subMenu : ''}:`,
        error
        );
    }
    }
}
