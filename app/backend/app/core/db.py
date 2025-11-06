from sqlmodel import Session, create_engine, select
from sqlalchemy import event, Mapper, Connection, InstanceState
import datetime

from app import crud
from app.core.config import settings
from app.models import User, UserCreate

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


# Event listeners to automatically update updated_at field
@event.listens_for(User, 'before_update')
def update_user_timestamp(mapper: Mapper, connection: Connection, target: InstanceState) -> None:
    target.updated_at = datetime.datetime.now(datetime.timezone.utc)


@event.listens_for(User, 'before_insert')
def set_user_timestamps(mapper: Mapper, connection: Connection, target: InstanceState) -> None:
    if not target.created_at:
        target.created_at = datetime.datetime.now(datetime.timezone.utc)
    if not target.updated_at:
        target.updated_at = datetime.datetime.now(datetime.timezone.utc)


# Import Item model for event listeners
from app.models import Item


@event.listens_for(Item, 'before_update')
def update_item_timestamp(mapper: Mapper, connection: Connection, target: InstanceState) -> None:
    target.updated_at = datetime.datetime.now(datetime.timezone.utc)


@event.listens_for(Item, 'before_insert')
def set_item_timestamps(mapper: Mapper, connection: Connection, target: InstanceState) -> None:
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
