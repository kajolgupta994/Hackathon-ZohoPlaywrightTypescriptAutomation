import { Page, Locator } from '@playwright/test';
import { Logger } from './logger';
import { getErrorMessage } from '../utils/error-handler';
import { AIEngine } from './ai-engine';

/**
 * Self-Healing Locator System
 * Automatically adapts to UI changes using multiple fallback strategies
 */
export class SelfHealingLocators {
  private logger: Logger;
  private aiEngine: AIEngine;
  private locatorCache: Map<string, string> = new Map();

  constructor() {
    this.logger = new Logger('SelfHealingLocators');
    this.aiEngine = new AIEngine();
  }

  /**
   * Get a self-healing locator with multiple fallback strategies
   */
  async getLocator(page: Page, description: string, options?: {
    timeout?: number;
    useAI?: boolean;
    fallbackStrategies?: string[];
  }): Promise<Locator> {
    const { timeout = 10000, useAI = true, fallbackStrategies = [] } = options || {};
    
    try {
      // Try cached locator first
      const cachedLocator = this.locatorCache.get(description);
      if (cachedLocator) {
        const locator = page.locator(cachedLocator);
        if (await this.isElementVisible(locator, 1000)) {
          this.logger.debug(`Using cached locator for: ${description}`);
          return locator;
        }
      }

      // Generate fallback strategies
      const strategies = await this.generateFallbackStrategies(description, page, useAI);
      const allStrategies = [...strategies, ...fallbackStrategies];

      // Try each strategy until one works
      for (const strategy of allStrategies) {
        try {
          const locator = page.locator(strategy);
          if (await this.isElementVisible(locator, timeout)) {
            this.logger.selfHealingLocator(description, strategy, true);
            this.locatorCache.set(description, strategy);
            return locator;
          }
        } catch (error) {
          this.logger.debug(`Strategy failed: ${strategy}`, { error: getErrorMessage(error) });
        }
      }

      throw new Error(`No working locator found for: ${description}`);
    } catch (error) {
      this.logger.error(`Failed to find locator for: ${description}`, { error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Generate multiple fallback strategies for an element
   */
  private async generateFallbackStrategies(description: string, page: Page, useAI: boolean): Promise<string[]> {
    const strategies: string[] = [];

    // Basic strategies
    strategies.push(
      `[data-testid*="${this.sanitizeDescription(description)}"]`,
      `[aria-label*="${this.sanitizeDescription(description)}"]`,
      `text=${description}`,
      `[title*="${this.sanitizeDescription(description)}"]`,
      `[placeholder*="${this.sanitizeDescription(description)}"]`
    );

    // Role-based strategies
    if (description.toLowerCase().includes('button')) {
      strategies.push('button', '[role="button"]');
    }
    if (description.toLowerCase().includes('input') || description.toLowerCase().includes('field')) {
      strategies.push('input', '[role="textbox"]', '[role="searchbox"]');
    }
    if (description.toLowerCase().includes('link')) {
      strategies.push('a', '[role="link"]');
    }

    // AI-generated strategies
    if (useAI) {
      try {
        const aiStrategies = await this.aiEngine.generateSelfHealingLocator(description, page);
        strategies.push(...this.parseAIStrategies(aiStrategies));
      } catch (error) {
        this.logger.warn('AI strategy generation failed, using fallback strategies', { error: getErrorMessage(error) });
      }
    }

    return strategies;
  }

  /**
   * Check if element is visible and interactable
   */
  private async isElementVisible(locator: Locator, timeout: number): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Sanitize description for use in selectors
   */
  private sanitizeDescription(description: string): string {
    return description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  /**
   * Parse AI-generated strategies
   */
  private parseAIStrategies(aiResponse: string): string[] {
    // Simple parsing - extract quoted strings
    const matches = aiResponse.match(/"([^"]+)"/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  }

  /**
   * Clear locator cache
   */
  clearCache(): void {
    this.locatorCache.clear();
    this.logger.info('Locator cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.locatorCache.size,
      keys: Array.from(this.locatorCache.keys())
    };
  }
}
