
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


test('Integration: Zoho Recruit & People Plus API Integration', async ({ page }) => {
  // Test data synchronization between Zoho Recruit and People Plus.  This may involve creating
  // candidates in one system and verifying their presence in the other.
  await api.createCandidateInRecruit('Test User API', ['Java', 'Spring']);
  await page.waitForTimeout(5000); // Allow time for synchronization
  const homePage = new HomePage(page);
  await homePage.searchCandidates('Test User API');
  await expect(page.locator(`[data-testid="candidate-name-Test User API"]`)).toBeVisible();
  await api.deleteCandidateFromRecruit('Test User API');
});