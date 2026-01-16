# Agent Guidelines for PyPo (Python + Expo)

This document provides essential information for AI coding agents working in this full-stack monorepo.

## Project Overview

**PyPo** is a Turborepo monorepo combining:

- **Backend**: FastAPI + SQLModel + Alembic (Python 3.10+)
- **Frontend**: Expo + React Native + TypeScript (strict mode)
- **Package Manager**: Bun 1.0.35
- **Monorepo Tool**: Turborepo 1.12.4

## Build, Lint, Test Commands

### Root Level (Turborepo)

```bash
bun run dev              # Start all dev servers (backend + expo)
bun run build            # Build all apps
bun run test             # Run all tests (backend + frontend)
bun run lint             # Lint all apps
bun run clean            # Clean all apps
bun run format           # Format with Prettier
```

### Backend (`app/backend/`)

```bash
# Development
bun run dev              # Start Docker Compose in watch mode

# Testing
uv run pytest                           # Run all tests
uv run pytest tests/test_file.py        # Run single test file
uv run pytest tests/test_file.py::test_function  # Run single test
uv run pytest -m database               # Run tests with marker
uv run pytest --cov=app                 # With coverage
uv run pytest -k "test_name"            # By name pattern

# Linting & Type Checking
uv run ruff check .                     # Lint
uv run ruff check . --fix               # Lint with auto-fix
uv run ruff format .                    # Format code
uv run mypy app                         # Type check
uv run pre-commit run --all-files       # Run all pre-commit hooks

# Dependencies
uv sync                  # Install/sync dependencies
```

### Frontend (`app/expo/`)

```bash
# Development
bun run dev              # Start Expo dev client
bun run android          # Run on Android
bun run ios              # Run on iOS
bun run web              # Run on web

# Testing
bun run test                            # Run all tests
bun run test:watch                      # Watch mode
bun run test -- path/to/test.test.tsx   # Run single test file

# Linting & Type Checking
bun run lint             # ESLint with --fix
bun run lint:check       # ESLint without fixing
bun run compile          # TypeScript check (no emit)

# Build
bun run bundle:web       # Export for web
bun run generate:client  # Generate OpenAPI client from backend
```

## Code Style Guidelines

### Frontend (TypeScript/React Native)

#### Import Order (enforced by ESLint)

```typescript
// 1. React imports
import { FC, useCallback, useState } from "react";

// 2. React Native imports
import { View, Pressable, Text } from "react-native";

// 3. Expo imports
import { useFocusEffect } from "@react-navigation/native";

// 4. Third-party libraries
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";

// 5. @/ aliased imports (app code)
import { Button } from "@/components/lib/Button";
import { useItems } from "@/services/api/hooks";

// 6. Relative imports
import { helper } from "./utils";
```

#### Formatting (Prettier)

- **Print width**: 100 characters
- **Semicolons**: No semicolons
- **Quotes**: Double quotes
- **Trailing commas**: Always
- **Quote props**: Consistent

#### Component Structure

```typescript
interface ComponentProps {
  title: string
  onPress?: () => void
}

export const ComponentName: FC<ComponentProps> = ({ title, onPress }) => {
  const { theme, themed } = useAppTheme()

  return <View style={themed($container)} />
}

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.background,
  padding: theme.spacing.md,
})
```

#### Naming Conventions

- **Components**: PascalCase (`Button.tsx`, `ItemCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useItems.ts`, `useAuth.ts`)
- **Utils**: camelCase (`formatDate.ts`, `storage.ts`)
- **Styles**: `$`-prefixed (`$container`, `$text`, `$button`)
- **Types/Interfaces**: PascalCase (`ItemPublic`, `ThemedStyle`)
- **Unused vars**: `_` prefix (e.g., `_unusedParam`)

#### TypeScript

- **Strict mode**: Enabled (noImplicitAny, strictNullChecks, etc.)
- **Path aliases**: `@/*` → `./app/*`, `@assets/*` → `./assets/*`
- **Prefer explicit types** for function parameters and return values
- **Use type imports** when importing only types: `import type { User } from "@/types"`

#### State Management Patterns

```typescript
// Server state: TanStack Query
const { data, isLoading } = useQuery({
  queryKey: ["items"],
  queryFn: () => apiClient.items.readItems({ token }),
});

// Client state: Zustand
const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// Persistent storage: MMKV
const [authToken, setAuthToken] = useMMKVString("AuthProvider.authToken");
```

#### Error Handling

```typescript
// Use try-catch for async operations
try {
  const result = await apiCall();
} catch (error) {
  console.error("Failed to fetch data:", error);
  // Show user-friendly error message
}

// Type-safe error checking
if (error instanceof Error) {
  Alert.alert("Error", error.message);
}
```

### Backend (Python/FastAPI)

#### Import Order (enforced by Ruff)

