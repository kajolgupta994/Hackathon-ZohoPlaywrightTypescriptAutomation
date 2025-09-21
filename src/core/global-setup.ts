import { chromium, FullConfig } from '@playwright/test';
import { Logger } from './logger';
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
    
    // Verify environment
    await verifyEnvironment();
    
    logger.info('Global setup completed successfully');
  } catch (error) {
    logger.error('Global setup failed', { error: error.message });
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
    logger.error('AI engine initialization failed', { error: error.message });
    throw error;
  }
}

/**
 * Setup test data and configurations
 */
async function setupTestData(): Promise<void> {
  const logger = new Logger('TestDataSetup');
  
  try {
    // Create test data files
    const testData = {
      candidates: [
        {
          name: 'John Doe',
          email: 'john.doe@example.com',
          skills: ['JavaScript', 'React', 'Node.js'],
          experience: '5 years',
          department: 'Engineering'
        },
        {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          skills: ['Python', 'Django', 'PostgreSQL'],
          experience: '3 years',
          department: 'Engineering'
        }
      ],
      positions: [
        {
          title: 'Senior Software Engineer',
          department: 'Engineering',
          location: 'San Francisco, CA',
          skills: ['JavaScript', 'React', 'Node.js'],
          experience: '5+ years'
        },
        {
          title: 'Marketing Manager',
          department: 'Marketing',
          location: 'New York, NY',
          skills: ['Digital Marketing', 'Analytics', 'SEO'],
          experience: '3+ years'
        }
      ]
    };
    
    const testDataPath = path.join(process.cwd(), 'test-results', 'test-data.json');
    fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));
    
    logger.info('Test data setup completed');
  } catch (error) {
    logger.error('Test data setup failed', { error: error.message });
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
    logger.error('Environment verification failed', { error: error.message });
    throw error;
  }
}

export default globalSetup;

