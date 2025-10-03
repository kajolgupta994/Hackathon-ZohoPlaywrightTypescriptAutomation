import { chromium, Browser, Page } from 'playwright';
import { Logger } from './logger';
import { AIEngine } from './ai-engine';

/**
 * Playwright MCP Server Integration
 * Provides real-time browser interaction capabilities for AI
 */
export class PlaywrightMCPServer {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private logger: Logger;
  private aiEngine: AIEngine;
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.logger = new Logger('PlaywrightMCPServer');
    this.aiEngine = new AIEngine();
    this.baseURL = baseURL;
  }

  /**
   * Initialize the browser and page
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Playwright MCP Server...');
      this.browser = await chromium.launch({ 
        headless: false, // Set to true for CI/CD
        slowMo: 1000 // Slow down for better observation
      });
      
      const context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
      
      this.page = await context.newPage();
      
      // Enable network and console logging
      this.setupLogging();
      
      this.logger.info('Playwright MCP Server initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize MCP Server:', error);
      throw error;
    }
  }

  /**
   * Navigate to a specific URL
   */
  async navigateTo(url: string): Promise<void> {
    if (!this.page) {
      throw new Error('MCP Server not initialized. Call initialize() first.');
    }

    try {
      const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
      this.logger.info(`Navigating to: ${fullUrl}`);
      await this.page.goto(fullUrl, { waitUntil: 'networkidle' });
      await this.page.waitForLoadState('domcontentloaded');
    } catch (error) {
      this.logger.error(`Failed to navigate to ${url}:`, error);
      throw error;
    }
  }

  /**
   * Take a screenshot of the current page
   */
  async takeScreenshot(name?: string): Promise<string> {
    if (!this.page) {
      throw new Error('MCP Server not initialized');
    }

    try {
      const screenshotName = name || `screenshot-${Date.now()}.png`;
      const screenshotPath = `test-results/${screenshotName}`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.logger.info(`Screenshot saved: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      this.logger.error('Failed to take screenshot:', error);
      throw error;
    }
  }

  /**
   * Analyze the current page DOM structure
   */
  async analyzeDOM(): Promise<any> {
    if (!this.page) {
      throw new Error('MCP Server not initialized');
    }

    try {
      const domAnalysis = await this.page.evaluate(() => {
        const elements = {
          buttons: Array.from(document.querySelectorAll('button')).map(btn => ({
            text: btn.textContent?.trim(),
            id: btn.id,
            className: btn.className,
            disabled: btn.disabled,
            visible: btn.offsetParent !== null
          })),
          inputs: Array.from(document.querySelectorAll('input')).map(input => ({
            type: input.type,
            placeholder: input.placeholder,
            id: input.id,
            className: input.className,
            required: input.required,
            visible: input.offsetParent !== null
          })),
          links: Array.from(document.querySelectorAll('a')).map(link => ({
            text: link.textContent?.trim(),
            href: link.href,
            id: link.id,
            className: link.className,
            visible: link.offsetParent !== null
          })),
          forms: Array.from(document.querySelectorAll('form')).map(form => ({
            id: form.id,
            className: form.className,
            action: form.action,
            method: form.method,
            visible: form.offsetParent !== null
          }))
        };
        return elements;
      });

      this.logger.info('DOM analysis completed');
      return domAnalysis;
    } catch (error) {
      this.logger.error('Failed to analyze DOM:', error);
      throw error;
    }
  }

  /**
   * Get network requests made by the page
   */
  async getNetworkRequests(): Promise<any[]> {
    if (!this.page) {
      throw new Error('MCP Server not initialized');
    }

    try {
      const requests = await this.page.evaluate(() => {
        return (window as any).networkRequests || [];
      });
      return requests;
    } catch (error) {
      this.logger.error('Failed to get network requests:', error);
      return [];
    }
  }

  /**
   * Get console logs from the page
   */
  async getConsoleLogs(): Promise<any[]> {
    if (!this.page) {
      throw new Error('MCP Server not initialized');
    }

    try {
      const logs = await this.page.evaluate(() => {
        return (window as any).consoleLogs || [];
      });
      return logs;
    } catch (error) {
      this.logger.error('Failed to get console logs:', error);
      return [];
    }
  }

  /**
   * Interact with an element on the page
   */
  async interactWithElement(selector: string, action: 'click' | 'fill' | 'hover', value?: string): Promise<void> {
    if (!this.page) {
      throw new Error('MCP Server not initialized');
    }

    try {
      const element = this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: 10000 });

      switch (action) {
        case 'click':
          await element.click();
          break;
        case 'fill':
          if (!value) throw new Error('Value required for fill action');
          await element.fill(value);
          break;
        case 'hover':
          await element.hover();
          break;
      }

      this.logger.info(`Performed ${action} on element: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to interact with element ${selector}:`, error);
      throw error;
    }
  }

  /**
   * Generate test cases based on current page analysis
   */
  async generateTestCasesFromPage(feature: string): Promise<string[]> {
    if (!this.page) {
      throw new Error('MCP Server not initialized');
    }

    try {
      // Analyze the current page
      const domAnalysis = await this.analyzeDOM();
      const screenshot = await this.takeScreenshot(`analysis-${feature}`);
      
      // Generate test cases using AI with real page context
      const context = `
        Current Page Analysis:
        - URL: ${this.page.url()}
        - Buttons: ${JSON.stringify(domAnalysis.buttons, null, 2)}
        - Inputs: ${JSON.stringify(domAnalysis.inputs, null, 2)}
        - Forms: ${JSON.stringify(domAnalysis.forms, null, 2)}
        - Screenshot: ${screenshot}
        
        Generate comprehensive test cases for: ${feature}
        Focus on login/signup functionality for manager and admin roles.
      `;

      const testCases = await this.aiEngine.generateTestCases(context, feature);
      this.logger.info(`Generated ${testCases.length} test cases for ${feature}`);
      return testCases;
    } catch (error) {
      this.logger.error('Failed to generate test cases from page:', error);
      throw error;
    }
  }

  /**
   * Explore the page and discover testable elements
   */
  async explorePage(): Promise<any> {
    if (!this.page) {
      throw new Error('MCP Server not initialized');
    }

    try {
      const exploration = await this.page.evaluate(() => {
        const testableElements: any[] = [];
        
        // Find all interactive elements
        const interactiveElements = document.querySelectorAll('button, input, select, textarea, a[href]');
        
        interactiveElements.forEach((element, index) => {
          const rect = element.getBoundingClientRect();
          testableElements.push({
            index,
            tagName: element.tagName,
            text: element.textContent?.trim(),
            id: element.id,
            className: element.className,
            type: (element as any).type,
            placeholder: (element as any).placeholder,
            visible: rect.width > 0 && rect.height > 0,
            position: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
          });
        });

        return {
          url: window.location.href,
          title: document.title,
          testableElements,
          forms: Array.from(document.querySelectorAll('form')).map(form => ({
            id: form.id,
            action: form.action,
            method: form.method,
            inputs: Array.from(form.querySelectorAll('input')).map(input => ({
              name: input.name,
              type: input.type,
              required: input.required
            }))
          }))
        };
      });

      this.logger.info(`Page exploration completed. Found ${exploration.testableElements.length} testable elements`);
      return exploration;
    } catch (error) {
      this.logger.error('Failed to explore page:', error);
      throw error;
    }
  }

  /**
   * Setup logging for network requests and console logs
   */
  private setupLogging(): void {
    if (!this.page) return;

    // Network request logging
    this.page.on('request', request => {
      this.logger.debug(`Network Request: ${request.method()} ${request.url()}`);
    });

    this.page.on('response', response => {
      this.logger.debug(`Network Response: ${response.status()} ${response.url()}`);
    });

    // Console log capture
    this.page.on('console', msg => {
      this.logger.debug(`Console ${msg.type()}: ${msg.text()}`);
    });

    // Page error logging
    this.page.on('pageerror', error => {
      this.logger.error('Page Error:', error);
    });
  }

  /**
   * Close the browser and cleanup
   */
  async close(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        this.logger.info('MCP Server closed successfully');
      }
    } catch (error) {
      this.logger.error('Failed to close MCP Server:', error);
      throw error;
    }
  }

  /**
   * Get current page URL
   */
  getCurrentURL(): string {
    if (!this.page) {
      throw new Error('MCP Server not initialized');
    }
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    if (!this.page) {
      throw new Error('MCP Server not initialized');
    }
    return await this.page.title();
  }
}
