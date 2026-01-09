#!/bin/bash
# Script to query the Docker database using harlequin

set -e

docker compose exec -it backend harlequin -a sqlite /app/data/app.db
