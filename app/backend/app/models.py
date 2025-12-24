import datetime
import re
import uuid

from pydantic import EmailStr, field_validator
from sqlmodel import Field, Relationship, SQLModel


def validate_password_strength(password: str) -> str:
    """Validate password meets complexity requirements."""
    if not re.search(r'[A-Z]', password):
        raise ValueError('Password must contain at least 1 uppercase letter')
    if not re.search(r'[a-z]', password):
        raise ValueError('Password must contain at least 1 lowercase letter')
    if not re.search(r'\d', password):
        raise ValueError('Password must contain at least 1 number')
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise ValueError('Password must contain at least 1 special character')
    return password


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        return validate_password_strength(v)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        return validate_password_strength(v)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if v is not None:
            return validate_password_strength(v)
        return v


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)
    
    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        return validate_password_strength(v)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=36)
    hashed_password: str
    created_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: str
    created_at: datetime.datetime
    updated_at: datetime.datetime


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Tag models
class TagBase(SQLModel):
    name: str = Field(min_length=1, max_length=50, unique=True, index=True)
    description: str | None = Field(default=None, max_length=255)
    color: str | None = Field(default=None, max_length=7)  # Hex color code


# Properties to receive on tag creation
class TagCreate(TagBase):
    pass


# Properties to receive on tag update
class TagUpdate(SQLModel):
    name: str | None = Field(default=None, min_length=1, max_length=50)
    description: str | None = Field(default=None, max_length=255)
    color: str | None = Field(default=None, max_length=7)


# Many-to-many relationship table between Item and Tag
class ItemTag(SQLModel, table=True):
    item_id: str = Field(foreign_key="item.id", primary_key=True, max_length=36)
    tag_id: str = Field(foreign_key="tag.id", primary_key=True, max_length=36)


# Database model for Tag
class Tag(TagBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=36)
    created_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    items: list["Item"] = Relationship(back_populates="tags", link_model=ItemTag)


# Properties to return via API, id is always required
class TagPublic(TagBase):
    id: str
    created_at: datetime.datetime
    updated_at: datetime.datetime


class TagsPublic(SQLModel):
    data: list[TagPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)
    image_url: str | None = Field(default=None, max_length=2048)
    video_url: str | None = Field(default=None, max_length=2048)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    tag_ids: list[str] | None = Field(default=None)


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore
    tag_ids: list[str] | None = Field(default=None)


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=36)
    owner_id: str = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE", max_length=36
    )
    created_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    owner: User | None = Relationship(back_populates="items")
    tags: list[Tag] = Relationship(back_populates="items", link_model=ItemTag)


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: str
    owner_id: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    tags: list[TagPublic] | None = None
    image_url: str | None
    video_url: str | None


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)
    
    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        return validate_password_strength(v)
