
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


test('Happy Path: Search for a candidate by name', async ({ page }) => {
  const homePage = new HomePage(page);
  const candidateListPage = new CandidateListPage(page);
  await homePage.navigateToCandidates();
  await candidateListPage.searchCandidate(testData.candidateData.name);
  await expect(candidateListPage.candidateList).toContainText(testData.candidateData.name);
});