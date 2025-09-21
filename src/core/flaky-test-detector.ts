import { Logger } from './logger';
import { AIEngine } from './ai-engine';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  timestamp: Date;
  retryCount: number;
  error?: string;
  browser?: string;
  os?: string;
}

interface FlakyTestAnalysis {
  testName: string;
  flakyScore: number;
  reasons: string[];
  recommendations: string[];
  confidence: number;
}

/**
 * Flaky Test Detection System
 * Identifies and analyzes flaky tests using AI and statistical analysis
 */
export class FlakyTestDetector {
  private logger: Logger;
  private aiEngine: AIEngine;
  private resultsFile: string;
  private flakyThreshold: number;

  constructor() {
    this.logger = new Logger('FlakyTestDetector');
    this.aiEngine = new AIEngine();
    this.resultsFile = path.join(process.cwd(), 'test-results', 'execution-history.json');
    this.flakyThreshold = parseFloat(process.env.FLAKY_TEST_THRESHOLD || '0.3');
  }

  /**
   * Record test execution result
   */
  async recordTestResult(result: TestResult): Promise<void> {
    try {
      const results = await this.loadTestResults();
      results.push(result);
      await this.saveTestResults(results);
      
      this.logger.debug(`Recorded test result: ${result.testName} - ${result.status}`);
    } catch (error) {
      this.logger.error('Failed to record test result', { error: error.message, result });
    }
  }

  /**
   * Analyze and detect flaky tests
   */
  async detectFlakyTests(): Promise<FlakyTestAnalysis[]> {
    try {
      const results = await this.loadTestResults();
      const testGroups = this.groupResultsByTest(results);
      const flakyTests: FlakyTestAnalysis[] = [];

      for (const [testName, testResults] of testGroups) {
        const analysis = await this.analyzeTestFlakiness(testName, testResults);
        if (analysis.flakyScore >= this.flakyThreshold) {
          flakyTests.push(analysis);
          this.logger.flakyTestDetected(testName, analysis.flakyScore, analysis.reasons);
        }
      }

      return flakyTests;
    } catch (error) {
      this.logger.error('Failed to detect flaky tests', { error: error.message });
      throw error;
    }
  }

  /**
   * Get flaky test recommendations
   */
  async getFlakyTestRecommendations(testName: string): Promise<string[]> {
    try {
      const results = await this.loadTestResults();
      const testResults = results.filter(r => r.testName === testName);
      
      if (testResults.length === 0) {
        return ['No test results found'];
      }

      const analysis = await this.analyzeTestFlakiness(testName, testResults);
      return analysis.recommendations;
    } catch (error) {
      this.logger.error('Failed to get recommendations', { error: error.message });
      return ['Unable to generate recommendations'];
    }
  }

  /**
   * Analyze individual test for flakiness
   */
  private async analyzeTestFlakiness(testName: string, results: TestResult[]): Promise<FlakyTestAnalysis> {
    const totalRuns = results.length;
    const passedRuns = results.filter(r => r.status === 'passed').length;
    const failedRuns = results.filter(r => r.status === 'failed').length;
    const passRate = passedRuns / totalRuns;
    const flakyScore = 1 - passRate;

    // Statistical analysis
    const durationVariance = this.calculateDurationVariance(results);
    const errorPatterns = this.analyzeErrorPatterns(results);
    const retryPatterns = this.analyzeRetryPatterns(results);
    const environmentIssues = this.analyzeEnvironmentIssues(results);

    // AI analysis
    let aiAnalysis: any = {};
    try {
      const aiResults = await this.aiEngine.detectFlakyTests(results);
      const testAnalysis = aiResults.find((r: any) => r.testName === testName);
      if (testAnalysis) {
        aiAnalysis = testAnalysis;
      }
    } catch (error) {
      this.logger.warn('AI analysis failed, using statistical analysis only', { error: error.message });
    }

    // Combine analyses
    const reasons = [
      ...this.getStatisticalReasons(flakyScore, durationVariance, errorPatterns, retryPatterns),
      ...(aiAnalysis.reasons || [])
    ];

    const recommendations = this.generateRecommendations(reasons, errorPatterns, environmentIssues);

    return {
      testName,
      flakyScore: Math.max(flakyScore, aiAnalysis.flakyScore || 0),
      reasons: [...new Set(reasons)], // Remove duplicates
      recommendations,
      confidence: this.calculateConfidence(totalRuns, flakyScore)
    };
  }

