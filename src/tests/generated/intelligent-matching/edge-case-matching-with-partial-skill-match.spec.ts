
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


test('Edge Case: Matching with Partial Skill Match', async ({ page }) => {
  const homePage = new HomePage(page);
  const positionPage = new PositionPage(page);
  const candidatePage = new CandidatePage(page);
  await homePage.navigateToPositions();
  await positionPage.createPosition('Data Scientist', ['Python', 'SQL']);
  await homePage.navigateToCandidates();
  await candidatePage.addCandidate('Jane Doe', ['Python']);
  await homePage.searchCandidates('Data Scientist');
  await expect(candidatePage.getCandidateName()).toContain('Jane Doe');
});