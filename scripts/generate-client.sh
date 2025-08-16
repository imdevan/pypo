#! /usr/bin/env bash

set -e
set -x

cd backend
python -c "import app.main; import json; print(json.dumps(app.main.app.openapi()))" > ../openapi.json
cd ..

mv openapi.json expo/

# Generate expo client
cd ./expo
bun generate:client
bunx biome format --write ./app/client