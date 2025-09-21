import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Logger } from './logger';

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
