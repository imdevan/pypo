#!/bin/sh -e
set -x

uv run alembic revision --autogenerate -m "$@"
