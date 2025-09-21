
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
import { HomePage } from './pages/HomePage';
import { CandidateListPage } from './pages/CandidateListPage';
import { LoginPage } from './pages/LoginPage';
import { api } from './api/api';


// Test Data
const testData = {
  validUser: { username: 'testuser', password: 'password123' },
  candidateData: { name: 'Test Candidate', skill: 'Testing' },
};


// Test Setup and Teardown

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  const loginPage = new LoginPage(page);
  await loginPage.login(testData.validUser.username, testData.validUser.password);
});

test.afterEach(async ({ page }) => {
  await page.close();
});


// Test Cases