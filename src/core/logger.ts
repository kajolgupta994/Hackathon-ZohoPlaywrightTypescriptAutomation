import winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Centralized logging system for AI automation framework
 * Provides structured logging with different levels and outputs
 */
export class Logger {
  private logger: winston.Logger;
  private logDir: string;

  constructor(module: string) {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
    
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, module, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}] [${module}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
      defaultMeta: { module },
      transports: [
        // Console output
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        // File output
        new winston.transports.File({
          filename: path.join(this.logDir, 'automation.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // Error file
        new winston.transports.File({
          filename: path.join(this.logDir, 'error.log'),
          level: 'error',
          maxsize: 5242880,
          maxFiles: 5,
        })
      ]
    });
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  // AI-specific logging methods
  aiRequest(prompt: string, model: string): void {
    this.logger.info('AI Request', { prompt: prompt.substring(0, 100) + '...', model });
  }

  aiResponse(response: string, tokens?: number): void {
    this.logger.info('AI Response', { response: response.substring(0, 100) + '...', tokens });
  }

  testExecution(testName: string, status: 'started' | 'passed' | 'failed' | 'skipped', duration?: number): void {
    this.logger.info('Test Execution', { testName, status, duration });
  }

  flakyTestDetected(testName: string, score: number, reasons: string[]): void {
    this.logger.warn('Flaky Test Detected', { testName, score, reasons });
  }

  selfHealingLocator(original: string, healed: string, success: boolean): void {
    this.logger.info('Self-Healing Locator', { original, healed, success });
  }

  visualComparison(baseline: string, current: string, diff: number, passed: boolean): void {
    this.logger.info('Visual Comparison', { baseline, current, diff, passed });
  }
}
