# VoxShield AI — Real-Time Detection & Prevention of Voice Cloning Impersonation Attacks

> **Tagline:** *Hear the voice. Verify the person.*  
> **Initiative:** Smart India Hackathon (SIH 2026) Prototype  
> **Domain:** AI Security, Audio Forensics & Cybersecurity Defense  

---

## 1. Project Overview

**VoxShield AI** is an end-to-end cybersecurity prototype designed to defend organizations and individuals against real-time voice cloning, deepfake audio impersonation, and AI-driven social engineering attacks.

Rather than relying on a single fallible signal (such as raw spectral frequency alone, which can easily produce false positives on noisy cellular calls), VoxShield AI evaluates four independent, orthogonal threat dimensions in real time:

```text
Microphone / Audio Feed
        ↓
Browser Web Audio API & MediaRecorder
        ↓
Low-Latency WebSocket (/ws/voice)
        ↓
Audio Preprocessing (Decode, Resample 16kHz, Amplitude Normalization)
        ↓
Voice Activity Detection (VAD)
        ↓
Acoustic Feature Extraction (MFCCs, Spectral Rolloff/Flatness, Pitch Prosody)
        ↓
┌────────────────────────────────────────────────────────┐
│ 1. AI Voice Authenticity (Synthetic Vocoder Artifacts) │
│ 2. Speaker Verification (Vocal Tract Embedding Cosine) │
│ 3. Speech-to-Text Transcription                        │
└────────────────────────────────────────────────────────┘
        ↓
4. Transcript Social Engineering Analysis (OTP, Extortion, Urgency)
        ↓
Explainable Multi-Signal Risk Engine (0 – 100 Score)
        ↓
Threat Classification (SAFE / CAUTION / SUSPICIOUS / HIGH_RISK)
        ↓
Real-Time Cybersecurity Dashboard & Simulated Quarantine
```

---

## 2. Multi-Signal Defense Matrix & Risk Formula

The Risk Engine synthesizes signals using configurable cybersecurity weights:

$$\text{Risk Score} = 0.45 \times P(\text{AI}) + 0.30 \times (1 - \text{Speaker Similarity}) + 0.15 \times \text{Transcript Risk} + 0.10 \times \text{Acoustic Anomaly}$$

Scaled to a **0–100 integer score**:

| Score Range | Threat Classification | System Behavior |
| :--- | :--- | :--- |
| **0 – 29** | `SAFE` | Voice harmonics and conversational behavior normal. Green indicators. |
| **30 – 59** | `CAUTION` | Minor acoustic anomalies or uncertain prosody. Amber alert. |
| **60 – 79** | `SUSPICIOUS` | Significant synthetic markers or unverified speaker profile. Orange alert. |
| **80 – 100** | `HIGH_RISK` | High synthetic voice probability, speaker mismatch, and/or OTP extortion. Red alert banner + verification recommendation + call quarantine simulation. |

### Explainable AI (XAI)
VoxShield AI explicitly shows **why** a conversation is flagged, displaying human-readable diagnostic reasons (e.g., *"Likely AI-generated voice"*, *"Speaker mismatch (similarity: 42%)"*, *"Extortion or legal threat detected"*, *"Suspicious OTP credential request"*).

---

## 3. Technology Stack

### Frontend
- **Framework:** React 19, Vite 6
- **Styling:** Vanilla CSS with custom cybersecurity tokens & dark glassmorphism design system
- **Real-Time Audio:** HTML5 Web Audio API, `MediaRecorder`, `AudioContext`, canvas visualizer
- **Networking:** Native WebSocket client with auto-reconnection (`ws://localhost:8000/ws/voice`), Fetch API

### Backend
- **Framework:** Python 3.14 / 3.12, FastAPI, Uvicorn (ASGI)
- **Audio Processing:** NumPy, SciPy, Librosa, SoundFile
- **Validation & Schemas:** Pydantic v2
- **Testing:** Pytest, HTTPX TestClient
- **Database:** SQLite with modular interface (ready for PostgreSQL)

---

## 4. Directory Structure