```python
# 1. Standard library
from datetime import datetime
from typing import Any

# 2. Third-party libraries
from fastapi import APIRouter, HTTPException
from sqlmodel import Session, select

# 3. Local imports
from app.api.deps import CurrentUser, SessionDep
from app.models import Item, ItemCreate, ItemPublic
```

#### Formatting (Ruff)

- **Line length**: 88 characters (default)
- **Indentation**: 4 spaces
- **Quotes**: Double quotes preferred
- **Type hints**: Always use for function signatures

#### Route Structure

```python
from typing import Any
from fastapi import APIRouter
from app.api.deps import CurrentUser, SessionDep
from app.models import Item, ItemPublic

router = APIRouter(prefix="/items", tags=["items"])

@router.get("/", response_model=ItemsPublic)
def read_items(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve items.
    """
    items = session.exec(select(Item).offset(skip).limit(limit)).all()
    return ItemsPublic(data=items, count=len(items))
```

#### Model Patterns (SQLModel)

```python
from sqlmodel import Field, SQLModel
from uuid import UUID, uuid4
from datetime import datetime

class ItemBase(SQLModel):
    title: str
    description: str | None = None

class ItemCreate(ItemBase):
    pass

class Item(ItemBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    owner_id: UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ItemPublic(ItemBase):
    id: UUID
    owner_id: UUID
```

#### Naming Conventions

- **Files**: snake_case (`items.py`, `user_crud.py`)
- **Classes**: PascalCase (`User`, `ItemCreate`)
- **Functions**: snake_case (`read_items`, `get_current_user`)
- **Constants**: UPPER_SNAKE_CASE (`API_V1_STR`, `SECRET_KEY`)
- **Private**: Single underscore prefix (`_internal_function`)

#### Type Hints

```python
# Always use type hints for function signatures
def get_item(session: Session, item_id: UUID) -> Item | None:
    return session.get(Item, item_id)

# Use dependency injection type aliases
CurrentUser = Annotated[User, Depends(get_current_user)]
SessionDep = Annotated[Session, Depends(get_session)]
```

#### Error Handling

```python
from fastapi import HTTPException, status

# Use HTTPException for API errors
if not item:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Item not found",
    )

# Document exceptions in docstrings
def delete_item(item_id: UUID) -> None:
    """
    Delete an item.

    Raises:
        HTTPException: 404 if item not found
    """
```

## Testing Guidelines

### Backend Testing

- **Location**: `app/backend/app/tests/`, `app/backend/tests/`
- **Framework**: Pytest 7.4+
- **Markers**: Use `@pytest.mark.database`, `@pytest.mark.slow`, `@pytest.mark.integration`
- **Timeout**: 5 seconds per test (configured in pytest.ini)
- **Fixtures**: Use session-scoped fixtures for DB setup
- **Naming**: Test files must start with `test_`, functions with `test_`

### Frontend Testing

- **Location**: `app/expo/app/**/*.test.tsx`
- **Framework**: Jest 29.7 with jest-expo preset
- **Setup**: `app/expo/test/setup.ts`
- **Testing Library**: `@testing-library/react-native`
- **Naming**: Test files must end with `.test.tsx` or `.test.ts`

## Important Conventions

### Git Hooks

- **Pre-commit**: Runs ESLint + Prettier (frontend), Ruff (backend)
- **Husky**: Configured to run lint-staged on commit

### OpenAPI Client Generation

- Auto-generated from backend OpenAPI schema
- **Command**: `bun run generate:client` (in `app/expo/`)
- **Output**: `app/expo/app/client/`
- **Do not manually edit** generated client files

### Database Migrations

- Use Alembic for all schema changes
- **Create migration**: `alembic revision --autogenerate -m "description"`
- **Apply migrations**: `alembic upgrade head`

### File Organization

```
app/expo/app/
├── components/lib/    # Reusable components (prefer these)
├── screens/           # Screen components
├── services/api/      # API client and hooks
├── stores/            # Zustand stores
├── theme/             # Theme system
└── utils/             # Utility functions

app/backend/app/
├── api/routes/        # API route handlers
├── core/              # Config, DB, security
├── models.py          # SQLModel models
└── crud.py            # CRUD operations
```

### AI Assistant Guidelines (from .kiro/steering/general.md)

- Little to no emoji in shell scripts
- Sparingly use color for important messages
- Avoid summary documents, only create for key points

## Common Patterns to Follow

1. **Always use themed styles** in React Native components via `useAppTheme()`
2. **Prefer custom components** from `@/components/lib/` over basic React Native components
3. **Use TanStack Query** for all API calls (server state)
4. **Use Zustand** for client-side global state
5. **Use MMKV** for persistent storage (not AsyncStorage)
6. **Follow dependency injection** pattern in FastAPI routes
7. **Use SQLModel CRUD functions** for database operations
8. **Generate OpenAPI client** after backend model/route changes
9. **Write tests** for new features (aim for good coverage)
10. **Run linters** before committing (pre-commit hooks will enforce this)
