"""
Test configuration for database tests.
"""

from collections.abc import Generator
import tempfile
from pathlib import Path

import pytest
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings


@pytest.fixture(scope="function")
def temp_db() -> Generator[Session, None, None]:
    """
    Create a temporary database for isolated testing.
    
    This fixture creates a fresh SQLite database for each test function,
    ensuring complete isolation between tests.
    """
    with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp_file:
        test_db_path = tmp_file.name
    
    try:
        # Create test engine with temporary database
        test_engine = create_engine(
            f"sqlite:///{test_db_path}",
            echo=False,
            connect_args={"check_same_thread": False}
        )
        
        # Create all tables
        SQLModel.metadata.create_all(test_engine)
        
        # Provide session
        with Session(test_engine) as session:
            yield session
            
    finally:
        # Clean up temporary database
        Path(test_db_path).unlink(missing_ok=True)


@pytest.fixture(scope="function")
def temp_db_engine() -> Generator[any, None, None]:
    """
    Create a temporary database engine for testing.
    
    This fixture provides direct access to the database engine
    for tests that need to create their own sessions.
    """
    with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp_file:
        test_db_path = tmp_file.name
    
    try:
        test_engine = create_engine(
            f"sqlite:///{test_db_path}",
            echo=False,
            connect_args={"check_same_thread": False}
        )
        
        # Create all tables
        SQLModel.metadata.create_all(test_engine)
        
        yield test_engine
        
    finally:
        # Clean up temporary database
        Path(test_db_path).unlink(missing_ok=True)


# Pytest markers for database tests
def pytest_configure(config):
    """Configure custom pytest markers."""
    config.addinivalue_line(
        "markers", "database: mark test as a database test"
    )
    config.addinivalue_line(
        "markers", "database_setup: mark test as a database setup validation test"
    )
    config.addinivalue_line(
        "markers", "database_performance: mark test as a database performance test"
    )
    config.addinivalue_line(
        "markers", "database_reliability: mark test as a database reliability test"
    )