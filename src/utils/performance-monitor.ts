import { Page } from '@playwright/test';
import { Logger } from '../core/logger';

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  totalBlockingTime: number;
  speedIndex: number;
  networkRequests: number;
  memoryUsage: number;
}

/**
 * Performance Monitor
 * Monitors and analyzes test execution performance
 */
export class PerformanceMonitor {
  private logger: Logger;
  private metrics: Map<string, PerformanceMetrics> = new Map();

  constructor() {
    this.logger = new Logger('PerformanceMonitor');
  }

  /**
   * Start performance monitoring for a page
   */
  async startMonitoring(page: Page, testName: string): Promise<void> {
    try {
      // Enable performance metrics collection
      await page.addInitScript(() => {
        // Performance observer for Core Web Vitals
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              (window as any).performanceMetrics = (window as any).performanceMetrics || {};
              (window as any).performanceMetrics[entry.name] = entry;
            });
          });

          observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
        }

        // Network monitoring
        (window as any).networkRequests = 0;
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
          (window as any).networkRequests++;
          return originalFetch.apply(this, args);
        };

        const originalXHR = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(...args) {
          (window as any).networkRequests++;
          return originalXHR.apply(this, args);
        };
      });

      this.logger.debug(`Started performance monitoring for: ${testName}`);
    } catch (error) {
      this.logger.error('Failed to start performance monitoring', { error: error.message });
    }
  }

  /**
   * Collect performance metrics
   */
  async collectMetrics(page: Page, testName: string): Promise<PerformanceMetrics> {
    try {
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');
        
        // Core Web Vitals
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        const lcp = performance.getEntriesByType('largest-contentful-paint')[0];
        const fid = performance.getEntriesByType('first-input')[0];
        const cls = performance.getEntriesByType('layout-shift').reduce((sum, entry) => sum + (entry as any).value, 0);

        // Calculate Speed Index (simplified)
        const speedIndex = navigation.loadEventEnd - navigation.navigationStart;

        // Calculate Total Blocking Time (simplified)
        const longTasks = performance.getEntriesByType('longtask');
        const totalBlockingTime = longTasks.reduce((sum, task) => sum + task.duration, 0);

        return {
          pageLoadTime: navigation.loadEventEnd - navigation.navigationStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          firstContentfulPaint: fcp ? fcp.startTime : 0,
          largestContentfulPaint: lcp ? lcp.startTime : 0,
          firstInputDelay: fid ? (fid as any).processingStart - fid.startTime : 0,
          cumulativeLayoutShift: cls,
          totalBlockingTime: totalBlockingTime,
          speedIndex: speedIndex,
          networkRequests: (window as any).networkRequests || 0,
          memoryUsage: (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0
        };
      });

      this.metrics.set(testName, metrics);
      this.logger.debug(`Collected performance metrics for: ${testName}`);
      
      return metrics;
    } catch (error) {
      this.logger.error('Failed to collect performance metrics', { error: error.message });
      return this.getDefaultMetrics();
    }
  }

  /**
   * Analyze performance and generate insights
   */
  analyzePerformance(testName: string): {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    issues: string[];
    recommendations: string[];
  } {
    const metrics = this.metrics.get(testName);
    if (!metrics) {
      return {
        score: 0,
        grade: 'F',
        issues: ['No performance data available'],
        recommendations: ['Enable performance monitoring']
      };
    }

    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Page Load Time (30% weight)
    if (metrics.pageLoadTime > 3000) {
      score -= 30;
      issues.push(`Slow page load time: ${metrics.pageLoadTime}ms`);
      recommendations.push('Optimize page loading, consider lazy loading and code splitting');
    } else if (metrics.pageLoadTime > 2000) {
      score -= 15;
      issues.push(`Moderate page load time: ${metrics.pageLoadTime}ms`);
      recommendations.push('Consider optimizing images and reducing bundle size');
    }

    // First Contentful Paint (25% weight)
    if (metrics.firstContentfulPaint > 1800) {
      score -= 25;
      issues.push(`Slow first contentful paint: ${metrics.firstContentfulPaint}ms`);
      recommendations.push('Optimize critical rendering path and reduce render-blocking resources');
    } else if (metrics.firstContentfulPaint > 1000) {
      score -= 12;
      issues.push(`Moderate first contentful paint: ${metrics.firstContentfulPaint}ms`);
      recommendations.push('Consider optimizing CSS and JavaScript delivery');
    }

    // Largest Contentful Paint (20% weight)
    if (metrics.largestContentfulPaint > 2500) {
      score -= 20;
      issues.push(`Slow largest contentful paint: ${metrics.largestContentfulPaint}ms`);
      recommendations.push('Optimize images and largest content elements');
    } else if (metrics.largestContentfulPaint > 1500) {
      score -= 10;
      issues.push(`Moderate largest contentful paint: ${metrics.largestContentfulPaint}ms`);
      recommendations.push('Consider image optimization and lazy loading');
    }

    // First Input Delay (15% weight)
    if (metrics.firstInputDelay > 100) {
      score -= 15;
      issues.push(`High first input delay: ${metrics.firstInputDelay}ms`);
      recommendations.push('Reduce JavaScript execution time and optimize event handlers');
    } else if (metrics.firstInputDelay > 50) {
      score -= 7;
      issues.push(`Moderate first input delay: ${metrics.firstInputDelay}ms`);
      recommendations.push('Consider code splitting and async loading');
    }

    // Cumulative Layout Shift (10% weight)
    if (metrics.cumulativeLayoutShift > 0.25) {
      score -= 10;
      issues.push(`High cumulative layout shift: ${metrics.cumulativeLayoutShift}`);
      recommendations.push('Fix layout shifts by setting dimensions for images and dynamic content');
    } else if (metrics.cumulativeLayoutShift > 0.1) {
      score -= 5;
      issues.push(`Moderate cumulative layout shift: ${metrics.cumulativeLayoutShift}`);
      recommendations.push('Review dynamic content loading and image sizing');
    }

    // Network Requests
    if (metrics.networkRequests > 100) {
      issues.push(`High number of network requests: ${metrics.networkRequests}`);
      recommendations.push('Consider request consolidation and caching strategies');
    }

    // Memory Usage
    if (metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
      issues.push(`High memory usage: ${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`);
      recommendations.push('Review memory leaks and optimize object creation');
    }

    const grade = this.getGrade(score);
    
    return {
      score: Math.max(0, score),
      grade,
      issues,
      recommendations
    };
  }

  /**
   * Get performance report for all tests
   */
  getPerformanceReport(): {
    overallScore: number;
    averageMetrics: PerformanceMetrics;
    testResults: Array<{
      testName: string;
      score: number;
      grade: string;
      issues: string[];
    }>;
    recommendations: string[];
  } {
    const testResults = Array.from(this.metrics.keys()).map(testName => {
      const analysis = this.analyzePerformance(testName);
      return {
        testName,
        score: analysis.score,
        grade: analysis.grade,
        issues: analysis.issues
      };
    });

    const overallScore = testResults.reduce((sum, result) => sum + result.score, 0) / testResults.length;
    
    const averageMetrics = this.calculateAverageMetrics();
    
    const allRecommendations = testResults.flatMap(result => 
      this.analyzePerformance(result.testName).recommendations
    );
    const uniqueRecommendations = [...new Set(allRecommendations)];

    return {
      overallScore: Math.round(overallScore),
      averageMetrics,
      testResults,
      recommendations: uniqueRecommendations
    };
  }

  /**
   * Clear metrics for a specific test
   */
  clearMetrics(testName: string): void {
    this.metrics.delete(testName);
    this.logger.debug(`Cleared performance metrics for: ${testName}`);
  }

  /**
   * Clear all metrics
   */
  clearAllMetrics(): void {
    this.metrics.clear();
    this.logger.debug('Cleared all performance metrics');
  }

  private getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private calculateAverageMetrics(): PerformanceMetrics {
    const metrics = Array.from(this.metrics.values());
    if (metrics.length === 0) {
      return this.getDefaultMetrics();
    }

    return {
      pageLoadTime: this.average(metrics.map(m => m.pageLoadTime)),
      domContentLoaded: this.average(metrics.map(m => m.domContentLoaded)),
      firstContentfulPaint: this.average(metrics.map(m => m.firstContentfulPaint)),
      largestContentfulPaint: this.average(metrics.map(m => m.largestContentfulPaint)),
      firstInputDelay: this.average(metrics.map(m => m.firstInputDelay)),
      cumulativeLayoutShift: this.average(metrics.map(m => m.cumulativeLayoutShift)),
      totalBlockingTime: this.average(metrics.map(m => m.totalBlockingTime)),
      speedIndex: this.average(metrics.map(m => m.speedIndex)),
      networkRequests: this.average(metrics.map(m => m.networkRequests)),
      memoryUsage: this.average(metrics.map(m => m.memoryUsage))
    };
  }

  private average(numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  private getDefaultMetrics(): PerformanceMetrics {
    return {
      pageLoadTime: 0,
      domContentLoaded: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      totalBlockingTime: 0,
      speedIndex: 0,
      networkRequests: 0,
      memoryUsage: 0
    };
  }
}
