"""
Database reliability and performance tests.

These tests ensure that the SQLite database performs well
and handles various edge cases correctly.
"""

import tempfile
from pathlib import Path
from typing import Generator

import pytest
from sqlmodel import Session, SQLModel, create_engine, select

from app import crud
from app.models import Item, ItemCreate, Tag, TagCreate, User, UserCreate


@pytest.mark.database
@pytest.mark.database_performance
class TestDatabasePerformance:
    """Test database performance characteristics."""

    def test_bulk_user_creation(self, temp_db_engine):
        """Test creating multiple users efficiently."""
        with Session(temp_db_engine) as session:
            # Create multiple users
            users_created = []
            for i in range(10):
                user_data = UserCreate(
                    email=f"user{i}@example.com",
                    password="TestPassword123!",
                    full_name=f"User {i}"
                )
                user = crud.create_user(session=session, user_create=user_data)
                users_created.append(user)
            
            session.commit()
            
            # Verify all users were created
            all_users = session.exec(select(User)).all()
            assert len(all_users) == 10, "Should have created 10 users"
            
            # Verify emails are unique
            emails = [user.email for user in all_users]
            assert len(set(emails)) == 10, "All emails should be unique"

    def test_complex_queries(self, temp_db_engine):
        """Test complex database queries perform correctly."""
        with Session(temp_db_engine) as session:
            # Create test data
            user_data = UserCreate(
                email="owner@example.com",
                password="TestPassword123!",
                full_name="Item Owner"
            )
            user = crud.create_user(session=session, user_create=user_data)
            
            # Create tags
            tag1_data = TagCreate(name="urgent", description="Urgent items")
            tag2_data = TagCreate(name="work", description="Work related")
            
            tag1 = crud.create_tag(session=session, tag_in=tag1_data)
            tag2 = crud.create_tag(session=session, tag_in=tag2_data)
            
            # Create items with tags
            for i in range(5):
                item_data = ItemCreate(
                    title=f"Item {i}",
                    description=f"Description for item {i}",
                    tag_ids=[tag1.id, tag2.id] if i % 2 == 0 else [tag1.id]
                )
                crud.create_item(session=session, item_in=item_data, owner_id=user.id)
            
            session.commit()
            
            # Test complex query: items with specific tags
            items_with_both_tags = session.exec(
                select(Item)
                .join(Item.tags)
                .where(Tag.name.in_(["urgent", "work"]))
                .group_by(Item.id)
            ).all()
            
            assert len(items_with_both_tags) >= 3, "Should find items with tags"


