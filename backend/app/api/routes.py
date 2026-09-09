"""
VoxShield AI - REST API Routes
Implements speaker registration/verification, offline audio analysis, risk config, and alerts.
"""

import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.core.config import settings
from app.core.security import validate_audio_file
from app.core.logging import logger
from app.audio.preprocessing import preprocess_audio
from app.models.speaker_verifier import speaker_verifier
from app.services.analysis_service import analysis_service
from app.services.alert_service import alert_service
from app.database.database import save_speaker, get_speaker, get_all_speakers
from app.schemas.risk import RiskConfigResponse, CreateAlertRequest, CreateAlertResponse

router = APIRouter(prefix="/api", tags=["Security & Speaker Services"])


@router.post("/speaker/register")
async def register_speaker(
    speaker_name: str = Form(...),
    audio: UploadFile = File(...),
):
    """
    Enroll an authorized speaker profile by extracting and storing their acoustic vocal tract embedding.
    """
    content = await audio.read()
    validate_audio_file(audio.filename, audio.content_type, len(content))

    audio_array, sr = preprocess_audio(content)
    if len(audio_array) < 1024:
        raise HTTPException(
            status_code=400,
            detail="Audio sample is too short or contains no usable speech.",
        )

    embedding = speaker_verifier.create_embedding(audio_array, sr=sr)
    speaker_id = f"spk-{uuid.uuid4().hex[:8]}"

    success = save_speaker(speaker_id=speaker_id, name=speaker_name, embedding=embedding)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save speaker profile.")

    logger.info(f"Successfully registered speaker: {speaker_name} ({speaker_id})")
    return {
        "success": True,
        "speaker_id": speaker_id,
        "speaker_name": speaker_name,
    }


@router.get("/speakers")
async def list_speakers():
    """
    Retrieve all registered speaker profiles.
    """
    return get_all_speakers()


@router.post("/speaker/verify")
async def verify_speaker(
    speaker_id: str = Form(...),
    audio: UploadFile = File(...),
):
    """
    Verify voice sample against a registered speaker profile.
    """
    speaker_data = get_speaker(speaker_id)
    if not speaker_data:
        raise HTTPException(status_code=404, detail="Speaker profile not found.")

    content = await audio.read()
    validate_audio_file(audio.filename, audio.content_type, len(content))

    audio_array, sr = preprocess_audio(content)
    current_embedding = speaker_verifier.create_embedding(audio_array, sr=sr)
    
    result = speaker_verifier.compare(current_embedding, speaker_data["embedding"])
    return {
        "match": result["match"],
        "similarity": result["similarity"],
        "threshold": result["threshold"],
    }


@router.post("/analyze")
async def analyze_audio_file(
    audio: UploadFile = File(...),
    speaker_id: Optional[str] = Form(None),
):
    """
    Analyze an uploaded audio file (offline mode).
    Returns voice authenticity, speaker verification, and multi-signal risk.
    """
    content = await audio.read()
    validate_audio_file(audio.filename, audio.content_type, len(content))

    full_res = analysis_service.process_audio_pipeline(
        raw_audio=content,
        speaker_id=speaker_id,
    )

    return {
        "voice": full_res["voice"],
        "speaker": full_res["speaker"],
        "risk": full_res["risk"],
    }


@router.get("/risk/config", response_model=RiskConfigResponse)
async def get_risk_config():
    """
    Returns current risk engine weights and classification thresholds.
    """
    return {
        "ai_voice_weight": settings.ai_voice_weight,
        "speaker_weight": settings.speaker_weight,
        "transcript_weight": settings.transcript_weight,
        "audio_anomaly_weight": settings.audio_anomaly_weight,
        "thresholds": {
            "safe": settings.threshold_safe,
            "caution": settings.threshold_caution,
            "suspicious": settings.threshold_suspicious,
        },
    }


@router.post("/alerts", response_model=CreateAlertResponse)
async def create_alert(payload: CreateAlertRequest):
    """
    Record a security alert from dashboard or automated trigger.
    """
    alert_id = alert_service.trigger_alert(
        risk_score=payload.risk_score,
        threat_level=payload.level,
        reason=payload.reason,
        session_id=payload.session_id,
    )
    return {
        "success": True,
        "alert_id": alert_id,
    }


@router.get("/alerts")
async def get_alerts():
    """
    Retrieve recent security alerts.
    """
    return alert_service.get_recent_alerts()
