import { test as base, Page, BrowserContext, TestInfo } from '@playwright/test';
import { ZohoAppPage } from '../pages/zoho-app-page';
import { FlakyTestDetector } from './flaky-test-detector';
import { Logger } from './logger';
import { allure } from 'allure-playwright';

/**
 * Enhanced Test Base Class
 * Provides AI-driven testing capabilities with comprehensive reporting
 */
export class TestBase {
  protected page: Page;
  protected context: BrowserContext;
  protected zohoAppPage: ZohoAppPage;
  protected flakyDetector: FlakyTestDetector;
  protected logger: Logger;
  protected testInfo: TestInfo;

  constructor(page: Page, context: BrowserContext, testInfo: TestInfo) {
    this.page = page;
    this.context = context;
    this.testInfo = testInfo;
    this.zohoAppPage = new ZohoAppPage(page);
    this.flakyDetector = new FlakyTestDetector();
    this.logger = new Logger(`Test-${testInfo.title}`);
  }

  /**
   * Setup test with AI enhancements
   */
  async setupTest(): Promise<void> {
    try {
      // Set up Allure test metadata
      await this.setupAllureMetadata();
      
      // Navigate to application
      await this.zohoAppPage.navigateToApp();
      
      // Record test start
      this.logger.testExecution(this.testInfo.title, 'started');
      
      // Setup flaky test detection
      await this.setupFlakyTestDetection();
      
    } catch (error) {
      this.logger.error('Test setup failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Teardown test with comprehensive reporting
   */
  async teardownTest(): Promise<void> {
    try {
      const testResult = this.getTestResult();
      
      // Record test result for flaky detection
      await this.flakyDetector.recordTestResult(testResult);
      
      // Log test completion
      this.logger.testExecution(
        this.testInfo.title, 
        testResult.status, 
        testResult.duration
      );
      
      // Add attachments for failed tests
      if (testResult.status === 'failed') {
        await this.addFailureAttachments();
      }
      
      // Cleanup
      await this.zohoAppPage.cleanup();
      
    } catch (error) {
      this.logger.error('Test teardown failed', { error: error.message });
    }
  }

  /**
   * Setup Allure metadata
   */
  private async setupAllureMetadata(): Promise<void> {
    // Add test description
    allure.description(this.testInfo.title);
    
    // Add test tags
    const tags = this.extractTagsFromTitle(this.testInfo.title);
    tags.forEach(tag => allure.tag(tag));
    
    // Add test severity based on title
    const severity = this.determineSeverity(this.testInfo.title);
    allure.severity(severity);
    
    // Add test owner
    allure.owner('QA Team');
    
    // Add test story
    allure.story('Zoho Internal Application');
    
    // Add test feature
    allure.feature('Candidate Management');
  }

  /**
   * Setup flaky test detection
   */
  private async setupFlakyTestDetection(): Promise<void> {
    // Check if this test is known to be flaky
    const flakyTests = await this.flakyDetector.detectFlakyTests();
    const isFlaky = flakyTests.some(ft => ft.testName === this.testInfo.title);
    
    if (isFlaky) {
      this.logger.warn(`Test ${this.testInfo.title} is detected as flaky`);
      allure.tag('flaky');
    }
  }

  /**
   * Add failure attachments
   */
  private async addFailureAttachments(): Promise<void> {
    try {
      // Add screenshot
      const screenshot = await this.page.screenshot({
        fullPage: true,
        animations: 'disabled'
      });
      allure.attachment('Screenshot', screenshot, 'image/png');
      
      // Add page source
      const pageSource = await this.page.content();
      allure.attachment('Page Source', pageSource, 'text/html');
      
      // Add console logs
      const consoleLogs = await this.page.evaluate(() => {
        return (window as any).consoleLogs || [];
      });
      if (consoleLogs.length > 0) {
        allure.attachment('Console Logs', JSON.stringify(consoleLogs, null, 2), 'application/json');
      }
      
      // Add network logs
      const networkLogs = await this.getNetworkLogs();
      if (networkLogs.length > 0) {
        allure.attachment('Network Logs', JSON.stringify(networkLogs, null, 2), 'application/json');
      }
      
      // Add video if available
      const videoPath = this.testInfo.outputPath('video.webm');
      if (await this.fileExists(videoPath)) {
        const videoBuffer = await this.page.context().browser()?.newContext().then(ctx => 
          ctx.pages()[0].screenshot({ fullPage: true })
        );
        if (videoBuffer) {
          allure.attachment('Test Video', videoBuffer, 'video/webm');
        }
      }
      
    } catch (error) {
      this.logger.error('Failed to add failure attachments', { error: error.message });
    }
  }

  /**
   * Get test result information
   */
  private getTestResult(): any {
    const duration = this.testInfo.duration || 0;
    const status = this.testInfo.status === 'passed' ? 'passed' : 
                  this.testInfo.status === 'failed' ? 'failed' : 'skipped';
    
    return {
      testName: this.testInfo.title,
      status,
      duration,
      timestamp: new Date(),
      retryCount: this.testInfo.retry,
      error: this.testInfo.error?.message,
      browser: this.context.browser()?.browserType().name(),
      os: process.platform
    };
  }

  /**
   * Extract tags from test title
   */
  private extractTagsFromTitle(title: string): string[] {
    const tags: string[] = [];
    
    // Extract @tags from title
    const tagMatches = title.match(/@(\w+)/g);
    if (tagMatches) {
      tags.push(...tagMatches.map(tag => tag.substring(1)));
    }
    
    // Add default tags based on content
    if (title.toLowerCase().includes('visual')) tags.push('visual');
    if (title.toLowerCase().includes('api')) tags.push('api');
    if (title.toLowerCase().includes('e2e')) tags.push('e2e');
    if (title.toLowerCase().includes('smoke')) tags.push('smoke');
    if (title.toLowerCase().includes('regression')) tags.push('regression');
    
    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Determine test severity
   */
  private determineSeverity(title: string): 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial' {
    if (title.toLowerCase().includes('critical') || title.toLowerCase().includes('smoke')) {
      return 'critical';
    }
    if (title.toLowerCase().includes('major') || title.toLowerCase().includes('important')) {
      return 'blocker';
    }
    if (title.toLowerCase().includes('minor') || title.toLowerCase().includes('low')) {
      return 'minor';
    }
    return 'normal';
  }

  /**
   * Get network logs
   */
  private async getNetworkLogs(): Promise<any[]> {
    try {
      return await this.page.evaluate(() => {
        return (window as any).networkLogs || [];
      });
    } catch {
      return [];
    }
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      const fs = require('fs');
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  /**
   * Add step to Allure report
   */
  async addStep(stepName: string, stepFunction: () => Promise<void>): Promise<void> {
    await allure.step(stepName, stepFunction);
  }

  /**
   * Add parameter to Allure report
   */
  addParameter(name: string, value: string): void {
    allure.parameter(name, value);
  }

  /**
   * Add attachment to Allure report
   */
  addAttachment(name: string, content: Buffer | string, type: string): void {
    allure.attachment(name, content, type);
  }

  /**
   * Add link to Allure report
   */
  addLink(url: string, name?: string, type?: string): void {
    allure.link(url, name, type);
  }

  /**
   * Mark test as flaky
   */
  markAsFlaky(reason: string): void {
    allure.tag('flaky');
    allure.description(`${this.testInfo.title}\n\nFlaky Test: ${reason}`);
  }

  /**
   * Add test evidence
   */
  async addEvidence(description: string, evidence: Buffer | string, type: string): Promise<void> {
    await allure.step(`Evidence: ${description}`, async () => {
      allure.attachment(description, evidence, type);
    });
  }
}

/**
 * Enhanced test function with AI capabilities
 */
export const test = base.extend<{ testBase: TestBase }>({
  testBase: async ({ page, context }, use, testInfo) => {
    const testBase = new TestBase(page, context, testInfo);
    await testBase.setupTest();
    await use(testBase);
    await testBase.teardownTest();
  }
});

export { expect } from '@playwright/test';
