# VoxShield AI — System Workflow

## Project
**AI-Powered Real-Time Detection and Prevention of Voice Cloning Impersonation Attacks**

VoxShield AI analyzes live speech and combines AI-voice detection, speaker verification, speech-to-text, conversation-risk analysis, and a real-time risk engine.

## End-to-End Flow

```text
Microphone / Audio Source
        ↓
Browser Audio Capture
        ↓
Audio Chunks
        ↓
WebSocket
        ↓
Audio Preprocessing
        ↓
Voice Activity Detection
        ↓
Feature Extraction
        ↓
┌──────────────────────────────┐
│ AI Voice Detection           │
│ Speaker Verification         │
│ Speech-to-Text                │
└──────────────────────────────┘
        ↓
Transcript / Behavior Analysis
        ↓
Risk Score Engine
        ↓
Threat Classification
        ↓
Dashboard Alert / Verification
```

## 1. Start Session

The user opens the VoxShield dashboard and selects **Start Microphone**.

The browser requests microphone permission.

The UI must show:

- Microphone state
- WebSocket state
- Live waveform
- Live transcript
- AI/Human probability
- Speaker verification
- Risk score
- Threat level
- Recommended action

## 2. Capture Audio

Use the browser Web Audio API or MediaRecorder to capture short audio chunks.

Do not wait for a complete recording before displaying analysis.

Target flow:

```text
Microphone → Audio Chunk → WebSocket → Backend
```

## 3. Preprocess Audio

The backend should:

- Decode the incoming audio.
- Validate the audio.
- Convert to a consistent sample rate.
- Normalize amplitude.
- Detect speech/silence.
- Segment usable speech.
- Handle noisy or malformed input safely.

Frequency-domain information can be used, but frequency alone must not determine whether a voice is cloned.

## 4. Extract Features

Possible features:

- MFCC
- Mel spectrogram
- Spectral centroid
- Spectral bandwidth
- Zero-crossing rate
- Pitch
- Energy
- Prosodic features
- Voice embeddings

The feature layer must remain independent from the API/WebSocket layer.

## 5. AI Voice Detection

The detector estimates whether a speech segment is likely human or AI-generated.

Example:

```json
{
  "ai_probability": 0.87,
  "human_probability": 0.13,
  "confidence": 0.87,
  "status": "LIKELY_AI"
}
```

Use configurable thresholds:

```text
0.00–0.30 → LIKELY_HUMAN
0.30–0.70 → UNCERTAIN
0.70–1.00 → LIKELY_AI
```

These are prototype defaults, not universal scientific thresholds.

Never claim 100% certainty.

## 6. Speaker Verification

If a trusted speaker profile exists:

```text
Current Speech
      ↓
Speaker Embedding
      ↓
Similarity Comparison
      ↓
Speaker Match / Mismatch
```

Example:

```json
{
  "match": false,
  "similarity": 0.42
}
```

Speaker verification and AI-voice detection must remain separate signals.

A cloned voice may resemble the registered speaker while still being synthetic.

## 7. Speech-to-Text

Convert usable speech into a live transcript.

Example:

```text
"Please send the OTP immediately."
```

The transcript is used as a secondary security signal.

## 8. Conversation Risk Analysis

Look for suspicious patterns such as:

- OTP requests
- Password requests
- Banking information requests
- Money-transfer requests
- Urgency
- Threats
- Confidential-information requests
- Instructions to bypass normal verification
- Impersonation claims

This module should provide risk signals rather than independently declaring a caller fraudulent.

## 9. Risk Engine

Combine independent signals.

Prototype formula:

```text
risk =
    0.45 × ai_probability
  + 0.30 × speaker_mismatch
  + 0.15 × transcript_risk
  + 0.10 × audio_anomaly
```

Convert the result to 0–100.

All weights must be configurable.

## 10. Threat Levels

```text
0–29   → SAFE
30–59  → CAUTION
60–79  → SUSPICIOUS
80–100 → HIGH_RISK
```

Example:

```json
{
  "score": 86,
  "level": "HIGH_RISK",
  "reasons": [
    "Likely AI-generated voice",
    "Speaker mismatch",
    "Suspicious OTP request"
  ]
}
```

## 11. Prevention

When risk becomes high, the prototype should:

1. Display a prominent warning.
2. Highlight the risk factors.
3. Recommend independent verification.
4. Optionally simulate blocking/pausing the interaction.

Do not claim that the prototype can terminate a real phone call unless it is actually integrated with a telephony system.

## 12. Real-Time Dashboard

The dashboard updates without a browser refresh.

Example:

```text
VOXSHIELD AI
Hear the voice. Verify the person.

WebSocket: CONNECTED
Microphone: ON

AI VOICE
87% AI
13% Human
Status: LIKELY AI

SPEAKER
Mismatch detected
Similarity: 42%

TRANSCRIPT
"Please send the OTP immediately."

RISK
86 / 100
HIGH RISK

RECOMMENDATION
Verify the caller through another trusted channel.
```

## 13. Failure Handling

Handle:

- Microphone permission denial
- WebSocket disconnect
- Invalid audio
- Empty audio
- Model errors
- Speech-recognition errors
- Backend unavailable

One failed module must not crash the whole dashboard.

## 14. Security

- Never expose API keys in frontend code.
- Use environment variables for secrets.
- Validate WebSocket payloads.
- Limit audio message sizes.
- Avoid unnecessary raw-audio storage.
- Protect speaker embeddings.
- Do not expose internal stack traces.
- Log important security events.
