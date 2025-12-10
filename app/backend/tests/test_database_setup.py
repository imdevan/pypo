"""
Database setup and configuration tests.

These tests ensure that the SQLite database is properly configured
and can perform basic operations correctly.
"""

import tempfile
from pathlib import Path
from typing import Generator

import pytest
from sqlmodel import Session, SQLModel, create_engine, select

from app import crud
from app.core.config import settings
from app.models import User, UserCreate


@pytest.mark.database
@pytest.mark.database_setup
class TestDatabaseConfiguration:
    """Test database configuration and URI generation."""

    def test_database_uri_format(self):
        """Test that the database URI is correctly formatted for SQLite."""
        db_uri = str(settings.SQLALCHEMY_DATABASE_URI)
        assert "sqlite:///" in db_uri, f"Expected SQLite URI, got: {db_uri}"
        assert db_uri.endswith(".db"), f"Expected .db file extension, got: {db_uri}"

    def test_database_path_creation(self):
        """Test that the database path is properly resolved."""
        db_uri = str(settings.SQLALCHEMY_DATABASE_URI)
        # Extract path from URI (remove sqlite:///)
        db_path = db_uri.replace("sqlite:///", "")
        path_obj = Path(db_path)
        
        # Should be an absolute path
        assert path_obj.is_absolute(), f"Database path should be absolute: {db_path}"

    def test_sqlite_db_path_setting(self):
        """Test that SQLITE_DB_PATH setting is properly configured."""
        assert hasattr(settings, 'SQLITE_DB_PATH'), "SQLITE_DB_PATH setting should exist"
        assert settings.SQLITE_DB_PATH, "SQLITE_DB_PATH should not be empty"


@pytest.mark.database
@pytest.mark.database_setup
class TestDatabaseConnection:
    """Test database connection and basic operations."""

    def test_basic_database_query(self, temp_db_engine):
        """Test basic database connectivity with a simple query."""
        with Session(temp_db_engine) as session:
            result = session.exec(select(1)).first()
            assert result == 1, "Basic database query should return 1"

    def test_user_creation_and_retrieval(self, temp_db_engine):
        """Test user creation and retrieval operations."""
        with Session(temp_db_engine) as session:
            # Create a test user
            user_data = UserCreate(
                email="test@example.com",
                password="TestPassword123!",
                full_name="Test User"
            )
            
            # Create user using CRUD function
            created_user = crud.create_user(session=session, user_create=user_data)
            
            # Verify user was created correctly
            assert created_user.email == "test@example.com"
            assert created_user.full_name == "Test User"
            assert created_user.id is not None
            assert created_user.created_at is not None
            assert created_user.updated_at is not None
            
            # Test user retrieval
            retrieved_user = session.exec(
                select(User).where(User.email == "test@example.com")
            ).first()
            
            assert retrieved_user is not None, "User should be retrievable from database"
            assert retrieved_user.email == created_user.email
            assert retrieved_user.id == created_user.id

    def test_database_constraints(self, temp_db_engine):
        """Test database constraints and validation."""
        with Session(temp_db_engine) as session:
            # Create first user
            user_data1 = UserCreate(
                email="unique@example.com",
                password="TestPassword123!",
                full_name="First User"
            )
            crud.create_user(session=session, user_create=user_data1)
            
            # Try to create user with same email (should fail due to unique constraint)
            user_data2 = UserCreate(
                email="unique@example.com",  # Same email
                password="AnotherPassword123!",
                full_name="Second User"
            )
            
            with pytest.raises(Exception):  # Should raise an integrity error
                crud.create_user(session=session, user_create=user_data2)
                session.commit()

    def test_database_transactions(self, temp_db_engine):
        """Test database transaction handling."""
        with Session(temp_db_engine) as session:
            # Create a user and commit
            user_data = UserCreate(
                email="transaction@example.com",
                password="TestPassword123!",
                full_name="Transaction User"
            )
            
            created_user = crud.create_user(session=session, user_create=user_data)
            session.commit()
            
            # Verify user exists after commit
            user_count = len(session.exec(select(User)).all())
            assert user_count == 1, "Should have one user after commit"
            
            # Test that we can create and query users within the same session
            user_data2 = UserCreate(
                email="session@example.com",
                password="TestPassword123!",
                full_name="Session User"
            )
            
            created_user2 = crud.create_user(session=session, user_create=user_data2)
            
            # Verify both users exist in the session
            users_in_session = session.exec(select(User)).all()
            assert len(users_in_session) == 2, "Should have two users in session"
            
            # Commit the second user
            session.commit()
            
            # Verify both users are persisted
            final_users = session.exec(select(User)).all()
            assert len(final_users) == 2, "Should have two users after final commit"
            
            emails = {user.email for user in final_users}
            assert "transaction@example.com" in emails
            assert "session@example.com" in emails


@pytest.mark.database
@pytest.mark.database_setup
class TestDatabaseIntegration:
    """Test database integration with the application."""

    def test_main_database_engine_creation(self):
        """Test that the main database engine can be created successfully."""
        from app.core.db import engine
        
        assert engine is not None, "Database engine should be created"
        assert str(engine.url).startswith("sqlite:///"), "Engine should use SQLite"

    def test_database_initialization(self, temp_db_engine):
        """Test database initialization process."""
        from app.core.db import init_db
        
        # This should not raise any exceptions
        with Session(temp_db_engine) as session:
            init_db(session)
            
            # Verify superuser was created
            superuser = session.exec(
                select(User).where(User.email == settings.FIRST_SUPERUSER)
            ).first()
            
            assert superuser is not None, "Superuser should be created during init"
            assert superuser.is_superuser is True, "User should have superuser privileges"

    def test_alembic_compatibility(self):
        """Test that the database URI works with Alembic migrations."""
        db_uri = str(settings.SQLALCHEMY_DATABASE_URI)
        
        # Alembic should be able to parse this URI
        assert "sqlite:///" in db_uri, "URI should be compatible with Alembic"
        
        # Should not contain async drivers that Alembic can't handle
        assert "aiosqlite" not in db_uri, "Should not use async driver for Alembic compatibility"