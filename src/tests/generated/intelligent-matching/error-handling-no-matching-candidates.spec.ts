
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


test('Error Handling: No Matching Candidates', async ({ page }) => {
  const homePage = new HomePage(page);
  const positionPage = new PositionPage(page);
  await homePage.navigateToPositions();
  await positionPage.createPosition('DevOps Engineer', ['Terraform', 'AWS']);
  await homePage.navigateToCandidates();
  await homePage.searchCandidates('DevOps Engineer');
  await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
});