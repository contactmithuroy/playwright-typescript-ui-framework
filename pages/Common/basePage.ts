import { Page, Locator } from '@playwright/test';


export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigate to a path with error handling
   */
  protected async navigateTo(path: string): Promise<void> {
    try {
      await this.page.goto(path, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      this.log(`Navigated to: ${path}`);
    } catch (error) {
      this.logError(`Navigation failed to ${path}`, error);
      throw error;
    }
  }

  /**
   * Wait for element with better error messaging
   */
  protected async waitForElement(
    locator: Locator,
    options?: { timeout?: number; state?: 'attached' | 'visible' | 'hidden' }
  ): Promise<void> {
    try {
      await locator.waitFor({
        timeout: options?.timeout || 10000,
        state: options?.state || 'visible',
      });
    } catch (error) {
      this.logError(`Element not found: ${locator}`, error);
      throw error;
    }
  }

  /**
   * Safe click with retry logic
   */
  protected async safeClick(
    locator: Locator,
    options?: { timeout?: number; retries?: number }
  ): Promise<void> {
    const retries = options?.retries || 3;
    const timeout = options?.timeout || 10000;

    for (let i = 0; i < retries; i++) {
      try {
        await locator.click({ timeout });
        return;
      } catch (error) {
        if (i === retries - 1) {
          this.logError(`Click failed after ${retries} attempts`, error);
          throw error;
        }
        this.log(`Click attempt ${i + 1} failed, retrying...`);
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Safe fill with clear and retry
   */
  protected async safeFill(
    locator: Locator,
    value: string,
    options?: { clear?: boolean; timeout?: number }
  ): Promise<void> {
    const { clear = true, timeout = 10000 } = options || {};

    try {
      await locator.waitFor({ state: 'visible', timeout });

      if (clear) {
        await locator.clear({ timeout });
      }

      await locator.fill(value, { timeout });
      this.log(`Filled input with value: ${value}`);
    } catch (error) {
      this.logError(`Fill failed for value: ${value}`, error);
      throw error;
    }
  }

  /**
   * Get current page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<Buffer> {
    const screenshot = await this.page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: true,
    });
    this.log(`Screenshot taken: ${name}`);
    return screenshot;
  }

  /**
   * Wait for page load
   */
  protected async waitForPageLoad(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle'
  ): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  /**
   * Check if element exists
   */
  protected async elementExists(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'attached', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get element text safely
   */
  protected async getElementText(locator: Locator): Promise<string> {
    try {
      await this.waitForElement(locator);
      return await locator.textContent() || '';
    } catch (error) {
      this.logError('Failed to get element text', error);
      return '';
    }
  }

  /**
   * Scroll to element
   */
  protected async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Logging utility
   */
  protected log(message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.constructor.name}] ${message}`);
  }

  /**
   * Error logging utility
   */
  protected logError(message: string, error: any): void {
    const timestamp = new Date().toISOString();
    console.error(
      `[${timestamp}] [${this.constructor.name}] ERROR: ${message}`,
      error
    );
  }

  /**
   * Wait for specific duration
   */
  protected async wait(milliseconds: number): Promise<void> {
    await this.page.waitForTimeout(milliseconds);
  }

  /**
   * Execute JavaScript in page context
   */
  protected async executeScript<T>(script: string | Function, ...args: any[]): Promise<T> {
    return await this.page.evaluate(script as any, ...args);
  }

  /**
   * Get page performance metrics
   */
  async getPerformanceMetrics(): Promise<any> {
    return await this.page.evaluate(() => {
      const perfData = window.performance.timing;
      return {
        loadTime: perfData.loadEventEnd - perfData.navigationStart,
        domReadyTime: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        responseTime: perfData.responseEnd - perfData.requestStart,
      };
    });
  }
}