"""
Tests for Audio Preprocessing, VAD, and Feature Extraction
"""

import numpy as np
import pytest
import io
import soundfile as sf
import base64

from app.audio.preprocessing import (
    preprocess_audio,
    normalize_audio,
    resample_audio,
    decode_audio_bytes,
)
from app.audio.vad import detect_speech
from app.audio.features import (
    extract_mfcc,
    extract_mel_spectrogram,
    extract_spectral_features,
    extract_pitch,
    extract_energy,
    extract_all_features,
)


def generate_sine_wave(freq=440.0, duration=1.0, sr=16000):
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    return 0.5 * np.sin(2 * np.pi * freq * t).astype(np.float32)


def test_normalize_audio():
    audio = np.array([-2.0, 0.0, 4.0], dtype=np.float32)
    norm = normalize_audio(audio)
    assert np.max(np.abs(norm)) <= 1.0
    assert norm[2] == pytest.approx(1.0)
    assert norm[0] == pytest.approx(-0.5)

    empty = normalize_audio(np.array([], dtype=np.float32))
    assert len(empty) == 0


def test_resample_audio():
    sr_orig = 8000
    sr_target = 16000
    sine = generate_sine_wave(freq=300, duration=0.5, sr=sr_orig)
    resampled = resample_audio(sine, orig_sr=sr_orig, target_sr=sr_target)
    assert len(resampled) == int(len(sine) * (sr_target / sr_orig))


def test_decode_and_preprocess_wav_bytes():
    sine = generate_sine_wave(freq=400, duration=0.5, sr=16000)
    bio = io.BytesIO()
    sf.write(bio, sine, 16000, format="WAV")
    wav_bytes = bio.getvalue()

    # Test raw bytes decoding
    audio, sr = decode_audio_bytes(wav_bytes, target_sr=16000)
    assert sr == 16000
    assert len(audio) > 0

    # Test base64 string preprocessing
    b64_str = base64.b64encode(wav_bytes).decode("utf-8")
    audio_b64, sr_b64 = preprocess_audio(b64_str, target_sr=16000)
    assert sr_b64 == 16000
    assert len(audio_b64) > 0


def test_malformed_audio_handling():
    # Random garbage bytes should not crash
    garbage = b"\x00\xff\xee\xdd\xcc" * 10
    audio, sr = preprocess_audio(garbage)
    assert isinstance(audio, np.ndarray)

    # Empty string
    audio_empty, _ = preprocess_audio("")
    assert len(audio_empty) == 0


def test_voice_activity_detection():
    # Pure silence
    silence = np.zeros(16000, dtype=np.float32)
    has_speech, ratio, _ = detect_speech(silence, sr=16000)
    assert has_speech is False
    assert ratio == 0.0

    # Voiced tone
    tone = generate_sine_wave(freq=220, duration=1.0, sr=16000)
    has_speech_tone, ratio_tone, active = detect_speech(tone, sr=16000)
    assert has_speech_tone is True
    assert ratio_tone > 0.0
    assert len(active) > 0


def test_feature_extraction():
    tone = generate_sine_wave(freq=440, duration=0.5, sr=16000)
    feats = extract_all_features(tone, sr=16000)

    assert "spectral" in feats
    assert "pitch" in feats
    assert "energy" in feats
    assert "mfcc_means" in feats
    assert len(feats["mfcc_means"]) == 20
    assert feats["spectral"]["centroid"] > 0
    assert feats["energy"]["rms_mean"] > 0
