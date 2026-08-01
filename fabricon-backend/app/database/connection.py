"""
Database connection setup.

Defines the SQLAlchemy engine, session factory, and declarative Base.
No tables are defined here — that happens in database/models.py once
the schema is designed. Creating the engine does NOT open a connection
immediately (SQLAlchemy connects lazily on first use), so the app can
start even if MySQL isn't reachable yet.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # avoids using stale/dropped connections
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a request-scoped DB session
    and guarantees it's closed afterward, even if an error occurs."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