```text
VoxShield-AI/
├── frontend/                     # React + Vite cybersecurity dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioCapture.jsx        # Mic capture & device controls
│   │   │   ├── Waveform.jsx            # HTML5 Canvas real-time audio visualizer
│   │   │   ├── VoiceAnalysis.jsx       # AI vs Human probability meters
│   │   │   ├── SpeakerVerification.jsx # Speaker enrollment & embedding matching
│   │   │   ├── Transcript.jsx          # Live speech-to-text with scam phrase highlighting
│   │   │   ├── RiskScore.jsx           # Circular SVG radial gauge & explainable reasons
│   │   │   ├── ThreatAlert.jsx         # High-risk banner & simulated quarantine action
│   │   │   ├── ConnectionStatus.jsx    # Live connection pills
│   │   │   └── Dashboard.jsx           # Main grid dashboard
│   │   ├── pages/
│   │   │   └── DashboardPage.jsx       # Top navigation, headers, offline file analyzer modal
│   │   ├── services/
│   │   │   ├── websocket.js            # Resilient WebSocket connection manager
│   │   │   └── api.js                  # REST API client
│   │   ├── hooks/
│   │   │   └── useVoiceStream.js       # Live microphone streaming & simulation hook
│   │   ├── styles/
│   │   │   └── index.css               # Dark theme design system & glow effects
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── package.json
│   │   └── vite.config.js
│
├── backend/                      # FastAPI backend & AI audio pipeline
│   ├── app/
│   │   ├── main.py                     # FastAPI application entrypoint & CORS
│   │   ├── api/
│   │   │   ├── routes.py               # REST API endpoints (register, verify, analyze, alerts)
│   │   │   ├── health.py               # /health and /api/system/status
│   │   │   └── websocket.py            # /ws/voice real-time streaming endpoint
│   │   ├── core/
│   │   │   ├── config.py               # Centralized Pydantic settings
│   │   │   ├── logging.py              # Structured event logger
│   │   │   └── security.py             # Audio validation & stack trace sanitization
│   │   ├── audio/
│   │   │   ├── preprocessing.py        # Base64/WAV decoding, resampling & normalization
│   │   │   ├── vad.py                  # Short-Time Energy & ZCR Voice Activity Detection
│   │   │   └── features.py             # MFCCs, spectral moments, pitch prosody & energy
│   │   ├── models/
│   │   │   ├── voice_detector.py       # Prototype Detection Model & neural model adapter
│   │   │   ├── speaker_verifier.py     # Vocal tract embedding generator & cosine matcher
│   │   │   ├── speech_to_text.py       # Modular transcriber with local phrase spotter
│   │   │   └── transcript_analyzer.py  # 9-factor social engineering NLP regex scanner
│   │   ├── services/
│   │   │   ├── risk_engine.py          # Multi-signal risk formula & threat classifier
│   │   │   ├── analysis_service.py     # End-to-end pipeline orchestrator
│   │   │   └── alert_service.py        # Incident logger (in-memory & SQLite)
│   │   ├── schemas/
│   │   │   ├── audio.py                # Audio chunk messages & feature schemas
│   │   │   ├── analysis.py             # Full analysis response schemas
│   │   │   └── risk.py                 # Risk config & alert schemas
│   │   └── database/
│   │       ├── database.py             # SQLite connection & schema initializer
│   │       └── models.py               # Table entities
│   ├── tests/
│   │   ├── test_audio.py               # Audio preprocessing & VAD tests
│   │   ├── test_detection.py           # Synthetic voice detection tests
│   │   ├── test_speaker.py             # Speaker verification & embedding tests
│   │   └── test_risk.py                # Risk engine & transcript risk tests
│   ├── requirements.txt
│   └── .env
│
├── models/                       # Weights and model storage placeholders
├── audio/                        # Ground-truth audio test fixtures
│   ├── real/sample_human_voice.wav
│   └── synthetic/sample_cloned_voice.wav
├── docs/                         # Specifications (API.md, CODE.md, STRUCTURE.md, WORKFLOW.md)
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 5. Quick Start Instructions

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js LTS (v20+ or v24+)

### Step 1: Start the Backend Server

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```
- API Base: `http://localhost:8000`
- Health Check: `http://localhost:8000/health`
- Interactive Swagger Docs: `http://localhost:8000/docs`

### Step 2: Start the Frontend Application

