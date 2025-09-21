
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


test('Responsive Design: Mobile View', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone 8 size
  const profilePage = new CandidateProfilePage(page);
  await profilePage.navigateToCandidateProfile('candidateId123');
  // Assertions for mobile view layout and responsiveness
  await expect(profilePage.mobileSpecificElement).toBeVisible(); // Replace with actual element
});