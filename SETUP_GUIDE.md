# 🚀 Setup Guide for AI-Driven Playwright Framework

## Step 1: Install Dependencies

First, install all the required dependencies:

```bash
npm install
```

## Step 2: Install Playwright Browsers

Install Playwright browsers:

```bash
npx playwright install --with-deps
```

## Step 3: Get Your Google Gemini API Key

### 🔑 **IMPORTANT: You need a Google Gemini API Key**

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## Step 4: Configure Environment Variables

Create a `.env` file in the root directory with the following content:

```env
# Environment Configuration
NODE_ENV=development
BASE_URL=http://localhost:3000

# ===========================================
# AI Configuration - REQUIRED
# ===========================================
# Get your API key from: https://makersuite.google.com/app/apikey
GOOGLE_GEMINI_API_KEY=your_actual_gemini_api_key_here
AI_MODEL=gemini-pro
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=1000

# ===========================================
# API Configuration - OPTIONAL
# ===========================================
# These are optional and only needed for API integration
API_BASE_URL=your_api_base_url
API_KEY=your_api_key
API_CLIENT_ID=your_client_id
API_CLIENT_SECRET=your_client_secret
API_REDIRECT_URI=http://localhost:3000/auth/callback

# ===========================================
# Test Configuration
# ===========================================
TEST_TIMEOUT=30000
RETRY_ATTEMPTS=3
SCREENSHOT_ON_FAILURE=true
VIDEO_ON_FAILURE=true
TRACE_ON_RETRY=true

# ===========================================
# Visual Testing Configuration
# ===========================================
VISUAL_THRESHOLD=0.2
VISUAL_UPDATE_SNAPSHOTS=false
VISUAL_IGNORE_ANTI_ALIASING=true

# ===========================================
# Flaky Test Detection Configuration
# ===========================================
FLAKY_DETECTION_ENABLED=true
FLAKY_TEST_THRESHOLD=0.3
FLAKY_RETRY_COUNT=5

# ===========================================
# Logging Configuration
# ===========================================
LOG_LEVEL=info
LOG_FILE=logs/automation.log
```

## Step 5: Replace the API Key

**Replace `your_actual_gemini_api_key_here` with your actual Gemini API key from Step 3.**

## Step 6: Verify Installation

Run the setup verification:

```bash
# On Windows
npm run setup

# On Linux/Mac
chmod +x scripts/setup.sh
./scripts/setup.sh
```

## Step 7: Generate Test Data

Generate sample test data:

```bash
npx ts-node -e "
import { TestDataGenerator } from './src/utils/test-data-generator';
const generator = new TestDataGenerator();
generator.generateFullDataset().then(() => console.log('Test data generated!')).catch(console.error);
"
```

## Step 8: Run Your First Test

```bash
# Generate AI tests
npm run test:ai-generate

# Run smoke tests
npm run test:smoke

# Run all tests
npm run test
```

## Step 9: View Reports

```bash
# Generate Allure report
npm run test:allure

# View Playwright report
npm run test:report
```

## 🔧 Troubleshooting

### Common Issues:

1. **"GOOGLE_GEMINI_API_KEY is required" error**
   - Make sure you've created the `.env` file
   - Verify the API key is correctly set
   - Check that there are no extra spaces or quotes around the key

2. **TypeScript compilation errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check that you have the correct Node.js version (18+)

3. **Playwright browser issues**
   - Run `npx playwright install --with-deps` again
   - On Linux, you might need additional system dependencies

4. **Import errors**
   - Make sure all dependencies are installed
   - Check that the file paths are correct

### Getting Help:

- Check the logs in the `logs/` directory
- Review the generated test reports
- Check the README.md for detailed documentation

## 🎯 Next Steps

1. **Customize Tests**: Modify the test files in `src/tests/` to match your application
2. **Add Page Objects**: Create new page objects in `src/pages/` for your specific pages
3. **Configure CI/CD**: Set up the GitHub Actions workflow for automated testing
4. **Monitor Performance**: Use the performance monitoring features
5. **Generate Reports**: Set up automated reporting with Allure

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Allure Reporting](https://docs.qameta.io/allure/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Happy Testing! 🚀**
