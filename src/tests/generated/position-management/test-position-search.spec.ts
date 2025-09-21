
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


test('Test position search', async ({ page }) => {
  const positionPage = new PositionPage(page);
  const positionData = { title: 'Test Position' };
  await positionPage.createPosition(positionData);
  await positionPage.publishPosition();
  await page.goto('/positions/search');
  await page.fill('[data-testid="search-input"]', positionData.title);
  await page.click('[data-testid="search-button"]');
  await expect(page.locator(`[data-testid="position-item-${positionData.title}"]`)).toBeVisible();
});