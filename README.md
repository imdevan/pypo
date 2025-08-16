# Pypo - Turborepo

This is a monorepo containing both the backend API and the Expo mobile application.

## Structure

```
pypo/
├── app/
│   ├── backend/     # FastAPI backend
│   └── expo/        # Expo React Native app
├── turbo.json       # Turborepo configuration
└── package.json     # Root workspace configuration
```

## Prerequisites

- Node.js >= 20.0.0
- Bun (package manager)
- Python 3.10+
- uv (Python package manager)

## Getting Started

1. Install dependencies:
   ```bash
   bun install
   ```

2. Install Python dependencies for the backend:
   ```bash
   cd app/backend
   uv sync
   ```

3. Start development servers:
   ```bash
   # Start both backend and expo
   bun run dev
   
   # Or start individually
   bun run dev --filter=backend
   bun run dev --filter=expo
   ```

## Available Scripts

### Root Level (Turborepo)
- `bun run build` - Build all applications
- `bun run dev` - Start development servers for all applications
- `bun run test` - Run tests for all applications
- `bun run lint` - Lint all applications
- `bun run clean` - Clean all applications
- `bun run format` - Format code with Prettier

### Backend (`app/backend/`)
- `bun run dev` - Start FastAPI development server
- `bun run test` - Run pytest tests
- `bun run lint` - Run ruff linter
- `bun run format` - Format code with ruff

### Expo (`app/expo/`)
- `bun run dev` - Start Expo development server
- `bun run android` - Run on Android
- `bun run ios` - Run on iOS
- `bun run web` - Run on web
- `bun run test` - Run Jest tests
- `bun run lint` - Run ESLint

## Development

### Backend Development
The backend is a FastAPI application located in `app/backend/`. It uses:
- FastAPI for the web framework
- SQLModel for ORM
- Alembic for database migrations
- Pytest for testing
- Ruff for linting and formatting

### Expo Development
The Expo app is located in `app/expo/` and includes:
- React Native with Expo
- TypeScript
- React Navigation
- TanStack Query for data fetching
- Zustand for state management

## Docker

The project includes Docker Compose configurations for easy deployment:

```bash
# Start all services
docker-compose up -d

# Start with Traefik (production-like)
docker-compose -f docker-compose.traefik.yml up -d
```

## Contributing

1. Make sure all tests pass: `bun run test`
2. Ensure code is properly formatted: `bun run format`
3. Check linting: `bun run lint`
4. Commit your changes

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
