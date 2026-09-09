"""
VoxShield AI - Database Models / Schemas
"""

from typing import Optional, List
from pydantic import BaseModel


class SpeakerModel(BaseModel):
    id: str
    name: str
    embedding: List[float]
    created_at: Optional[str] = None


class AlertModel(BaseModel):
    id: str
    session_id: Optional[str] = None
    risk_score: float
    threat_level: str
    reason: str
    created_at: Optional[str] = None
