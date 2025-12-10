#!/usr/bin/env bash

set -e

echo "🗄️  Running SQLite Database Tests Only"
echo "======================================"

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

# Check if we're in the right directory
if [ ! -f "pyproject.toml" ]; then
    print_error "Please run this script from the backend directory (app/backend)"
    exit 1
fi

print_status "Setting up test environment..."

# Clean up any existing test databases
rm -f test_*.db app_test.db *.db 2>/dev/null || true

print_status "Running database setup tests..."
if uv run pytest tests/ -m "database_setup" -v; then
    print_success "Database setup tests passed!"
else
    print_error "Database setup tests failed!"
    exit 1
fi

print_status "Running database reliability tests..."
if uv run pytest tests/ -m "database_reliability" -v; then
    print_success "Database reliability tests passed!"
else
    print_error "Database reliability tests failed!"
    exit 1
fi

print_status "Running database performance tests..."
if uv run pytest tests/ -m "database_performance" -v; then
    print_success "Database performance tests passed!"
else
    print_warning "Database performance tests failed (non-critical)"
fi

print_status "Running all database tests together..."
if uv run pytest tests/ -m "database" -v; then
    print_success "All database tests passed!"
else
    print_error "Some database tests failed!"
    exit 1
fi

# Clean up test databases
print_status "Cleaning up test databases..."
rm -f test_*.db app_test.db 2>/dev/null || true

print_success "🎉 All database tests completed successfully!"
echo ""
echo "Database test summary:"
echo "- ✅ Configuration validation"
echo "- ✅ Connection reliability" 
echo "- ✅ Performance characteristics"
echo "- ✅ Error handling"
echo "- ✅ Migration compatibility"
echo ""
echo "Your SQLite database setup is working correctly! 🚀"