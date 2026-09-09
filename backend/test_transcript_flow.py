"""
Test Script for Two-Sentence Live Transcription & Fraud Detection
Validates:
  1. Sentence 1: "Good morning team, let's test the model." -> low risk, no threat flags
  2. Sentence 2: "Please send me your OTP or your bank account details." -> detects OTP_REQUEST, BANKING_REQUEST, elevated risk score
  3. No cumulative repeat corruption
"""

import sys
import io
import time
import json
import wave
import base64
import numpy as np
import websockets
import asyncio

WS_URL = "ws://localhost:8000/ws/voice"

def generate_wav_bytes(duration_sec=1.0, sr=16000, freq=220.0):
    t = np.linspace(0, duration_sec, int(sr * duration_sec), endpoint=False)
    signal = 0.4 * np.sin(2 * np.pi * freq * t) + 0.2 * np.sin(2 * np.pi * (freq * 2) * t)
    samples = (np.clip(signal, -1.0, 1.0) * 32767).astype(np.int16)
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(samples.tobytes())
    return base64.b64encode(buf.getvalue()).decode('utf-8')


async def test_sequential_transcripts():
    print("\n" + "="*70)
    print("TESTING SEQUENTIAL TRANSCRIPT REPETITION BUG FIX")
    print("="*70)
    
    sentence_1 = "Good morning team, let's test the model."
    sentence_2 = "Please send me your OTP or your bank account details."
    
    b64_audio = generate_wav_bytes(duration_sec=1.0)
    
    async with websockets.connect(WS_URL) as ws:
        await ws.recv() # welcome
        await ws.send(json.dumps({
            "type": "start_session",
            "speaker_id": None
        }))
        await ws.recv() # ready
        
        # 1. Send Sentence 1
        print("\n--- Sending Sentence 1 ---")
        print(f"Input: '{sentence_1}'")
        await ws.send(json.dumps({
            "type": "audio",
            "audio": b64_audio,
            "transcript_hint": sentence_1,
            "speaker_id": None
        }))
        res1 = json.loads(await ws.recv())
        print(f"Backend Returned Transcript: '{res1.get('transcript')}'")
        print(f"Risk Score: {res1.get('overall_risk_score')} (Level: {res1.get('risk_level')})")
        print(f"Flags: {res1.get('transcript_data', {}).get('flags')}")
        
        assert res1.get("transcript") == sentence_1
        assert len(res1.get("transcript_data", {}).get("flags", [])) == 0
        assert res1.get("overall_risk_score") < 40
        print(">>> Sentence 1 verified clean and low-risk.")
        
        # 2. Send Sentence 2
        print("\n--- Sending Sentence 2 ---")
        print(f"Input: '{sentence_2}'")
        await ws.send(json.dumps({
            "type": "audio",
            "audio": b64_audio,
            "transcript_hint": sentence_2,
            "speaker_id": None
        }))
        res2 = json.loads(await ws.recv())
        print(f"Backend Returned Transcript: '{res2.get('transcript')}'")
        print(f"Risk Score: {res2.get('overall_risk_score')} (Level: {res2.get('risk_level')})")
        flags2 = res2.get('transcript_data', {}).get('flags', [])
        print(f"Flags: {flags2}")
        
        assert res2.get("transcript") == sentence_2
        assert "OTP_REQUEST" in flags2, f"Expected OTP_REQUEST in {flags2}"
        assert "BANKING_REQUEST" in flags2, f"Expected BANKING_REQUEST in {flags2}"
        assert res2.get("overall_risk_score") >= 60, f"Expected elevated risk score, got {res2.get('overall_risk_score')}"
        print(">>> Sentence 2 verified: threat flags [OTP_REQUEST, BANKING_REQUEST] triggered elevated risk.")
        
        # Verify no repeated cumulative text
        transcript_text = res2.get("transcript", "")
        count_good_morning = transcript_text.lower().count("good morning")
        assert count_good_morning == 0, f"Sentence 2 should not repeat Sentence 1! Count: {count_good_morning}"
        
        print("\n" + "="*70)
        print("PASS: Sequential transcription produces clean text without repeated accumulation!")
        print("="*70)

if __name__ == "__main__":
    asyncio.run(test_sequential_transcripts())
