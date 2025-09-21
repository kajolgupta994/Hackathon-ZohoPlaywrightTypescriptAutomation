
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


test('API Integration: Zoho Recruit & Zoho People Plus', async ({ page }) => {
  const positionPage = new PositionPage(page);
  const positionData = { title: 'API Integration Test' };
  await positionPage.createPosition(positionData);
  await positionPage.publishPosition();
  // Verify data synchronization between Zoho Recruit and Zoho People Plus APIs
  const recruitPosition = await recruitAPI.getPositionByTitle(positionData.title);
  const peoplePlusPosition = await peoplePlusAPI.getPositionByTitle(positionData.title);
  expect(recruitPosition).toBeDefined();
  expect(peoplePlusPosition).toBeDefined();
  expect(recruitPosition.title).toBe(peoplePlusPosition.title); // Example synchronization check
});