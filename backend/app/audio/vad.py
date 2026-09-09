"""
VoxShield AI - Voice Activity Detection (VAD)
Detects usable speech and separates active voice segments from ambient silence.
"""

import numpy as np
import librosa
from typing import Tuple


def detect_speech(
    audio: np.ndarray,
    sr: int = 16000,
    energy_threshold: float = 0.015,
    zcr_threshold: float = 0.35,
    frame_length: int = 2048,
    hop_length: int = 512,
) -> Tuple[bool, float, np.ndarray]:
    """
    Analyzes audio array for presence of human speech activity.
    Returns:
    - has_speech: bool
    - speech_ratio: float (proportion of frames containing speech)
    - active_speech_audio: np.ndarray (concatenated voiced frames, or full audio if voiced)
    """
    if audio is None or len(audio) < hop_length:
        return False, 0.0, np.array([], dtype=np.float32)

    # Calculate Root-Mean-Square Energy across short frames
    rms = librosa.feature.rms(y=audio, frame_length=frame_length, hop_length=hop_length)[0]
    
    # Calculate Zero Crossing Rate across frames
    zcr = librosa.feature.zero_crossing_rate(y=audio, frame_length=frame_length, hop_length=hop_length)[0]

    # Human speech frames typically exhibit:
    # 1. RMS energy distinctly higher than baseline silence/background noise
    # 2. ZCR within speech limits (not pure high-frequency white hiss)
    speech_frames = (rms > energy_threshold) & (zcr < zcr_threshold)
    
    total_frames = len(speech_frames)
    if total_frames == 0:
        return False, 0.0, audio

    speech_count = int(np.sum(speech_frames))
    speech_ratio = float(speech_count / total_frames)

    # Minimum 10% voiced speech frames to qualify as speech chunk
    has_speech = speech_ratio >= 0.10

    if has_speech and speech_count > 0:
        # Extract active voiced samples
        indices = np.where(speech_frames)[0]
        sample_indices = []
        for idx in indices:
            start = idx * hop_length
            end = min(start + frame_length, len(audio))
            sample_indices.extend(range(start, end))
        unique_indices = np.unique(sample_indices)
        active_audio = audio[unique_indices]
        return True, speech_ratio, active_audio

    return has_speech, speech_ratio, audio
