#!/bin/bash

# Script to run migrations against Turso using CLI
# Generates SQL from Alembic and executes it on Turso
# Usage: ./migrate-turso.sh [.env-file]
#   If .env-file is not provided, defaults to .env.production

set -e

# Load environment variables from .env file
ENV_FILE="${1:-.env}"
if [ -f "$ENV_FILE" ]; then
  echo "Loading environment variables from $ENV_FILE..."
  set -a
  source "$ENV_FILE"
  set +a
else
  echo "WARNING: $ENV_FILE not found. Using environment variables from current shell."
fi

echo "Running migrations against Turso database..."

# Check if turso CLI is installed
if ! command -v turso &>/dev/null; then
  echo "ERROR: Turso CLI not found. Please install it first:"
  echo "   curl -sSfL https://get.tur.so/install.sh | bash"
  exit 1
fi

# Check if we have the database URL
if [ -z "$TURSO_DATABASE_URL" ]; then
  echo "ERROR: TURSO_DATABASE_URL not set"
  exit 1
fi

# Check if we have the database name
if [ -z "$TURSO_DATABASE_NAME" ]; then
  echo "ERROR: TURSO_DATABASE_NAME not set"
  exit 1
fi

# Use database name from environment variable
DB_NAME="$TURSO_DATABASE_NAME"

echo "Database: $DB_NAME"

# Generate SQL from Alembic
echo "Generating migration SQL..."
uv run alembic upgrade head --sql >migration.sql

if [ ! -s migration.sql ]; then
  echo "INFO: No migrations to run (database is up to date)"
  rm -f migration.sql
  exit 0
fi

echo "Generated migration SQL:"
cat migration.sql

# Execute the SQL on Turso
echo "Executing migrations on Turso..."
turso db shell "$DB_NAME" <migration.sql

# Clean up - move to archive with date-time prefix
ARCHIVE_DIR="migration_archive"
mkdir -p "$ARCHIVE_DIR"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
ARCHIVE_FILE="${ARCHIVE_DIR}/${TIMESTAMP}_migration.sql"
mv migration.sql "$ARCHIVE_FILE"
echo "Migration archived to: $ARCHIVE_FILE"

echo "Migrations completed successfully!"
