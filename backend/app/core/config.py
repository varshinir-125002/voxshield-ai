"""
VoxShield AI - Configuration Module
Centralized settings management using Pydantic.
"""

import os
from typing import List
from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "VoxShield AI"
    app_env: str = os.getenv("APP_ENV", "development")
    debug: bool = os.getenv("DEBUG", "True").lower() == "true"
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))

    secret_key: str = os.getenv("SECRET_KEY", "voxshield_secret_prototype_key")
    allowed_origins: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:8000",
        ).split(",")
    ]

    # Audio Pipeline Configuration
    audio_sample_rate: int = int(os.getenv("AUDIO_SAMPLE_RATE", "16000"))
    max_audio_chunk_size_mb: int = int(os.getenv("MAX_AUDIO_CHUNK_SIZE_MB", "5"))

    # Database
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./voxshield.db")
    model_path: str = os.getenv("MODEL_PATH", "../models")
    stt_api_key: str = os.getenv("STT_API_KEY", "")

    # Multi-Signal Risk Engine Weights
    ai_voice_weight: float = float(os.getenv("AI_VOICE_WEIGHT", "0.45"))
    speaker_weight: float = float(os.getenv("SPEAKER_WEIGHT", "0.30"))
    transcript_weight: float = float(os.getenv("TRANSCRIPT_WEIGHT", "0.15"))
    audio_anomaly_weight: float = float(os.getenv("AUDIO_ANOMALY_WEIGHT", "0.10"))

    # Threat Classification Thresholds
    threshold_safe: int = int(os.getenv("THRESHOLD_SAFE", "29"))
    threshold_caution: int = int(os.getenv("THRESHOLD_CAUTION", "59"))
    threshold_suspicious: int = int(os.getenv("THRESHOLD_SUSPICIOUS", "79"))


settings = Settings()
