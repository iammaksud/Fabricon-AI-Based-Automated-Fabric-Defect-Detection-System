import logging
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.database.models import Admin
from app.services.auth_service import get_password_hash

logger = logging.getLogger(__name__)


def init_db() -> None:
    """Checks if any Admin user exists in MySQL.

    If not, automatically seeds the default admin user.
    """
    db: Session = SessionLocal()
    try:
        admin_exists = db.query(Admin).first()
        if not admin_exists:
            logger.info("No admin user found. Creating default admin account...")
            default_admin = Admin(
                username="admin",
                email="admin@fabricon.com",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True,
            )
            db.add(default_admin)
            db.commit()
            db.refresh(default_admin)
            logger.info("Default admin created successfully: admin@fabricon.com")
        else:
            logger.info("Admin user already exists. Skipping initialization.")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()