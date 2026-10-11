import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "CloudSales IQ API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cloudsales.db")
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    MONTHLY_TARGET: float = float(os.getenv("MONTHLY_TARGET", "150000.0"))

settings = Settings()
