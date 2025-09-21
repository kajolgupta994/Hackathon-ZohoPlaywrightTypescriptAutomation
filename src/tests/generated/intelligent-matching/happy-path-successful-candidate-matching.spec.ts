
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


test('Happy Path: Successful Candidate Matching', async ({ page }) => {
  const homePage = new HomePage(page);
  const positionPage = new PositionPage(page);
  const candidatePage = new CandidatePage(page);
  await homePage.navigateToPositions();
  await positionPage.createPosition('Software Engineer', ['JavaScript', 'TypeScript']);
  await homePage.navigateToCandidates();
  await candidatePage.addCandidate('John Doe', ['JavaScript', 'React']);
  await homePage.searchCandidates('Software Engineer');
  await expect(candidatePage.getCandidateName()).toContain('John Doe');
});