"""
Database seeding script using Faker to generate fake data.

This script creates random tags and items for development and testing.
It can be run manually or automatically during database initialization
by setting SEED_DB=true in the environment.

Faker docs:
https://faker.readthedocs.io/en/master/locales/az_AZ.html#faker.providers.internet.az_AZ.Provider.image_url
"""

import logging
import random

from faker import Faker
from sqlmodel import Session, select

from app.core.db import engine
from app.crud import create_item, create_tag
from app.models import ItemCreate, Tag, TagCreate, User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

fake = Faker()


def seed_tags(session: Session, count: int = 20) -> list[Tag]:
    """Create random tags."""
    logger.info(f"Creating {count} tags...")
    tags = []

    # Generate unique tag names
    tag_names = set()
    while len(tag_names) < count:
        tag_names.add(fake.word().capitalize())

    for name in tag_names:
        # Check if tag already exists
        existing_tag = session.exec(select(Tag).where(Tag.name == name)).first()

        if existing_tag:
            tags.append(existing_tag)
            continue

        tag_in = TagCreate(
            name=name,
            description=fake.sentence(),
            color=fake.hex_color(),
        )
        tag = create_tag(session=session, tag_in=tag_in)
        tags.append(tag)
        logger.info(f"Created tag: {tag.name}")

    return tags


def seed_items(
    session: Session, owner_id: str, tags: list[Tag], count: int = 50
) -> None:
    """Create random items for the given owner."""
    logger.info(f"Creating {count} items...")

    for i in range(count):
        # Randomly select 0-5 tags for each item
        num_tags = random.randint(0, min(5, len(tags)))
        selected_tags = random.sample(tags, num_tags) if num_tags > 0 else []
        tag_ids = [tag.id for tag in selected_tags]
        item_in = ItemCreate(
            title=fake.sentence(nb_words=random.randint(3, 8)).rstrip("."),
            description=fake.paragraph(nb_sentences=random.randint(1, 3)),
            tag_ids=tag_ids if tag_ids else None,
            image_url=fake.image_url(
                width=400,
                height=300,
                placeholder_url=f"https://picsum.photos/300/400/?blur=2&random={i}",
            )
            if random.random() > 0.1
            else None,
        )
        tag_ids = (tag_ids if tag_ids else None,)
        item = create_item(session=session, item_in=item_in, owner_id=owner_id)
        logger.info(f"Created item {i + 1}/{count}: {item.title}")


def seed_database(num_tags: int = 20, num_items: int = 50) -> None:
    """Seed the database with fake data."""
    with Session(engine) as session:
        # Get the first superuser
        user = session.exec(
            select(User).where(User.is_superuser == True).order_by(User.created_at)
        ).first()

        if not user:
            logger.error("No superuser found. Please run initial_data.py first.")
            return

        logger.info(f"Using superuser: {user.email} (ID: {user.id})")

        # Seed tags
        tags = seed_tags(session, count=num_tags)

        # Seed items
        seed_items(session, owner_id=user.id, tags=tags, count=num_items)

        logger.info("Database seeding completed!")


def main() -> None:
    logger.info("Starting database seeding...")
    seed_database(num_tags=20, num_items=50)


if __name__ == "__main__":
    main()
