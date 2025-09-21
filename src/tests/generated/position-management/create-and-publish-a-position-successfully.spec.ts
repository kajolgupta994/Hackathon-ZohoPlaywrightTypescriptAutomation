
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


test('Create and publish a position successfully', async ({ page }) => {
  const positionPage = new PositionPage(page);
  const positionData = {
    title: 'Software Engineer',
    description: 'Experienced Software Engineer needed...',
    // ... other fields
  };
  await positionPage.createPosition(positionData);
  await positionPage.publishPosition();
  await expect(page.locator('[data-testid="position-published-message"]')).toBeVisible();
  // Verify in Zoho Recruit API
  const recruitPosition = await recruitAPI.getPositionByTitle(positionData.title);
  expect(recruitPosition).toBeDefined();
});