# AI-Driven Test Results

## Framework Overview
This is an AI-driven automation framework built with Playwright and TypeScript, featuring:

- **Self-healing locators** with fallback strategies
- **Smart wait strategies** for dynamic content
- **AI test generation** using Google Gemini API
- **Flaky test detection** with statistical analysis
- **Visual regression testing** with pixel-perfect comparisons
- **Allure reporting** for comprehensive test insights
- **Screenshot and video capture** for failed tests

## Test Results
- HTML Report: `playwright-report/index.html`
- Allure Report: `allure-report/index.html`
- Screenshots: `test-results/screenshots/`
- Videos: `test-results/videos/`
- Traces: `test-results/traces/`

## AI Features
- Test case generation based on user stories
- Intelligent locator healing
- Flaky test detection and recommendations
- Visual comparison with AI-enhanced analysis

## Usage
```bash
# Run all tests
npm run test

# Generate Allure report
npm run test:allure

# Run AI test generation
npm run test:ai-generate

# Detect flaky tests
npm run test:flaky-detect
```
