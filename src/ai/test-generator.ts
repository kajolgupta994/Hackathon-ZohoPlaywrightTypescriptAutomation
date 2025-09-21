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
   * Generate tests for Zoho application features
   */
  async generateZohoTests(): Promise<GeneratedTest[]> {
    const zohoFeatures: TestGenerationRequest[] = [
      {
        feature: 'Candidate Profile Aggregation',
        userStory: 'As a manager, I want to view unified candidate profiles from Zoho Recruit and Zoho People Plus so that I can make informed hiring decisions.',
        acceptanceCriteria: [
          'Profile data is aggregated from both systems',
          'Data is up-to-date and synchronized',
          'Conflicting information is highlighted',
          'Profile view is user-friendly and comprehensive'
        ],
        testType: 'e2e',
        priority: 'high',
        tags: ['candidate', 'profile', 'aggregation']
      },
      {
        feature: 'Position Management',
        userStory: 'As a manager, I want to create and publish open positions so that I can attract suitable candidates.',
        acceptanceCriteria: [
          'Position creation form is intuitive',
          'All required fields are validated',
          'Position is published successfully',
          'Position appears in search results'
        ],
        testType: 'e2e',
        priority: 'high',
        tags: ['position', 'management', 'creation']
      },
      {
        feature: 'Intelligent Matching',
        userStory: 'As a manager, I want the system to suggest suitable candidates for open positions based on skills and experience.',
        acceptanceCriteria: [
          'Matching algorithm considers skills, experience, and preferences',
          'Match scores are calculated accurately',
          'Results are ranked by relevance',
          'Filtering and sorting options are available'
        ],
        testType: 'e2e',
        priority: 'high',
        tags: ['matching', 'intelligence', 'recommendation']
      },
      {
        feature: 'Search and Discovery',
        userStory: 'As a manager, I want to search and filter candidates quickly so that I can find the right person for the job.',
        acceptanceCriteria: [
          'Search functionality works across all candidate data',
          'Filters are intuitive and comprehensive',
          'Search results are fast and accurate',
          'Advanced search options are available'
        ],
        testType: 'e2e',
        priority: 'medium',
        tags: ['search', 'discovery', 'filtering']
      }
    ];

    const allGeneratedTests: GeneratedTest[] = [];

    for (const feature of zohoFeatures) {
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
      Generate comprehensive Playwright TypeScript test cases for:
      
      Feature: ${request.feature}
      User Story: ${request.userStory}
      Acceptance Criteria: ${request.acceptanceCriteria.join(', ')}
      Test Type: ${request.testType}
      Priority: ${request.priority}
      
      Requirements:
      1. Use Page Object Model pattern
      2. Include proper error handling and assertions
      3. Use self-healing locators with data-testid attributes
      4. Implement smart waits for dynamic content
      5. Include both positive and negative test scenarios
      6. Add proper test data setup and cleanup
      7. Use descriptive test names and comments
      8. Include accessibility testing where applicable
      9. Add visual validation for UI components
      10. Implement proper test isolation
      
      For Zoho application context:
      - Test Zoho Recruit API integration
      - Test Zoho People Plus API integration
      - Test data synchronization between systems
      - Test authentication and authorization
      - Test responsive design across devices
      
      Return only the test code, no explanations.
    `;
  }

  /**
   * Format generated test code
   */
  private formatTestCode(testCode: string, request: TestGenerationRequest): string {
    const imports = `
import { test, expect } from '@playwright/test';
import { ZohoAppPage } from '../pages/zoho-app-page';
import { SelfHealingLocators } from '../core/self-healing-locators';
import { SmartWaits } from '../core/smart-waits';
import { VisualValidator } from '../core/visual-validator';
`;

    const testSetup = `
test.beforeEach(async ({ page }) => {
  const zohoAppPage = new ZohoAppPage(page);
  await zohoAppPage.navigateToApp();
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
