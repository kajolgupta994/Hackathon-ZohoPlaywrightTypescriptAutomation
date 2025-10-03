# 🤖 AI-Driven Playwright Automation Framework

A comprehensive, AI-powered automation testing framework built with Playwright and TypeScript, featuring intelligent capabilities and self-healing mechanisms for any web application.

## ✨ Features

### 🧠 AI-Powered Capabilities
- **AI Test Generation**: Generate comprehensive test cases using Google Gemini API
- **Self-Healing Locators**: Automatically adapt to UI changes with fallback strategies
- **Smart Wait Strategies**: Intelligent waiting mechanisms for dynamic content
- **Flaky Test Detection**: AI-powered analysis to identify and fix flaky tests
- **Visual Regression Testing**: Pixel-perfect visual comparisons with AI enhancements

### 🎯 Web Application Testing
- **Page Object Model**: Structured page interactions with AI enhancements
- **Form Testing**: Automated form validation and submission testing
- **Navigation Testing**: Comprehensive navigation and routing testing
- **Search & Discovery**: Advanced search and filtering functionality testing

### 📊 Advanced Reporting
- **Allure Integration**: Rich, interactive test reports with detailed insights
- **Screenshot & Video Capture**: Automatic capture for failed tests
- **AI Analysis Reports**: Intelligent insights and recommendations
- **Flaky Test Reports**: Detailed analysis of test stability

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Gemini API key
- API credentials (optional for enhanced functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd your-project-name
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

4. **Setup environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your API keys and configuration
   ```

5. **Generate AI tests**
   ```bash
   npm run test:ai-generate
   ```

6. **Run tests**
   ```bash
   npm run test
   ```

## 🛠️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# AI Configuration
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-pro
AI_TEMPERATURE=0.7

# Application Configuration
BASE_URL=http://localhost:3000

# API Configuration (Optional)
API_BASE_URL=your_api_base_url
API_KEY=your_api_key
API_CLIENT_ID=your_client_id
API_CLIENT_SECRET=your_client_secret

# Test Configuration
TEST_TIMEOUT=30000
RETRY_ATTEMPTS=3
VISUAL_THRESHOLD=0.2
FLAKY_DETECTION_ENABLED=true
```

### Playwright Configuration

The framework uses an enhanced Playwright configuration with AI capabilities:

```typescript
// playwright.config.ts
export default defineConfig({
  // AI-enhanced timeout strategies
  actionTimeout: 30000,
  navigationTimeout: 60000,
  
  // Enhanced screenshot and video capture
  screenshot: {
    mode: 'only-on-failure',
    fullPage: true,
    animations: 'disabled'
  },
  video: {
    mode: 'retain-on-failure',
    size: { width: 1280, height: 720 }
  },
  
  // Allure reporting
  reporter: [
    ['allure-playwright', { 
      outputFolder: 'allure-results',
      detail: true,
      suiteTitle: false,
      attachments: true
    }]
  ]
});
```

## 🧪 Test Structure

### Page Objects
- `PageObjectBase`: Base page with AI-enhanced methods
- `LoginPage`: Authentication functionality
- `DashboardPage`: Main application dashboard

### Test Files
- `authentication.spec.ts`: Login and authentication tests
- `dashboard.spec.ts`: Main application functionality tests
- `generated/`: AI-generated test files

### Core Components
- `AIEngine`: Google Gemini API integration
- `SelfHealingLocators`: Adaptive locator strategies
- `SmartWaits`: Intelligent waiting mechanisms
- `FlakyTestDetector`: Test stability analysis
- `VisualValidator`: Visual regression testing

## 🎮 Usage

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:smoke          # Smoke tests
npm run test:regression     # Full regression suite
npm run test:visual         # Visual regression tests
npm run test:failed         # Re-run failed tests

# Run with specific browsers
npm run test -- --project=chromium
npm run test -- --project=firefox
npm run test -- --project=webkit

# Run in headed mode
npm run test:headed

# Run with debug mode
npm run test:debug
```

### AI Test Generation

```bash
# Interactive AI test generation
npm run test:ai-generate

# Generate tests for specific features
npx ts-node src/ai/test-generator-cli.ts
```

### Flaky Test Detection

```bash
# Detect flaky tests
npm run test:flaky-detect

# Run with retry for flaky tests
npm run test:retry
```

### Reporting

```bash
# Generate Allure report
npm run test:allure

# Serve Allure report
npm run test:allure-serve

# View Playwright report
npm run test:report
```

## 🔧 AI Features

### Self-Healing Locators

The framework automatically adapts to UI changes using multiple fallback strategies:

```typescript
// Automatic fallback strategies
const locator = await selfHealingLocators.getLocator(page, 'login button', {
  fallbackStrategies: [
    '[data-testid="login-btn"]',
    'button:has-text("Login")',
    '[role="button"]:has-text("Login")',
    'input[type="submit"][value="Login"]'
  ]
});
```

### Smart Wait Strategies

Intelligent waiting mechanisms that adapt to different scenarios:

```typescript
// AI-enhanced waiting
await smartWaits.waitForElement(page, locator, {
  timeout: 30000,
  useAI: true,
  customConditions: [
    'url === "https://your-app.com/dashboard"',
    'function() { return document.readyState === "complete"; }'
  ]
});
```

### AI Test Generation

Generate comprehensive test cases from user stories:

```typescript
const testGenerator = new TestGenerator();
const tests = await testGenerator.generateFromUserStory({
  feature: 'User Authentication',
  userStory: 'As a user, I want to login to access my account...',
  acceptanceCriteria: ['Login is successful', 'User is redirected to dashboard'],
  testType: 'e2e',
  priority: 'high'
});
```

### Visual Regression Testing

AI-enhanced visual comparisons with intelligent analysis:

```typescript
const visualResult = await visualValidator.compareVisual(
  page,
  '[data-testid="user-list"]',
  'user-list-visual',
  {
    threshold: 0.1,
    ignoreRegions: [{ x: 0, y: 0, width: 100, height: 50 }]
  }
);
```

## 📊 Reporting

### Allure Reports

Rich, interactive reports with:
- Test execution timeline
- Screenshots and videos for failed tests
- AI analysis and recommendations
- Flaky test detection results
- Visual comparison results

### Playwright Reports

Standard Playwright reports with:
- Test results overview
- Screenshot gallery
- Video recordings
- Trace files for debugging

### AI Analysis Reports

Intelligent insights including:
- Test execution patterns
- Performance recommendations
- Flaky test analysis
- Coverage suggestions

## 🚀 CI/CD Integration

The framework includes a comprehensive GitHub Actions workflow with:

- **AI Test Generation**: Automatic test generation on PRs
- **Flaky Test Detection**: Scheduled analysis of test stability
- **Multi-browser Testing**: Parallel execution across browsers
- **Visual Regression**: Automated visual testing
- **AI Analysis**: Post-execution analysis and reporting
- **Allure Reports**: Automated report generation

## 🛡️ Best Practices

### Test Design
- Use descriptive test names with tags
- Implement proper test isolation
- Use Page Object Model pattern
- Leverage AI-generated test cases

### Maintenance
- Regularly update AI models
- Monitor flaky test reports
- Update visual baselines when needed
- Review and refine self-healing strategies

### Performance
- Use parallel execution where possible
- Implement smart retry strategies
- Optimize wait times with AI
- Monitor test execution duration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the full test suite
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the example tests
- Consult the AI-generated insights

## 🔮 Roadmap

- [ ] Enhanced AI model integration
- [ ] Mobile testing capabilities
- [ ] Performance testing integration
- [ ] Advanced visual AI analysis
- [ ] Cross-platform testing support
- [ ] Real-time test monitoring

---

**Built with ❤️ using Playwright, TypeScript, and AI**

