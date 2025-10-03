# Playwright MCP Server Integration

This document explains the integration of Playwright MCP (Model Context Protocol) Server into the automation framework.

## Overview

The MCP Server provides real-time browser interaction capabilities that complement the existing AI-driven test generation framework. It enables:

- Real-time DOM analysis
- Screenshot analysis
- Network request monitoring
- Interactive test generation
- Browser context-aware AI operations

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Engine     │    │  MCP Server      │    │   Browser       │
│                 │◄──►│                  │◄──►│                 │
│ - Test Gen      │    │ - DOM Analysis   │    │ - Real-time     │
│ - Self Healing  │    │ - Screenshots    │    │ - Interaction   │
│ - Smart Waits   │    │ - Network Monitor│    │ - Context       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Key Features

### 1. Real-time Browser Context
- Navigate to pages and capture current state
- Analyze DOM structure and interactive elements
- Take screenshots for visual analysis
- Monitor network requests and console logs

### 2. Enhanced Test Generation
- Generate tests based on actual page content
- Create locators from real DOM elements
- Adapt to dynamic content changes
- Provide context-aware test scenarios

### 3. Self-Healing Capabilities
- Analyze page changes in real-time
- Update locators based on current DOM
- Adapt to UI modifications
- Maintain test stability

## Usage

### Basic MCP Server Operations

```typescript
// Initialize MCP Server
const mcpServer = new PlaywrightMCPServer(page);
await mcpServer.initialize();

// Navigate and analyze
await mcpServer.navigateTo('http://localhost:3000');
const pageAnalysis = await mcpServer.explorePage();
const domAnalysis = await mcpServer.analyzeDOM();

// Take screenshot
const screenshot = await mcpServer.takeScreenshot('analysis');

// Close when done
await mcpServer.close();
```

### AI-Enhanced Test Generation

```typescript
// Generate tests with browser context
const testCases = await aiEngine.generateTestCasesWithBrowserContext(
  'Login functionality test cases',
  'http://localhost:3000'
);
```

## Configuration

The MCP Server is configured in `src/core/ai-engine.ts`:

```typescript
// MCP Server integration
private mcpServer: PlaywrightMCPServer | null = null;

async initializeMCPServer() {
  this.mcpServer = new PlaywrightMCPServer(this.page);
  await this.mcpServer.initialize();
}
```

## Benefits

1. **Real-time Context**: Tests are generated based on actual page state
2. **Dynamic Adaptation**: Framework adapts to UI changes automatically
3. **Enhanced Accuracy**: Locators are generated from real DOM elements
4. **Visual Analysis**: Screenshot-based test validation
5. **Network Monitoring**: Track API calls and performance

## Integration with Existing Framework

The MCP Server seamlessly integrates with:
- **AI Engine**: Enhanced test generation with browser context
- **Self-Healing Locators**: Real-time DOM analysis for locator updates
- **Smart Waits**: Context-aware waiting strategies
- **Visual Validator**: Screenshot-based visual testing

## Commands

```bash
# Generate tests with MCP
npm run test:ai-generate-mcp

# Run MCP-specific tests
npm run test:mcp
```

## Future Enhancements

- Multi-browser context analysis
- Cross-page flow testing
- Performance monitoring integration
- Advanced visual regression testing
