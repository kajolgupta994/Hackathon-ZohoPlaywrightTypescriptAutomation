import { Page, Locator, expect } from '@playwright/test';
import { SelfHealingLocators } from '../core/self-healing-locators';
import { SmartWaits } from '../core/smart-waits';
import { VisualValidator } from '../core/visual-validator';
import { Logger } from '../core/logger';
import { getErrorMessage } from '../utils/error-handler';

/**
 * Page Object Base Class for Web Applications
 * Implements AI-driven automation patterns and common page interactions
 */
export class PageObjectBase {
  protected page: Page;
  protected selfHealingLocators: SelfHealingLocators;
  protected smartWaits: SmartWaits;
  protected visualValidator: VisualValidator;
  protected logger: Logger;

  // Common locators (optional - may not exist in all apps)
  protected readonly header: Locator;
  protected readonly navigation: Locator;
  protected readonly mainContent: Locator;
  protected readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.selfHealingLocators = new SelfHealingLocators();
    this.smartWaits = new SmartWaits();
    this.visualValidator = new VisualValidator();
    this.logger = new Logger('PageObjectBase');

    // Initialize common locators
    this.header = page.locator('header, [role="banner"]');
    this.navigation = page.locator('nav, [role="navigation"]');
    this.mainContent = page.locator('main, [role="main"]');
    this.footer = page.locator('footer, [role="contentinfo"]');
  }

  /**
   * Navigate to a URL
   */
  async navigateTo(url?: string): Promise<void> {
    const targetUrl = url || process.env.BASE_URL || 'http://localhost:3000';
    await this.page.goto(targetUrl);
    await this.smartWaits.waitForNetworkIdle(this.page);
    await this.waitForAppReady();
    this.logger.info(`Navigated to ${targetUrl}`);
  }

  /**
   * Wait for application to be ready
   */
  async waitForAppReady(): Promise<void> {
    // Wait for page to be loaded
    await this.page.waitForLoadState('networkidle');
    
    // Wait for critical elements to be visible (header is optional for simple apps)
    try {
      await this.smartWaits.waitForElement(this.page, this.header, { timeout: 5000 });
    } catch {
      // Header not found, which is fine for simple login apps
      this.logger.debug('Header not found - app might be a simple form');
    }
    
    // Wait for main content or form elements
    try {
      await this.smartWaits.waitForElement(this.page, this.mainContent, { timeout: 5000 });
    } catch {
      // Main content not found, try to find form elements instead
      const formElements = this.page.locator('input, button, form');
      if (await formElements.count() > 0) {
        await this.smartWaits.waitForElement(this.page, formElements.first(), { timeout: 5000 });
      }
    }
    
    // Wait for any loading indicators to disappear
    const loadingSelectors = [
      '[data-testid="loading"]',
      '.loading',
      '.spinner',
      '[aria-label*="loading" i]'
    ];
    
    for (const selector of loadingSelectors) {
      try {
        const loadingElement = this.page.locator(selector);
        if (await loadingElement.isVisible()) {
          await loadingElement.waitFor({ state: 'hidden', timeout: 5000 });
        }
      } catch {
        // Loading element not found or already hidden, continue
      }
    }
  }

  /**
   * Get self-healing locator for an element
   */
  async getLocator(description: string, options?: any): Promise<Locator> {
    return await this.selfHealingLocators.getLocator(this.page, description, options);
  }

  /**
   * Click element with smart wait
   */
  async clickElement(description: string, options?: any): Promise<void> {
    const locator = await this.getLocator(description, options);
    await this.smartWaits.waitForElement(this.page, locator);
    await locator.click();
    await this.smartWaits.waitForAnimations(this.page);
    this.logger.debug(`Clicked element: ${description}`);
  }

  /**
   * Fill input field with smart wait
   */
  async fillInput(description: string, value: string, options?: any): Promise<void> {
    const locator = await this.getLocator(description, options);
    await this.smartWaits.waitForElement(this.page, locator);
    await locator.clear();
    await locator.fill(value);
    await this.smartWaits.waitForElementStable(locator);
    this.logger.debug(`Filled input: ${description} with value: ${value}`);
  }

  /**
   * Select option from dropdown
   */
  async selectOption(description: string, value: string, options?: any): Promise<void> {
    const locator = await this.getLocator(description, options);
    await this.smartWaits.waitForElement(this.page, locator);
    await locator.selectOption(value);
    await this.smartWaits.waitForAnimations(this.page);
    this.logger.debug(`Selected option: ${value} from ${description}`);
  }

  /**
   * Wait for text to be visible
   */
  async waitForText(text: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForSelector(`text=${text}`, { timeout });
    this.logger.debug(`Text appeared: ${text}`);
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(description: string, timeout: number = 10000): Promise<void> {
    const locator = await this.getLocator(description);
    await this.smartWaits.waitForElement(this.page, locator, { timeout });
  }

  /**
   * Verify element is visible
   */
  async verifyElementVisible(description: string): Promise<void> {
    const locator = await this.getLocator(description);
    await expect(locator).toBeVisible();
    this.logger.debug(`Verified element visible: ${description}`);
  }

  /**
   * Verify text content
   */
  async verifyText(description: string, expectedText: string): Promise<void> {
    const locator = await this.getLocator(description);
    await expect(locator).toHaveText(expectedText);
    this.logger.debug(`Verified text: ${description} contains "${expectedText}"`);
  }

  /**
   * Verify URL contains text
   */
  async verifyUrlContains(text: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(text));
    this.logger.debug(`Verified URL contains: ${text}`);
  }

  /**
   * Take screenshot for visual testing
   */
  async takeScreenshot(name: string, options?: any): Promise<string> {
    const screenshotPath = `test-results/screenshots/${name}-${Date.now()}.png`;
    await this.page.screenshot({ path: screenshotPath, ...options });
    this.logger.debug(`Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  }

  /**
   * Perform visual comparison
   */
  async compareVisual(selector: string, testName: string, options?: any): Promise<any> {
    return await this.visualValidator.compareVisual(this.page, selector, testName, options);
  }

  /**
   * Wait for API response
   */
  async waitForAPIResponse(apiPattern: string | RegExp, timeout: number = 10000): Promise<void> {
    await this.smartWaits.waitForAPIResponse(this.page, apiPattern, timeout);
  }

  /**
   * Get page title
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
   * Refresh page
   */
  async refresh(): Promise<void> {
    await this.page.reload();
    await this.waitForAppReady();
    this.logger.debug('Page refreshed');
  }

  /**
   * Go back
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForAppReady();
    this.logger.debug('Navigated back');
  }

  /**
   * Go forward
   */
  async goForward(): Promise<void> {
    await this.page.goForward();
    await this.waitForAppReady();
    this.logger.debug('Navigated forward');
  }


  /**
   * Clean up page resources
   */
  async cleanup(): Promise<void> {
    // Clear any test data
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    this.logger.debug('Page cleanup completed');
  }
}
