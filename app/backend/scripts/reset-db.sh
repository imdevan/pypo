#!/bin/bash

# Database reset script
# This script will:
# 1. Remove all previous migration files
# 2. Drop all tables from the database (or delete SQLite file)
# 3. Generate a new initial migration from current models
# 4. Apply the migration

set -e
set -x

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Change to backend directory (parent of scripts directory)
cd "$SCRIPT_DIR/.." || exit 1

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠️  WARNING: This will delete all data in your database!${NC}"
echo -e "${YELLOW}Press Ctrl+C to cancel, or wait 5 seconds to continue...${NC}"
sleep 5

# Get the database path from config
DB_PATH="${SQLITE_DB_PATH:-app.db}"

# Check if using Turso or local SQLite
if [ -n "$TURSO_DATABASE_URL" ] && [ -n "$TURSO_AUTH_TOKEN" ]; then
  echo -e "${GREEN}Detected Turso database${NC}"
  USE_TURSO=true
else
  echo -e "${GREEN}Detected local SQLite database${NC}"
  USE_TURSO=false
fi

# Step 1: Remove all migration files (except __pycache__)
echo -e "${GREEN}Step 1: Removing all migration files...${NC}"
MIGRATIONS_DIR="app/alembic/versions"
if [ -d "$MIGRATIONS_DIR" ]; then
  # Remove all .py files but keep __pycache__ directory
  find "$MIGRATIONS_DIR" -maxdepth 1 -name "*.py" -type f -delete
  echo -e "${GREEN}✓ Migration files removed${NC}"
else
  echo -e "${YELLOW}⚠️  Migrations directory not found, skipping...${NC}"
fi

# Step 2: Drop all tables from database
echo -e "${GREEN}Step 2: Dropping all tables from database...${NC}"

if [ "$USE_TURSO" = true ]; then
  # For Turso: Drop all tables via Python script
  echo -e "${YELLOW}Dropping tables from Turso database...${NC}"
  uv run python -c "
from app.core.db import engine
from sqlalchemy import inspect, text

inspector = inspect(engine)
tables = inspector.get_table_names()

if tables:
    print('Dropping tables:', ', '.join(tables))
    with engine.connect() as conn:
        # Drop all tables
        for table in tables:
            try:
                conn.execute(text(f'DROP TABLE IF EXISTS {table}'))
                print(f'  ✓ Dropped {table}')
            except Exception as e:
                print(f'  ⚠️  Error dropping {table}: {e}')
        conn.commit()
    print('✓ All tables dropped')
else:
    print('No tables found in database')
"
else
  # For local SQLite: Delete the database file
  if [ -f "$DB_PATH" ]; then
    rm -f "$DB_PATH"
    echo -e "${GREEN}✓ SQLite database file deleted${NC}"
  else
    echo -e "${YELLOW}⚠️  Database file not found, skipping...${NC}"
  fi
fi

# Step 3: Generate new initial migration
echo -e "${GREEN}Step 3: Generating new initial migration...${NC}"
uv run alembic revision --autogenerate -m "Initial migration"

# Step 4: Apply the migration
echo -e "${GREEN}Step 4: Applying migration...${NC}"
uv run alembic upgrade head

echo -e "${GREEN}✓ Database reset complete!${NC}"
echo -e "${GREEN}All tables have been recreated from your current models.${NC}"
