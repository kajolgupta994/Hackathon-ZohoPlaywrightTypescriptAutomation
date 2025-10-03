#!/usr/bin/env ts-node

import { TestGenerator } from './test-generator';
import { Logger } from '../core/logger';
import * as readline from 'readline';

/**
 * CLI for AI Test Generator
 * Interactive command-line interface for generating tests
 */
class TestGeneratorCLI {
  private testGenerator: TestGenerator;
  private logger: Logger;
  private rl: readline.Interface;

  constructor() {
    this.testGenerator = new TestGenerator();
    this.logger = new Logger('TestGeneratorCLI');
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start(): Promise<void> {
    console.log('🤖 AI Test Generator CLI');
    console.log('========================\n');

    try {
      while (true) {
        const choice = await this.showMenu();
        
        switch (choice) {
          case '1':
            await this.generateWebAppTests();
            break;
          case '2':
            await this.generateCustomTests();
            break;
          case '3':
            await this.generateVisualTests();
            break;
          case '4':
            await this.showTestStats();
            break;
          case '5':
            console.log('👋 Goodbye!');
            process.exit(0);
          default:
            console.log('❌ Invalid choice. Please try again.\n');
        }
      }
    } catch (error) {
      this.logger.error('CLI error', { error: (error as Error).message });
      console.log('❌ An error occurred. Please check the logs.');
    } finally {
      this.rl.close();
    }
  }

  private async showMenu(): Promise<string> {
    console.log('📋 Menu Options:');
    console.log('1. Generate Web Application Tests');
    console.log('2. Generate Custom Tests');
    console.log('3. Generate Visual Tests');
    console.log('4. Show Test Statistics');
    console.log('5. Exit\n');

    return new Promise((resolve) => {
      this.rl.question('Enter your choice (1-5): ', (answer) => {
        resolve(answer.trim());
      });
    });
  }

  private async generateWebAppTests(): Promise<void> {
    console.log('\n🚀 Generating Web Application Tests...\n');
    
    try {
      const tests = await this.testGenerator.generateWebAppTests();
      
      console.log(`✅ Generated ${tests.length} tests successfully!\n`);
      
      tests.forEach((test, index) => {
        console.log(`${index + 1}. ${test.testName}`);
        console.log(`   Description: ${test.description}`);
        console.log(`   Priority: ${test.priority}`);
        console.log(`   Estimated Duration: ${test.estimatedDuration}s`);
        console.log(`   Tags: ${test.tags.join(', ')}\n`);
      });
    } catch (error) {
      console.log(`❌ Failed to generate tests: ${(error as Error).message}\n`);
    }
  }

  private async generateCustomTests(): Promise<void> {
    console.log('\n📝 Custom Test Generation\n');
    
    try {
      const feature = await this.promptInput('Enter feature name: ');
      const userStory = await this.promptInput('Enter user story: ');
      const testType = await this.promptChoice('Select test type:', ['e2e', 'integration', 'unit', 'visual']);
      const priority = await this.promptChoice('Select priority:', ['high', 'medium', 'low']);
      
      const acceptanceCriteria: string[] = [];
      console.log('\nEnter acceptance criteria (press Enter with empty line to finish):');
      
      while (true) {
        const criteria = await this.promptInput('Criteria: ');
        if (!criteria.trim()) break;
        acceptanceCriteria.push(criteria);
      }

      const request = {
        feature,
        userStory,
        acceptanceCriteria,
        testType: testType as 'e2e' | 'integration' | 'unit' | 'visual',
        priority: priority as 'high' | 'medium' | 'low',
        tags: ['custom', 'generated']
      };

      console.log('\n🚀 Generating custom tests...\n');
      const tests = await this.testGenerator.generateFromUserStory(request);
      
      console.log(`✅ Generated ${tests.length} tests successfully!\n`);
      
      tests.forEach((test, index) => {
        console.log(`${index + 1}. ${test.testName}`);
        console.log(`   Description: ${test.description}\n`);
      });
    } catch (error) {
      console.log(`❌ Failed to generate custom tests: ${(error as Error).message}\n`);
    }
  }

  private async generateVisualTests(): Promise<void> {
    console.log('\n🎨 Visual Test Generation\n');
    
    try {
      const component = await this.promptInput('Enter component name: ');
      
      console.log('\n🚀 Generating visual tests...\n');
      const tests = await this.testGenerator.generateVisualTests(component);
      
      console.log(`✅ Generated ${tests.length} visual tests for ${component}!\n`);
      
      tests.forEach((test, index) => {
        console.log(`${index + 1}. ${test.testName}`);
        console.log(`   Description: ${test.description}\n`);
      });
    } catch (error) {
      console.log(`❌ Failed to generate visual tests: ${(error as Error).message}\n`);
    }
  }

  private async showTestStats(): Promise<void> {
    console.log('\n📊 Test Statistics\n');
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      const generatedDir = path.join(process.cwd(), 'src', 'tests', 'generated');
      
      if (!fs.existsSync(generatedDir)) {
        console.log('No generated tests found.\n');
        return;
      }

      const features = fs.readdirSync(generatedDir);
      let totalTests = 0;
      
      console.log('Generated Tests by Feature:');
      console.log('==========================\n');
      
      for (const feature of features) {
        const featurePath = path.join(generatedDir, feature);
        if (fs.statSync(featurePath).isDirectory()) {
          const testFiles = fs.readdirSync(featurePath)
            .filter((file: string) => file.endsWith('.spec.ts'));
          
          console.log(`${feature}: ${testFiles.length} tests`);
          totalTests += testFiles.length;
        }
      }
      
      console.log(`\nTotal Generated Tests: ${totalTests}\n`);
    } catch (error) {
      console.log(`❌ Failed to get test statistics: ${(error as Error).message}\n`);
    }
  }

  private async promptInput(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  private async promptChoice(question: string, choices: string[]): Promise<string> {
    console.log(question);
    choices.forEach((choice, index) => {
      console.log(`  ${index + 1}. ${choice}`);
    });
    
    return new Promise((resolve) => {
      this.rl.question(`Enter choice (1-${choices.length}): `, (answer) => {
        const choiceIndex = parseInt(answer) - 1;
        if (choiceIndex >= 0 && choiceIndex < choices.length) {
          resolve(choices[choiceIndex]);
        } else {
          console.log('Invalid choice. Please try again.');
          this.promptChoice(question, choices).then(resolve);
        }
      });
    });
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  const cli = new TestGeneratorCLI();
  cli.start().catch(console.error);
}

export { TestGeneratorCLI };
