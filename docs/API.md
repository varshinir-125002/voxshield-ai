# VoxShield AI — API Specification

## Base URLs

Development backend:

```text
http://localhost:8000
```

Frontend:

```text
http://localhost:5173
```

## 1. Health Check

### GET `/health`

Response:

```json
{
  "status": "ok",
  "service": "VoxShield AI"
}
```

## 2. System Status

### GET `/api/system/status`

Response:

```json
{
  "backend": "online",
  "models": "loaded",
  "websocket": "available"
}
```

## 3. Real-Time WebSocket

### WS `/ws/voice`

Development URL:

```text
ws://localhost:8000/ws/voice
```

The client opens one connection per analysis session.

### Client → Server

```json
{
  "type": "audio",
  "audio": "<encoded-audio-data>",
  "timestamp": 1234567890
}
```

Supported client message types:

```text
start_session
audio
stop_session
```

### Server → Client

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
    "flags": [
      "OTP_REQUEST"
    ]
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

## 4. WebSocket Ready Message

After connection:

```json
{
  "type": "ready",
  "message": "VoxShield voice analysis ready"
}
```

## 5. WebSocket Warning

```json
{
  "type": "warning",
  "level": "HIGH_RISK",
  "message": "Possible voice-cloning impersonation detected."
}
```

## 6. WebSocket Error

```json
{
  "type": "error",
  "code": "AUDIO_PROCESSING_ERROR",
  "message": "Unable to process audio chunk."
}
```

Never send Python stack traces to the frontend.

## 7. Speaker Registration

### POST `/api/speaker/register`

Request:

```text
multipart/form-data
speaker_name=<name>
audio=<audio-file>
```

Response:

```json
{
  "success": true,
  "speaker_id": "generated-id"
}
```

Prefer storing a speaker embedding rather than unnecessary raw audio.

## 8. Speaker Verification

### POST `/api/speaker/verify`

Request:

```text
multipart/form-data
speaker_id=<id>
audio=<audio-file>
```

Response:

```json
{
  "match": false,
  "similarity": 0.43,
  "threshold": 0.75
}
```

## 9. Offline Audio Analysis

### POST `/api/analyze`

Request:

```text
multipart/form-data
audio=<audio-file>
```

Response:

```json
{
  "voice": {
    "ai_probability": 0.76,
    "human_probability": 0.24,
    "confidence": 0.76,
    "status": "LIKELY_AI"
  },
  "speaker": {
    "match": false,
    "similarity": 0.48
  },
  "risk": {
    "score": 79,
    "level": "SUSPICIOUS",
    "reasons": [
      "Possible AI voice",
      "Speaker mismatch"
    ]
  }
}
```

This endpoint is mainly for testing uploaded recordings. Real-time operation should use WebSocket.

## 10. Risk Configuration

### GET `/api/risk/config`

Response:

```json
{
  "ai_voice_weight": 0.45,
  "speaker_weight": 0.30,
  "transcript_weight": 0.15,
  "audio_anomaly_weight": 0.10,
  "thresholds": {
    "safe": 29,
    "caution": 59,
    "suspicious": 79
  }
}
```

## 11. Create Alert

### POST `/api/alerts`

Request:

```json
{
  "risk_score": 87,
  "level": "HIGH_RISK",
  "reason": "Possible voice cloning impersonation"
}
```

Response:

```json
{
  "success": true,
  "alert_id": "alert-001"
}
```

## API Rules

- Validate all input.
- Use correct HTTP status codes.
- Limit upload sizes.
- Validate audio MIME types.
- Never expose secrets.
- Never expose stack traces.
- Return predictable JSON.
- Log security-relevant failures.
