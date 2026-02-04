import { Page } from '@playwright/test';

export class BasePage {
    constructor(protected page: Page) {}

    protected async navigateTo(path: string): Promise<void> {
        await this.page.goto(path);
    }
}