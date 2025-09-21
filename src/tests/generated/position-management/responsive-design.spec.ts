
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


test('Responsive Design', async ({ page, browserName }) => {
  const positionPage = new PositionPage(page);
  const viewportSizes = [
    { width: 375, height: 667 }, // iPhone 8
    { width: 1280, height: 800 }, // Desktop
    { width: 768, height: 1024 }, // iPad
  ];
  for (const size of viewportSizes) {
    await page.setViewportSize(size);
    await positionPage.createPosition({ title: `Responsive Test ${browserName}` });
    // Add visual validation here using expect.toMatchSnapshot()
    // await expect(