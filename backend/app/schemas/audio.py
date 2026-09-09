"""
VoxShield AI - Audio Schemas
"""

from typing import Optional, List
from pydantic import BaseModel, Field


class AudioChunkMessage(BaseModel):
    type: str = "audio"
    audio: str  # Base64 encoded audio string
    timestamp: Optional[float] = None
    speaker_id: Optional[str] = None


class ClientSessionMessage(BaseModel):
    type: str
    speaker_id: Optional[str] = None


class AudioFeaturesSchema(BaseModel):
    sample_rate: int
    duration_seconds: float
    has_speech: bool
    rms_energy: float
    zero_crossing_rate: float
    spectral_centroid: float
    spectral_bandwidth: float
    spectral_flatness: float
    pitch_mean: float
    pitch_std: float
    mfcc_means: List[float] = Field(default_factory=list)
