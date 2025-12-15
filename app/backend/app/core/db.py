from sqlmodel import Session, create_engine, select
from sqlalchemy import event
import datetime
from typing import Any

# Import libsql dialect to register it with SQLAlchemy (only if using Turso)
# This must be imported before creating the engine with sqlite+libsql:// URLs
# The sqlalchemy-libsql package should auto-register via setuptools entry points
# when the package is installed. Importing it here ensures the entry point is loaded.
try:
    import sqlalchemy_libsql  # noqa: F401
except ImportError:
    # Package not installed - this is fine if not using Turso
    # Will fail at engine creation with a clear error if Turso is configured
    pass

from app import crud
from app.core.config import settings
from app.models import User, UserCreate


# Determine database configuration
def get_engine_config():
    """Configure engine based on environment variables."""
    # Check if Turso credentials are available (must be non-empty strings)
    turso_url = settings.TURSO_DATABASE_URL
    turso_token = settings.TURSO_AUTH_TOKEN
    
    # Check if both are set and non-empty (after stripping whitespace)
    # Handle None, empty string, and whitespace-only strings
    has_turso_url = (
        turso_url is not None 
        and isinstance(turso_url, str) 
        and turso_url.strip() != ""
    )
    has_turso_token = (
        turso_token is not None 
        and isinstance(turso_token, str) 
        and turso_token.strip() != ""
    )
    
    if has_turso_url and has_turso_token:
        # Use Turso Remote
        # Check if sqlalchemy-libsql is installed
        try:
            import sqlalchemy_libsql  # noqa: F401
        except ImportError:
            raise ImportError(
                "Turso database is configured but sqlalchemy-libsql is not installed.\n"
                "To fix this:\n"
                "  - If building Docker image: Rebuild with BUILD_TURSO_DEPS=1\n"
                "    Example: BUILD_TURSO_DEPS=1 docker-compose build\n"
                "  - If running locally: Install with: uv sync --extra turso\n"
                "  - Or remove TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to use local SQLite"
            )
        # https://docs.turso.tech/sdk/python/orm/sqlalchemy
        # sqlalchemy-libsql provides the sqlite+libsql:// dialect for SQLAlchemy
        # The TURSO_DATABASE_URL should already include the libsql:// protocol
        # Example: libsql://your-db-org.turso.io
        # We need to convert libsql:// to sqlite+libsql:// for SQLAlchemy
        db_url = turso_url
        if db_url.startswith("libsql://"):
            # Remove libsql:// prefix and use sqlite+libsql:// format
            db_url = db_url.replace("libsql://", "", 1)
            db_url = f"sqlite+libsql://{db_url}?secure=true"
        else:
            # If it doesn't start with libsql://, assume it's just the hostname
            db_url = f"sqlite+libsql://{db_url}?secure=true"
        return {
            "url": db_url,
            "connect_args": {
                "auth_token": turso_token,
            },
        }
    else:
        # Use local SQLite
        return {
            "url": str(settings.SQLALCHEMY_DATABASE_URI),
            "connect_args": {
                "check_same_thread": False
            },  # Allow SQLite to be used with multiple threads
        }


# Create engine based on configuration
# Only disable echo (SQL query logging) in production
engine_config = get_engine_config()
engine = create_engine(
    engine_config["url"],
    echo=settings.ENVIRONMENT != "production",
    connect_args=engine_config["connect_args"],
)


# Event listeners to automatically update updated_at field
@event.listens_for(User, "before_update")
def update_user_timestamp(mapper: Any, connection: Any, target: User) -> None:
    target.updated_at = datetime.datetime.now(datetime.timezone.utc)


@event.listens_for(User, "before_insert")
def set_user_timestamps(mapper: Any, connection: Any, target: User) -> None:
    if not target.created_at:
        target.created_at = datetime.datetime.now(datetime.timezone.utc)
    if not target.updated_at:
        target.updated_at = datetime.datetime.now(datetime.timezone.utc)


# Import Item and Tag models for event listeners
from app.models import Item, Tag


@event.listens_for(Item, "before_update")
def update_item_timestamp(mapper: Any, connection: Any, target: Item) -> None:
    target.updated_at = datetime.datetime.now(datetime.timezone.utc)


@event.listens_for(Item, "before_insert")
def set_item_timestamps(mapper: Any, connection: Any, target: Item) -> None:
    if not target.created_at:
        target.created_at = datetime.datetime.now(datetime.timezone.utc)
    if not target.updated_at:
        target.updated_at = datetime.datetime.now(datetime.timezone.utc)


@event.listens_for(Tag, "before_update")
def update_tag_timestamp(mapper: Any, connection: Any, target: Tag) -> None:
    target.updated_at = datetime.datetime.now(datetime.timezone.utc)


@event.listens_for(Tag, "before_insert")
def set_tag_timestamps(mapper: Any, connection: Any, target: Tag) -> None:
    if not target.created_at:
        target.created_at = datetime.datetime.now(datetime.timezone.utc)
    if not target.updated_at:
        target.updated_at = datetime.datetime.now(datetime.timezone.utc)


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/fastapi/full-stack-fastapi-template/issues/28


def init_db(session: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next lines
    # from sqlmodel import SQLModel

    # This works because the models are already imported and registered from app.models
    # SQLModel.metadata.create_all(engine)

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = crud.create_user(session=session, user_create=user_in)
