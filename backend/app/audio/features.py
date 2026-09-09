"""
VoxShield AI - Feature Extraction Module
Extracts acoustic, spectral, prosodic, and temporal characteristics.
Note: Acoustic frequency alone is NEVER used in isolation to determine synthetic voice.
"""

import numpy as np
import librosa
from typing import Dict, Any


def extract_mfcc(audio: np.ndarray, sr: int = 16000, n_mfcc: int = 20) -> np.ndarray:
    """
    Extract Mel-Frequency Cepstral Coefficients (MFCCs).
    """
    if len(audio) < 512:
        return np.zeros((n_mfcc, 1), dtype=np.float32)
    return librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=n_mfcc)


def extract_mel_spectrogram(audio: np.ndarray, sr: int = 16000, n_mels: int = 128) -> np.ndarray:
    """
    Extract Mel Spectrogram representation.
    """
    if len(audio) < 512:
        return np.zeros((n_mels, 1), dtype=np.float32)
    return librosa.feature.melspectrogram(y=audio, sr=sr, n_mels=n_mels)


def extract_spectral_features(audio: np.ndarray, sr: int = 16000) -> Dict[str, float]:
    """
    Extract spectral envelope and shape descriptors:
    - Spectral Centroid (brightness)
    - Spectral Bandwidth (spread)
    - Spectral Flatness (noisiness vs tonality; vocoder artifact marker)
    - Spectral Rolloff
    - Zero-Crossing Rate
    """
    if len(audio) < 512:
        return {
            "centroid": 0.0,
            "bandwidth": 0.0,
            "flatness": 0.0,
            "rolloff": 0.0,
            "zcr": 0.0,
        }

    centroid = float(np.mean(librosa.feature.spectral_centroid(y=audio, sr=sr)))
    bandwidth = float(np.mean(librosa.feature.spectral_bandwidth(y=audio, sr=sr)))
    flatness = float(np.mean(librosa.feature.spectral_flatness(y=audio)))
    rolloff = float(np.mean(librosa.feature.spectral_rolloff(y=audio, sr=sr)))
    zcr = float(np.mean(librosa.feature.zero_crossing_rate(y=audio)))

    return {
        "centroid": round(centroid, 2),
        "bandwidth": round(bandwidth, 2),
        "flatness": round(flatness, 6),
        "rolloff": round(rolloff, 2),
        "zcr": round(zcr, 4),
    }


def extract_pitch(audio: np.ndarray, sr: int = 16000) -> Dict[str, float]:
    """
    Extract fundamental frequency (F0/pitch) and its standard deviation (prosody measure).
    Natural human speech exhibits organic pitch drift; cloned or synthesized voices
    often exhibit micro-pitch robotic stability or atypical jump artifacts.
    """
    if len(audio) < 1024:
        return {"pitch_mean": 0.0, "pitch_std": 0.0, "pitch_jitter": 0.0}

    try:
        f0, voiced_flag, voiced_probs = librosa.pyin(
            audio,
            fmin=librosa.note_to_hz("C2"),
            fmax=librosa.note_to_hz("C7"),
            sr=sr,
        )
        voiced_f0 = f0[~np.isnan(f0)]
        if len(voiced_f0) > 0:
            pitch_mean = float(np.mean(voiced_f0))
            pitch_std = float(np.std(voiced_f0))
            # Jitter approx
            diffs = np.abs(np.diff(voiced_f0))
            pitch_jitter = float(np.mean(diffs)) if len(diffs) > 0 else 0.0
            return {
                "pitch_mean": round(pitch_mean, 2),
                "pitch_std": round(pitch_std, 2),
                "pitch_jitter": round(pitch_jitter, 2),
            }
    except Exception:
        pass

    return {"pitch_mean": 0.0, "pitch_std": 0.0, "pitch_jitter": 0.0}


def extract_energy(audio: np.ndarray) -> Dict[str, float]:
    """
    Extract RMS energy and energy envelope variance.
    """
    if len(audio) < 512:
        return {"rms_mean": 0.0, "rms_std": 0.0}

    rms = librosa.feature.rms(y=audio)[0]
    return {
        "rms_mean": float(round(float(np.mean(rms)), 4)),
        "rms_std": float(round(float(np.std(rms)), 4)),
    }


def extract_all_features(audio: np.ndarray, sr: int = 16000) -> Dict[str, Any]:
    """
    Aggregates full acoustic feature vector.
    """
    spectral = extract_spectral_features(audio, sr)
    pitch = extract_pitch(audio, sr)
    energy = extract_energy(audio)
    mfcc = extract_mfcc(audio, sr)
    mfcc_means = [float(round(m, 4)) for m in np.mean(mfcc, axis=1)]

    return {
        "sample_rate": sr,
        "duration_seconds": round(len(audio) / sr, 2),
        "spectral": spectral,
        "pitch": pitch,
        "energy": energy,
        "mfcc_means": mfcc_means,
    }
