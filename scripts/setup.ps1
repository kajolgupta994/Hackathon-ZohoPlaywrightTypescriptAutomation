# AI-Driven Playwright Automation Framework Setup Script for Windows
# This script sets up the complete automation framework with all dependencies

param(
    [switch]$SkipDependencies,
    [switch]$SkipBrowsers,
    [switch]$SkipData
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Purple = "Magenta"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Function to check if Node.js is installed
function Test-NodeJS {
    Write-Status "Checking Node.js installation..."
    
    try {
        $nodeVersion = node --version
        $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        
        if ($versionNumber -lt 18) {
            Write-Error "Node.js version 18+ is required. Current version: $nodeVersion"
            exit 1
        }
        
        Write-Success "Node.js $nodeVersion is installed"
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js 18+ first."
        Write-Host "Download from: https://nodejs.org/"
        exit 1
    }
}

# Function to check if npm is installed
function Test-NPM {
    Write-Status "Checking npm installation..."
    
    try {
        $npmVersion = npm --version
        Write-Success "npm $npmVersion is installed"
    }
    catch {
        Write-Error "npm is not installed. Please install npm first."
        exit 1
    }
}

# Function to install dependencies
function Install-Dependencies {
    if ($SkipDependencies) {
        Write-Status "Skipping dependency installation..."
        return
    }
    
    Write-Status "Installing project dependencies..."
    
    try {
        npm install
        Write-Success "Dependencies installed successfully"
    }
    catch {
        Write-Error "Failed to install dependencies"
        exit 1
    }
}

# Function to install Playwright browsers
function Install-Playwright {
    if ($SkipBrowsers) {
        Write-Status "Skipping Playwright browser installation..."
        return
    }
    
    Write-Status "Installing Playwright browsers..."
    
    try {
        npx playwright install --with-deps
        Write-Success "Playwright browsers installed successfully"
    }
    catch {
        Write-Error "Failed to install Playwright browsers"
        exit 1
    }
}

# Function to setup environment file
function Setup-Environment {
    Write-Status "Setting up environment configuration..."
    
    if (-not (Test-Path ".env")) {
        if (Test-Path "env.example") {
            Copy-Item "env.example" ".env"
            Write-Success "Created .env file from template"
            Write-Warning "Please update .env file with your API keys and configuration"
        }
        else {
            Write-Warning "No env.example file found. Please create .env file manually"
        }
    }
    else {
        Write-Success ".env file already exists"
    }
}

# Function to create necessary directories
function New-Directories {
    Write-Status "Creating necessary directories..."
    
    $directories = @(
        "test-results",
        "test-results\screenshots",
        "test-results\videos",
        "test-results\traces",
        "test-results\baselines",
        "test-results\diffs",
        "test-results\test-data",
        "allure-results",
        "logs",
        "src\tests\generated"
    )
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    
    Write-Success "Directories created successfully"
}

# Function to generate test data
function New-TestData {
    if ($SkipData) {
        Write-Status "Skipping test data generation..."
        return
    }
    
    Write-Status "Generating test data..."
    
    try {
        $script = @"
import { TestDataGenerator } from './src/utils/test-data-generator';
const generator = new TestDataGenerator();
generator.generateFullDataset().then(() => {
    console.log('Test data generated successfully');
}).catch(console.error);
"@
        
        $script | npx ts-node
        Write-Success "Test data generated successfully"
    }
    catch {
        Write-Warning "Test data generation failed, but continuing..."
    }
}

# Function to verify installation
function Test-Installation {
    Write-Status "Verifying installation..."
    
    # Check if Playwright is working
    try {
        $playwrightVersion = npx playwright --version
        Write-Success "Playwright is working correctly"
    }
    catch {
        Write-Error "Playwright verification failed"
        exit 1
    }
    
    # Check if TypeScript compilation works
    try {
        npx tsc --noEmit | Out-Null
        Write-Success "TypeScript compilation is working"
    }
    catch {
        Write-Warning "TypeScript compilation has issues, but continuing..."
    }
    
    Write-Success "Installation verification completed"
}

# Function to display next steps
function Show-NextSteps {
    Write-Host ""
    Write-Host "🎉 Setup completed successfully!" -ForegroundColor $Purple
    Write-Host "================================" -ForegroundColor $Purple
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Update .env file with your API keys:"
    Write-Host "   - GOOGLE_GEMINI_API_KEY (REQUIRED)"
    Write-Host "   - BASE_URL"
    Write-Host "   - Zoho API credentials (optional)"
    Write-Host ""
    Write-Host "2. Get your Gemini API key from:"
    Write-Host "   https://makersuite.google.com/app/apikey"
    Write-Host ""
    Write-Host "3. Run the AI test generator:"
    Write-Host "   npm run test:ai-generate"
    Write-Host ""
    Write-Host "4. Run tests:"
    Write-Host "   npm run test                    # Run all tests"
    Write-Host "   npm run test:smoke             # Run smoke tests"
    Write-Host "   npm run test:visual            # Run visual tests"
    Write-Host ""
    Write-Host "5. Generate reports:"
    Write-Host "   npm run test:allure            # Generate Allure report"
    Write-Host "   npm run test:report            # View Playwright report"
    Write-Host ""
    Write-Host "6. Detect flaky tests:"
    Write-Host "   npm run test:flaky-detect"
    Write-Host ""
    Write-Host "For more information, see SETUP_GUIDE.md"
    Write-Host ""
}

# Main execution
function Main {
    Write-Host "🤖 Setting up AI-Driven Playwright Automation Framework" -ForegroundColor $Purple
    Write-Host "======================================================" -ForegroundColor $Purple
    
    Test-NodeJS
    Test-NPM
    Install-Dependencies
    Install-Playwright
    Setup-Environment
    New-Directories
    New-TestData
    Test-Installation
    Show-NextSteps
}

# Run main function
Main
