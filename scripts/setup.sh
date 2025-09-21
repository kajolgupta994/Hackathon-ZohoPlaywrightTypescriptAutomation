#!/bin/bash

# AI-Driven Playwright Automation Framework Setup Script
# This script sets up the complete automation framework with all dependencies

set -e

echo "🤖 Setting up AI-Driven Playwright Automation Framework"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "npm $(npm --version) is installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Install Playwright browsers
install_playwright() {
    print_status "Installing Playwright browsers..."
    npx playwright install --with-deps
    
    if [ $? -eq 0 ]; then
        print_success "Playwright browsers installed successfully"
    else
        print_error "Failed to install Playwright browsers"
        exit 1
    fi
}

# Setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            print_success "Created .env file from template"
            print_warning "Please update .env file with your API keys and configuration"
        else
            print_warning "No env.example file found. Please create .env file manually"
        fi
    else
        print_success ".env file already exists"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    directories=(
        "test-results"
        "test-results/screenshots"
        "test-results/videos"
        "test-results/traces"
        "test-results/baselines"
        "test-results/diffs"
        "test-results/test-data"
        "allure-results"
        "logs"
        "src/tests/generated"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
    done
    
    print_success "Directories created successfully"
}

# Generate test data
generate_test_data() {
    print_status "Generating test data..."
    
    if [ -f "src/utils/test-data-generator.ts" ]; then
        npx ts-node -e "
        import { TestDataGenerator } from './src/utils/test-data-generator';
        const generator = new TestDataGenerator();
        generator.generateFullDataset().then(() => {
            console.log('Test data generated successfully');
        }).catch(console.error);
        "
        print_success "Test data generated successfully"
    else
        print_warning "Test data generator not found, skipping data generation"
    fi
}

# Verify installation
verify_installation() {
    print_status "Verifying installation..."
    
    # Check if Playwright is working
    if npx playwright --version &> /dev/null; then
        print_success "Playwright is working correctly"
    else
        print_error "Playwright verification failed"
        exit 1
    fi
    
    # Check if TypeScript compilation works
    if npx tsc --noEmit &> /dev/null; then
        print_success "TypeScript compilation is working"
    else
        print_warning "TypeScript compilation has issues, but continuing..."
    fi
    
    print_success "Installation verification completed"
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "================================"
    echo ""
    echo "Next steps:"
    echo "1. Update .env file with your API keys:"
    echo "   - GOOGLE_GEMINI_API_KEY"
    echo "   - BASE_URL"
    echo "   - Zoho API credentials (optional)"
    echo ""
    echo "2. Run the AI test generator:"
    echo "   npm run test:ai-generate"
    echo ""
    echo "3. Run tests:"
    echo "   npm run test                    # Run all tests"
    echo "   npm run test:smoke             # Run smoke tests"
    echo "   npm run test:visual            # Run visual tests"
    echo ""
    echo "4. Generate reports:"
    echo "   npm run test:allure            # Generate Allure report"
    echo "   npm run test:report            # View Playwright report"
    echo ""
    echo "5. Detect flaky tests:"
    echo "   npm run test:flaky-detect"
    echo ""
    echo "For more information, see README.md"
    echo ""
}

# Main execution
main() {
    check_node
    check_npm
    install_dependencies
    install_playwright
    setup_environment
    create_directories
    generate_test_data
    verify_installation
    show_next_steps
}

# Run main function
main "$@"
