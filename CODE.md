# VoxShield AI — Antigravity Coding Instructions

## Mission

Build a working prototype of:

**AI-Powered Real-Time Detection and Prevention of Voice Cloning Impersonation Attacks**

Product name:

**VoxShield AI**

Tagline:

**Hear the voice. Verify the person.**

Read these files before coding:

```text
WORKFLOW.md
STRUCTURE.md
API.md
CODE.md
```

Follow them as the source of truth for architecture.

---

# 1. Build Order

Implement in this order:

1. Project folders
2. FastAPI backend
3. React/Vite frontend
4. Health endpoint
5. WebSocket connection
6. Microphone capture
7. Audio preprocessing
8. Feature extraction
9. Voice detector interface
10. Speaker verifier interface
11. Speech-to-text interface
12. Transcript analyzer
13. Risk engine
14. Real-time dashboard
15. Alerts/prevention UI
16. Automated tests
17. Run and fix integration errors

Do not build disconnected mock screens first and call the project complete.

---

# 2. Backend Setup

Use:

```text
Python
FastAPI
Uvicorn
WebSockets
Pydantic
NumPy
Librosa
PyTorch
```

Create:

```text
backend/app/main.py
```

Start with:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

---

# 3. Frontend Setup

Use:

```text
React
Vite
JavaScript
CSS
WebSocket
Web Audio API
```

Start with:

```bash
cd frontend
npm install
npm run dev
```

---

# 4. Microphone Capture

Create:

```text
frontend/src/components/AudioCapture.jsx
frontend/src/hooks/useVoiceStream.js
frontend/src/services/websocket.js
```

Use browser microphone permission:

```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
```

Do not access the microphone without user permission.

Capture short chunks and stream them to the backend.

---

# 5. WebSocket

Create:

```text
backend/app/api/websocket.py
```

Implement:

```python
@app.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    await websocket.accept()
    ...
```

The server must:

1. Accept connection.
2. Receive messages.
3. Validate audio.
4. Preprocess audio.
5. Run analysis.
6. Calculate risk.
7. Return JSON.
8. Continue until disconnect.

Frontend WebSocket service must support:

```text
connect()
sendAudio()
handleMessage()
disconnect()
reconnect()
```

---

# 6. Audio Processing

Create:

```text
backend/app/audio/preprocessing.py
backend/app/audio/vad.py
backend/app/audio/features.py
```

Implement clean interfaces:

```python
preprocess_audio(audio)
normalize_audio(audio)
resample_audio(audio)
detect_speech(audio)
extract_mfcc(audio)
extract_mel_spectrogram(audio)
extract_spectral_features(audio)
extract_pitch(audio)
extract_energy(audio)
```

Do not use frequency alone to classify a voice.

---

# 7. Voice Detection

Create:

```text
backend/app/models/voice_detector.py
```

Use:

```python
class VoiceDetector:
    def predict(self, audio):
        ...
```

Return:

```python
{
    "ai_probability": 0.0,
    "human_probability": 1.0,
    "confidence": 0.0,
    "status": "UNCERTAIN"
}
```

Statuses:

```text
LIKELY_HUMAN
UNCERTAIN
LIKELY_AI
```

## Model Abstraction

Create a replaceable architecture:

```text
VoiceDetector
├── PrototypeVoiceDetector
└── TrainedVoiceDetector
```

If a trained model is unavailable, use a clearly labeled development fallback.

Never present a random heuristic as a scientifically validated deepfake detector.

The UI should distinguish:

```text
Prototype Model
```

from:

```text
Trained Model
```

---

# 8. Speaker Verification

Create:

```text
backend/app/models/speaker_verifier.py
```

Implement:

```python
class SpeakerVerifier:

    def create_embedding(self, audio):
        ...

    def compare(self, current_embedding, registered_embedding):
        ...
```

Return:

```python
{
    "match": False,
    "similarity": 0.42
}
```

Keep speaker verification separate from AI-voice detection.

---

# 9. Speech-to-Text

Create:

```text
backend/app/models/speech_to_text.py
```

Interface:

```python
class SpeechToText:

    def transcribe(self, audio):
        ...
```

Use a suitable local model or backend API.

If an external service is used:

- Store the API key in `.env`.
- Call the service only from the backend.
- Never expose the key to React.

---

# 10. Transcript Analyzer

Create:

```text
backend/app/models/transcript_analyzer.py
```

Detect security-relevant patterns:

```text
OTP_REQUEST
PASSWORD_REQUEST
BANKING_REQUEST
MONEY_TRANSFER
URGENT_REQUEST
THREAT
CONFIDENTIAL_INFORMATION
IMPERSONATION
BYPASS_VERIFICATION
```

Return:

```python
{
    "risk_score": 0.0,
    "flags": []
}
```

Use transparent rule/model outputs so the UI can explain why risk increased.

---

# 11. Analysis Service

Create:

```text
backend/app/services/analysis_service.py
```

This module orchestrates:

