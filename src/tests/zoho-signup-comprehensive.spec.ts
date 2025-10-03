import { test, expect } from '@playwright/test';

// Configure all tests to run in headed mode by default
test.use({ headless: false });

test.describe('Zoho Application Signup Comprehensive Tests', () => {
  let managerCredentials: any;
  let adminCredentials: any;

  // Generate unique credentials for each test run
  function generateUniqueCredentials(role: string) {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 10000);
    return {
      fullName: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      email: `${role}${timestamp}${randomSuffix}@zoho.com`,
      password: `${role.charAt(0).toUpperCase() + role.slice(1)}Pass123!`,
      role: role
    };
  }

  test('1. Manager Signup with Valid Credentials', async ({ page }) => {
    console.log('📝 STEP 1: Manager Signup with Valid Credentials');
    
    managerCredentials = generateUniqueCredentials('manager');
    console.log('Manager Credentials:', managerCredentials);

    await page.goto('http://localhost:3000/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Wait for form elements to be ready
    await page.waitForSelector('input[placeholder*="full name" i]', { timeout: 10000 });
    await page.fill('input[placeholder*="full name" i]', managerCredentials.fullName);
    
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', managerCredentials.email);
    
    await page.waitForSelector('select', { timeout: 10000 });
    await page.selectOption('select', 'manager');
    
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).waitFor({ timeout: 10000 });
    await passwordInputs.nth(0).fill(managerCredentials.password);
    await passwordInputs.nth(1).fill(managerCredentials.password);
    
    await page.waitForSelector('button:has-text("Create Account")', { timeout: 10000 });
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log('After signup URL:', currentUrl);
    
    if (currentUrl.includes('/login')) {
      console.log('✅ Manager signup successful - redirected to login page');
    } else {
      throw new Error('Manager signup failed - not redirected to login page');
    }
  });

  test('2. Admin Signup with Valid Credentials', async ({ page }) => {
    console.log('📝 STEP 2: Admin Signup with Valid Credentials');
    
    adminCredentials = generateUniqueCredentials('admin');
    console.log('Admin Credentials:', adminCredentials);

    await page.goto('http://localhost:3000/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Wait for form elements to be ready
    await page.waitForSelector('input[placeholder*="full name" i]', { timeout: 10000 });
    await page.fill('input[placeholder*="full name" i]', adminCredentials.fullName);
    
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', adminCredentials.email);
    
    await page.waitForSelector('select', { timeout: 10000 });
    await page.selectOption('select', 'admin');
    
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).waitFor({ timeout: 10000 });
    await passwordInputs.nth(0).fill(adminCredentials.password);
    await passwordInputs.nth(1).fill(adminCredentials.password);
    
    await page.waitForSelector('button:has-text("Create Account")', { timeout: 10000 });
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log('After signup URL:', currentUrl);
    
    if (currentUrl.includes('/login')) {
      console.log('✅ Admin signup successful - redirected to login page');
    } else {
      throw new Error('Admin signup failed - not redirected to login page');
    }
  });

  test('3. Invalid Email Format Validation', async ({ page }) => {
    console.log('❌ STEP 3: Testing Invalid Email Format Validation');
    
    const invalidEmails = ['invalid-email', 'test@', '@example.com'];
    
    for (const invalidEmail of invalidEmails) {
      console.log(`Testing invalid email: ${invalidEmail}`);
      
      // Go back to signup page from login
      await page.goto('http://localhost:3000/register');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Wait for form elements to be ready
      await page.waitForSelector('input[placeholder*="full name" i]', { timeout: 10000 });
      await page.fill('input[placeholder*="full name" i]', 'Test User');
      
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.fill('input[type="email"]', invalidEmail);
      
      await page.waitForSelector('select', { timeout: 10000 });
      await page.selectOption('select', 'manager');
      
      const passwordInputs = page.locator('input[type="password"]');
      await passwordInputs.nth(0).waitFor({ timeout: 10000 });
      await passwordInputs.nth(0).fill('TestPass123!');
      await passwordInputs.nth(1).fill('TestPass123!');
      
      await page.waitForSelector('button:has-text("Create Account")', { timeout: 10000 });
      await page.click('button:has-text("Create Account")');
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      if (currentUrl.includes('/register')) {
        console.log(`✅ Invalid email '${invalidEmail}' correctly prevented signup`);
      } else {
        console.log(`❌ Invalid email '${invalidEmail}' was not handled properly`);
      }
    }
    
    console.log('✅ Invalid email format validation completed');
  });

  test('4. Required Field Validation', async ({ page }) => {
    console.log('⚠️ STEP 4: Testing Required Field Validation');
    
    // Go back to signup page from login
    await page.goto('http://localhost:3000/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test 1: Empty form submission
    console.log('Testing empty form submission...');
    await page.waitForSelector('button:has-text("Create Account")', { timeout: 10000 });
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(2000);
    
    const emptyFormUrl = page.url();
    if (emptyFormUrl.includes('/register')) {
      console.log('✅ Empty form correctly prevented signup');
    } else {
      console.log('❌ Empty form was not handled properly');
    }

    // Test 2: Missing full name
    console.log('Testing missing full name...');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.selectOption('select', 'manager');
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('TestPass123!');
    await passwordInputs.nth(1).fill('TestPass123!');
    
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);
    
    const missingNameUrl = page.url();
    if (missingNameUrl.includes('/register')) {
      console.log('✅ Missing full name correctly prevented signup');
    } else {
      console.log('❌ Missing full name was not handled properly');
    }

    // Test 3: Missing email
    console.log('Testing missing email...');
    await page.fill('input[placeholder*="full name" i]', 'Test User');
    await page.fill('input[type="email"]', '');
    
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);
    
    const missingEmailUrl = page.url();
    if (missingEmailUrl.includes('/register')) {
      console.log('✅ Missing email correctly prevented signup');
    } else {
      console.log('❌ Missing email was not handled properly');
    }

    // Test 4: Missing password
    console.log('Testing missing password...');
    await page.fill('input[type="email"]', 'test@example.com');
    await passwordInputs.nth(0).fill('');
    await passwordInputs.nth(1).fill('TestPass123!');
    
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);
    
    const missingPasswordUrl = page.url();
    if (missingPasswordUrl.includes('/register')) {
      console.log('✅ Missing password correctly prevented signup');
    } else {
      console.log('❌ Missing password was not handled properly');
    }

    // Test 5: Missing confirm password
    console.log('Testing missing confirm password...');
    await passwordInputs.nth(0).fill('TestPass123!');
    await passwordInputs.nth(1).fill('');
    
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);
    
    const missingConfirmUrl = page.url();
    if (missingConfirmUrl.includes('/register')) {
      console.log('✅ Missing confirm password correctly prevented signup');
    } else {
      console.log('❌ Missing confirm password was not handled properly');
    }

    console.log('✅ Required field validation completed');
  });

  test('5. Password Mismatch Validation', async ({ page }) => {
    console.log('❌ STEP 5: Testing Password Mismatch Validation');
    
    // Go back to signup page from login
    await page.goto('http://localhost:3000/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.fill('input[placeholder*="full name" i]', 'Test User');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.selectOption('select', 'manager');
    
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('TestPass123!');
    await passwordInputs.nth(1).fill('DifferentPass123!');
    
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/register')) {
      console.log('✅ Password mismatch correctly prevented signup');
    } else {
      console.log('❌ Password mismatch was not handled properly');
    }

    console.log('✅ Password mismatch validation completed');
  });

  test('6. Duplicate Email Prevention', async ({ page }) => {
    console.log('❌ STEP 6: Testing Duplicate Email Prevention');
    
    if (!managerCredentials) {
      console.log('❌ Manager credentials not available for duplicate test');
      return;
    }

    // Go back to signup page from login
    await page.goto('http://localhost:3000/register');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Try to signup with the same email as manager
    await page.fill('input[placeholder*="full name" i]', 'Duplicate User');
    await page.fill('input[type="email"]', managerCredentials.email);
    await page.selectOption('select', 'admin');
    
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('TestPass123!');
    await passwordInputs.nth(1).fill('TestPass123!');
    
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/register')) {
      console.log('✅ Duplicate email correctly prevented signup');
    } else {
      console.log('❌ Duplicate email was not handled properly');
    }

    console.log('✅ Duplicate email prevention completed');
  });

  test('7. Store Credentials for Login Testing', async ({ page }) => {
    console.log('💾 STEP 7: Storing Credentials for Login Testing');
    
    if (!managerCredentials || !adminCredentials) {
      console.log('❌ Credentials not available for storage');
      return;
    }

    // Store credentials in a way that can be accessed by login tests
    const credentials = {
      manager: managerCredentials,
      admin: adminCredentials
    };

    // Write to a file that login tests can read
    const fs = require('fs');
    const path = require('path');
    const credentialsPath = path.join(process.cwd(), 'src', 'test-data', 'stored-credentials.json');
    
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
    
    console.log('Stored Manager Credentials:', managerCredentials);
    console.log('Stored Admin Credentials:', adminCredentials);
    console.log('✅ Credentials stored for login testing');
    console.log(`Manager Email: ${managerCredentials.email}`);
    console.log(`Admin Email: ${adminCredentials.email}`);
  });
});