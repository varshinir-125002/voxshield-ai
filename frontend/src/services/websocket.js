/**
 * VoxShield AI - WebSocket Service Client
 * Manages resilient bidirectional WebSocket connection to ws://localhost:8000/ws/voice
 */

export const DEFAULT_WS_URL = import.meta.env.VITE_WS_URL || 'wss://voxshield-ai-backend-verh.onrender.com/ws/voice';

export class VoiceWebSocketClient {
  constructor(url = DEFAULT_WS_URL) {
    this.url = url;
    this.ws = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectIntervalMs = 2500;

    // Callbacks
    this.onReady = null;
    this.onAnalysis = null;
    this.onWarning = null;
    this.onError = null;
    this.onStatusChange = null;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    this._notifyStatus('CONNECTING');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this._notifyStatus('CONNECTED');
        console.log('[WS] Connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WS] Received:', data);
          this._handleMessage(data);
        } catch (err) {
          console.error('[VoxShield WS] Failed to parse message JSON:', err);
        }
      };

      this.ws.onclose = (event) => {
        this.isConnected = false;
        this.isConnecting = false;
        this._notifyStatus('DISCONNECTED');
        console.log('[VoxShield WS] Connection closed', event.code, event.reason);

        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`[VoxShield WS] Reconnecting in ${this.reconnectIntervalMs}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => this.connect(), this.reconnectIntervalMs);
        }
      };

      this.ws.onerror = (error) => {
        console.warn('[VoxShield WS] WebSocket encounter:', error);
        this._notifyStatus('ERROR');
        if (this.onError) {
          this.onError({ code: 'CONNECTION_ERROR', message: 'Connection lost. Trying to reconnect...' });
        }
      };
    } catch (err) {
      this.isConnecting = false;
      this._notifyStatus('DISCONNECTED');
      console.error('[VoxShield WS] Connect error:', err);
    }
  }

  _notifyStatus(status) {
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }

  _handleMessage(data) {
    switch (data.type) {
      case 'ready':
        if (this.onReady) this.onReady(data);
        break;
      case 'analysis':
        if (this.onAnalysis) this.onAnalysis(data);
        break;
      case 'warning':
        if (this.onWarning) this.onWarning(data);
        break;
      case 'error':
        if (this.onError) this.onError(data);
        break;
      default:
        console.log('[VoxShield WS] Received untyped message:', data);
    }
  }

  sendStartSession(speakerId = null) {
    this._send({
      type: 'start_session',
      speaker_id: speakerId,
    });
  }

  sendAudio(base64Audio, timestamp = Date.now(), transcriptHint = null, speakerId = null) {
    console.log('[WS] Sending audio chunk');
    this._send({
      type: 'audio',
      audio: base64Audio,
      timestamp,
      transcript_hint: transcriptHint,
      speaker_id: speakerId,
    });
  }

  sendStopSession() {
    this._send({
      type: 'stop_session',
    });
  }

  _send(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this._notifyStatus('DISCONNECTED');
  }

  reconnect() {
    this.disconnect();
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this.connect();
  }
}