  /**
   * Calculate duration variance
   */
  private calculateDurationVariance(results: TestResult[]): number {
    const durations = results.map(r => r.duration);
    const mean = durations.reduce((a, b) => a + b, 0) / durations.length;
    const variance = durations.reduce((sum, duration) => sum + Math.pow(duration - mean, 2), 0) / durations.length;
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  /**
   * Analyze error patterns
   */
  private analyzeErrorPatterns(results: TestResult[]): string[] {
    const errors = results.filter(r => r.error).map(r => r.error!);
    const errorCounts = new Map<string, number>();
    
    errors.forEach(error => {
      const normalizedError = this.normalizeError(error);
      errorCounts.set(normalizedError, (errorCounts.get(normalizedError) || 0) + 1);
    });

    return Array.from(errorCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([error, count]) => `${error} (${count} times)`);
  }

  /**
   * Analyze retry patterns
   */
  private analyzeRetryPatterns(results: TestResult[]): { maxRetries: number; avgRetries: number } {
    const retries = results.map(r => r.retryCount);
    return {
      maxRetries: Math.max(...retries),
      avgRetries: retries.reduce((a, b) => a + b, 0) / retries.length
    };
  }

  /**
   * Analyze environment issues
   */
  private analyzeEnvironmentIssues(results: TestResult[]): string[] {
    const issues: string[] = [];
    
    // Browser-specific issues
    const browserGroups = this.groupBy(results, r => r.browser || 'unknown');
    for (const [browser, browserResults] of browserGroups) {
      const browserPassRate = browserResults.filter(r => r.status === 'passed').length / browserResults.length;
      if (browserPassRate < 0.8) {
        issues.push(`Low pass rate on ${browser} (${(browserPassRate * 100).toFixed(1)}%)`);
      }
    }

    // OS-specific issues
    const osGroups = this.groupBy(results, r => r.os || 'unknown');
    for (const [os, osResults] of osGroups) {
      const osPassRate = osResults.filter(r => r.status === 'passed').length / osResults.length;
      if (osPassRate < 0.8) {
        issues.push(`Low pass rate on ${os} (${(osPassRate * 100).toFixed(1)}%)`);
      }
    }

    return issues;
  }

  /**
   * Get statistical reasons for flakiness
   */
  private getStatisticalReasons(
    flakyScore: number,
    durationVariance: number,
    errorPatterns: string[],
    retryPatterns: { maxRetries: number; avgRetries: number }
  ): string[] {
    const reasons: string[] = [];

    if (flakyScore > 0.3) {
      reasons.push(`High failure rate: ${(flakyScore * 100).toFixed(1)}%`);
    }

    if (durationVariance > 0.5) {
      reasons.push('High duration variance indicating timing issues');
    }

    if (errorPatterns.length > 0) {
      reasons.push(`Recurring errors: ${errorPatterns.join(', ')}`);
    }

    if (retryPatterns.avgRetries > 1) {
      reasons.push(`High retry count: ${retryPatterns.avgRetries.toFixed(1)} average retries`);
    }

    return reasons;
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    reasons: string[],
    errorPatterns: string[],
    environmentIssues: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (reasons.some(r => r.includes('timing'))) {
      recommendations.push('Add explicit waits and increase timeouts');
      recommendations.push('Use smart wait strategies for dynamic content');
    }

    if (reasons.some(r => r.includes('selector'))) {
      recommendations.push('Use more robust selectors with data-testid attributes');
      recommendations.push('Implement self-healing locators');
    }

    if (errorPatterns.some(e => e.includes('timeout'))) {
      recommendations.push('Increase timeout values for slow operations');
      recommendations.push('Add network idle waits');
    }

    if (environmentIssues.length > 0) {
      recommendations.push('Investigate environment-specific issues');
      recommendations.push('Add environment-specific test configurations');
    }

    if (reasons.some(r => r.includes('data'))) {
      recommendations.push('Use stable test data and cleanup procedures');
      recommendations.push('Implement data isolation between tests');
    }

    return recommendations;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(totalRuns: number, flakyScore: number): number {
    // Higher confidence with more runs and clearer flakiness patterns
    const runConfidence = Math.min(totalRuns / 10, 1); // Max confidence at 10+ runs
    const scoreConfidence = flakyScore > 0.5 ? 1 : flakyScore * 2; // Higher confidence for clear flakiness
    return (runConfidence + scoreConfidence) / 2;
  }

  /**
   * Normalize error messages for pattern analysis
   */
  private normalizeError(error: string): string {
    return error
      .replace(/\d+/g, 'N') // Replace numbers with N
      .replace(/at .*?\(.*?\)/g, 'at ...') // Simplify stack traces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Group results by test name
   */
  private groupResultsByTest(results: TestResult[]): Map<string, TestResult[]> {
    return this.groupBy(results, r => r.testName);
  }

  /**
   * Generic group by function
   */
  private groupBy<T, K>(array: T[], keyFn: (item: T) => K): Map<K, T[]> {
    const groups = new Map<K, T[]>();
    for (const item of array) {
      const key = keyFn(item);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    }
    return groups;
  }

  /**
   * Load test results from file
   */
  private async loadTestResults(): Promise<TestResult[]> {
    try {
      if (!fs.existsSync(this.resultsFile)) {
        return [];
      }
      const data = fs.readFileSync(this.resultsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      this.logger.error('Failed to load test results', { error: error.message });
      return [];
    }
  }

  /**
   * Save test results to file
   */
  private async saveTestResults(results: TestResult[]): Promise<void> {
    try {
      const dir = path.dirname(this.resultsFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.resultsFile, JSON.stringify(results, null, 2));
    } catch (error) {
      this.logger.error('Failed to save test results', { error: error.message });
    }
  }
}
