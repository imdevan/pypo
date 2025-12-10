#!/usr/bin/env bash

set -e
set -x

echo "🧪 Running all tests..."

# Run app tests (existing tests)
echo "Running app tests..."
uv run coverage run --source=app -m pytest app/tests/

# Run database tests (new SQLite tests)
echo "Running database setup tests..."
uv run coverage run --append --source=app -m pytest tests/ -m database

# Generate coverage reports
echo "Generating coverage reports..."
uv run coverage report --show-missing
uv run coverage html --title "${@-coverage}"

echo "✅ All tests completed!"
