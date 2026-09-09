/**
 * VoxShield AI - useVoiceStream Hook
 * Manages live microphone capture, Web Audio API analysis, WebSocket streaming,
 * and live browser SpeechRecognition hints.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceWebSocketClient } from '../services/websocket';

export function useVoiceStream() {
  const [isRecording, setIsRecording] = useState(false);
  const [wsStatus, setWsStatus] = useState('DISCONNECTED');
  const [error, setError] = useState(null);
  const [warningMessage, setWarningMessage] = useState(null);
  const [selectedSpeakerId, setSelectedSpeakerId] = useState(null);

  // Live Analysis State
  const [analysisData, setAnalysisData] = useState({
    voice: {
      ai_probability: 0.0,
      human_probability: 1.0,
      confidence: 0.0,
      status: 'LIKELY_HUMAN',
    },
    speaker: {
      match: false,
      similarity: 0.0,
      registered_speaker: null,
    },
    transcript: {
      text: '',
      risk_score: 0.0,
      flags: [],
    },
    risk: {
      score: 0,
      level: 'SAFE',
      reasons: ['System idle — microphone paused'],
    },
  });

  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [audioFrequencyData, setAudioFrequencyData] = useState(new Uint8Array(64));

  const wsClientRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const processorRef = useRef(null);
  const animFrameRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const selectedSpeakerIdRef = useRef(selectedSpeakerId);

  // Transcript state tracking refs to eliminate duplicate and cumulative accumulation
  const finalTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');
  const sessionFinalRef = useRef('');
  const persistedFinalRef = useRef('');
  const fullDisplayRef = useRef('');
  const isRecordingRef = useRef(false);

  useEffect(() => {
    selectedSpeakerIdRef.current = selectedSpeakerId;
  }, [selectedSpeakerId]);

  // Centralized transcript display updater with explicit logging
  const updateTranscriptDisplay = useCallback((finalText, interimText) => {
    const finalClean = (finalText || '').trim();
    const interimClean = (interimText || '').trim();

    let displayed = '';
    if (finalClean && interimClean) {
      displayed = `${finalClean} ${interimClean}`;
    } else if (finalClean) {
      displayed = finalClean;
    } else if (interimClean) {
      displayed = interimClean;
    }

    finalTranscriptRef.current = finalClean;
    interimTranscriptRef.current = interimClean;
    fullDisplayRef.current = displayed;

    setFinalTranscript(finalClean);
    setInterimTranscript(interimClean);
    setLiveTranscript(displayed);

    console.log('[STT] interim transcript:', interimClean);
    console.log('[STT] final transcript:', finalClean);
    console.log('[STT] displayed transcript:', displayed);

    return displayed;
  }, []);

  // 1. Initialize WebSocket client on mount
  useEffect(() => {
    const ws = new VoiceWebSocketClient();
    wsClientRef.current = ws;

    ws.onStatusChange = (status) => setWsStatus(status);

    ws.onReady = (msg) => {
      console.log('[VoxShield] Server ready:', msg.message);
      setError(null);
    };

    ws.onAnalysis = (data) => {
      const incomingText = typeof data.transcript === 'string'
        ? data.transcript
        : (data.transcript?.text || data.transcript_data?.text || '');

      const aiProb = data.ai_spoof_probability !== undefined
        ? data.ai_spoof_probability
        : Math.round((data.voice?.ai_probability || 0) * 100);

      const classification = data.classification || data.voice?.status || 'HUMAN';
      const riskScore = data.overall_risk_score !== undefined
        ? data.overall_risk_score
        : (data.risk_score !== undefined
            ? data.risk_score
            : (data.risk?.score ?? 0));

      console.log('[UI] Updating detection result', { probability: aiProb, classification });
      console.log('[UI] Updating risk score', riskScore);
      console.log('[STT] backend transcript:', incomingText);

      // Single authoritative transcript display path:
      // If browser SpeechRecognition is active, it authoritative drives liveTranscript.
      // Only when SpeechRecognition is NOT running in browser (fallback/offline),
      // update liveTranscript from backend with strict deduplication.
      if (!speechRecognitionRef.current) {
        if (incomingText && incomingText.trim()) {
          const trimmed = incomingText.trim();
          setLiveTranscript((prev) => {
            if (!prev) {
              fullDisplayRef.current = trimmed;
              finalTranscriptRef.current = trimmed;
              setFinalTranscript(trimmed);
              console.log('[STT] displayed transcript:', trimmed);
              return trimmed;
            }
            if (prev === trimmed || prev.endsWith(trimmed)) {
              return prev;
            }
            if (trimmed.startsWith(prev)) {
              fullDisplayRef.current = trimmed;
              finalTranscriptRef.current = trimmed;
              setFinalTranscript(trimmed);
              console.log('[STT] displayed transcript:', trimmed);
              return trimmed;
            }
            if (prev.includes(trimmed)) {
              return prev;
            }
            const updated = `${prev} ${trimmed}`;
            fullDisplayRef.current = updated;
            finalTranscriptRef.current = updated;
            setFinalTranscript(updated);
            console.log('[STT] displayed transcript:', updated);
            return updated;
          });
        }
      }

      const normalizedData = {
        ...data,
        transcript_text: incomingText,
        ai_spoof_probability: aiProb,
        classification,
        overall_risk_score: riskScore,
        risk_level: data.risk_level || (riskScore >= 80 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH' : riskScore >= 30 ? 'MEDIUM' : 'LOW'),
        speaker_similarity: data.speaker_similarity,
        recommended_action: data.recommended_action || data.risk?.recommended_action || 'NORMAL MONITORING',
        voice: data.voice || {
          ai_probability: aiProb / 100,
          human_probability: 1 - (aiProb / 100),
          confidence: data.voice?.confidence ?? 0.85,
          status: classification === 'AI-GENERATED' ? 'LIKELY_AI' : 'LIKELY_HUMAN',
        },
        speaker: data.speaker || {
          match: data.speaker_similarity !== null && data.speaker_similarity >= 75,
          similarity: data.speaker_similarity !== null ? (data.speaker_similarity / 100) : 0.0,
          registered_speaker: data.speaker?.registered_speaker || null,
        },
        transcript: {
          text: incomingText,
          risk_score: data.transcript_data?.risk_score ?? (data.conversation_risk !== undefined ? data.conversation_risk / 100 : (data.transcript?.risk_score ?? 0)),
          flags: data.transcript_data?.flags ?? data.transcript?.flags ?? [],
        },
        risk: {
          score: riskScore,
          level: data.risk?.level || (riskScore >= 80 ? 'HIGH_RISK' : riskScore >= 60 ? 'SUSPICIOUS' : riskScore >= 30 ? 'CAUTION' : 'SAFE'),
          reasons: data.risk?.reasons || [],
          recommended_action: data.recommended_action || data.risk?.recommended_action || 'NORMAL MONITORING',
        },
      };

      setAnalysisData(normalizedData);
    };

    ws.onWarning = (warn) => {
      setWarningMessage(warn.message || 'Suspicious voice pattern detected.');
    };

    ws.onError = (err) => {
      setError(err.message || 'An error occurred during voice analysis.');
    };

    ws.connect();

    return () => {
      ws.disconnect();
    };
  }, []);

  // 2. Frequency animation loop for canvas
  const updateVisualizer = useCallback(() => {
    if (analyserRef.current && isRecording) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      setAudioFrequencyData(dataArray);
      animFrameRef.current = requestAnimationFrame(updateVisualizer);
    }
  }, [isRecording]);

  // Helper function to encode raw PCM Float32 samples to standard 16 kHz Mono WAV format
  const encodeWav = (samples, sampleRate = 16000) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset, str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // 1 channel Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // 16 bits per sample
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    return buffer;
  };

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return 'data:audio/wav;base64,' + window.btoa(binary);
  };

  // 3. Start Microphone Capture
  const startMicrophone = async () => {
    setError(null);
    setWarningMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported by your browser.');
      }

      // Request microphone permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // Set up AudioContext & AnalyserNode
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Reset transcript states on new recording start
      isRecordingRef.current = true;
      persistedFinalRef.current = '';
      sessionFinalRef.current = '';
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
      fullDisplayRef.current = '';
      setFinalTranscript('');
      setInterimTranscript('');
      setLiveTranscript('');

      // Browser Speech Recognition with separated interim and final segments
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognizer = new SpeechRecognition();
          recognizer.continuous = true;
          recognizer.interimResults = true;
          recognizer.lang = 'en-US';

          recognizer.onresult = (event) => {
            let sessionFinal = '';
            let currentInterim = '';

            for (let i = 0; i < event.results.length; ++i) {
              const res = event.results[i];
              const piece = res[0]?.transcript?.trim();
              if (!piece) continue;

              if (res.isFinal) {
                sessionFinal += (sessionFinal ? ' ' : '') + piece;
              } else {
                currentInterim += (currentInterim ? ' ' : '') + piece;
              }
            }

            sessionFinalRef.current = sessionFinal;

            const totalFinal = persistedFinalRef.current
              ? (sessionFinal ? `${persistedFinalRef.current} ${sessionFinal}` : persistedFinalRef.current)
              : sessionFinal;

            updateTranscriptDisplay(totalFinal, currentInterim);
          };

          recognizer.onend = () => {
            if (isRecordingRef.current && speechRecognitionRef.current) {
              if (sessionFinalRef.current) {
                persistedFinalRef.current = persistedFinalRef.current
                  ? `${persistedFinalRef.current} ${sessionFinalRef.current}`
                  : sessionFinalRef.current;
                sessionFinalRef.current = '';
              }
              interimTranscriptRef.current = '';
              setInterimTranscript('');
              try {
                recognizer.start();
              } catch (restartErr) {
                console.log('[SpeechRecognition] restart note:', restartErr);
              }
            }
          };

          recognizer.onerror = (e) => {
            console.log('[SpeechRecognition] Note:', e.error);
          };

          recognizer.start();
          speechRecognitionRef.current = recognizer;
        } catch (sttErr) {
          console.log('[SpeechRecognition] fallback:', sttErr);
        }
      }

      // Inform backend of session start
      if (wsClientRef.current) {
        wsClientRef.current.sendStartSession(selectedSpeakerIdRef.current);
      }

      // Capture raw PCM samples via ScriptProcessor and emit standard 16kHz WAV chunk every 1000ms
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      let pcmBuffer = [];
      const TARGET_SAMPLES = 16000; // 1 second of audio at 16 kHz

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        for (let i = 0; i < inputData.length; i++) {
          pcmBuffer.push(inputData[i]);
        }

        if (pcmBuffer.length >= TARGET_SAMPLES) {
          const chunkSamples = pcmBuffer.slice(0, TARGET_SAMPLES);
          pcmBuffer = pcmBuffer.slice(TARGET_SAMPLES);

          if (wsClientRef.current?.isConnected) {
            const wavBuffer = encodeWav(chunkSamples, 16000);
            const base64Wav = arrayBufferToBase64(wavBuffer);
            // Send authoritative clean transcript to backend so threat analysis receives the full conversation context
            const hint = fullDisplayRef.current || finalTranscriptRef.current || '';
            wsClientRef.current.sendAudio(base64Wav, Date.now(), hint, selectedSpeakerIdRef.current);
          }
        }
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

      setIsRecording(true);
      animFrameRef.current = requestAnimationFrame(updateVisualizer);

    } catch (err) {
      console.error('Microphone activation failed:', err);
      let friendlyMsg = 'Microphone permission was denied or device is unavailable.';
      if (err.name === 'NotAllowedError') {
        friendlyMsg = 'Microphone permission denied. Please allow microphone access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        friendlyMsg = 'No microphone input device was found on your system.';
      }
      setError(friendlyMsg);
      setIsRecording(false);
    }
  };

  // 4. Stop Microphone Capture
  const stopMicrophone = useCallback(() => {
    isRecordingRef.current = false;

    // Disconnect audio processor
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    // Stop Speech Recognition cleanly
    if (speechRecognitionRef.current) {
      const rec = speechRecognitionRef.current;
      speechRecognitionRef.current = null;
      try {
        rec.stop();
      } catch (e) {
        // Ignore stop errors
      }
    }

    // Stop Media Tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Close AudioContext
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Cancel animation frame
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    // Reset frequency data
    setAudioFrequencyData(new Uint8Array(64));
    setIsRecording(false);

    // Notify backend
    if (wsClientRef.current) {
      wsClientRef.current.sendStopSession();
    }
  }, []);

  // 5. Clean teardown on unmount
  useEffect(() => {
    return () => {
      stopMicrophone();
    };
  }, [stopMicrophone]);

  // 6. Evaluator Preset Simulator (Controlled demo states matching project requirements)
  const simulateScenario = (scenarioType) => {
    let scenarioText = '';
    if (scenarioType === 'SAFE') {
      scenarioText = 'Good afternoon, confirming our scheduled review for the quarterly cybersecurity report.';
      setAnalysisData({
        voice: {
          ai_probability: 0.08,
          human_probability: 0.92,
          confidence: 0.84,
          status: 'LIKELY_HUMAN',
        },
        speaker: {
          match: true,
          similarity: 0.94,
          registered_speaker: 'Chief Officer',
        },
        transcript: {
          text: scenarioText,
          risk_score: 0.05,
          flags: [],
        },
        risk: {
          score: 12,
          level: 'SAFE',
          reasons: ['Natural human vocal harmonics verified', 'Speaker identity confirmed with registered profile'],
        },
      });
      setWarningMessage(null);
    } else if (scenarioType === 'SUSPICIOUS') {
      scenarioText = 'Hello, this is urgent. I need you to verify account details right now.';
      setAnalysisData({
        voice: {
          ai_probability: 0.72,
          human_probability: 0.28,
          confidence: 0.65,
          status: 'LIKELY_AI',
        },
        speaker: {
          match: false,
          similarity: 0.44,
          registered_speaker: 'Chief Officer',
        },
        transcript: {
          text: scenarioText,
          risk_score: 0.55,
          flags: ['URGENT_REQUEST', 'BANKING_REQUEST'],
        },
        risk: {
          score: 71,
          level: 'SUSPICIOUS',
          reasons: ['Possible AI-generated voice characteristics', 'Speaker mismatch detected', 'Emergency-pressure language used'],
        },
      });
      setWarningMessage('Caution: Voice characteristics indicate possible cloning.');
    } else if (scenarioType === 'HIGH_RISK') {
      scenarioText = 'Please send the OTP immediately or your bank account will be suspended by police!';
      setAnalysisData({
        voice: {
          ai_probability: 0.93,
          human_probability: 0.07,
          confidence: 0.93,
          status: 'LIKELY_AI',
        },
        speaker: {
          match: false,
          similarity: 0.38,
          registered_speaker: 'Chief Officer',
        },
        transcript: {
          text: scenarioText,
          risk_score: 0.92,
          flags: ['OTP_REQUEST', 'URGENT_REQUEST', 'THREAT', 'BANKING_REQUEST'],
        },
        risk: {
          score: 94,
          level: 'HIGH_RISK',
          reasons: [
            'Likely AI-generated synthetic voice detected',
            'Severe speaker mismatch (similarity: 38%)',
            'Extortion/suspicious OTP credential request',
            'Threat and emergency-pressure language',
          ],
        },
      });
      setWarningMessage('CRITICAL: High-risk voice cloning impersonation detected.');
    }

    persistedFinalRef.current = scenarioText;
    sessionFinalRef.current = '';
    finalTranscriptRef.current = scenarioText;
    interimTranscriptRef.current = '';
    fullDisplayRef.current = scenarioText;
    setFinalTranscript(scenarioText);
    setInterimTranscript('');
    setLiveTranscript(scenarioText);
    console.log('[STT] displayed transcript (preset):', scenarioText);
  };

  return {
    isRecording,
    wsStatus,
    error,
    warningMessage,
    analysisData,
    liveTranscript,
    finalTranscript,
    interimTranscript,
    audioFrequencyData,
    selectedSpeakerId,
    setSelectedSpeakerId,
    startMicrophone,
    stopMicrophone,
    simulateScenario,
    setWarningMessage,
  };
}
