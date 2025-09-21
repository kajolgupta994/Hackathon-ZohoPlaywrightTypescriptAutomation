import { FullConfig } from '@playwright/test';
import { Logger } from './logger';
import { getErrorMessage } from '../utils/error-handler';
import { FlakyTestDetector } from './flaky-test-detector';
import { VisualValidator } from './visual-validator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global Teardown for AI-driven Playwright Tests
 * Performs cleanup and generates final reports
 */
async function globalTeardown(config: FullConfig) {
  const logger = new Logger('GlobalTeardown');
  
  try {
    logger.info('Starting global teardown for AI-driven automation framework');
    
    // Analyze flaky tests
    await analyzeFlakyTests();
    
    // Cleanup old files
    await cleanupOldFiles();
    
    // Generate AI insights
    await generateAIInsights();
    
    // Generate final reports
    await generateFinalReports();
    
    logger.info('Global teardown completed successfully');
  } catch (error) {
    logger.error('Global teardown failed', { error: getErrorMessage(error) });
  }
}

/**
 * Analyze flaky tests and generate recommendations
 */
async function analyzeFlakyTests(): Promise<void> {
  const logger = new Logger('FlakyTestAnalysis');
  
  try {
    const flakyDetector = new FlakyTestDetector();
    const flakyTests = await flakyDetector.detectFlakyTests();
    
    if (flakyTests.length > 0) {
      logger.warn(`Detected ${flakyTests.length} flaky tests`);
      
      // Generate flaky test report
      const flakyReport = {
        timestamp: new Date().toISOString(),
        totalFlakyTests: flakyTests.length,
        tests: flakyTests.map(test => ({
          name: test.testName,
          score: test.flakyScore,
          reasons: test.reasons,
          recommendations: test.recommendations,
          confidence: test.confidence
        }))
      };
      
      const reportPath = path.join(process.cwd(), 'test-results', 'flaky-tests-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(flakyReport, null, 2));
      
      logger.info(`Flaky test report generated: ${reportPath}`);
    } else {
      logger.info('No flaky tests detected');
    }
  } catch (error) {
    logger.error('Flaky test analysis failed', { error: getErrorMessage(error) });
  }
}

/**
 * Cleanup old test artifacts
 */
async function cleanupOldFiles(): Promise<void> {
  const logger = new Logger('FileCleanup');
  
  try {
    const visualValidator = new VisualValidator();
    await visualValidator.cleanupOldScreenshots(7); // Keep 7 days
    
    // Cleanup old trace files
    const traceDir = path.join(process.cwd(), 'test-results', 'traces');
    if (fs.existsSync(traceDir)) {
      const files = fs.readdirSync(traceDir);
      const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
      
      for (const file of files) {
        const filePath = path.join(traceDir, file);
        const stats = fs.statSync(filePath);
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          logger.debug(`Deleted old trace file: ${file}`);
        }
      }
    }
    
    // Cleanup old video files
    const videoDir = path.join(process.cwd(), 'test-results', 'videos');
    if (fs.existsSync(videoDir)) {
      const files = fs.readdirSync(videoDir);
      const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
      
      for (const file of files) {
        const filePath = path.join(videoDir, file);
        const stats = fs.statSync(filePath);
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          logger.debug(`Deleted old video file: ${file}`);
        }
      }
    }
    
    logger.info('File cleanup completed');
  } catch (error) {
    logger.error('File cleanup failed', { error: getErrorMessage(error) });
  }
}

/**
 * Generate AI insights and recommendations
 */
async function generateAIInsights(): Promise<void> {
  const logger = new Logger('AIInsights');
  
  try {
    // Read test results
    const resultsPath = path.join(process.cwd(), 'test-results.json');
    if (!fs.existsSync(resultsPath)) {
      logger.warn('No test results found for AI analysis');
      return;
    }
    
    const testResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    
    // Generate insights
    const insights = {
      timestamp: new Date().toISOString(),
      totalTests: testResults.suites?.reduce((total: number, suite: any) => 
        total + (suite.specs?.length || 0), 0) || 0,
      passedTests: testResults.suites?.reduce((total: number, suite: any) => 
        total + (suite.specs?.filter((spec: any) => spec.ok).length || 0), 0) || 0,
      failedTests: testResults.suites?.reduce((total: number, suite: any) => 
        total + (suite.specs?.filter((spec: any) => !spec.ok).length || 0), 0) || 0,
      executionTime: testResults.stats?.duration || 0,
      recommendations: [
        'Consider implementing more visual regression tests',
        'Add more API integration tests for better coverage',
        'Implement parallel test execution for faster feedback',
        'Add performance testing for critical user journeys'
      ]
    };
    
    const insightsPath = path.join(process.cwd(), 'test-results', 'ai-insights.json');
    fs.writeFileSync(insightsPath, JSON.stringify(insights, null, 2));
    
    logger.info(`AI insights generated: ${insightsPath}`);
  } catch (error) {
    logger.error('AI insights generation failed', { error: getErrorMessage(error) });
  }
}

/**
 * Generate final test reports
 */
async function generateFinalReports(): Promise<void> {
  const logger = new Logger('FinalReports');
  
  try {
    // Generate test summary
    const summaryPath = path.join(process.cwd(), 'test-results', 'test-summary.json');
    const summary = {
      timestamp: new Date().toISOString(),
      framework: 'AI-driven Playwright Automation',
      features: [
        'Self-healing locators',
        'Smart wait strategies',
        'AI test generation',
        'Flaky test detection',
        'Visual regression testing',
        'Allure reporting',
        'Screenshot and video capture'
      ],
      capabilities: [
        'Google Gemini AI integration',
        'Zoho Recruit and People Plus integration',
        'Intelligent candidate matching',
        'Position management automation',
        'Comprehensive test reporting'
      ]
    };
    
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    // Generate README for test results
    const readmePath = path.join(process.cwd(), 'test-results', 'README.md');
    const readme = `# AI-Driven Test Results

## Framework Overview
This is an AI-driven automation framework built with Playwright and TypeScript, featuring:

- **Self-healing locators** with fallback strategies
- **Smart wait strategies** for dynamic content
- **AI test generation** using Google Gemini API
- **Flaky test detection** with statistical analysis
- **Visual regression testing** with pixel-perfect comparisons
- **Allure reporting** for comprehensive test insights
- **Screenshot and video capture** for failed tests

## Test Results
- HTML Report: \`playwright-report/index.html\`
- Allure Report: \`allure-report/index.html\`
- Screenshots: \`test-results/screenshots/\`
- Videos: \`test-results/videos/\`
- Traces: \`test-results/traces/\`

## AI Features
- Test case generation based on user stories
- Intelligent locator healing
- Flaky test detection and recommendations
- Visual comparison with AI-enhanced analysis

## Usage
\`\`\`bash
# Run all tests
npm run test

# Generate Allure report
npm run test:allure

# Run AI test generation
npm run test:ai-generate

# Detect flaky tests
npm run test:flaky-detect
\`\`\`
`;
    
    fs.writeFileSync(readmePath, readme);
    
    logger.info('Final reports generated successfully');
  } catch (error) {
    logger.error('Final report generation failed', { error: getErrorMessage(error) });
  }
}

export default globalTeardown;

