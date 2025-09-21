import { Page, Locator, expect } from '@playwright/test';
import { Logger } from './logger';
import { AIEngine } from './ai-engine';

/**
 * Smart Wait System
 * Intelligent waiting strategies that adapt to different scenarios
 */
export class SmartWaits {
  private logger: Logger;
  private aiEngine: AIEngine;

  constructor() {
    this.logger = new Logger('SmartWaits');
    this.aiEngine = new AIEngine();
  }

  /**
   * Wait for element with intelligent strategies
   */
  async waitForElement(
    page: Page,
    locator: Locator,
    options?: {
      timeout?: number;
      state?: 'visible' | 'hidden' | 'attached' | 'detached';
      useAI?: boolean;
      customConditions?: string[];
    }
  ): Promise<void> {
    const { timeout = 30000, state = 'visible', useAI = true, customConditions = [] } = options || {};

    try {
      // Basic wait
      await locator.waitFor({ state, timeout });

      // AI-enhanced waiting
      if (useAI) {
        await this.aiEnhancedWait(page, locator, timeout, customConditions);
      }

      this.logger.debug(`Element waited successfully: ${locator.toString()}`);
    } catch (error) {
      this.logger.error(`Element wait failed: ${locator.toString()}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Wait for network requests to complete
   */
  async waitForNetworkIdle(page: Page, timeout: number = 5000): Promise<void> {
    try {
      await page.waitForLoadState('networkidle', { timeout });
      this.logger.debug('Network idle state reached');
    } catch (error) {
      this.logger.warn('Network idle wait timeout', { error: error.message });
    }
  }

  /**
   * Wait for specific API calls to complete
   */
  async waitForAPIResponse(page: Page, apiPattern: string | RegExp, timeout: number = 10000): Promise<void> {
    try {
      await page.waitForResponse(apiPattern, { timeout });
      this.logger.debug(`API response received: ${apiPattern}`);
    } catch (error) {
      this.logger.error(`API wait timeout: ${apiPattern}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Wait for animations to complete
   */
  async waitForAnimations(page: Page, timeout: number = 3000): Promise<void> {
    try {
      // Wait for CSS transitions and animations to complete
      await page.evaluate(() => {
        return new Promise<void>((resolve) => {
          const animations = document.getAnimations();
          if (animations.length === 0) {
            resolve();
            return;
          }

          Promise.all(animations.map(animation => animation.finished))
            .then(() => resolve())
            .catch(() => resolve()); // Resolve even if some animations fail
        });
      });

      // Additional wait for any remaining transitions
      await page.waitForTimeout(100);
      this.logger.debug('Animations completed');
    } catch (error) {
      this.logger.warn('Animation wait failed', { error: error.message });
    }
  }

  /**
   * Wait for element to be stable (no position/size changes)
   */
  async waitForElementStable(locator: Locator, timeout: number = 2000): Promise<void> {
    try {
      let previousBox = await locator.boundingBox();
      let stableCount = 0;
      const requiredStableChecks = 3;

      while (stableCount < requiredStableChecks) {
        await locator.page().waitForTimeout(100);
        const currentBox = await locator.boundingBox();

        if (previousBox && currentBox &&
            Math.abs(previousBox.x - currentBox.x) < 1 &&
            Math.abs(previousBox.y - currentBox.y) < 1 &&
            Math.abs(previousBox.width - currentBox.width) < 1 &&
            Math.abs(previousBox.height - currentBox.height) < 1) {
          stableCount++;
        } else {
          stableCount = 0;
        }

        previousBox = currentBox;
      }

      this.logger.debug('Element is stable');
    } catch (error) {
      this.logger.warn('Element stability check failed', { error: error.message });
    }
  }

  /**
   * AI-enhanced waiting with custom conditions
   */
  private async aiEnhancedWait(
    page: Page,
    locator: Locator,
    timeout: number,
    customConditions: string[]
  ): Promise<void> {
    try {
      const elementDescription = await this.getElementDescription(locator);
      const smartWaitCode = await this.aiEngine.generateSmartWait(elementDescription, 'visible');

      // Execute AI-generated wait conditions
      if (smartWaitCode) {
        await this.executeSmartWait(page, smartWaitCode, timeout);
      }

      // Execute custom conditions
      for (const condition of customConditions) {
        await this.executeCustomCondition(page, condition, timeout);
      }
    } catch (error) {
      this.logger.warn('AI-enhanced wait failed, using basic wait', { error: error.message });
    }
  }

  /**
   * Get element description for AI processing
   */
  private async getElementDescription(locator: Locator): Promise<string> {
    try {
      const tagName = await locator.evaluate(el => el.tagName);
      const text = await locator.textContent();
      const role = await locator.getAttribute('role');
      const ariaLabel = await locator.getAttribute('aria-label');

      return `${tagName}${text ? ` with text "${text}"` : ''}${role ? ` with role "${role}"` : ''}${ariaLabel ? ` with aria-label "${ariaLabel}"` : ''}`;
    } catch {
      return 'element';
    }
  }

  /**
   * Execute AI-generated wait code
   */
  private async executeSmartWait(page: Page, waitCode: string, timeout: number): Promise<void> {
    try {
      // Parse and execute the AI-generated wait code
      // This is a simplified implementation - in production, use proper AST parsing
      if (waitCode.includes('waitForLoadState')) {
        await page.waitForLoadState('networkidle', { timeout });
      }
      if (waitCode.includes('waitForResponse')) {
        // Extract API pattern from the code and wait for it
        const apiMatch = waitCode.match(/waitForResponse\(['"`]([^'"`]+)['"`]\)/);
        if (apiMatch) {
          await page.waitForResponse(apiMatch[1], { timeout });
        }
      }
    } catch (error) {
      this.logger.warn('Smart wait execution failed', { error: error.message });
    }
  }

  /**
   * Execute custom wait condition
   */
  private async executeCustomCondition(page: Page, condition: string, timeout: number): Promise<void> {
    try {
      // Support for common custom conditions
      if (condition.includes('url')) {
        const urlMatch = condition.match(/url\s*===\s*['"`]([^'"`]+)['"`]/);
        if (urlMatch) {
          await page.waitForURL(urlMatch[1], { timeout });
        }
      }
      if (condition.includes('function')) {
        // Execute custom function condition
        await page.waitForFunction(condition, { timeout });
      }
    } catch (error) {
      this.logger.warn(`Custom condition failed: ${condition}`, { error: error.message });
    }
  }

  /**
   * Wait for multiple conditions to be true
   */
  async waitForAllConditions(
    page: Page,
    conditions: Array<() => Promise<boolean>>,
    timeout: number = 10000
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const results = await Promise.all(conditions.map(condition => condition()));
        if (results.every(result => result)) {
          this.logger.debug('All conditions met');
          return;
        }
      } catch (error) {
        this.logger.debug('Condition check failed', { error: error.message });
      }
      
      await page.waitForTimeout(100);
    }
    
    throw new Error('Timeout waiting for all conditions');
  }
}