```bash
cd frontend
npm install
npm run dev
```
- Dashboard Interface: `http://localhost:5173`

---

## 6. Running Automated Tests

Run the full pytest suite from the project root:

```bash
python -m pytest backend/tests -v
```

Tests verify:
- Audio normalization, resampling, and malformed audio resilience
- Voice Activity Detection (VAD) accuracy
- Voice authenticity scoring and classification ranges
- Speaker 64-dimensional acoustic embedding generation and cosine comparison
- Social engineering keyword pattern detection and multi-signal risk calculation

---

## 7. REST API & WebSocket Protocol

### Health Check
- `GET /health` → `{"status": "ok", "service": "VoxShield AI"}`
- `GET /api/system/status` → `{"backend": "online", "models": "loaded", "websocket": "available"}`

### Speaker Enrollment & Verification
- `POST /api/speaker/register` (multipart) → accepts `speaker_name`, `audio` file. Returns `{"success": true, "speaker_id": "spk-..."}`.
- `POST /api/speaker/verify` (multipart) → accepts `speaker_id`, `audio` file. Returns `{"match": true/false, "similarity": 0.88, "threshold": 0.75}`.

### Offline File Analysis
- `POST /api/analyze` (multipart) → accepts `audio` file, optional `speaker_id`. Runs full multi-signal pipeline on recorded voice files.

### Real-Time WebSocket (`ws://localhost:8000/ws/voice`)
1. **Client connects:** Backend responds with `{"type": "ready", "message": "VoxShield voice analysis ready"}`
2. **Client starts session:** `{"type": "start_session", "speaker_id": "spk-..."}`
3. **Client streams chunks:** `{"type": "audio", "audio": "<base64_wav>", "timestamp": 1234567890}`
4. **Backend sends live analysis:**
```json
{
  "type": "analysis",
  "timestamp": 1234567890,
  "voice": {
    "ai_probability": 0.87,
    "human_probability": 0.13,
    "confidence": 0.87,
    "status": "LIKELY_AI"
  },
  "speaker": {
    "match": false,
    "similarity": 0.42
  },
  "transcript": {
    "text": "Please send the OTP immediately.",
    "risk_score": 0.81,
    "flags": ["OTP_REQUEST", "URGENT_REQUEST"]
  },
  "risk": {
    "score": 86,
    "level": "HIGH_RISK",
    "reasons": [
      "Likely AI-generated voice",
      "Speaker mismatch",
      "Suspicious OTP request"
    ]
  }
}
```

---

## 8. Model Transparency & Honest Prototype Disclosure

In accordance with ethical AI and competition guidelines:
- **Prototype Detection Model:** The current acoustic detector calculates multi-feature spectral flatness, prosodic pitch variance, energy envelope stability, and rolloff continuity. It is transparently labeled in the UI as **"Prototype Detection Model"**.
- **Model Adapter:** The backend implements a plug-in interface (`TrainedVoiceDetectorAdapter` in `voice_detector.py`) allowing drop-in integration of fine-tuned deep learning models (such as AASIST, Wav2Vec2, or RawNet2) simply by specifying `MODEL_PATH` in `.env`.
- **Telephony Boundaries:** The prevention feature provides a simulated interaction quarantine (**"Prototype Simulation"**) and independent verification guidelines. It does not claim carrier-level PBX call termination without hardware telephony integration.

---

## 9. Evaluator Demo Simulator

For demonstration and judging purposes when live attacker voice samples are not readily available:
Use the **Prototype Test Presets** in the Live Audio Capture card:
1. **Safe Caller:** Simulates a verified authentic voice (AI: 8%, Similarity: 94%, Risk: 12/100 `SAFE`).
2. **Suspicious:** Simulates an uncertain acoustic profile with speaker mismatch (AI: 72%, Similarity: 44%, Risk: 71/100 `SUSPICIOUS`).
3. **High-Risk Scam:** Simulates a synthetic voice demanding OTP credentials under legal threat (AI: 93%, Similarity: 38%, Risk: 94/100 `HIGH_RISK`). Triggers the high-priority warning banner and quarantine action.

---

## 10. License

Developed for **Smart India Hackathon (SIH 2026)**. Open-source prototype under the MIT License.
