import { Page, expect } from '@playwright/test';
import { Logger } from './logger';
import * as fs from 'fs';
import * as path from 'path';
import * as pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import sharp from 'sharp';

interface VisualComparisonResult {
  passed: boolean;
  diff: number;
  baselinePath: string;
  currentPath: string;
  diffPath: string;
  threshold: number;
}

/**
 * Visual Validation System
 * AI-powered visual regression testing with intelligent comparison
 */
export class VisualValidator {
  private logger: Logger;
  private screenshotsDir: string;
  private baselineDir: string;
  private diffDir: string;
  private threshold: number;

  constructor() {
    this.logger = new Logger('VisualValidator');
    this.screenshotsDir = path.join(process.cwd(), 'test-results', 'screenshots');
    this.baselineDir = path.join(process.cwd(), 'test-results', 'baselines');
    this.diffDir = path.join(process.cwd(), 'test-results', 'diffs');
    this.threshold = parseFloat(process.env.VISUAL_THRESHOLD || '0.2');
    
    this.ensureDirectories();
  }

  /**
   * Capture and compare visual elements
   */
  async compareVisual(
    page: Page,
    selector: string,
    testName: string,
    options?: {
      threshold?: number;
      ignoreRegions?: Array<{ x: number; y: number; width: number; height: number }>;
      updateBaseline?: boolean;
    }
  ): Promise<VisualComparisonResult> {
    const { threshold = this.threshold, ignoreRegions = [], updateBaseline = false } = options || {};
    
    try {
      const element = page.locator(selector);
      await element.waitFor({ state: 'visible' });

      // Capture current screenshot
      const currentPath = await this.captureElementScreenshot(page, element, testName, 'current');
      const baselinePath = path.join(this.baselineDir, `${testName}.png`);

      // Update baseline if requested
      if (updateBaseline) {
        await this.updateBaseline(currentPath, baselinePath);
        return {
          passed: true,
          diff: 0,
          baselinePath,
          currentPath,
          diffPath: '',
          threshold
        };
      }

      // Compare with baseline
      if (!fs.existsSync(baselinePath)) {
        this.logger.warn(`No baseline found for ${testName}, creating new baseline`);
        await this.updateBaseline(currentPath, baselinePath);
        return {
          passed: true,
          diff: 0,
          baselinePath,
          currentPath,
          diffPath: '',
          threshold
        };
      }

      const comparison = await this.compareImages(baselinePath, currentPath, testName, threshold, ignoreRegions);
      
      this.logger.visualComparison(baselinePath, currentPath, comparison.diff, comparison.passed);
      
      return comparison;
    } catch (error) {
      this.logger.error(`Visual comparison failed for ${testName}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Compare full page screenshots
   */
  async compareFullPage(
    page: Page,
    testName: string,
    options?: {
      threshold?: number;
      ignoreRegions?: Array<{ x: number; y: number; width: number; height: number }>;
      updateBaseline?: boolean;
    }
  ): Promise<VisualComparisonResult> {
    const { threshold = this.threshold, ignoreRegions = [], updateBaseline = false } = options || {};
    
    try {
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Additional wait for animations

      // Capture full page screenshot
      const currentPath = await this.captureFullPageScreenshot(page, testName, 'current');
      const baselinePath = path.join(this.baselineDir, `${testName}-fullpage.png`);

      // Update baseline if requested
      if (updateBaseline) {
        await this.updateBaseline(currentPath, baselinePath);
        return {
          passed: true,
          diff: 0,
          baselinePath,
          currentPath,
          diffPath: '',
          threshold
        };
      }

      // Compare with baseline
      if (!fs.existsSync(baselinePath)) {
        this.logger.warn(`No baseline found for ${testName}, creating new baseline`);
        await this.updateBaseline(currentPath, baselinePath);
        return {
          passed: true,
          diff: 0,
          baselinePath,
          currentPath,
          diffPath: '',
          threshold
        };
      }

      const comparison = await this.compareImages(baselinePath, currentPath, testName, threshold, ignoreRegions);
      
      this.logger.visualComparison(baselinePath, currentPath, comparison.diff, comparison.passed);
      
      return comparison;
    } catch (error) {
      this.logger.error(`Full page comparison failed for ${testName}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Capture element screenshot
   */
  private async captureElementScreenshot(
    page: Page,
    element: any,
    testName: string,
    type: 'current' | 'baseline'
  ): Promise<string> {
    const filename = `${testName}-${type}.png`;
    const filepath = path.join(this.screenshotsDir, filename);
    
    await element.screenshot({ path: filepath });
    return filepath;
  }

  /**
   * Capture full page screenshot
   */
  private async captureFullPageScreenshot(
    page: Page,
    testName: string,
    type: 'current' | 'baseline'
  ): Promise<string> {
    const filename = `${testName}-fullpage-${type}.png`;
    const filepath = path.join(this.screenshotsDir, filename);
    
    await page.screenshot({ 
      path: filepath,
      fullPage: true,
      animations: 'disabled'
    });
    return filepath;
  }

  /**
   * Compare two images using pixelmatch
   */
  private async compareImages(
    baselinePath: string,
    currentPath: string,
    testName: string,
    threshold: number,
    ignoreRegions: Array<{ x: number; y: number; width: number; height: number }>
  ): Promise<VisualComparisonResult> {
    try {
      // Load images
      const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
      const current = PNG.sync.read(fs.readFileSync(currentPath));

      // Ensure images have same dimensions
      if (baseline.width !== current.width || baseline.height !== current.height) {
        this.logger.warn(`Image dimensions don't match for ${testName}`);
        return {
          passed: false,
          diff: 1,
          baselinePath,
          currentPath,
          diffPath: '',
          threshold
        };
      }

      // Create diff image
      const diff = new PNG({ width: baseline.width, height: baseline.height });
      
      // Apply ignore regions
      const processedBaseline = this.applyIgnoreRegions(baseline, ignoreRegions);
      const processedCurrent = this.applyIgnoreRegions(current, ignoreRegions);

      // Compare images
      const diffPixels = pixelmatch(
        processedBaseline.data,
        processedCurrent.data,
        diff.data,
        baseline.width,
        baseline.height,
        {
          threshold: threshold,
          alpha: 0.1,
          diffColor: [255, 0, 0], // Red for differences
          diffColorAlt: [0, 255, 0] // Green for differences
        }
      );

      const diffPercentage = diffPixels / (baseline.width * baseline.height);
      const passed = diffPercentage <= threshold;

      // Save diff image if there are differences
      let diffPath = '';
      if (!passed && diffPixels > 0) {
        diffPath = path.join(this.diffDir, `${testName}-diff.png`);
        fs.writeFileSync(diffPath, PNG.sync.write(diff));
      }

      return {
        passed,
        diff: diffPercentage,
        baselinePath,
        currentPath,
        diffPath,
        threshold
      };
    } catch (error) {
      this.logger.error(`Image comparison failed for ${testName}`, { error: error.message });
      throw error;
    }
  }

  /**
   * Apply ignore regions to image
   */
  private applyIgnoreRegions(
    image: PNG,
    ignoreRegions: Array<{ x: number; y: number; width: number; height: number }>
  ): PNG {
    const processed = new PNG({ width: image.width, height: image.height });
    processed.data = Buffer.from(image.data);

    for (const region of ignoreRegions) {
      for (let y = region.y; y < region.y + region.height && y < image.height; y++) {
        for (let x = region.x; x < region.x + region.width && x < image.width; x++) {
          const idx = (y * image.width + x) * 4;
          // Set to transparent or neutral color
          processed.data[idx] = 0;     // R
          processed.data[idx + 1] = 0; // G
          processed.data[idx + 2] = 0; // B
          processed.data[idx + 3] = 0; // A
        }
      }
    }

    return processed;
  }

  /**
   * Update baseline image
   */
  private async updateBaseline(currentPath: string, baselinePath: string): Promise<void> {
    try {
      fs.copyFileSync(currentPath, baselinePath);
      this.logger.info(`Baseline updated: ${baselinePath}`);
    } catch (error) {
      this.logger.error('Failed to update baseline', { error: error.message });
      throw error;
    }
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectories(): void {
    [this.screenshotsDir, this.baselineDir, this.diffDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Clean up old screenshots
   */
  async cleanupOldScreenshots(daysToKeep: number = 7): Promise<void> {
    try {
      const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      
      for (const dir of [this.screenshotsDir, this.diffDir]) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          if (stats.mtime.getTime() < cutoffTime) {
            fs.unlinkSync(filePath);
            this.logger.debug(`Deleted old screenshot: ${filePath}`);
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to cleanup old screenshots', { error: error.message });
    }
  }

  /**
   * Get visual test statistics
   */
  async getVisualTestStats(): Promise<{
    totalBaselines: number;
    totalScreenshots: number;
    totalDiffs: number;
    recentFailures: number;
  }> {
    try {
      const baselines = fs.readdirSync(this.baselineDir).length;
      const screenshots = fs.readdirSync(this.screenshotsDir).length;
      const diffs = fs.readdirSync(this.diffDir).length;
      
      // Count recent failures (last 24 hours)
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
      let recentFailures = 0;
      const diffFiles = fs.readdirSync(this.diffDir);
      for (const file of diffFiles) {
        const filePath = path.join(this.diffDir, file);
        const stats = fs.statSync(filePath);
        if (stats.mtime.getTime() > cutoffTime) {
          recentFailures++;
        }
      }

      return {
        totalBaselines: baselines,
        totalScreenshots: screenshots,
        totalDiffs: diffs,
        recentFailures
      };
    } catch (error) {
      this.logger.error('Failed to get visual test stats', { error: error.message });
      return {
        totalBaselines: 0,
        totalScreenshots: 0,
        totalDiffs: 0,
        recentFailures: 0
      };
    }
  }
}
