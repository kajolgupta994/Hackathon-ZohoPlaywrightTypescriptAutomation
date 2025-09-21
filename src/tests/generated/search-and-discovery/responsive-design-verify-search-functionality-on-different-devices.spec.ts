
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


test('Responsive Design: Verify search functionality on different devices', async ({ page }) => {
  const homePage = new HomePage(page);
  const candidateListPage = new CandidateListPage(page);
  await homePage.navigateToCandidates();
  await page.setViewportSize({width: 375, height: 667}); //iPhone 8 size
  await candidateListPage.searchCandidate(testData.candidateData.name);
  await expect(candidateListPage.candidateList).toContainText(testData.candidateData.name);
  await page.setViewportSize({width: 1440, height: 900}); //Large desktop size
  await candidateListPage.searchCandidate(testData.candidateData.name);
  await expect(candidateListPage.candidateList).toContainText(testData.candidateData.name);
});


//Page Objects (Example -  needs to be completed for all pages and selectors)
class HomePage {
  constructor(public page: any) {}
  async navigateToCandidates() {