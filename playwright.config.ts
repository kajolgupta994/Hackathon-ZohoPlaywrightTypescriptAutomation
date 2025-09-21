import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

// Load environment variables
config();

/**
 * AI-Driven Playwright Configuration
 * Enhanced with AI capabilities for self-healing, smart waits, and intelligent testing
 */
export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
    ['allure-playwright', { 
      outputFolder: 'allure-results',
      detail: true,
      suiteTitle: false,
      attachments: true
    }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://your-zoho-app.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: {
      mode: 'retain-on-failure',
      size: { width: 1280, height: 720 }
    },
    // AI-enhanced timeout strategies
    actionTimeout: 30000,
    navigationTimeout: 60000,
    // Enhanced screenshot options
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
      animations: 'disabled'
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  // No web server needed - testing against existing applications
  // AI-specific configurations
  expect: {
    // Visual comparison threshold for AI-powered visual testing
    threshold: 0.2,
    // Animation handling for better visual comparisons
    animations: 'disabled',
  },
  // Global setup for AI services
  globalSetup: require.resolve('./src/core/global-setup.ts'),
  globalTeardown: require.resolve('./src/core/global-teardown.ts'),
});
