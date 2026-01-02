#! /usr/bin/env bash

set -e
set -x

# Generate OpenAPI YAML file
uv run --with pyyaml python -c "
import app.main
import yaml

openapi_schema = app.main.app.openapi()
yaml_output = yaml.dump(openapi_schema, default_flow_style=False, sort_keys=False, allow_unicode=True)

with open('openapi.yaml', 'w') as f:
    f.write(yaml_output)

print('OpenAPI YAML file generated successfully: openapi.yaml')
"

