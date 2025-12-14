FROM python:3.10

ENV PYTHONUNBUFFERED=1

WORKDIR /app/

# Build argument to conditionally install build tools for Turso/libsql
# Set BUILD_TURSO_DEPS=1 when building if you need Turso support
ARG BUILD_TURSO_DEPS=0

# Conditionally install build dependencies for Rust-based packages (libsql-experimental)
# These are only needed if using Turso database
RUN if [ "$BUILD_TURSO_DEPS" = "1" ]; then \
        apt-get update && apt-get install -y \
        build-essential \
        cmake \
        curl \
        pkg-config \
        libssl-dev \
        git \
        ca-certificates \
        libsqlite3-dev \
        && rm -rf /var/lib/apt/lists/* \
        && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y; \
    else \
        apt-get update && apt-get install -y \
        curl \
        ca-certificates \
        && rm -rf /var/lib/apt/lists/*; \
    fi

# Set Rust path if installed
ENV PATH="/root/.cargo/bin:${PATH}"

# Install uv
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#installing-uv
COPY --from=ghcr.io/astral-sh/uv:0.5.11 /uv /uvx /bin/

# Place executables in the environment at the front of the path
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#using-the-environment
ENV PATH="/app/.venv/bin:$PATH"

# Compile bytecode
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#compiling-bytecode
ENV UV_COMPILE_BYTECODE=1

# uv Cache
# Ref: https://docs.astral.sh/uv/guides/integration/docker/#caching
ENV UV_LINK_MODE=copy

# Install dependencies
# Copy dependency files first for better caching
COPY ./pyproject.toml ./uv.lock /app/
# Conditionally install Turso dependencies based on build arg
RUN if [ "$BUILD_TURSO_DEPS" = "1" ]; then \
        uv sync --frozen --no-install-project --extra turso; \
    else \
        uv sync --frozen --no-install-project; \
    fi

ENV PYTHONPATH=/app

COPY ./scripts /app/scripts

COPY ./alembic.ini /app/

COPY ./app /app/app

# Sync the project (with optional Turso dependencies if needed)
RUN if [ "$BUILD_TURSO_DEPS" = "1" ]; then \
        uv sync --extra turso; \
    else \
        uv sync; \
    fi

CMD ["fastapi", "run", "--workers", "4", "app/main.py"]
