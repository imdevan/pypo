#!/bin/sh -e
set -x

uv run alembic upgrade head
