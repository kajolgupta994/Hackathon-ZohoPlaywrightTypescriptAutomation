import { AIEngine } from '../core/ai-engine';
import { Logger } from '../core/logger';
import * as fs from 'fs';
import * as path from 'path';

interface TestGenerationRequest {
  feature: string;
  userStory: string;
  acceptanceCriteria: string[];
  testType: 'e2e' | 'integration' | 'unit' | 'visual';
  priority: 'high' | 'medium' | 'low';
  tags?: string[];
}

interface GeneratedTest {
  testName: string;
  testCode: string;
  description: string;
  tags: string[];
  priority: string;
  estimatedDuration: number;
}

/**
 * AI Test Generator
 * Generates comprehensive test cases using Google Gemini API
 */
export class TestGenerator {
  private aiEngine: AIEngine;
  private logger: Logger;
  private outputDir: string;

  constructor() {
    this.aiEngine = new AIEngine();
    this.logger = new Logger('TestGenerator');
    this.outputDir = path.join(process.cwd(), 'src', 'tests', 'generated');
    this.ensureOutputDirectory();
  }

  /**
   * Generate test cases from user story
   */
  async generateFromUserStory(request: TestGenerationRequest): Promise<GeneratedTest[]> {
    try {
      this.logger.info(`Generating tests for feature: ${request.feature}`);

      const prompt = this.buildTestGenerationPrompt(request);
      const testCases = await this.aiEngine.generateTestCases(prompt, request.userStory);

      const generatedTests: GeneratedTest[] = [];
      
      for (let i = 0; i < testCases.length; i++) {
        const testCode = testCases[i];
        const testName = this.extractTestName(testCode);
        const description = this.extractTestDescription(testCode);
        
        generatedTests.push({
          testName: testName || `Generated Test ${i + 1}`,
          testCode: this.formatTestCode(testCode, request),
          description: description || `Test for ${request.feature}`,
          tags: request.tags || ['generated', request.testType],
          priority: request.priority,
          estimatedDuration: this.estimateTestDuration(testCode)
        });
      }

      // Save generated tests
      await this.saveGeneratedTests(request.feature, generatedTests);
      
      this.logger.info(`Generated ${generatedTests.length} tests for ${request.feature}`);
      return generatedTests;
    } catch (error) {
      this.logger.error('Failed to generate tests from user story', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Generate tests for common web application features
   */
  async generateWebAppTests(): Promise<GeneratedTest[]> {
    const webAppFeatures: TestGenerationRequest[] = [
      {
        feature: 'User Authentication',
        userStory: 'As a user, I want to login to access my account so that I can use the application features.',
        acceptanceCriteria: [
          'Login form validates credentials correctly',
          'Successful login redirects to dashboard',
          'Invalid credentials show appropriate error messages',
          'Session management works correctly'
        ],
        testType: 'e2e',
        priority: 'high',
        tags: ['authentication', 'login', 'security']
      },
      {
        feature: 'Dashboard Management',
        userStory: 'As a user, I want to view my dashboard so that I can see my data and navigate the application.',
        acceptanceCriteria: [
          'Dashboard loads with user data',
          'Navigation elements are functional',
          'Data is displayed correctly',
          'User can access all features'
        ],
        testType: 'e2e',
        priority: 'high',
        tags: ['dashboard', 'navigation', 'data-display']
      },
      {
        feature: 'Form Validation',
        userStory: 'As a user, I want forms to validate my input so that I can submit accurate data.',
        acceptanceCriteria: [
          'Required fields are validated',
          'Input format validation works',
          'Error messages are clear and helpful',
          'Form submission works correctly'
        ],
        testType: 'e2e',
        priority: 'high',
        tags: ['forms', 'validation', 'user-input']
      },
      {
        feature: 'Search and Filtering',
        userStory: 'As a user, I want to search and filter data so that I can find what I need quickly.',
        acceptanceCriteria: [
          'Search functionality works across all data',
          'Filters are intuitive and comprehensive',
          'Search results are fast and accurate',
          'Advanced search options are available'
        ],
        testType: 'e2e',
        priority: 'medium',
        tags: ['search', 'filtering', 'data-retrieval']
      }
    ];

    const allGeneratedTests: GeneratedTest[] = [];

    for (const feature of webAppFeatures) {
      try {
        const tests = await this.generateFromUserStory(feature);
        allGeneratedTests.push(...tests);
      } catch (error) {
        this.logger.error(`Failed to generate tests for ${feature.feature}`, { error: (error as Error).message });
      }
    }

    return allGeneratedTests;
  }

  /**
   * Generate visual regression tests
   */
  async generateVisualTests(component: string): Promise<GeneratedTest[]> {
    try {
      const prompt = `
        Generate visual regression tests for the ${component} component.
        
        Include tests for:
        1. Component rendering in different states
        2. Responsive design across breakpoints
        3. Dark/light theme variations
        4. Loading and error states
        5. Interactive states (hover, focus, active)
        
        Use Playwright visual testing with proper selectors and assertions.
      `;

      const testCases = await this.aiEngine.generateTestCases(prompt);
      
      return testCases.map((testCode, index) => ({
        testName: `Visual Test ${component} ${index + 1}`,
        testCode: this.formatVisualTestCode(testCode, component),
        description: `Visual regression test for ${component}`,
        tags: ['visual', 'regression', component.toLowerCase()],
        priority: 'medium',
        estimatedDuration: 30
      }));
    } catch (error) {
      this.logger.error(`Failed to generate visual tests for ${component}`, { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Build comprehensive test generation prompt
   */
  private buildTestGenerationPrompt(request: TestGenerationRequest): string {
    return `
      Generate a single, complete Playwright TypeScript test case for:
      
      Feature: ${request.feature}
      User Story: ${request.userStory}
      Acceptance Criteria: ${request.acceptanceCriteria.join(', ')}
      Test Type: ${request.testType}
      Priority: ${request.priority}
      
      Requirements:
      1. Generate ONLY ONE complete test case
      2. Use proper TypeScript syntax with no syntax errors
      3. Include proper imports and test structure
      4. Use descriptive test name with @tags
      5. Include proper error handling
      6. Use data-testid selectors
      7. Include proper assertions
      8. Test should be self-contained and runnable
      
      Format:
      import { test, expect } from '@playwright/test';
      
      test.describe('Feature Name @tag', () => {
        test('Test Name @tag', async ({ page }) => {
          // Test implementation
        });
      });
      
      Return ONLY the complete test code, no explanations or additional text.
    `;
  }

  /**
   * Format generated test code
   */
  private formatTestCode(testCode: string, request: TestGenerationRequest): string {
    const imports = `
import { test, expect } from '@playwright/test';
import { PageObjectBase } from '../pages/page-object-base';
import { SelfHealingLocators } from '../core/self-healing-locators';
import { SmartWaits } from '../core/smart-waits';
import { VisualValidator } from '../core/visual-validator';
`;

    const testSetup = `
test.beforeEach(async ({ page }) => {
  const pageObjectBase = new PageObjectBase(page);
  await pageObjectBase.navigateTo();
});

test.afterEach(async ({ page }) => {
  // Cleanup test data
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});
`;

    return `${imports}\n\n${testSetup}\n\n${testCode}`;
  }

  /**
   * Format visual test code
   */
  private formatVisualTestCode(testCode: string, component: string): string {
    const imports = `
import { test, expect } from '@playwright/test';
import { VisualValidator } from '../core/visual-validator';
`;

    return `${imports}\n\n${testCode}`;
  }

  /**
   * Extract test name from test code
   */
  private extractTestName(testCode: string): string | null {
    const match = testCode.match(/test\(['"`]([^'"`]+)['"`]/);
    return match ? match[1] : null;
  }

  /**
   * Extract test description from test code
   */
  private extractTestDescription(testCode: string): string | null {
    const match = testCode.match(/\/\*\*([^*]+)\*\//);
    return match ? match[1].trim() : null;
  }

  /**
   * Estimate test duration based on complexity
   */
  private estimateTestDuration(testCode: string): number {
    const lines = testCode.split('\n').length;
    const hasAPI = testCode.includes('api') || testCode.includes('fetch');
    const hasVisual = testCode.includes('screenshot') || testCode.includes('visual');
    
    let duration = Math.max(10, lines * 0.5); // Base duration
    if (hasAPI) duration += 5;
    if (hasVisual) duration += 10;
    
    return Math.min(duration, 120); // Cap at 2 minutes
  }

  /**
   * Save generated tests to files
   */
  private async saveGeneratedTests(feature: string, tests: GeneratedTest[]): Promise<void> {
    try {
      const featureDir = path.join(this.outputDir, this.sanitizeFeatureName(feature));
      if (!fs.existsSync(featureDir)) {
        fs.mkdirSync(featureDir, { recursive: true });
      }

      for (const test of tests) {
        const fileName = `${this.sanitizeTestName(test.testName)}.spec.ts`;
        const filePath = path.join(featureDir, fileName);
        
        fs.writeFileSync(filePath, test.testCode);
        this.logger.debug(`Saved test: ${filePath}`);
      }

      // Save test metadata
      const metadataPath = path.join(featureDir, 'metadata.json');
      fs.writeFileSync(metadataPath, JSON.stringify(tests, null, 2));
    } catch (error) {
      this.logger.error('Failed to save generated tests', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Sanitize feature name for file system
   */
  private sanitizeFeatureName(feature: string): string {
    return feature
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  /**
   * Sanitize test name for file system
   */
  private sanitizeTestName(testName: string): string {
    return testName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }
}
