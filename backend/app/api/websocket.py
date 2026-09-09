"""
VoxShield AI - Real-Time WebSocket Handler
Receives live audio streaming chunks, runs real-time pipeline, and streams back threat analyses.
"""

import json
import time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.analysis_service import analysis_service
from app.core.security import sanitize_error_message
from app.core.logging import logger

router = APIRouter(tags=["Real-time Stream"])


@router.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    """
    Real-time bidirectional WebSocket connection for live microphone analysis.
    Endpoint: ws://localhost:8000/ws/voice
    """
    await websocket.accept()
    logger.info("WebSocket connection established with client.")

    # Send initial ready message per API.md specification
    await websocket.send_json({
        "type": "ready",
        "message": "VoxShield voice analysis ready",
    })

    current_speaker_id = None
    session_active = False

    try:
        while True:
            raw_text = await websocket.receive_text()
            try:
                data = json.loads(raw_text)
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "code": "INVALID_JSON",
                    "message": "Expected valid JSON message.",
                })
                continue

            msg_type = data.get("type", "")

            # 1. Start Session
            if msg_type == "start_session":
                session_active = True
                current_speaker_id = data.get("speaker_id")
                logger.info(f"Session started (speaker_id={current_speaker_id})")
                await websocket.send_json({
                    "type": "ready",
                    "message": "Voice monitoring session active.",
                })

            # 2. Audio Chunk Streaming
            elif msg_type == "audio":
                audio_b64 = data.get("audio")
                if not audio_b64:
                    continue

                ts = data.get("timestamp", time.time())
                speaker_id = data.get("speaker_id", current_speaker_id)
                transcript_hint = data.get("transcript_hint")

                try:
                    # Execute pipeline
                    result = analysis_service.process_audio_pipeline(
                        raw_audio=audio_b64,
                        speaker_id=speaker_id,
                        transcript_hint=transcript_hint,
                        timestamp=ts,
                    )

                    # Send analysis result back to frontend
                    logger.info(f"[WS] Sending analysis result to frontend (Risk: {result.get('overall_risk_score')}, Classification: {result.get('classification')})")
                    await websocket.send_json(result)

                    # If configured threat threshold is reached, issue explicit security warning per API.md
                    risk_lvl = result.get("risk", {}).get("level", "")
                    risk_score = result.get("overall_risk_score", 0)
                    if risk_lvl in ["HIGH_RISK", "CRITICAL"] or risk_score >= 80:
                        await websocket.send_json({
                            "type": "warning",
                            "level": "HIGH_RISK",
                            "message": "CRITICAL WARNING: Voice cloning and high-threat social engineering detected! Terminate call immediately.",
                        })
                    elif risk_lvl == "SUSPICIOUS" or risk_score >= 60:
                        await websocket.send_json({
                            "type": "warning",
                            "level": "SUSPICIOUS",
                            "message": "SECURITY WARNING: Suspicious voice characteristics or credential requests detected. Verify identity out-of-band.",
                        })

                except Exception as proc_err:
                    clean_msg = sanitize_error_message(proc_err)
                    await websocket.send_json({
                        "type": "error",
                        "code": "AUDIO_PROCESSING_ERROR",
                        "message": clean_msg,
                    })

            # 3. Stop Session
            elif msg_type == "stop_session":
                session_active = False
                logger.info("Session stopped by client.")
                await websocket.send_json({
                    "type": "ready",
                    "message": "Voice monitoring session paused.",
                })

            else:
                logger.warning(f"Unrecognized WebSocket message type: {msg_type}")

    except WebSocketDisconnect:
        logger.info("Client disconnected from WebSocket cleanly.")
    except Exception as e:
        logger.error(f"Unexpected WebSocket error: {e}")
