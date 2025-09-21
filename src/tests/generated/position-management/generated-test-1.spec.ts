
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


test(```typescript
import { test, expect } from '@playwright/test';
import { PositionPage } from './position.page'; // Page Object Model
import { ZohoRecruitAPI } from './zohoRecruit.api';
import { ZohoPeoplePlusAPI } from './zohoPeoplePlus.api';

const recruitAPI = new ZohoRecruitAPI();
const peoplePlusAPI = new ZohoPeoplePlusAPI();

test.beforeEach(async ({ page }) => {
  await page.goto('/positions'); // Navigate to position creation page
  await page.waitForSelector('[data-testid="position-creation-form"]');
});

test.afterEach(async ({ page }) => {
  // Cleanup: Delete created position if needed
  await page.close();
});