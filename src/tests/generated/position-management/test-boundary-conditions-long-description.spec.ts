
import { test, expect } from '@playwright/test';
import { ZohoAppPage } from '../pages/zoho-app-page';
import { SelfHealingLocators } from '../core/self-healing-locators';
import { SmartWaits } from '../core/smart-waits';
import { VisualValidator } from '../core/visual-validator';



test.beforeEach(async ({ page }) => {
  const zohoAppPage = new ZohoAppPage(page);
  await zohoAppPage.navigateToApp();
});

test.afterEach(async ({ page }) => {
  // Cleanup test data
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});


test('Test boundary conditions: Long description', async ({ page }) => {
  const positionPage = new PositionPage(page);
  const longDescription = 'a'.repeat(10000); // Exceed character limit
  await positionPage.createPosition({ description: longDescription });
  await expect(page.locator('[data-testid="error-description"]')).toBeVisible();
});