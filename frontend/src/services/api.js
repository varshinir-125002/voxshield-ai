/**
 * VoxShield AI - REST API Service Client
 */

const API_BASE = 'http://localhost:8000';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch health status:', err);
    return { status: 'offline', service: 'VoxShield AI' };
  }
}

export async function fetchSystemStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/system/status`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch system status:', err);
    return { backend: 'offline', models: 'unknown', websocket: 'unknown' };
  }
}

export async function fetchRiskConfig() {
  try {
    const res = await fetch(`${API_BASE}/api/risk/config`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch risk config:', err);
    return null;
  }
}

export async function fetchSpeakers() {
  try {
    const res = await fetch(`${API_BASE}/api/speakers`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch speakers:', err);
    return [];
  }
}

export async function registerSpeaker(name, audioBlob) {
  const formData = new FormData();
  formData.append('speaker_name', name);
  formData.append('audio', audioBlob, 'enrollment.wav');

  const res = await fetch(`${API_BASE}/api/speaker/register`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(errData.detail || 'Failed to register speaker');
  }
  return await res.json();
}

export async function verifySpeaker(speakerId, audioBlob) {
  const formData = new FormData();
  formData.append('speaker_id', speakerId);
  formData.append('audio', audioBlob, 'verify.wav');

  const res = await fetch(`${API_BASE}/api/speaker/verify`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Verification failed' }));
    throw new Error(errData.detail || 'Failed to verify speaker');
  }
  return await res.json();
}

export async function analyzeOfflineAudio(audioBlob, speakerId = null) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'upload.wav');
  if (speakerId) {
    formData.append('speaker_id', speakerId);
  }

  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(errData.detail || 'Failed to analyze audio');
  }
  return await res.json();
}

export async function createAlert(riskScore, level, reason, sessionId = 'default_session') {
  try {
    const res = await fetch(`${API_BASE}/api/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        risk_score: riskScore,
        level,
        reason,
        session_id: sessionId,
      }),
    });
    if (!res.ok) throw new Error('Failed to create alert');
    return await res.json();
  } catch (err) {
    console.error('Failed to report alert:', err);
    return null;
  }
}

export async function fetchRecentAlerts() {
  try {
    const res = await fetch(`${API_BASE}/api/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch alerts:', err);
    return [];
  }
}