```text
Audio
 ↓
Preprocessing
 ↓
Features
 ↓
Voice Detection
 ↓
Speaker Verification
 ↓
Speech-to-Text
 ↓
Transcript Analysis
 ↓
Risk Engine
```

The WebSocket route should call the analysis service instead of containing all model logic.

---

# 12. Risk Engine

Create:

```text
backend/app/services/risk_engine.py
```

Implement:

```python
calculate_risk(
    ai_probability,
    speaker_similarity,
    transcript_risk,
    audio_anomaly
)
```

Prototype formula:

```text
risk =
    0.45 × ai_probability
  + 0.30 × speaker_mismatch
  + 0.15 × transcript_risk
  + 0.10 × audio_anomaly
```

Convert to 0–100.

Use configuration rather than hard-coding weights throughout the project.

---

# 13. Dashboard

Build a polished cybersecurity dashboard.

Required sections:

```text
VoxShield AI
Hear the voice. Verify the person.

Connection Status

Live Voice Capture
Start Microphone
Stop Microphone
Waveform

AI Voice Analysis
AI Probability
Human Probability
Confidence
Status

Speaker Verification
Match/Mismatch
Similarity

Live Transcript

Risk Score
Threat Level
Risk Reasons

Security Recommendation
```

The interface must update live.

Do not reload the page for each analysis result.

---

# 14. Visual Behavior

Use a professional cybersecurity interface.

Requirements:

- Dark theme
- Responsive layout
- Card-based information hierarchy
- Live waveform
- Clear status badges
- Animated risk indicator
- Large risk score
- Prominent high-risk warning
- Mobile-friendly layout
- Accessible contrast
- Clear loading/error states

Avoid excessive decorative animations.

---

# 15. State Management

Frontend should maintain:

```text
connectionStatus
microphoneStatus
aiProbability
humanProbability
detectionConfidence
voiceStatus
speakerMatch
speakerSimilarity
transcript
transcriptRisk
riskScore
riskLevel
riskReasons
analysisStatus
error
```

---

# 16. Error Handling

Handle:

```text
MIC_PERMISSION_DENIED
WEBSOCKET_DISCONNECTED
INVALID_AUDIO
AUDIO_PROCESSING_ERROR
MODEL_ERROR
STT_ERROR
BACKEND_UNAVAILABLE
```

Use user-friendly messages.

Do not display internal exceptions.

---

# 17. Environment Variables

Create:

```text
backend/.env
```

Possible variables:

```text
MODEL_PATH=
DATABASE_URL=
SECRET_KEY=
STT_API_KEY=
```

Create/update `.gitignore`:

```text
.env
__pycache__/
*.pyc
node_modules/
dist/
.venv/
```

Never hard-code credentials.

---

# 18. Testing

Create:

```text
backend/tests/test_audio.py
backend/tests/test_detection.py
backend/tests/test_speaker.py
backend/tests/test_risk.py
```

Test:

### Human sample

Expected:

```text
LIKELY_HUMAN
```

### AI sample

Expected:

```text
LIKELY_AI
```

Only use these expected labels when the test data has known ground truth.

### Speaker mismatch

Expected:

```text
match = false
```

### Suspicious transcript

Expected:

```text
transcript risk increases
```

### Combined risk

Expected:

```text
HIGH_RISK
```

Also test malformed audio and disconnected WebSockets.

---

# 19. Prototype Honesty

Never write UI text claiming:

```text
100% Accurate
Guaranteed Detection
Impossible to Fool
```

Use:

```text
AI-generated probability
Detection confidence
Risk score
Likely AI-generated
Likely Human
Uncertain
```

The system is a prototype/security decision-support system.

---

# 20. Prevention

For the prototype, prevention should mean:

```text
Detect
 ↓
Warn
 ↓
Explain
 ↓
Recommend independent verification
 ↓
Optional simulated block
```

Do not implement unauthorized access to phone calls or communications.

---

# 21. Final Acceptance Criteria

The project is complete only when:

- Frontend starts.
- Backend starts.
- Health endpoint works.
- Microphone permission works.
- WebSocket connects.
- Audio chunks reach backend.
- Audio preprocessing works.
- Voice detector returns structured output.
- Speaker verifier returns structured output.
- Transcript appears.
- Transcript risk is calculated.
- Risk score is calculated.
- Dashboard updates in real time.
- High-risk alerts appear.
- Errors are handled.
- API keys are protected.
- Tests run successfully.
- README explains setup and execution.

---

# 22. Antigravity Agent Rules

You are the implementation agent for VoxShield AI.

Before writing code, read:

```text
WORKFLOW.md
STRUCTURE.md
API.md
CODE.md
```

Then inspect the existing repository before creating files.

Do not overwrite working code unnecessarily.

Do not invent undocumented APIs.

Do not put business/model logic directly inside frontend components.

Do not put all backend logic inside one file.

Keep interfaces modular so real trained models can be integrated later.

After each major phase:

1. Run the application.
2. Check errors.
3. Fix integration issues.
4. Continue to the next phase.

At the end, provide:

- Files created
- Technologies used
- Commands to run frontend/backend
- Environment variables required
- Tests performed
- Any model limitations
