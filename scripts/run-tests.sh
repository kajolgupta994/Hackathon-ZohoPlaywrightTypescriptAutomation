#!/bin/bash

# AI-Driven Playwright Test Runner Script
# Provides various test execution options with AI enhancements

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${PURPLE}🤖 AI-Driven Playwright Test Runner${NC}"
    echo "======================================"
}

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

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  smoke              Run smoke tests only"
    echo "  regression         Run full regression suite"
    echo "  visual             Run visual regression tests"
    echo "  failed             Re-run failed tests"
    echo "  flaky              Run flaky test detection"
    echo "  generate           Generate AI tests"
    echo "  all                Run all tests (default)"
    echo "  --headed           Run in headed mode"
    echo "  --debug            Run in debug mode"
    echo "  --ui               Run with Playwright UI"
    echo "  --browser [name]   Run with specific browser (chromium, firefox, webkit)"
    echo "  --parallel [num]   Run with specified number of workers"
    echo "  --retry [num]      Retry failed tests specified number of times"
    echo "  --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 smoke --headed"
    echo "  $0 regression --browser chromium --parallel 4"
    echo "  $0 visual --retry 2"
    echo "  $0 generate"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Please run setup.sh first or create .env manually"
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_error "node_modules not found. Please run 'npm install' first"
        exit 1
    fi
    
    # Check if Playwright is installed
    if ! npx playwright --version &> /dev/null; then
        print_error "Playwright not found. Please run 'npx playwright install' first"
        exit 1
    fi
    
    print_success "Prerequisites check completed"
}

# Function to run smoke tests
run_smoke_tests() {
    print_status "Running smoke tests..."
    npx playwright test --grep @smoke "$@"
    
    if [ $? -eq 0 ]; then
        print_success "Smoke tests completed successfully"
    else
        print_error "Smoke tests failed"
        exit 1
    fi
}

# Function to run regression tests
run_regression_tests() {
    print_status "Running regression tests..."
    npx playwright test --grep @regression "$@"
    
    if [ $? -eq 0 ]; then
        print_success "Regression tests completed successfully"
    else
        print_error "Regression tests failed"
        exit 1
    fi
}

# Function to run visual tests
run_visual_tests() {
    print_status "Running visual regression tests..."
    npx playwright test --grep @visual "$@"
    
    if [ $? -eq 0 ]; then
        print_success "Visual tests completed successfully"
    else
        print_error "Visual tests failed"
        exit 1
    fi
}

# Function to run failed tests
run_failed_tests() {
    print_status "Re-running failed tests..."
    npx playwright test --grep @failed "$@"
    
    if [ $? -eq 0 ]; then
        print_success "Failed tests re-run completed"
    else
        print_error "Failed tests still failing"
        exit 1
    fi
}

# Function to run all tests
run_all_tests() {
    print_status "Running all tests..."
    npx playwright test "$@"
    
    if [ $? -eq 0 ]; then
        print_success "All tests completed successfully"
    else
        print_error "Some tests failed"
        exit 1
    fi
}

# Function to run flaky test detection
run_flaky_detection() {
    print_status "Running flaky test detection..."
    npx ts-node src/ai/test-generator-cli.ts
    
    if [ $? -eq 0 ]; then
        print_success "Flaky test detection completed"
    else
        print_error "Flaky test detection failed"
        exit 1
    fi
}

# Function to generate AI tests
generate_ai_tests() {
    print_status "Generating AI tests..."
    npx ts-node src/ai/test-generator-cli.ts
    
    if [ $? -eq 0 ]; then
        print_success "AI test generation completed"
    else
        print_error "AI test generation failed"
        exit 1
    fi
}

# Function to generate reports
generate_reports() {
    print_status "Generating test reports..."
    
    # Generate Allure report
    if command -v allure &> /dev/null; then
        allure generate allure-results --clean -o allure-report
        print_success "Allure report generated"
    else
        print_warning "Allure not installed, skipping Allure report generation"
    fi
    
    # Show Playwright report
    print_status "Opening Playwright report..."
    npx playwright show-report
}

# Function to run performance tests
run_performance_tests() {
    print_status "Running performance tests..."
    npx playwright test --grep @performance "$@"
    
    if [ $? -eq 0 ]; then
        print_success "Performance tests completed successfully"
    else
        print_error "Performance tests failed"
        exit 1
    fi
}

# Function to run accessibility tests
run_accessibility_tests() {
    print_status "Running accessibility tests..."
    npx playwright test --grep @accessibility "$@"
    
    if [ $? -eq 0 ]; then
        print_success "Accessibility tests completed successfully"
    else
        print_error "Accessibility tests failed"
        exit 1
    fi
}

# Function to run API tests
run_api_tests() {
    print_status "Running API tests..."
    npx playwright test --grep @api "$@"
    
    if [ $? -eq 0 ]; then
        print_success "API tests completed successfully"
    else
        print_error "API tests failed"
        exit 1
    fi
}

# Main execution function
main() {
    print_header
    
    # Parse arguments
    TEST_TYPE="all"
    EXTRA_ARGS=()
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            smoke|regression|visual|failed|all|flaky|generate|performance|accessibility|api)
                TEST_TYPE="$1"
                shift
                ;;
            --headed|--debug|--ui)
                EXTRA_ARGS+=("$1")
                shift
                ;;
            --browser|--parallel|--retry)
                EXTRA_ARGS+=("$1" "$2")
                shift 2
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                EXTRA_ARGS+=("$1")
                shift
                ;;
        esac
    done
    
    # Check prerequisites
    check_prerequisites
    
    # Run tests based on type
    case $TEST_TYPE in
        smoke)
            run_smoke_tests "${EXTRA_ARGS[@]}"
            ;;
        regression)
            run_regression_tests "${EXTRA_ARGS[@]}"
            ;;
        visual)
            run_visual_tests "${EXTRA_ARGS[@]}"
            ;;
        failed)
            run_failed_tests "${EXTRA_ARGS[@]}"
            ;;
        flaky)
            run_flaky_detection
            ;;
        generate)
            generate_ai_tests
            ;;
        performance)
            run_performance_tests "${EXTRA_ARGS[@]}"
            ;;
        accessibility)
            run_accessibility_tests "${EXTRA_ARGS[@]}"
            ;;
        api)
            run_api_tests "${EXTRA_ARGS[@]}"
            ;;
        all)
            run_all_tests "${EXTRA_ARGS[@]}"
            ;;
        *)
            print_error "Unknown test type: $TEST_TYPE"
            show_usage
            exit 1
            ;;
    esac
    
    # Generate reports if tests were run
    if [ "$TEST_TYPE" != "flaky" ] && [ "$TEST_TYPE" != "generate" ]; then
        generate_reports
    fi
    
    print_success "Test execution completed!"
}

# Run main function with all arguments
main "$@"
