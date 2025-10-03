#!/usr/bin/env ts-node

/**
 * MCP-Enhanced Test Generator CLI
 * 
 * This CLI tool uses the Playwright MCP Server to generate test cases
 * with real-time browser context and DOM analysis.
 */

import { chromium, Browser, Page } from 'playwright';
import { AIEngine } from '../core/ai-engine';
import { PlaywrightMCPServer } from '../core/mcp-server';
import { Logger } from '../core/logger';

class MCPTestGeneratorCLI {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private aiEngine: AIEngine | null = null;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('MCPTestGeneratorCLI');
  }

  async initialize() {
    try {
      this.logger.info('Initializing MCP Test Generator...');
      
      // Launch browser
      this.browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.page = await this.browser.newPage();
      
      // Initialize AI Engine
      this.aiEngine = new AIEngine();
      await this.aiEngine.initialize();
      
      this.logger.info('MCP Test Generator initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize MCP Test Generator:', error);
      throw error;
    }
  }

  async generateTests(requirement: string, url: string, outputFile?: string) {
    if (!this.aiEngine || !this.page) {
      throw new Error('MCP Test Generator not initialized');
    }

    try {
      this.logger.info(`Generating tests for: ${requirement}`);
      this.logger.info(`Target URL: ${url}`);

      // Generate tests with browser context
      const testCases = await this.aiEngine.generateTestCasesWithBrowserContext(requirement, url);
      
      // Format test cases
      const formattedTests = this.formatTestCases(testCases, requirement);
      
      // Save to file or display
      if (outputFile) {
        await this.saveToFile(formattedTests, outputFile);
        this.logger.info(`Tests saved to: ${outputFile}`);
      } else {
        console.log('\n' + '='.repeat(80));
        console.log('GENERATED TEST CASES');
        console.log('='.repeat(80));
        console.log(formattedTests);
        console.log('='.repeat(80));
      }

      return testCases;
    } catch (error) {
      this.logger.error('Failed to generate tests:', error);
      throw error;
    }
  }

  private formatTestCases(testCases: string[], requirement: string): string {
    const header = `/**
 * Generated Test Cases for: ${requirement}
 * Generated on: ${new Date().toISOString()}
 * 
 * This file contains AI-generated test cases based on real browser analysis.
 * Review and modify as needed before using in your test suite.
 */

import { test, expect } from '@playwright/test';

test.describe('Generated Tests: ${requirement}', () => {
`;

    const footer = `});
`;

    const testBody = testCases.map((testCase, index) => {
      return `  test('${testCase}', async ({ page }) => {
    // TODO: Implement test logic
    // Generated test case: ${testCase}
  });`;
    }).join('\n\n');

    return header + '\n' + testBody + '\n' + footer;
  }

  private async saveToFile(content: string, filename: string) {
    const fs = await import('fs/promises');
    await fs.writeFile(filename, content, 'utf8');
  }

  async close() {
    try {
      if (this.aiEngine) {
        await this.aiEngine.closeMCPServer();
      }
      
      if (this.browser) {
        await this.browser.close();
      }
      
      this.logger.info('MCP Test Generator closed successfully');
    } catch (error) {
      this.logger.error('Error closing MCP Test Generator:', error);
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
Usage: ts-node test-generator-mcp-cli.ts <requirement> <url> [output-file]

Examples:
  ts-node test-generator-mcp-cli.ts "Login functionality" "http://localhost:3000"
  ts-node test-generator-mcp-cli.ts "User registration" "http://localhost:3000/signup" "generated-signup-tests.ts"
    `);
    process.exit(1);
  }

  const [requirement, url, outputFile] = args;
  const generator = new MCPTestGeneratorCLI();

  try {
    await generator.initialize();
    await generator.generateTests(requirement, url, outputFile);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await generator.close();
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { MCPTestGeneratorCLI };
