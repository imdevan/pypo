#! /usr/bin/env bash

set -e
set -x

# cd app/backend
uv run python -c "import app.main; import json; print(json.dumps(app.main.app.openapi()))" >./openapi.json

mv openapi.json ../expo/

# Generate expo client
cd ../expo
bun generate:client
bunx biome format --write ./app/client

