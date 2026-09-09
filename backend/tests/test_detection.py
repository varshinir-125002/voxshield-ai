"""
Tests for Voice Authenticity and Deepfake Detection
"""

import numpy as np
import pytest
from app.models.voice_detector import PrototypeVoiceDetector, TrainedVoiceDetectorAdapter


def generate_audio_signal(duration=1.0, sr=16000, is_synthetic=False):
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    if not is_synthetic:
        # Organic human-like harmonic complex with pitch variation
        f0 = 150 + 20 * np.sin(2 * np.pi * 3 * t)
        signal = 0.4 * np.sin(2 * np.pi * f0 * t) + 0.2 * np.sin(2 * np.pi * 2 * f0 * t)
        noise = 0.01 * np.random.normal(0, 1, len(t))
        return (signal + noise).astype(np.float32)
    else:
        # Robotic flatline sine wave with high-frequency buzz (vocoder artifact imitation)
        carrier = 0.5 * np.sin(2 * np.pi * 300 * t)
        high_buzz = 0.3 * np.sin(2 * np.pi * 7500 * t)
        return (carrier + high_buzz).astype(np.float32)


def test_voice_detector_output_structure():
    detector = PrototypeVoiceDetector()
    audio = generate_audio_signal(is_synthetic=False)
    res = detector.predict(audio, sr=16000)

    assert "ai_probability" in res
    assert "human_probability" in res
    assert "confidence" in res
    assert "status" in res
    assert res["status"] in ["LIKELY_HUMAN", "UNCERTAIN", "LIKELY_AI"]

    # Check probabilities sum to approx 1.0
    assert (res["ai_probability"] + res["human_probability"]) == pytest.approx(1.0, abs=0.02)
    assert 0.0 <= res["ai_probability"] <= 1.0
    assert 0.0 <= res["confidence"] <= 1.0


def test_voice_detector_synthetic_vs_natural():
    detector = PrototypeVoiceDetector()
    natural_audio = generate_audio_signal(is_synthetic=False)
    synthetic_audio = generate_audio_signal(is_synthetic=True)

    res_nat = detector.predict(natural_audio, sr=16000)
    res_syn = detector.predict(synthetic_audio, sr=16000)

    # Synthetic tone with high frequency buzz and rigid pitch should have higher AI probability
    assert res_syn["ai_probability"] > res_nat["ai_probability"]


def test_trained_adapter_fallback():
    adapter = TrainedVoiceDetectorAdapter(weights_path="nonexistent.pt")
    audio = generate_audio_signal(is_synthetic=False)
    res = adapter.predict(audio, sr=16000)
    assert "ai_probability" in res
    assert res["model_type"] == "Acoustic Multi-Feature Estimator / Prototype Acoustic Voice Detector"
