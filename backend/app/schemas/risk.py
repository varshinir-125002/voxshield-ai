"""
VoxShield AI - Risk Configuration & Alert Schemas
"""

from typing import Dict
from pydantic import BaseModel, Field


class RiskConfigResponse(BaseModel):
    ai_voice_weight: float
    speaker_weight: float
    transcript_weight: float
    audio_anomaly_weight: float
    thresholds: Dict[str, int]


class CreateAlertRequest(BaseModel):
    risk_score: float
    level: str
    reason: str
    session_id: str = Field(default="default_session")


class CreateAlertResponse(BaseModel):
    success: bool
    alert_id: str
