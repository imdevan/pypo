import uuid
from typing import Any

from sqlmodel import Session, select, desc

from app.core.security import get_password_hash, verify_password
from app.models import Item, ItemCreate, ItemUpdate, User, UserCreate, UserUpdate, Tag, TagCreate, TagUpdate, ItemTag


def create_user(*, session: Session, user_create: UserCreate) -> User:
    # Generate UUID as string explicitly
    user_id = str(uuid.uuid4())
    
    db_obj = User.model_validate(
        user_create, update={
            "hashed_password": get_password_hash(user_create.password),
            "id": user_id
        }
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


def create_item(*, session: Session, item_in: ItemCreate, owner_id: str) -> Item:
    # Extract tag_ids from item_in
    tag_ids = item_in.tag_ids if item_in.tag_ids else []
    
    # Create item without tags first
    item_data = item_in.model_dump(exclude={"tag_ids"})
    db_item = Item.model_validate(item_data, update={"owner_id": owner_id})
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    
    # Add tags if provided
    if tag_ids:
        for tag_id in tag_ids:
            # Verify tag exists
            tag = session.get(Tag, tag_id)
            if tag:
                item_tag = ItemTag(item_id=db_item.id, tag_id=tag_id)
                session.add(item_tag)
        session.commit()
        session.refresh(db_item)
    
    return db_item


def update_item(*, session: Session, db_item: Item, item_in: ItemUpdate) -> Item:
    item_data = item_in.model_dump(exclude_unset=True, exclude={"tag_ids"})
    tag_ids = item_in.tag_ids
    
    # Update basic item fields
    if item_data:
        db_item.sqlmodel_update(item_data)
        session.add(db_item)
    
    # Update tags if provided
    if tag_ids is not None:
        # Remove existing tag relationships
        existing_tags = session.exec(
            select(ItemTag).where(ItemTag.item_id == db_item.id)
        ).all()
        for existing_tag in existing_tags:
            session.delete(existing_tag)
        
        # Add new tag relationships
        for tag_id in tag_ids:
            tag = session.get(Tag, tag_id)
            if tag:
                item_tag = ItemTag(item_id=db_item.id, tag_id=tag_id)
                session.add(item_tag)
    
    session.commit()
    session.refresh(db_item)
    return db_item


# Tag CRUD operations
def create_tag(*, session: Session, tag_in: TagCreate) -> Tag:
    db_tag = Tag.model_validate(tag_in)
    session.add(db_tag)
    session.commit()
    session.refresh(db_tag)
    return db_tag


def update_tag(*, session: Session, db_tag: Tag, tag_in: TagUpdate) -> Tag:
    tag_data = tag_in.model_dump(exclude_unset=True)
    db_tag.sqlmodel_update(tag_data)
    session.add(db_tag)
    session.commit()
    session.refresh(db_tag)
    return db_tag


def get_tag(*, session: Session, tag_id: str) -> Tag | None:
    return session.get(Tag, tag_id)


def get_tag_by_name(*, session: Session, name: str) -> Tag | None:
    statement = select(Tag).where(Tag.name == name)
    return session.exec(statement).first()


def get_tags(*, session: Session, skip: int = 0, limit: int = 100) -> list[Tag]:
    statement = select(Tag).order_by(Tag.name).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def delete_tag(*, session: Session, tag_id: str) -> bool:
    tag = session.get(Tag, tag_id)
    if not tag:
        return False
    session.delete(tag)
    session.commit()
    return True


def get_items_by_tag(*, session: Session, tag_id: str, skip: int = 0, limit: int = 100) -> list[Item]:
    statement = (
        select(Item)
        .join(ItemTag)
        .where(ItemTag.item_id == Item.id)
        .where(ItemTag.tag_id == tag_id)
        .order_by(desc(Item.created_at))
        .offset(skip)
        .limit(limit)
    )
    return list(session.exec(statement).all())
