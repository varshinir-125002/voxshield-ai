"""
VoxShield AI - Analysis Pipeline Service
Orchestrates audio preprocessing, acoustic extraction, voice authenticity,
speaker verification, transcript analysis, and multi-signal risk calculation.
"""

import time
from typing import Dict, Any, Optional
import numpy as np

from app.audio.preprocessing import preprocess_audio
from app.audio.vad import detect_speech
from app.audio.features import extract_all_features
from app.models.voice_detector import voice_detector
from app.models.speaker_verifier import speaker_verifier
from app.models.speech_to_text import speech_to_text
from app.models.transcript_analyzer import transcript_analyzer
from app.services.risk_engine import risk_engine
from app.database.database import get_speaker
from app.core.logging import logger


class AnalysisService:
    """
    Unified analysis service orchestrating the multi-signal AI cybersecurity pipeline.
    """

    def process_audio_pipeline(
        self,
        raw_audio: Any,
        speaker_id: Optional[str] = None,
        transcript_hint: Optional[str] = None,
        timestamp: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Executes the end-to-end analysis on an incoming audio segment.
        """
        ts = timestamp or time.time()

        # Step 1: Preprocess Audio
        audio, sr = preprocess_audio(raw_audio)
        if len(audio) == 0:
            logger.warning("[AUDIO] Empty or undecodable audio chunk received")
            return self._empty_analysis(ts)

        logger.info(f"[AUDIO] Audio chunk received ({len(audio)} samples, {sr}Hz)")

        # Step 2: Voice Activity Detection (VAD)
        has_speech, speech_ratio, active_audio = detect_speech(audio, sr=sr)
        target_audio = active_audio if len(active_audio) >= 512 else audio

        # Step 3: Acoustic Feature Extraction
        features = extract_all_features(target_audio, sr=sr)
        spectral = features["spectral"]
        
        # Calculate acoustic anomaly score based on spectral flatness and rolloff
        anomaly_score = float(np.clip(spectral["flatness"] * 25.0, 0.0, 1.0))

        # Step 4: AI Voice Authenticity Detection
        logger.info("[DETECTION] Running AI voice detection")
        voice_res = voice_detector.predict(target_audio, sr=sr)
        ai_spoof_prob = int(round(voice_res["ai_probability"] * 100))
        logger.info(f"[DETECTION] AI spoof probability: {ai_spoof_prob}%")

        # Step 5: Speaker Verification
        logger.info("[SPEAKER] Calculating speaker similarity")
        speaker_data = get_speaker(speaker_id) if speaker_id else None
        has_registered_speaker = speaker_data is not None
        registered_name = speaker_data["name"] if speaker_data else None

        current_embedding = speaker_verifier.create_embedding(target_audio, sr=sr)
        registered_embedding = speaker_data["embedding"] if speaker_data else None

        speaker_comp = speaker_verifier.compare(current_embedding, registered_embedding)
        
        if has_registered_speaker:
            speaker_similarity = int(round(speaker_comp["similarity"] * 100))
            logger.info(f"[SPEAKER] Speaker similarity: {speaker_similarity}% (Speaker: {registered_name})")
        else:
            speaker_similarity = None
            logger.info("[SPEAKER] No registered speaker profile enrolled (similarity: null)")

        speaker_res = {
            "match": speaker_comp["match"] if has_registered_speaker else False,
            "similarity": speaker_comp["similarity"] if has_registered_speaker else 0.0,
            "registered_speaker": registered_name,
            "status_message": speaker_comp["status_message"],
        }

        # Step 6: Speech-to-Text
        transcript_text = speech_to_text.transcribe(target_audio, sr=sr, client_hint=transcript_hint)

        # Step 7: Transcript Security Risk Analysis
        transcript_res = transcript_analyzer.analyze(transcript_text)
        conversation_risk = int(round(transcript_res["risk_score"] * 100))

        # Step 8: Multi-Signal Risk Engine
        logger.info("[RISK] Calculating risk score")
        risk_res = risk_engine.calculate_risk(
            ai_probability=voice_res["ai_probability"],
            speaker_similarity=speaker_res["similarity"],
            transcript_risk=transcript_res["risk_score"],
            audio_anomaly=anomaly_score,
            has_registered_speaker=has_registered_speaker,
            transcript_flags=transcript_res["flags"],
        )
        overall_risk_score = risk_res["score"]
        raw_level = risk_res["level"]
        logger.info(f"[RISK] Risk score: {overall_risk_score} (Level: {raw_level})")

        # Map to required risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
        level_map = {
            "SAFE": "LOW",
            "CAUTION": "MEDIUM",
            "SUSPICIOUS": "HIGH",
            "HIGH_RISK": "CRITICAL",
        }
        risk_level = level_map.get(raw_level, "LOW")

        # Determine Classification
        if has_speech:
            classification = "AI-GENERATED" if voice_res["ai_probability"] >= 0.70 else "HUMAN"
        else:
            classification = "UNKNOWN"

        # Explainable Recommended Action
        if overall_risk_score >= 80 or risk_level == "CRITICAL":
            recommended_action = "TERMINATE CALL IMMEDIATELY: High probability of AI voice cloning and social engineering detected. Do not share credentials or authorize transactions."
        elif overall_risk_score >= 60 or risk_level == "HIGH":
            recommended_action = "VERIFY IDENTITY OUT-OF-BAND: Suspicious acoustic patterns or high-risk language detected. Contact the speaker via a trusted secondary channel before proceeding."
        elif overall_risk_score >= 30 or risk_level == "MEDIUM":
            recommended_action = "PROCEED WITH CAUTION: Mild acoustic anomalies or sensitive topics detected. Request secondary confirmation if discussing credentials."
        else:
            recommended_action = "NORMAL MONITORING: Voice characteristics verified as natural human speech. No immediate threats detected."

        return {
            "type": "analysis",
            "timestamp": ts,
            # Top-level required fields
            "transcript": transcript_text,
            "ai_spoof_probability": ai_spoof_prob,
            "classification": classification,
            "speaker_similarity": speaker_similarity,
            "conversation_risk": conversation_risk,
            "overall_risk_score": overall_risk_score,
            "risk_level": risk_level,
            "recommended_action": recommended_action,
            # Structured sub-objects for dashboard UI compatibility
            "voice": {
                "ai_probability": voice_res["ai_probability"],
                "human_probability": voice_res["human_probability"],
                "confidence": voice_res["confidence"],
                "status": voice_res["status"],
            },
            "speaker": {
                "match": speaker_res["match"],
                "similarity": speaker_res["similarity"],
                "registered_speaker": registered_name,
            },
            "transcript_data": {
                "text": transcript_text,
                "risk_score": transcript_res["risk_score"],
                "flags": transcript_res["flags"],
            },
            "risk": {
                "score": overall_risk_score,
                "level": raw_level,
                "reasons": risk_res["reasons"],
                "recommended_action": recommended_action,
            },
        }

    def _empty_analysis(self, timestamp: float) -> Dict[str, Any]:
        return {
            "type": "analysis",
            "timestamp": timestamp,
            "transcript": "",
            "ai_spoof_probability": 0,
            "classification": "UNKNOWN",
            "speaker_similarity": None,
            "conversation_risk": 0,
            "overall_risk_score": 0,
            "risk_level": "LOW",
            "recommended_action": "NORMAL MONITORING: System idle — awaiting speech input.",
            "voice": {
                "ai_probability": 0.0,
                "human_probability": 1.0,
                "confidence": 0.0,
                "status": "LIKELY_HUMAN",
            },
            "speaker": {
                "match": False,
                "similarity": 0.0,
                "registered_speaker": None,
            },
            "transcript_data": {
                "text": "",
                "risk_score": 0.0,
                "flags": [],
            },
            "risk": {
                "score": 0,
                "level": "SAFE",
                "reasons": ["No speech detected in audio segment"],
                "recommended_action": "NORMAL MONITORING: System idle — awaiting speech input.",
            },
        }


analysis_service = AnalysisService()
