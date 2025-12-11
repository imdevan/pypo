import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.crud import (
    create_tag,
    delete_tag,
    get_tag,
    get_tags,
    update_tag,
    get_items_by_tag,
)
from app.models import Tag, TagCreate, TagPublic, TagsPublic, TagUpdate, Item, ItemPublic, ItemsPublic, Message, ItemTag

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("/", response_model=TagsPublic)
def read_tags(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve all tags.
    """
    count_statement = select(func.count()).select_from(Tag)
    count = session.exec(count_statement).one()
    tags = get_tags(session=session, skip=skip, limit=limit)
    return TagsPublic(data=tags, count=count)


@router.get("/{tag_id}", response_model=TagPublic)
def read_tag(session: SessionDep, tag_id: str) -> Any:
    """
    Get tag by ID.
    """
    tag = get_tag(session=session, tag_id=tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.post("/", response_model=TagPublic)
def create_new_tag(
    *, session: SessionDep, current_user: CurrentUser, tag_in: TagCreate
) -> Any:
    """
    Create new tag.
    """
    # Check if tag with same name already exists
    existing_tag = session.exec(
        select(Tag).where(Tag.name == tag_in.name)
    ).first()
    if existing_tag:
        raise HTTPException(status_code=400, detail="Tag with this name already exists")
    
    tag = create_tag(session=session, tag_in=tag_in)
    return tag


@router.put("/{tag_id}", response_model=TagPublic)
def update_existing_tag(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    tag_id: str,
    tag_in: TagUpdate,
) -> Any:
    """
    Update a tag.
    """
    tag = get_tag(session=session, tag_id=tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Check if name is being updated and if it conflicts with existing tag
    if tag_in.name and tag_in.name != tag.name:
        existing_tag = session.exec(
            select(Tag).where(Tag.name == tag_in.name)
        ).first()
        if existing_tag:
            raise HTTPException(status_code=400, detail="Tag with this name already exists")
    
    updated_tag = update_tag(session=session, db_tag=tag, tag_in=tag_in)
    return updated_tag


@router.delete("/{tag_id}")
def delete_existing_tag(
    session: SessionDep, current_user: CurrentUser, tag_id: str
) -> Message:
    """
    Delete a tag.
    """
    tag = get_tag(session=session, tag_id=tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    success = delete_tag(session=session, tag_id=tag_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete tag")
    
    return Message(message="Tag deleted successfully")


@router.get("/{tag_id}/items", response_model=ItemsPublic)
def read_items_by_tag(
    session: SessionDep, tag_id: str, skip: int = 0, limit: int = 100
) -> Any:
    """
    Get all items tagged with a specific tag.
    """
    tag = get_tag(session=session, tag_id=tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    items = get_items_by_tag(session=session, tag_id=tag_id, skip=skip, limit=limit)
    
    # Count total items for this tag
    count_statement = (
        select(func.count())
        .select_from(Item)
        .join(ItemTag)
        .where(ItemTag.item_id == Item.id)
        .where(ItemTag.tag_id == tag_id)
    )
    count = session.exec(count_statement).one()
    
    return ItemsPublic(data=items, count=count)
