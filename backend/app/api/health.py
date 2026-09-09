"""
VoxShield AI - Health and Status Endpoints
"""

from fastapi import APIRouter

router = APIRouter(tags=["System Health"])


@router.get("/health")
async def health_check():
    """
    Standard health check endpoint matching API.md specification.
    """
    return {
        "status": "ok",
        "service": "VoxShield AI",
    }


@router.get("/api/system/status")
async def system_status():
    """
    Detailed system telemetry and component status.
    Clearly distinguishes acoustic prototype analysis from absent neural checkpoints.
    """
    return {
        "backend": "online",
        "voice_detector": "acoustic_prototype",
        "speaker_verifier": "available",
        "stt": "available",
        "neural_checkpoint": "not_loaded",
        "websocket": "available",
    }

