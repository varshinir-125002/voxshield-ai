"""
VoxShield AI - Speech to Text Module
Modular transcription interface supporting local processing and external STT APIs.
"""

from typing import Optional
import numpy as np
from app.core.config import settings
from app.core.logging import logger

try:
    import speech_recognition as sr_mod
except ImportError:
    sr_mod = None


class SpeechToText:
    """
    Modular Speech-to-Text transcriber.
    Supports client hints (Web Speech API) and local SpeechRecognition engine.
    """

    def __init__(self):
        self.api_key = settings.stt_api_key
        self.recognizer = sr_mod.Recognizer() if sr_mod else None
        if self.recognizer:
            self.recognizer.energy_threshold = 300
            self.recognizer.dynamic_energy_threshold = True
        logger.info(f"Initialized SpeechToText (engine={'SpeechRecognition' if self.recognizer else 'client_hint_only'})")

    def transcribe(self, audio: np.ndarray, sr: int = 16000, client_hint: Optional[str] = None) -> str:
        """
        Transcribes speech into text.
        If a live browser Web Speech API transcript is streamed as client_hint, it is prioritized.
        Otherwise uses modular SpeechRecognition transcription pipeline.
        """
        logger.info("[STT] Processing audio")

        if client_hint and client_hint.strip():
            hint_text = client_hint.strip()
            logger.info(f"[STT] Transcript (from client stream): {hint_text}")
            return hint_text

        if audio is None or len(audio) < sr * 0.3:
            logger.info("[STT] Transcript: (audio segment too short or silent)")
            return ""

        # SpeechRecognition transcription
        if self.recognizer and sr_mod:
            try:
                # Convert float32 [-1, 1] to 16-bit PCM bytes
                pcm_data = (np.clip(audio, -1.0, 1.0) * 32767.0).astype(np.int16).tobytes()
                audio_data = sr_mod.AudioData(pcm_data, sr, 2)
                text = self.recognizer.recognize_google(audio_data)
                if text and text.strip():
                    logger.info(f"[STT] Transcript: {text.strip()}")
                    return text.strip()
            except sr_mod.UnknownValueError:
                logger.info("[STT] Transcript: (no recognizable speech)")
            except sr_mod.RequestError as e:
                logger.warning(f"[STT] STT service request warning: {e}")
            except Exception as e:
                logger.warning(f"[STT] STT processing error: {e}")

        logger.info("[STT] Transcript: ")
        return ""


speech_to_text = SpeechToText()
