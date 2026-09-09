"""
VoxShield AI - Analysis Schemas
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class VoiceAnalysisResult(BaseModel):
    ai_probability: float
    human_probability: float
    confidence: float
    status: str  # LIKELY_HUMAN, UNCERTAIN, LIKELY_AI


class SpeakerVerificationResult(BaseModel):
    match: bool
    similarity: float
    registered_speaker: Optional[str] = None
    status_message: Optional[str] = None


class TranscriptAnalysisResult(BaseModel):
    text: str
    risk_score: float
    flags: List[str] = Field(default_factory=list)


class RiskResult(BaseModel):
    score: int
    level: str  # SAFE, CAUTION, SUSPICIOUS, HIGH_RISK
    reasons: List[str] = Field(default_factory=list)


class FullAnalysisResponse(BaseModel):
    type: str = "analysis"
    timestamp: float
    voice: VoiceAnalysisResult
    speaker: SpeakerVerificationResult
    transcript: TranscriptAnalysisResult
    risk: RiskResult
