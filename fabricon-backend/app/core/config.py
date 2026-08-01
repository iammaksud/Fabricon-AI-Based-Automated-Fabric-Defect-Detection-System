"""
Application configuration.

Reads all environment variables once into a single Settings object.
Every other module (database connection, CORS setup, future JWT logic)
should import `settings` from here instead of calling os.getenv directly.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ---------------- Application ----------------
    APP_NAME: str = "Fabricon"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # ---------------- CORS ----------------
    CORS_ORIGINS: str = "http://localhost:5173"

    # ---------------- Database ----------------
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "fabricon_db"

    # ---------------- JWT (values loaded now, logic implemented later) ----------------
    JWT_SECRET_KEY: str = "change-this-secret-key-before-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ---------------- External services ----------------
    ROBOFLOW_API_KEY: str = "gxO41noQYgeAwm2TncxA"
    ROBOFLOW_MODEL_ID: str = "fabric-defect-dfetection1-vccmv/2"
    ROBOFLOW_API_URL: str = "https://detect.roboflow.com"

    # ---------------- Hardware (Arduino over USB serial) ----------------
    ARDUINO_PORT: str = "COM3"
    BAUD_RATE: int = 9600

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origins_list(self) -> list[str]:
        """CORS_ORIGINS is stored as a comma-separated string in .env;
        this exposes it as a list for CORSMiddleware."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def database_url(self) -> str:
        """Builds the SQLAlchemy MySQL connection URL from individual parts."""
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )


@lru_cache
def get_settings() -> Settings:
    """Cached so the .env file is only parsed once per process."""
    return Settings()


settings = get_settings()