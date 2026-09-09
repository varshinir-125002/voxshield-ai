"""
VoxShield AI - Audio Preprocessing
Handles decoding, validation, resampling, and normalization.
"""

import io
import base64
import numpy as np
import soundfile as sf
import librosa
from typing import Tuple
from app.core.config import settings
from app.core.logging import logger


def normalize_audio(audio: np.ndarray) -> np.ndarray:
    """
    Normalize audio array to [-1.0, 1.0] range.
    """
    if audio is None or len(audio) == 0:
        return np.array([], dtype=np.float32)
    
    max_val = np.max(np.abs(audio))
    if max_val > 1e-6:
        return (audio / max_val).astype(np.float32)
    return audio.astype(np.float32)


def resample_audio(audio: np.ndarray, orig_sr: int, target_sr: int = 16000) -> np.ndarray:
    """
    Resample audio to target sample rate.
    """
    if orig_sr == target_sr or len(audio) == 0:
        return audio.astype(np.float32)
    try:
        return librosa.resample(audio, orig_sr=orig_sr, target_sr=target_sr).astype(np.float32)
    except Exception as e:
        logger.warning(f"Resampling failed, returning original audio: {e}")
        return audio.astype(np.float32)


def decode_audio_bytes(data: bytes, target_sr: int = 16000) -> Tuple[np.ndarray, int]:
    """
    Decodes audio bytes (WAV, MP3, OGG, FLAC, WebM or raw 16-bit PCM) into float32 numpy array.
    """
    if not data or len(data) == 0:
        return np.array([], dtype=np.float32), target_sr

    # Attempt 1: SoundFile decoder (handles WAV, FLAC, OGG, etc.)
    try:
        with io.BytesIO(data) as bio:
            audio, sr = sf.read(bio, dtype="float32")
            if audio.ndim > 1:
                audio = np.mean(audio, axis=1)  # Convert stereo/multichannel to mono
            audio = normalize_audio(audio)
            if sr != target_sr:
                audio = resample_audio(audio, sr, target_sr)
            return audio, target_sr
    except Exception as sf_err:
        logger.debug(f"Soundfile decode fell back: {sf_err}")

    # Attempt 2: Raw PCM 16-bit little-endian (common browser WebSocket stream format)
    try:
        if len(data) % 2 == 0:
            pcm_data = np.frombuffer(data, dtype=np.int16).astype(np.float32) / 32768.0
            pcm_data = normalize_audio(pcm_data)
            return pcm_data, target_sr
    except Exception as pcm_err:
        logger.debug(f"PCM decode fell back: {pcm_err}")

    # Attempt 3: Raw Float32
    try:
        if len(data) % 4 == 0:
            float_data = np.frombuffer(data, dtype=np.float32)
            float_data = normalize_audio(float_data)
            return float_data, target_sr
    except Exception as float_err:
        logger.debug(f"Float decode fell back: {float_err}")

    logger.warning("Could not decode audio data through any supported codec.")
    return np.array([], dtype=np.float32), target_sr


def preprocess_audio(raw_input: any, target_sr: int = 16000) -> Tuple[np.ndarray, int]:
    """
    Main entrypoint for preprocessing audio.
    Accepts:
    - base64 string
    - raw bytes
    - numpy array
    """
    if raw_input is None:
        return np.array([], dtype=np.float32), target_sr

    if isinstance(raw_input, np.ndarray):
        audio = raw_input.astype(np.float32)
        if audio.ndim > 1:
            audio = np.mean(audio, axis=1)
        return normalize_audio(audio), target_sr

    if isinstance(raw_input, str):
        # Handle base64 encoded audio (with or without data URI prefix)
        clean_b64 = raw_input
        if "," in clean_b64:
            clean_b64 = clean_b64.split(",", 1)[1]
        try:
            data = base64.b64decode(clean_b64)
            return decode_audio_bytes(data, target_sr)
        except Exception as e:
            logger.error(f"Base64 audio decoding failed: {e}")
            return np.array([], dtype=np.float32), target_sr

    if isinstance(raw_input, bytes):
        return decode_audio_bytes(raw_input, target_sr)

    return np.array([], dtype=np.float32), target_sr
