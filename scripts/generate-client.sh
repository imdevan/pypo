#! /usr/bin/env bash

set -e
set -x

cd backend
python -c "import app.main; import json; print(json.dumps(app.main.app.openapi()))" > ../openapi.json
cd ..

# Copy openapi.json to expo and frontend
cp openapi.json expo/openapi.json
mv openapi.json frontend/

# Generate frontend client
cd frontend
npm run generate-client
npx biome format --write ./src/client

# Generate expo client
cd ../expo
bun generate:client
bunx biome format --write ./app/client