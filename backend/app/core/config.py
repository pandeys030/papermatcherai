import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings and configuration."""

    APP_NAME: str = "PaperMatcher-AI"
    API_HOST: str = "127.0.0.1"
    API_PORT: int = 8002
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]
    DATASET_PATH: str = "data/arXiv_scientific_dataset.csv"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def get_dataset_file_path(self) -> Path:
        """Resolve dataset file path relative to project root or absolute."""
        candidate = Path(self.DATASET_PATH)
        if candidate.is_absolute() and candidate.exists():
            return candidate

        # Check relative to current working directory
        if candidate.exists():
            return candidate.resolve()

        # Check relative to project root (4 levels up: config.py -> core -> app -> backend -> PaperMatcher-AI)
        project_root = Path(__file__).resolve().parent.parent.parent.parent
        if (project_root / candidate).exists():
            return (project_root / candidate).resolve()

        return candidate.resolve()


settings = Settings()
