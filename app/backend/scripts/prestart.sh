#! /usr/bin/env bash

set -e
set -x

# Let the DB start
python app/backend_pre_start.py

# Run migrations
alembic upgrade head

# Seed database with fake data if enabled
if [ "${SEED_DB:-false}" = "true" ]; then
  # Create initial data in DB
  python app/initial_data.py

  echo "Seeding database with fake data..."
  python app/seed_data.py
fi
