
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
import { CandidateProfilePage } from './candidateProfilePage'; // Page Object Model
import { RecruitAPI } from './recruitAPI'; // API interaction
import { PeoplePlusAPI } from './peoplePlusAPI'; // API interaction

const recruitAPI = new RecruitAPI();
const peoplePlusAPI = new PeoplePlusAPI();

test.beforeEach(async ({ page }) => {
  await page.goto('your-application-url'); // Replace with your URL
  await page.getByRole('button', { name: 'Login' }).click(); // Adjust as needed
  // Add login logic here using data-testid attributes
  await page.getByTestId('username').fill('your_username');
  await page.getByTestId('password').fill('your_password');
  await page.getByTestId('login-button').click();

  // Wait for successful login, use smart waits
  await page.waitForSelector('[data-testid="candidate-profile-section"]', { state: 'attached' });
});

test.afterEach(async ({ page }) => {
  // Cleanup test data here - e.g., delete created profiles
  await page.close();
});