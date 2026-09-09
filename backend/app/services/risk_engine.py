"""
VoxShield AI - Risk Engine
Multi-signal threat evaluation and explainable security reasoning.
"""

from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.logging import logger


class RiskEngine:
    """
    Computes an aggregate security risk score (0-100) combining:
    1. AI Voice Probability (weight: 0.45 default)
    2. Speaker Identity Mismatch (weight: 0.30 default)
    3. Transcript Social-Engineering Risk (weight: 0.15 default)
    4. Audio Acoustic Anomaly (weight: 0.10 default)
    """

    def __init__(self):
        self.w_ai = settings.ai_voice_weight
        self.w_speaker = settings.speaker_weight
        self.w_transcript = settings.transcript_weight
        self.w_anomaly = settings.audio_anomaly_weight

        self.th_safe = settings.threshold_safe
        self.th_caution = settings.threshold_caution
        self.th_suspicious = settings.threshold_suspicious

        logger.info(
            f"Initialized RiskEngine (w_ai={self.w_ai}, w_speaker={self.w_speaker}, "
            f"w_transcript={self.w_transcript}, w_anomaly={self.w_anomaly})"
        )

    def calculate_risk(
        self,
        ai_probability: float,
        speaker_similarity: float,
        transcript_risk: float,
        audio_anomaly: float = 0.0,
        has_registered_speaker: bool = False,
        transcript_flags: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Calculates aggregate score (0-100), threat classification, and human-readable reasons.
        """
        transcript_flags = transcript_flags or []

        # If a registered speaker exists, mismatch is (1.0 - similarity)
        # If no speaker is enrolled, we adjust the speaker mismatch weight into AI authenticity
        if has_registered_speaker:
            speaker_mismatch = max(0.0, 1.0 - speaker_similarity)
            effective_w_ai = self.w_ai
            effective_w_spk = self.w_speaker
            effective_w_trans = self.w_transcript
        else:
            speaker_mismatch = 0.0
            # Reallocate speaker weight proportionately to voice authenticity & transcript risk
            effective_w_ai = self.w_ai + (self.w_speaker * 0.5)
            effective_w_spk = 0.0
            effective_w_trans = self.w_transcript + (self.w_speaker * 0.5)

        # Weighted calculation (0.0 to 1.0 scale)
        raw_risk = (
            (effective_w_ai * ai_probability) +
            (effective_w_spk * speaker_mismatch) +
            (effective_w_trans * transcript_risk) +
            (self.w_anomaly * audio_anomaly)
        )

        # Critical credential theft / extortion threat evaluation:
        # If direct OTP extraction, password theft, or legal threats are detected,
        # ensure risk elevates to the warning threshold (>=60 score / SUSPICIOUS or HIGH_RISK)
        critical_flags = {"OTP_REQUEST", "PASSWORD_REQUEST", "THREAT"}
        detected_critical = set(transcript_flags).intersection(critical_flags)
        if detected_critical:
            boost = 0.30 if len(detected_critical) >= 2 else 0.20
            raw_risk = max(raw_risk, 0.60) + (boost * min(transcript_risk, 1.0) * 0.3)

        # Scale to 0-100 integer
        score = int(round(min(max(raw_risk * 100.0, 0.0), 100.0)))

        # Determine Threat Level:
        # 0–29: SAFE
        # 30–59: CAUTION
        # 60–79: SUSPICIOUS
        # 80–100: HIGH_RISK
        if score <= self.th_safe:
            level = "SAFE"
        elif score <= self.th_caution:
            level = "CAUTION"
        elif score <= self.th_suspicious:
            level = "SUSPICIOUS"
        else:
            level = "HIGH_RISK"

        # Generate Explainable Reasons
        reasons: List[str] = []

        if ai_probability >= 0.70:
            reasons.append("Likely AI-generated voice")
        elif ai_probability >= 0.40:
            reasons.append("Uncertain voice authenticity (potential synthetic markers)")

        if has_registered_speaker and speaker_similarity < 0.65:
            reasons.append(f"Speaker mismatch (similarity: {int(speaker_similarity * 100)}%)")

        if audio_anomaly > 0.5:
            reasons.append("Unusual spectral characteristics")

        # Specific transcript reasons
        if "OTP_REQUEST" in transcript_flags:
            reasons.append("Suspicious OTP request")
        if "PASSWORD_REQUEST" in transcript_flags:
            reasons.append("Password or PIN request detected")
        if "BANKING_REQUEST" in transcript_flags:
            reasons.append("Sensitive banking credentials requested")
        if "URGENT_REQUEST" in transcript_flags:
            reasons.append("Emergency-pressure language detected")
        if "THREAT" in transcript_flags:
            reasons.append("Extortion or legal threat detected")
        if "IMPERSONATION" in transcript_flags:
            reasons.append("Authority or bank impersonation phrasing")

        if not reasons:
            if level == "SAFE":
                reasons.append("Voice characteristics and conversational flow appear normal")
            else:
                reasons.append("Multiple minor acoustic anomalies detected")

        return {
            "score": score,
            "level": level,
            "reasons": reasons,
        }


risk_engine = RiskEngine()
