# VoxShield AI — Project Structure

## Recommended Stack

### Frontend
- React
- Vite
- JavaScript or TypeScript
- CSS/Tailwind CSS
- Web Audio API
- WebSocket

### Backend
- Python
- FastAPI
- Uvicorn
- WebSockets
- Pydantic
- NumPy
- Librosa
- PyTorch

### AI Components
- AI/deepfake voice detector
- Speaker embedding/verification model
- Speech-to-text model/service
- Transcript risk analyzer

### Database
- SQLite for prototype
- PostgreSQL for production

## Directory Tree

```text
VoxShield-AI/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AudioCapture.jsx
│   │   │   ├── Waveform.jsx
│   │   │   ├── Transcript.jsx
│   │   │   ├── VoiceAnalysis.jsx
│   │   │   ├── SpeakerVerification.jsx
│   │   │   ├── RiskScore.jsx
│   │   │   ├── ThreatAlert.jsx
│   │   │   └── ConnectionStatus.jsx
│   │   ├── pages/
│   │   │   └── DashboardPage.jsx
│   │   ├── services/
│   │   │   ├── websocket.js
│   │   │   └── api.js
│   │   ├── hooks/
│   │   │   └── useVoiceStream.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles/
│   │       └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── routes.py
│   │   │   ├── health.py
│   │   │   └── websocket.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── logging.py
│   │   │   └── security.py
│   │   ├── audio/
│   │   │   ├── preprocessing.py
│   │   │   ├── vad.py
│   │   │   └── features.py
│   │   ├── models/
│   │   │   ├── voice_detector.py
│   │   │   ├── speaker_verifier.py
│   │   │   ├── speech_to_text.py
│   │   │   └── transcript_analyzer.py
│   │   ├── services/
│   │   │   ├── analysis_service.py
│   │   │   ├── risk_engine.py
│   │   │   └── alert_service.py
│   │   ├── schemas/
│   │   │   ├── audio.py
│   │   │   ├── analysis.py
│   │   │   └── risk.py
│   │   └── database/
│   │       ├── database.py
│   │       └── models.py
│   ├── tests/
│   │   ├── test_audio.py
│   │   ├── test_detection.py
│   │   ├── test_speaker.py
│   │   └── test_risk.py
│   ├── requirements.txt
│   └── .env
│
├── models/
│   ├── voice_detector/
│   ├── speaker_model/
│   └── speech_model/
│
├── audio/
│   ├── real/
│   └── synthetic/
│
├── docs/
│   ├── WORKFLOW.md
│   ├── STRUCTURE.md
│   ├── API.md
│   └── CODE.md
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

## Module Responsibilities

### Frontend
`AudioCapture` captures microphone audio.

`Waveform` visualizes audio activity only.

`VoiceAnalysis` displays AI/Human probabilities.

`SpeakerVerification` displays speaker match and similarity.

`Transcript` displays live speech-to-text.

`RiskScore` displays score, level, and reasons.

`ThreatAlert` displays warnings and recommendations.

`websocket.js` owns the real-time connection.

### Backend
`main.py` starts FastAPI.

`websocket.py` handles real-time audio.

`preprocessing.py` cleans and prepares audio.

`features.py` extracts acoustic features.

`voice_detector.py` provides the AI-voice detector interface.

`speaker_verifier.py` provides speaker verification.

`speech_to_text.py` provides transcription.

`transcript_analyzer.py` evaluates conversation risk.

`risk_engine.py` combines security signals.

`analysis_service.py` orchestrates the analysis pipeline.

## Architecture Rule

Keep these layers separate:

```text
API
 ↓
Services
 ↓
Models
 ↓
Audio/Feature Processing
```

Do not put model logic directly inside FastAPI routes.
