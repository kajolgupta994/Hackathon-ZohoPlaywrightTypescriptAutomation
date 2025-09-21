
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


test('Integration: Data Synchronization', async ({ page }) => {
    const recruitData = await recruitAPI.getCandidate('candidateId123');
    const peoplePlusData = await peoplePlusAPI.getEmployee('employeeId123');
    // Compare relevant data fields from both APIs for synchronization
    expect(recruitData.email).toBe(peoplePlusData.email); // Example assertion
});