"""
Tests for Speaker Verification and Embedding Comparison
"""

import numpy as np
import pytest
from app.models.speaker_verifier import SpeakerVerifier
from app.database.database import init_db, save_speaker, get_speaker


def generate_tone(freq=300.0, duration=1.0, sr=16000):
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    return (0.6 * np.sin(2 * np.pi * freq * t)).astype(np.float32)


def test_embedding_generation_and_dimension():
    verifier = SpeakerVerifier(threshold=0.75)
    audio = generate_tone(freq=250.0)
    embedding = verifier.create_embedding(audio, sr=16000)

    assert isinstance(embedding, list)
    assert len(embedding) == 64
    # Check L2 normalized
    norm = np.linalg.norm(np.array(embedding))
    assert norm == pytest.approx(1.0, abs=0.05)


def test_speaker_comparison_identical():
    verifier = SpeakerVerifier(threshold=0.75)
    audio = generate_tone(freq=300.0)
    emb = verifier.create_embedding(audio, sr=16000)

    res = verifier.compare(emb, emb)
    assert res["match"] is True
    assert res["similarity"] == pytest.approx(1.0, abs=0.02)


def test_speaker_comparison_mismatch():
    verifier = SpeakerVerifier(threshold=0.75)
    # Distinct harmonics
    audio_a = generate_tone(freq=120.0)
    audio_b = generate_tone(freq=1200.0)

    emb_a = verifier.create_embedding(audio_a, sr=16000)
    emb_b = verifier.create_embedding(audio_b, sr=16000)

    res = verifier.compare(emb_a, emb_b)
    assert res["similarity"] < 0.75
    assert res["match"] is False


def test_speaker_comparison_missing():
    verifier = SpeakerVerifier(threshold=0.75)
    audio = generate_tone(freq=200.0)
    emb = verifier.create_embedding(audio, sr=16000)

    res = verifier.compare(emb, None)
    assert res["match"] is False
    assert "no registered speaker" in res["status_message"].lower()


def test_database_speaker_save_and_retrieve():
    init_db()
    test_id = "spk-test-01"
    test_name = "Alice Security"
    dummy_emb = [0.1] * 64

    saved = save_speaker(test_id, test_name, dummy_emb)
    assert saved is True

    record = get_speaker(test_id)
    assert record is not None
    assert record["name"] == test_name
    assert len(record["embedding"]) == 64
