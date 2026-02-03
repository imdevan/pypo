#! /usr/bin/env bash

set -e
set -x

# Let the DB start
python app/backend_pre_start.py

# Optional destructive reset for local/dev rebuilds.
if [ "${RESET_DB:-false}" = "true" ]; then
  ./scripts/reset-db.sh
fi

# Run migrations
alembic upgrade head

# Create initial data in DB
# i.e. make sure there is at least one user in the db for login
python app/initial_data.py

# Seed database with fake data if enabled
if [ "${SEED_DB:-false}" = "true" ]; then

  echo "Seeding database with fake data..."
  python app/seed_data.py
fi