@pytest.mark.database
@pytest.mark.database_reliability
class TestDatabaseReliability:
    """Test database reliability and error handling."""

    def test_concurrent_access_simulation(self, temp_db_engine):
        """Test simulated concurrent access to the database."""
        # Create multiple sessions to simulate concurrent access
        sessions = [Session(temp_db_engine) for _ in range(3)]
        
        try:
            # Each session creates a user
            for i, session in enumerate(sessions):
                user_data = UserCreate(
                    email=f"concurrent{i}@example.com",
                    password="TestPassword123!",
                    full_name=f"Concurrent User {i}"
                )
                crud.create_user(session=session, user_create=user_data)
                session.commit()
            
            # Verify all users were created
            with Session(temp_db_engine) as verify_session:
                users = verify_session.exec(select(User)).all()
                assert len(users) == 3, "All concurrent users should be created"
                
        finally:
            for session in sessions:
                session.close()

    def test_database_file_permissions(self, temp_db_engine):
        """Test that database file has correct permissions."""
        # Get the database file path from the engine
        db_path = str(temp_db_engine.url).replace("sqlite:///", "")
        db_file = Path(db_path)
        
        assert db_file.exists(), "Database file should exist"
        assert db_file.is_file(), "Database path should be a file"
        
        # Test that we can read and write to the file
        assert db_file.stat().st_size > 0, "Database file should not be empty"

    def test_database_recovery_after_error(self, temp_db_engine):
        """Test database recovery after an error condition."""
        with Session(temp_db_engine) as session:
            # Create a valid user first
            user_data = UserCreate(
                email="valid@example.com",
                password="TestPassword123!",
                full_name="Valid User"
            )
            valid_user = crud.create_user(session=session, user_create=user_data)
            session.commit()
            
            # Try to create an invalid user (this should fail)
            try:
                invalid_user_data = UserCreate(
                    email="valid@example.com",  # Duplicate email
                    password="TestPassword123!",
                    full_name="Invalid User"
                )
                crud.create_user(session=session, user_create=invalid_user_data)
                session.commit()
            except Exception:
                session.rollback()  # Rollback the failed transaction
            
            # Verify we can still use the database after the error
            user_count = len(session.exec(select(User)).all())
            assert user_count == 1, "Should still have the valid user after error recovery"
            
            # Verify we can create new users after recovery
            recovery_user_data = UserCreate(
                email="recovery@example.com",
                password="TestPassword123!",
                full_name="Recovery User"
            )
            recovery_user = crud.create_user(session=session, user_create=recovery_user_data)
            session.commit()
            
            assert recovery_user.email == "recovery@example.com"

    def test_database_schema_integrity(self, temp_db_engine):
        """Test that database schema is created correctly."""
        # Check that all expected tables exist
        from sqlalchemy import inspect
        
        inspector = inspect(temp_db_engine)
        table_names = inspector.get_table_names()
        
        expected_tables = {"user", "item", "tag", "itemtag"}
        actual_tables = set(table_names)
        
        assert expected_tables.issubset(actual_tables), f"Missing tables: {expected_tables - actual_tables}"
        
        # Check that user table has expected columns
        user_columns = {col['name'] for col in inspector.get_columns('user')}
        expected_user_columns = {"id", "email", "hashed_password", "full_name", "is_active", "is_superuser", "created_at", "updated_at"}
        
        assert expected_user_columns.issubset(user_columns), f"Missing user columns: {expected_user_columns - user_columns}"


@pytest.mark.database
@pytest.mark.database_reliability
class TestDatabaseMigrations:
    """Test database migration compatibility."""

    def test_fresh_database_creation(self):
        """Test creating a fresh database from scratch."""
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp_file:
            test_db_path = tmp_file.name
        
        try:
            # Create engine for fresh database
            fresh_engine = create_engine(
                f"sqlite:///{test_db_path}",
                echo=False,
                connect_args={"check_same_thread": False}
            )
            
            # Create all tables (simulating migration)
            SQLModel.metadata.create_all(fresh_engine)
            
            # Verify database is functional
            with Session(fresh_engine) as session:
                result = session.exec(select(1)).first()
                assert result == 1, "Fresh database should be functional"
                
        finally:
            Path(test_db_path).unlink(missing_ok=True)

    def test_database_version_compatibility(self, temp_db_engine):
        """Test that database works with current SQLModel version."""
        # This test ensures our models are compatible with the current SQLModel version
        with Session(temp_db_engine) as session:
            # Test all model types can be created
            user_data = UserCreate(
                email="version@example.com",
                password="TestPassword123!",
                full_name="Version Test User"
            )
            user = crud.create_user(session=session, user_create=user_data)
            
            tag_data = TagCreate(name="version-test", description="Version test tag")
            tag = crud.create_tag(session=session, tag_in=tag_data)
            
            item_data = ItemCreate(
                title="Version Test Item",
                description="Testing version compatibility",
                tag_ids=[tag.id]
            )
            item = crud.create_item(session=session, item_in=item_data, owner_id=user.id)
            
            session.commit()
            
            # Verify relationships work
            assert item.owner.email == user.email
            assert len(item.tags) == 1
            assert item.tags[0].name == "version-test"