"""
VoxShield AI - Voice Detector
Modular interface for AI voice / deepfake detection.
Includes Prototype Detection Model and plug-in adapter for trained deep learning models.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any
import numpy as np
from app.audio.features import extract_all_features
from app.core.logging import logger


class BaseVoiceDetector(ABC):
    """Abstract interface for all voice detection engines."""

    @abstractmethod
    def predict(self, audio: np.ndarray, sr: int = 16000) -> Dict[str, Any]:
        pass


class PrototypeVoiceDetector(BaseVoiceDetector):
    """
    Prototype Detection Model
    Acoustic multi-feature estimator combining:
    1. Spectral flatness & vocoder artifact indicators
    2. High-frequency boundary discontinuity & rolloff
    3. Prosodic pitch variance & organic jitter
    4. Energy dynamics and unnatural temporal smoothness
    
    Clearly labeled as 'Prototype Detection Model'.
    """

    def __init__(self):
        self.model_name = "Acoustic Multi-Feature Estimator / Prototype Acoustic Voice Detector"
        self.version = "1.0-sih-prototype"
        logger.info(f"Initialized {self.model_name} ({self.version})")

    def predict(self, audio: np.ndarray, sr: int = 16000) -> Dict[str, Any]:
        if audio is None or len(audio) < 1024:
            return {
                "ai_probability": 0.0,
                "human_probability": 1.0,
                "confidence": 0.0,
                "status": "LIKELY_HUMAN",
                "model_type": self.model_name,
            }

        feats = extract_all_features(audio, sr)
        spectral = feats["spectral"]
        pitch = feats["pitch"]
        energy = feats["energy"]

        # 1. Vocoder / Spectral Flatness analysis:
        # Synthetic vocoders (e.g., HiFi-GAN, WaveGlow) often show atypical spectral flatness
        # or harmonic phase mismatch in specific bands.
        flatness = spectral["flatness"]
        flatness_score = np.clip((flatness - 0.005) * 40.0, 0.0, 1.0)

        # 2. Pitch Prosody:
        # Natural human speech has organic pitch standard deviation (> 12 Hz during speech).
        # Synthetic speech without pitch diffusion can have rigid prosody (< 8 Hz)
        # or unnatural sudden jumps.
        pitch_std = pitch["pitch_std"]
        if pitch_std > 0:
            if pitch_std < 8.0:
                prosody_score = 0.75  # Unnaturally monotone / synthetic flatline
            elif pitch_std > 85.0:
                prosody_score = 0.65  # Glitchy synthetic frequency jump
            else:
                prosody_score = 0.15  # Natural human prosodic variance
        else:
            prosody_score = 0.35  # Unvoiced / whispered

        # 3. Energy Consistency:
        # Synthetic voices often lack natural breathing pauses, resulting in atypical energy stability
        rms_std = energy["rms_std"]
        energy_score = 0.70 if (rms_std < 0.015 and energy["rms_mean"] > 0.05) else 0.20

        # 4. High-frequency Spectral Rolloff:
        rolloff = spectral["rolloff"]
        rolloff_score = 0.65 if (rolloff > 7200 or rolloff < 1500) else 0.25

        # Weighted combination of acoustic signals (Prototype Heuristic)
        raw_ai_prob = (
            0.35 * flatness_score +
            0.30 * prosody_score +
            0.20 * rolloff_score +
            0.15 * energy_score
        )

        ai_probability = round(float(np.clip(raw_ai_prob, 0.05, 0.95)), 2)
        human_probability = round(float(1.0 - ai_probability), 2)
        confidence = round(float(abs(ai_probability - 0.5) * 2.0), 2)

        # Threshold ranges:
        # 0.00–0.30 -> LIKELY_HUMAN
        # 0.30–0.70 -> UNCERTAIN
        # 0.70–1.00 -> LIKELY_AI
        if ai_probability < 0.30:
            status = "LIKELY_HUMAN"
        elif ai_probability <= 0.70:
            status = "UNCERTAIN"
        else:
            status = "LIKELY_AI"

        return {
            "ai_probability": ai_probability,
            "human_probability": human_probability,
            "confidence": confidence,
            "status": status,
            "model_type": self.model_name,
        }


class TrainedVoiceDetectorAdapter(BaseVoiceDetector):
    """
    Adapter for trained neural deepfake detector (e.g. AASIST, Wav2Vec2, RawNet2).
    If model weights file is present in MODEL_PATH, it can be loaded here.
    Falls back cleanly to PrototypeVoiceDetector if weights are absent.
    """

    def __init__(self, weights_path: str = ""):
        self.weights_path = weights_path
        self.fallback = PrototypeVoiceDetector()
        self.model_name = "Trained Voice Detector (AASIST/Neural)"
        self.is_loaded = False

    def predict(self, audio: np.ndarray, sr: int = 16000) -> Dict[str, Any]:
        if not self.is_loaded:
            return self.fallback.predict(audio, sr)
        # Deep learning inference would run here
        return self.fallback.predict(audio, sr)


# Global default instance
voice_detector = PrototypeVoiceDetector()
