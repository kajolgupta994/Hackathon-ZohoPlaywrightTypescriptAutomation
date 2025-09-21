
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


test('Happy Path: View Unified Profile with Data from Both Systems', async ({ page }) => {
  const profilePage = new CandidateProfilePage(page);
  await profilePage.navigateToCandidateProfile('candidateId123'); // Replace with valid ID
  await expect(profilePage.recruitDataSection).toBeVisible();
  await expect(profilePage.peoplePlusDataSection).toBeVisible();
  await expect(profilePage.nameField).toContainText('John Doe'); // Example assertion
});