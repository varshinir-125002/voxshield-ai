"""
Tests for Transcript Analysis and Multi-Signal Risk Engine
"""

from app.models.transcript_analyzer import TranscriptAnalyzer
from app.services.risk_engine import RiskEngine


def test_transcript_analyzer_safe():
    analyzer = TranscriptAnalyzer()
    res = analyzer.analyze("Good morning, how are you doing today? Let us discuss the project update.")
    assert res["risk_score"] == 0.0
    assert len(res["flags"]) == 0


def test_transcript_analyzer_otp_and_urgency():
    analyzer = TranscriptAnalyzer()
    res = analyzer.analyze("Please send the OTP immediately, do not delay!")
    assert res["risk_score"] >= 0.50
    assert "OTP_REQUEST" in res["flags"]
    assert "URGENT_REQUEST" in res["flags"]


def test_transcript_analyzer_banking_credentials():
    analyzer = TranscriptAnalyzer()
    res = analyzer.analyze("Calling from the bank fraud department. Verify your credit card cvv right now.")
    assert "BANKING_REQUEST" in res["flags"]
    assert "IMPERSONATION" in res["flags"]
    assert res["risk_score"] >= 0.60


def test_risk_engine_safe():
    engine = RiskEngine()
    res = engine.calculate_risk(
        ai_probability=0.10,
        speaker_similarity=0.95,
        transcript_risk=0.0,
        audio_anomaly=0.05,
        has_registered_speaker=True,
    )
    assert res["score"] <= 29
    assert res["level"] == "SAFE"
    assert len(res["reasons"]) > 0


def test_risk_engine_high_risk():
    engine = RiskEngine()
    res = engine.calculate_risk(
        ai_probability=0.90,
        speaker_similarity=0.30,
        transcript_risk=0.85,
        audio_anomaly=0.60,
        has_registered_speaker=True,
        transcript_flags=["OTP_REQUEST", "URGENT_REQUEST"],
    )
    assert res["score"] >= 80
    assert res["level"] == "HIGH_RISK"
    assert any("AI-generated" in r for r in res["reasons"])
    assert any("Speaker mismatch" in r for r in res["reasons"])
    assert any("OTP" in r for r in res["reasons"])


def test_risk_engine_no_speaker_reallocation():
    engine = RiskEngine()
    # When no speaker is registered, speaker mismatch is not penalized
    res = engine.calculate_risk(
        ai_probability=0.15,
        speaker_similarity=0.0,
        transcript_risk=0.0,
        audio_anomaly=0.10,
        has_registered_speaker=False,
    )
    assert res["score"] <= 29
    assert res["level"] == "SAFE"
