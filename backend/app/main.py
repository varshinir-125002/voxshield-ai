"""
VoxShield AI - Main FastAPI Application
AI-Powered Real-Time Detection and Prevention of Voice Cloning Impersonation Attacks.
SIH 2026 Prototype.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import logger
from app.database.database import init_db
from app.api.health import router as health_router
from app.api.routes import router as api_router
from app.api.websocket import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.app_name} (Env: {settings.app_env})")
    init_db()
    try:
        # Pre-warm Librosa acoustic kernels and feature extractors to eliminate cold-start compilation latency
        import numpy as np
        from app.audio.features import extract_all_features
        from app.models.voice_detector import voice_detector
        dummy_audio = np.zeros(1024, dtype=np.float32)
        dummy_feats = extract_all_features(dummy_audio, sr=16000)
        voice_detector.predict(dummy_audio, sr=16000, precomputed_features=dummy_feats)
        logger.info("Acoustic feature and detector kernels pre-warmed successfully.")
    except Exception as w_err:
        logger.warning(f"Kernel pre-warm completed with warning: {w_err}")
    yield
    logger.info(f"Shutting down {settings.app_name}")


app = FastAPI(
    title="VoxShield AI",
    description="Real-Time Detection and Prevention of Voice Cloning Impersonation Attacks",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(health_router)
app.include_router(api_router)
app.include_router(ws_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=settings.debug)
