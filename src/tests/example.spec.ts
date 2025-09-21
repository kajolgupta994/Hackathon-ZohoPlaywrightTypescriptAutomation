import { test, expect } from '../core/test-base';
import { allure } from 'allure-playwright';
import { getErrorMessage } from '../utils/error-handler';

/**
 * Example Test Suite
 * Demonstrates the AI-driven automation framework capabilities
 */
test.describe('Example Tests @example @smoke', () => {
  
  test('should demonstrate basic page navigation @basic', async ({ page, testBase }) => {
    await allure.step('Navigate to example page', async () => {
      // Navigate to a simple test page
      await page.goto('https://example.com');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Verify page title
      await expect(page).toHaveTitle(/Example Domain/);
    });
    
    await allure.step('Verify page content', async () => {
      // Check for main heading
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText('Example Domain');
    });
  });

  test('should demonstrate AI test generation @ai', async ({ page, testBase }) => {
    await allure.step('Test AI capabilities', async () => {
      // This test demonstrates the AI framework capabilities
      // In a real scenario, this would test your Zoho application
      
      await page.goto('https://example.com');
      await page.waitForLoadState('networkidle');
      
      // Verify the page loaded successfully
      await expect(page).toHaveTitle(/Example Domain/);
      
      // Add some test metadata
      allure.parameter('Test Type', 'AI Generated');
      allure.parameter('Framework', 'Playwright + AI');
      allure.parameter('Browser', 'Chromium');
    });
  });

  test('should demonstrate visual testing @visual', async ({ page, testBase }) => {
    await allure.step('Take visual screenshot', async () => {
      await page.goto('https://example.com');
      await page.waitForLoadState('networkidle');
      
      // Take a screenshot for visual comparison
      const screenshot = await page.screenshot({ fullPage: true });
      allure.attachment('Page Screenshot', screenshot, 'image/png');
      
      // Verify page elements are visible
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('p')).toBeVisible();
    });
  });

  test('should demonstrate performance monitoring @performance', async ({ page, testBase }) => {
    await allure.step('Monitor page performance', async () => {
      const startTime = Date.now();
      
      await page.goto('https://example.com');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Add performance metrics
      allure.parameter('Page Load Time', `${loadTime}ms`);
      allure.parameter('Performance Grade', loadTime < 2000 ? 'A' : 'B');
      
      // Verify performance is acceptable
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });
  });

  test('should demonstrate error handling @error-handling', async ({ page, testBase }) => {
    await allure.step('Test error handling', async () => {
      try {
        // Try to navigate to a non-existent page
        await page.goto('https://this-page-does-not-exist-12345.com');
        await page.waitForLoadState('networkidle', { timeout: 5000 });
      } catch (error) {
        // This is expected - demonstrate error handling
        allure.parameter('Error Type', 'Navigation Timeout');
        allure.parameter('Error Message', getErrorMessage(error));
        
        // Verify we handled the error gracefully
        expect(getErrorMessage(error)).toContain('timeout');
      }
    });
  });
});
