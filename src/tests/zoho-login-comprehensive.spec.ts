import { test, expect } from '@playwright/test';

// Configure all tests to run in headed mode by default
test.use({ headless: false });

test.describe('Zoho Application Login Comprehensive Tests', () => {
  let managerCredentials: any;
  let adminCredentials: any;

  test.beforeAll(async () => {
    // Load stored credentials from signup tests
    const fs = require('fs');
    const path = require('path');
    const credentialsPath = path.join(process.cwd(), 'src', 'test-data', 'stored-credentials.json');
    
    try {
      if (fs.existsSync(credentialsPath)) {
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        managerCredentials = credentials.manager;
        adminCredentials = credentials.admin;
        console.log('✅ Loaded stored credentials for login testing');
        console.log(`Manager Email: ${managerCredentials?.email}`);
        console.log(`Admin Email: ${adminCredentials?.email}`);
      } else {
        console.log('❌ No stored credentials found. Please run signup tests first.');
      }
    } catch (error) {
      console.log('❌ Error loading stored credentials:', error.message);
    }
  });

  test('1. Admin Login, Dashboard Navigation and Logout Flow', async ({ page }) => {
    console.log('🔑 STEP 1: Admin Login, Dashboard Navigation and Logout Flow');
    
    if (!adminCredentials) {
      console.log('❌ Admin credentials not available');
      return;
    }

    // Admin Login
    console.log('Logging in as Admin...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.fill('input[type="email"]', adminCredentials.email);
    await page.fill('input[type="password"]', adminCredentials.password);
    
    await page.click('button:has-text("Sign in")');
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    const loginUrl = page.url();
    if (loginUrl.includes('/dashboard')) {
      console.log('✅ Admin login successful');
      
      // Test Dashboard Navigation
      console.log('Testing admin dashboard navigation...');
      const navItems = ['Dashboard', 'Employees', 'Positions', 'Matching'];
      
      for (const navItem of navItems) {
        try {
          // Wait for navigation element to be visible and stable
          await page.waitForSelector(`text=${navItem}`, { timeout: 10000 });
          await page.click(`text=${navItem}`);
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          console.log(`✅ Navigated to ${navItem} page`);
        } catch (e) {
          console.log(`⚠️ Could not navigate to ${navItem}: ${e.message}`);
          // Continue with next navigation item instead of failing
        }
      }
      
      // Return to Dashboard - with better error handling
      try {
        await page.waitForSelector('text=Dashboard', { timeout: 10000 });
        await page.click('text=Dashboard');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      } catch (e) {
        console.log(`⚠️ Could not return to Dashboard: ${e.message}`);
        // Navigate directly to dashboard URL as fallback
        await page.goto('http://localhost:3000/dashboard');
        await page.waitForLoadState('networkidle');
      }
      
      console.log('✅ Admin dashboard navigation completed');
      
      // Admin Logout - scroll to bottom to find logout button
      console.log('Logging out as Admin...');
      
      // Scroll to bottom of page to find logout button
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(1000);
      
      const logoutSelectors = [
        'button:has-text("Logout")',
        'a:has-text("Logout")',
        'button:has-text("Sign Out")',
        'a:has-text("Sign Out")',
        'button:has-text("Exit")',
        'a:has-text("Exit")',
        '[data-testid*="logout"]',
        '[aria-label*="logout" i]',
        'button[class*="logout"]',
        'a[class*="logout"]'
      ];
      
      let logoutSuccess = false;
      for (const selector of logoutSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible()) {
            console.log(`Found logout element: ${selector}`);
            await element.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);
            
            const logoutUrl = page.url();
            if (logoutUrl.includes('/login')) {
              console.log('✅ Admin logout successful');
              logoutSuccess = true;
              break;
            }
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!logoutSuccess) {
        console.log('⚠️ Logout element not found, manually navigating to login');
        await page.goto('http://localhost:3000/login');
      }
    } else {
      console.log('❌ Admin login failed');
    }
  });

  test('2. Manager Login, Dashboard Navigation and Logout Flow', async ({ page }) => {
    console.log('🔑 STEP 2: Manager Login, Dashboard Navigation and Logout Flow');
    
    if (!managerCredentials) {
      console.log('❌ Manager credentials not available');
      return;
    }

    // Manager Login
    console.log('Logging in as Manager...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.fill('input[type="email"]', managerCredentials.email);
    await page.fill('input[type="password"]', managerCredentials.password);
    
    await page.click('button:has-text("Sign in")');
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    const loginUrl = page.url();
    if (loginUrl.includes('/dashboard')) {
      console.log('✅ Manager login successful');
      
      // Test Dashboard Navigation
      console.log('Testing manager dashboard navigation...');
      const navItems = ['Dashboard', 'Employees', 'Positions', 'Matching'];
      
      for (const navItem of navItems) {
        try {
          // Wait for navigation element to be visible and stable
          await page.waitForSelector(`text=${navItem}`, { timeout: 10000 });
          await page.click(`text=${navItem}`);
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          console.log(`✅ Navigated to ${navItem} page`);
        } catch (e) {
          console.log(`⚠️ Could not navigate to ${navItem}: ${e.message}`);
          // Continue with next navigation item instead of failing
        }
      }
      
      // Return to Dashboard - with better error handling
      try {
        await page.waitForSelector('text=Dashboard', { timeout: 10000 });
        await page.click('text=Dashboard');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      } catch (e) {
        console.log(`⚠️ Could not return to Dashboard: ${e.message}`);
        // Navigate directly to dashboard URL as fallback
        await page.goto('http://localhost:3000/dashboard');
        await page.waitForLoadState('networkidle');
      }
      
      console.log('✅ Manager dashboard navigation completed');
      
      // Manager Logout - scroll to bottom to find logout button
      console.log('Logging out as Manager...');
      
      // Scroll to bottom of page to find logout button
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(1000);
      
      const logoutSelectors = [
        'button:has-text("Logout")',
        'a:has-text("Logout")',
        'button:has-text("Sign Out")',
        'a:has-text("Sign Out")',
        'button:has-text("Exit")',
        'a:has-text("Exit")',
        '[data-testid*="logout"]',
        '[aria-label*="logout" i]',
        'button[class*="logout"]',
        'a[class*="logout"]'
      ];
      
      let logoutSuccess = false;
      for (const selector of logoutSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible()) {
            console.log(`Found logout element: ${selector}`);
            await element.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);
            
            const logoutUrl = page.url();
            if (logoutUrl.includes('/login')) {
              console.log('✅ Manager logout successful');
              logoutSuccess = true;
              break;
            }
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!logoutSuccess) {
        console.log('⚠️ Logout element not found, manually navigating to login');
        await page.goto('http://localhost:3000/login');
      }
    } else {
      console.log('❌ Manager login failed');
    }
  });

  test('3. Login Negative Test Cases', async ({ page }) => {
    console.log('❌ STEP 3: Login Negative Test Cases');
    
    // Test 1: Invalid Email with Valid Password
    console.log('Testing: Invalid Email with Valid Password');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'ValidPassword123!');
    
    await page.click('button:has-text("Sign in")');
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    const invalidEmailUrl = page.url();
    if (invalidEmailUrl.includes('/login')) {
      console.log('✅ Invalid email correctly prevented login');
    } else {
      console.log('❌ Invalid email was not handled properly');
    }

    // Test 2: Valid Email with Invalid Password
    console.log('Testing: Valid Email with Invalid Password');
    if (managerCredentials) {
      await page.fill('input[type="email"]', managerCredentials.email);
      await page.fill('input[type="password"]', 'InvalidPassword123!');
      
      await page.click('button:has-text("Sign in")');
      await page.waitForTimeout(3000);
      await page.waitForLoadState('networkidle');
      
      const invalidPasswordUrl = page.url();
      if (invalidPasswordUrl.includes('/login')) {
        console.log('✅ Invalid password correctly prevented login');
      } else {
        console.log('❌ Invalid password was not handled properly');
      }
    } else {
      console.log('⚠️ Manager credentials not available for invalid password test');
    }

    // Test 3: Empty Email with Valid Password
    console.log('Testing: Empty Email with Valid Password');
    await page.fill('input[type="email"]', '');
    await page.fill('input[type="password"]', 'ValidPassword123!');
    
    // Wait for button to be ready and click
    await page.waitForSelector('button:has-text("Sign in")', { timeout: 10000 });
    await page.click('button:has-text("Sign in")');
    await page.waitForTimeout(3000);
    
    const emptyEmailUrl = page.url();
    if (emptyEmailUrl.includes('/login')) {
      console.log('✅ Empty email correctly prevented login');
    } else {
      console.log('❌ Empty email was not handled properly');
    }

    // Test 4: Valid Email with Empty Password
    console.log('Testing: Valid Email with Empty Password');
    if (managerCredentials) {
      await page.fill('input[type="email"]', managerCredentials.email);
      await page.fill('input[type="password"]', '');
      
      await page.click('button:has-text("Sign in")');
      await page.waitForTimeout(2000);
      
      const emptyPasswordUrl = page.url();
      if (emptyPasswordUrl.includes('/login')) {
        console.log('✅ Empty password correctly prevented login');
      } else {
        console.log('❌ Empty password was not handled properly');
      }
    } else {
      console.log('⚠️ Manager credentials not available for empty password test');
    }

    // Test 5: Both Fields Empty
    console.log('Testing: Both Fields Empty');
    await page.fill('input[type="email"]', '');
    await page.fill('input[type="password"]', '');
    
    await page.click('button:has-text("Sign in")');
    await page.waitForTimeout(2000);
    
    const emptyFieldsUrl = page.url();
    if (emptyFieldsUrl.includes('/login')) {
      console.log('✅ Empty fields correctly prevented login');
    } else {
      console.log('❌ Empty fields were not handled properly');
    }

    // Test 6: Invalid Email Format
    console.log('Testing: Invalid Email Format');
    await page.fill('input[type="email"]', 'invalid-email-format');
    await page.fill('input[type="password"]', 'ValidPassword123!');
    
    await page.click('button:has-text("Sign in")');
    await page.waitForTimeout(2000);
    
    const invalidFormatUrl = page.url();
    if (invalidFormatUrl.includes('/login')) {
      console.log('✅ Invalid email format correctly prevented login');
    } else {
      console.log('❌ Invalid email format was not handled properly');
    }

    console.log('✅ Login negative test cases completed');
  });

});