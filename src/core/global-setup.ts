import { chromium, FullConfig } from '@playwright/test';
import { Logger } from './logger';
import { getErrorMessage } from '../utils/error-handler';
import { AIEngine } from './ai-engine';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from config folder
dotenv.config({ path: path.join(process.cwd(), 'config', '.env') });

/**
 * Global Setup for AI-driven Playwright Tests
 * Initializes AI services and prepares test environment
 */
async function globalSetup(config: FullConfig) {
  const logger = new Logger('GlobalSetup');
  
  try {
    logger.info('Starting global setup for AI-driven automation framework');
    
    // Ensure required directories exist
    await ensureDirectories();
    
    // Initialize AI engine
    await initializeAIEngine();
    
    // Setup test data
    await setupTestData();
    
  // Verify environment (skip for now as we don't have a local server)
  // await verifyEnvironment();
    
    logger.info('Global setup completed successfully');
  } catch (error) {
    logger.error('Global setup failed', { error: getErrorMessage(error) });
    throw error;
  }
}

/**
 * Ensure required directories exist
 */
async function ensureDirectories(): Promise<void> {
  const logger = new Logger('DirectorySetup');
  
  const directories = [
    'test-results',
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces',
    'test-results/baselines',
    'test-results/diffs',
    'allure-results',
    'logs',
    'src/tests/generated'
  ];
  
  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      logger.debug(`Created directory: ${dir}`);
    }
  }
}

/**
 * Initialize AI engine and verify API connectivity
 */
async function initializeAIEngine(): Promise<void> {
  const logger = new Logger('AIEngineSetup');
  
  try {
    const aiEngine = new AIEngine();
    
    // Test AI engine connectivity
    const testPrompt = 'Generate a simple test case for login functionality';
    const testCases = await aiEngine.generateTestCases(testPrompt);
    
    if (testCases.length > 0) {
      logger.info('AI engine initialized successfully');
    } else {
      logger.warn('AI engine test returned no results');
    }
  } catch (error) {
    logger.error('AI engine initialization failed', { error: getErrorMessage(error) });
    throw error;
  }
}

/**
 * Setup basic test data and configurations
 */
async function setupTestData(): Promise<void> {
  const logger = new Logger('TestDataSetup');
  
  try {
    // Create basic test data structure
    const basicTestData = {
      environment: {
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        apiURL: process.env.API_URL || 'http://localhost:3000/api',
        timeout: process.env.TEST_TIMEOUT || '30000'
      },
      testUsers: {
        manager: {
          email: process.env.MANAGER_USER_EMAIL || 'manager@example.com',
          password: process.env.MANAGER_USER_PASSWORD || 'ManagerPassword123!'
        },
        admin: {
          email: process.env.ADMIN_USER_EMAIL || 'admin@example.com',
          password: process.env.ADMIN_USER_PASSWORD || 'AdminPassword123!'
        }
      }
    };
    
    // Write basic test data to files
    const testDataDir = path.join(process.cwd(), 'src', 'test-data');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(testDataDir, 'basic-test-data.json'),
      JSON.stringify(basicTestData, null, 2)
    );
    
    logger.info('Basic test data setup completed');
  } catch (error) {
    logger.error('Test data setup failed', { error: getErrorMessage(error) });
    throw error;
  }
}

/**
 * Verify test environment and dependencies
 */
async function verifyEnvironment(): Promise<void> {
  const logger = new Logger('EnvironmentVerification');
  
  try {
    // Check environment variables
    const requiredEnvVars = [
      'GOOGLE_GEMINI_API_KEY',
      'BASE_URL'
    ];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        logger.warn(`Environment variable ${envVar} is not set`);
      }
    }
    
    // Test browser launch
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Test basic navigation
    await page.goto(process.env.BASE_URL || 'http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    await browser.close();
    
    logger.info('Environment verification completed');
  } catch (error) {
    logger.error('Environment verification failed', { error: getErrorMessage(error) });
    throw error;
  }
}

export default globalSetup;

