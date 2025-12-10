"""
Database configuration validation tests.

These tests validate that the database configuration is correct
for different environments and deployment scenarios.
"""

import os
import tempfile
from pathlib import Path
from unittest.mock import patch

import pytest
from pydantic import ValidationError

from app.core.config import Settings


@pytest.mark.database
@pytest.mark.database_setup
class TestDatabaseConfigurationValidation:
    """Test database configuration validation."""

    def test_default_sqlite_configuration(self):
        """Test default SQLite configuration."""
        settings = Settings()

        # Should have SQLite database path
        assert hasattr(settings, "SQLITE_DB_PATH")
        assert settings.SQLITE_DB_PATH == "app.db"

        # Database URI should be SQLite
        db_uri = str(settings.SQLALCHEMY_DATABASE_URI)
        assert "sqlite:///" in db_uri
        assert db_uri.endswith("app.db")

    def test_custom_sqlite_path(self):
        """Test custom SQLite database path configuration."""
        with patch.dict(os.environ, {"SQLITE_DB_PATH": "custom.db"}):
            settings = Settings()

            assert settings.SQLITE_DB_PATH == "custom.db"
            db_uri = str(settings.SQLALCHEMY_DATABASE_URI)
            assert "custom.db" in db_uri

    def test_absolute_path_configuration(self):
        """Test configuration with absolute database path."""
        with tempfile.TemporaryDirectory() as temp_dir:
            custom_path = str(Path(temp_dir) / "absolute.db")

            with patch.dict(os.environ, {"SQLITE_DB_PATH": custom_path}):
                settings = Settings()

                db_uri = str(settings.SQLALCHEMY_DATABASE_URI)
                assert custom_path in db_uri
                assert "sqlite:///" in db_uri

    def test_relative_path_resolution(self):
        """Test that relative paths are resolved correctly."""
        with patch.dict(os.environ, {"SQLITE_DB_PATH": "data/test.db"}):
            settings = Settings()

            db_uri = str(settings.SQLALCHEMY_DATABASE_URI)
            # Should contain absolute path
            assert "sqlite:///" in db_uri
            assert "data/test.db" in db_uri

    def test_environment_specific_configuration(self):
        """Test configuration for different environments."""
        # Test local environment
        with patch.dict(
            os.environ, {"ENVIRONMENT": "local", "SQLITE_DB_PATH": "local.db"}
        ):
            settings = Settings()
            assert settings.ENVIRONMENT == "local"
            assert "local.db" in str(settings.SQLALCHEMY_DATABASE_URI)

        # Test production environment (with proper secrets)
        with patch.dict(
            os.environ,
            {
                "ENVIRONMENT": "production",
                "SQLITE_DB_PATH": "prod.db",
                "SECRET_KEY": "test-secret-key-for-production",
                "FIRST_SUPERUSER_PASSWORD": "TestProductionPassword123!",
            },
        ):
            settings = Settings()
            assert settings.ENVIRONMENT == "production"
            assert "prod.db" in str(settings.SQLALCHEMY_DATABASE_URI)


@pytest.mark.database
@pytest.mark.database_setup
class TestDatabaseConfigurationSecurity:
    """Test database configuration security aspects."""

    def test_database_path_validation(self):
        """Test that database path is validated properly."""
        # Test with various path formats
        valid_paths = [
            "app.db",
            "data/app.db",
            "/tmp/app.db",
            "database.sqlite",
            "db/production.db",
        ]

        for path in valid_paths:
            with patch.dict(os.environ, {"SQLITE_DB_PATH": path}):
                settings = Settings()
                db_uri = str(settings.SQLALCHEMY_DATABASE_URI)
                assert "sqlite:///" in db_uri
                assert path in db_uri

    def test_database_uri_format_security(self):
        """Test that database URI format is secure."""
        settings = Settings()
        db_uri = str(settings.SQLALCHEMY_DATABASE_URI)

        # Should not contain credentials or sensitive information
        assert "password" not in db_uri.lower()
        assert "secret" not in db_uri.lower()
        assert "token" not in db_uri.lower()

        # Should be properly formatted SQLite URI
        assert db_uri.startswith("sqlite:///")
        assert not db_uri.startswith("sqlite://localhost")  # No network access

    def test_no_network_database_access(self):
        """Test that database configuration doesn't allow network access."""
        settings = Settings()
        db_uri = str(settings.SQLALCHEMY_DATABASE_URI)

        # SQLite should be local file only
        assert "localhost" not in db_uri
        assert "127.0.0.1" not in db_uri
        assert ":" not in db_uri.split("///")[1]  # No port numbers in path


@pytest.mark.database
@pytest.mark.database_setup
class TestDatabaseConfigurationCompatibility:
    """Test database configuration compatibility with different components."""

    def test_alembic_compatibility(self):
        """Test that configuration is compatible with Alembic."""
        settings = Settings()
        db_uri = str(settings.SQLALCHEMY_DATABASE_URI)

        # Alembic requires synchronous drivers
        assert "aiosqlite" not in db_uri
        assert db_uri.startswith("sqlite:///")

    def test_sqlmodel_compatibility(self):
        """Test that configuration works with SQLModel."""
        from sqlmodel import create_engine

        settings = Settings()
        db_uri = str(settings.SQLALCHEMY_DATABASE_URI)

        # Should be able to create engine without errors
        engine = create_engine(db_uri, connect_args={"check_same_thread": False})
        assert engine is not None
        assert str(engine.url) == db_uri

    def test_fastapi_compatibility(self):
        """Test that configuration works with FastAPI dependency injection."""
        from app.core.db import engine

        # Engine should be created successfully
        assert engine is not None

        # Should use SQLite
        assert "sqlite" in str(engine.url)

    def test_docker_compatibility(self):
        """Test configuration compatibility with Docker deployment."""
        # Test with Docker-style environment variables
        docker_env = {
            "SQLITE_DB_PATH": "/app/data/app.db",
            "ENVIRONMENT": "production",
            "SECRET_KEY": "docker-secret-key-for-production",
            "FIRST_SUPERUSER_PASSWORD": "DockerProductionPassword123!",
        }

        with patch.dict(os.environ, docker_env):
            settings = Settings()
            db_uri = str(settings.SQLALCHEMY_DATABASE_URI)

            # Should handle absolute paths correctly
            assert "/app/data/app.db" in db_uri
            assert "sqlite:///" in db_uri

