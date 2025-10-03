import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Logger } from './logger';
import { PlaywrightMCPServer } from './mcp-server';

// Load environment variables from config folder
dotenv.config({ path: path.join(process.cwd(), 'config', '.env') });

/**
 * AI Engine for test generation, analysis, and intelligent automation
 * Leverages Google Gemini API for various AI-driven testing capabilities
 */
export class AIEngine {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private logger: Logger;
  private mcpServer: PlaywrightMCPServer | null = null;

  constructor() {
    this.logger = new Logger('AIEngine');
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.AI_MODEL || 'gemini-1.5-flash',
      generationConfig: {
        temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
        maxOutputTokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
      }
    });
  }

  /**
   * Generate test cases based on user stories or requirements
   */
  async generateTestCases(requirement: string, context?: string): Promise<string[]> {
    try {
      const prompt = `
        As a QA automation expert, generate comprehensive test cases for the following requirement:
        
        Requirement: ${requirement}
        ${context ? `Context: ${context}` : ''}
        
        Please generate test cases in Playwright TypeScript format that cover:
        1. Happy path scenarios
        2. Edge cases
        3. Error handling
        4. Boundary conditions
        5. Integration scenarios
        
        Return only the test code, no explanations.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const testCode = response.text();
      
      // Parse and return individual test cases
      return this.parseTestCases(testCode);
    } catch (error) {
      this.logger.error('Failed to generate test cases:', error);
      throw error;
    }
  }

  /**
   * Generate self-healing locators with fallback strategies
   */
  async generateSelfHealingLocator(description: string, page: any): Promise<string> {
    try {
      const prompt = `
        Generate a self-healing locator for: "${description}"
        
        The locator should:
        1. Use multiple fallback strategies
        2. Be resilient to UI changes
        3. Include data-testid, role, text, and CSS selectors
        4. Handle dynamic content
        
        Return a Playwright locator string with fallback logic.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('Failed to generate self-healing locator:', error);
      throw error;
    }
  }

  /**
   * Analyze test failures and suggest fixes
   */
  async analyzeTestFailure(error: string, testCode: string, screenshot?: string): Promise<string> {
    try {
      const prompt = `
        Analyze this test failure and provide a fix:
        
        Error: ${error}
        Test Code: ${testCode}
        ${screenshot ? 'Screenshot available for analysis' : ''}
        
        Provide:
        1. Root cause analysis
        2. Specific fix recommendations
        3. Updated test code
        4. Prevention strategies
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('Failed to analyze test failure:', error);
      throw error;
    }
  }

  /**
   * Detect flaky tests based on execution patterns
   */
  async detectFlakyTests(testResults: any[]): Promise<{ testName: string; flakyScore: number; reasons: string[] }[]> {
    try {
      const prompt = `
        Analyze these test execution results to identify flaky tests:
        
        ${JSON.stringify(testResults, null, 2)}
        
        For each test, calculate a flaky score (0-1) and identify reasons for flakiness:
        - Timing issues
        - Race conditions
        - Environment dependencies
        - Unstable selectors
        - Data dependencies
        
        Return JSON format with testName, flakyScore, and reasons array.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      this.logger.error('Failed to detect flaky tests:', error);
      throw error;
    }
  }

  /**
   * Generate smart wait strategies
   */
  async generateSmartWait(elementDescription: string, expectedState: string): Promise<string> {
    try {
      const prompt = `
        Generate a smart wait strategy for:
        Element: ${elementDescription}
        Expected State: ${expectedState}
        
        Consider:
        1. Network requests completion
        2. DOM mutations
        3. Element visibility
        4. Animation completion
        5. Custom conditions
        
        Return Playwright wait code.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('Failed to generate smart wait:', error);
      throw error;
    }
  }

  /**
   * Initialize MCP Server for enhanced AI capabilities
   */
  async initializeMCPServer(baseURL: string = 'http://localhost:3000'): Promise<void> {
    try {
      this.mcpServer = new PlaywrightMCPServer(baseURL);
      await this.mcpServer.initialize();
      this.logger.info('MCP Server initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize MCP Server:', error);
      throw error;
    }
  }

  /**
   * Generate test cases with real-time browser context using MCP Server
   */
  async generateTestCasesWithBrowserContext(requirement: string, url: string): Promise<string[]> {
    try {
      if (!this.mcpServer) {
        await this.initializeMCPServer();
      }

      // Navigate to the page and analyze it
      await this.mcpServer!.navigateTo(url);
      const pageAnalysis = await this.mcpServer!.explorePage();
      const domAnalysis = await this.mcpServer!.analyzeDOM();
      const screenshot = await this.mcpServer!.takeScreenshot(`analysis-${Date.now()}`);

      // Create enhanced context with real browser data
      const enhancedContext = `
        Real Browser Context:
        - URL: ${this.mcpServer!.getCurrentURL()}
        - Page Title: ${await this.mcpServer!.getPageTitle()}
        - Interactive Elements: ${JSON.stringify(pageAnalysis.testableElements, null, 2)}
        - DOM Structure: ${JSON.stringify(domAnalysis, null, 2)}
        - Screenshot: ${screenshot}
        
        Original Requirement: ${requirement}
        
        Generate comprehensive test cases based on the actual page structure and elements.
        Focus on testing the real functionality visible in the browser.
      `;

      const testCases = await this.generateTestCases(enhancedContext, requirement);
      this.logger.info(`Generated ${testCases.length} test cases with browser context`);
      return testCases;
    } catch (error) {
      this.logger.error('Failed to generate test cases with browser context:', error);
      throw error;
    }
  }

  /**
   * Analyze test failures with real browser context
   */
  async analyzeTestFailureWithBrowser(error: string, testCode: string, url: string): Promise<string> {
    try {
      if (!this.mcpServer) {
        await this.initializeMCPServer();
      }

      // Navigate to the page and capture current state
      await this.mcpServer!.navigateTo(url);
      const currentState = await this.mcpServer!.analyzeDOM();
      const screenshot = await this.mcpServer!.takeScreenshot(`failure-analysis-${Date.now()}`);
      const consoleLogs = await this.mcpServer!.getConsoleLogs();

      const enhancedPrompt = `
        Analyze this test failure with real browser context:
        
        Error: ${error}
        Test Code: ${testCode}
        Current Page State: ${JSON.stringify(currentState, null, 2)}
        Console Logs: ${JSON.stringify(consoleLogs, null, 2)}
        Screenshot: ${screenshot}
        
        Provide:
        1. Root cause analysis based on actual browser state
        2. Specific fix recommendations
        3. Updated test code that works with current page structure
        4. Prevention strategies
      `;

      const result = await this.model.generateContent(enhancedPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('Failed to analyze test failure with browser context:', error);
      throw error;
    }
  }

  /**
   * Generate self-healing locators with real browser context
   */
  async generateSelfHealingLocatorWithBrowser(description: string, url: string): Promise<string> {
    try {
      if (!this.mcpServer) {
        await this.initializeMCPServer();
      }

      // Navigate to the page and analyze it
      await this.mcpServer!.navigateTo(url);
      const domAnalysis = await this.mcpServer!.analyzeDOM();

      const enhancedPrompt = `
        Generate a self-healing locator for: "${description}"
        
        Current Page DOM Analysis:
        - Buttons: ${JSON.stringify(domAnalysis.buttons, null, 2)}
        - Inputs: ${JSON.stringify(domAnalysis.inputs, null, 2)}
        - Links: ${JSON.stringify(domAnalysis.links, null, 2)}
        - Forms: ${JSON.stringify(domAnalysis.forms, null, 2)}
        
        The locator should:
        1. Use multiple fallback strategies based on actual page elements
        2. Be resilient to UI changes
        3. Include data-testid, role, text, and CSS selectors
        4. Handle dynamic content
        5. Work with the actual page structure
        
        Return a Playwright locator string with fallback logic.
      `;

      const result = await this.model.generateContent(enhancedPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('Failed to generate self-healing locator with browser context:', error);
      throw error;
    }
  }

  /**
   * Close MCP Server
   */
  async closeMCPServer(): Promise<void> {
    if (this.mcpServer) {
      await this.mcpServer.close();
      this.mcpServer = null;
      this.logger.info('MCP Server closed');
    }
  }

  /**
   * Parse generated test cases into individual tests
   */
  private parseTestCases(testCode: string): string[] {
    // Simple parsing - in production, use AST parsing
    const testCases = testCode.split('test(');
    return testCases
      .filter(tc => tc.trim())
      .map(tc => 'test(' + tc.trim())
      .filter(tc => tc.includes('test('));
  }
}
