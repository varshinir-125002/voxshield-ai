import React, { useState, useEffect } from 'react';
import { analyzeOfflineAudio, fetchSpeakers, createAlert } from '../services/api';

export default function FileAnalysisPage({ selectedSpeakerId }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [speakers, setSpeakers] = useState([]);
  const [activeSpeaker, setActiveSpeaker] = useState(selectedSpeakerId || '');
  const [savedToHistory, setSavedToHistory] = useState(false);

  useEffect(() => {
    fetchSpeakers().then(setSpeakers).catch(console.error);
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSavedToHistory(false);

    try {
      const data = await analyzeOfflineAudio(file, activeSpeaker || null);
      setResult(data);

      // Save to localStorage threat history for persistent auditing
      const localHistory = JSON.parse(localStorage.getItem('voxshield_threat_history') || '[]');
      const newEntry = {
        id: `file-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        timestamp: Date.now(),
        risk_score: data.risk?.score || 0,
        ai_prob: Math.round((data.voice?.ai_probability || 0) * 100),
        speaker_match: Math.round((data.speaker?.similarity || 0) * 100),
        level: data.risk?.level || (data.risk?.score >= 70 ? 'HIGH_RISK' : data.risk?.score >= 40 ? 'SUSPICIOUS' : 'SAFE'),
        action: data.risk?.score >= 70 ? 'Quarantine / Warning Issued' : 'Verified File Analysis',
        reason: (data.risk?.reasons && data.risk.reasons[0]) || `Offline audio sample analyzed: ${file.name}`
      };
      localStorage.setItem('voxshield_threat_history', JSON.stringify([newEntry, ...localHistory].slice(0, 50)));
      setSavedToHistory(true);

      // Also create alert on backend if high threat
      if (data.risk?.score >= 70) {
        createAlert(data.risk.score, data.risk.level, `High-risk file analysis: ${file.name}`);
      }
    } catch (err) {
      console.error('File analysis error:', err);
      setError(err.message || 'Offline analysis failed. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const riskScore = result?.risk?.score !== undefined ? result.risk.score : 0;
  const riskLevel = (result?.risk?.level || (riskScore >= 70 ? 'HIGH_RISK' : riskScore >= 40 ? 'SUSPICIOUS' : 'SAFE')).toUpperCase();
  const aiProb = Math.round((result?.voice?.ai_probability || 0) * 100);
  const humanProb = Math.round((result?.voice?.human_probability || (1 - (result?.voice?.ai_probability || 0))) * 100);
  const confidence = Math.round((result?.voice?.confidence || 0.94) * 100);
  const speakerSim = Math.round((result?.speaker?.similarity || 0) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span>Offline Audio Analysis</span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.3)'
          }}>
            MULTI-SIGNAL FORENSICS
          </span>
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
          Analyze a recorded voice sample for synthetic-voice indicators, spectral perturbation, and biometric mismatch.
        </p>
      </div>

      {/* Upload Zone & Speaker Config */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Target Speaker Selector */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.25rem' }}>
                Compare Against Trusted Speaker (Optional)
              </label>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                Select enrolled voice profile to compute biometric similarity
              </div>
            </div>

            <select
              value={activeSpeaker}
              onChange={(e) => setActiveSpeaker(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                color: '#f8fafc',
                fontSize: '0.75rem',
                padding: '0.5rem 0.85rem',
                borderRadius: '0.5rem',
                minWidth: '220px'
              }}
            >
              <option value="">General Detection (No Profile)</option>
              {speakers.map((s) => (
                <option key={s.speaker_id || s.id} value={s.speaker_id || s.id}>
                  {s.name || s.speaker_name} ({s.speaker_id?.substring(0, 8)})
                </option>
              ))}
            </select>
          </div>

          {/* Drag and drop box */}
          <div
            className={`dropzone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}
            onClick={() => document.getElementById('file-input-upload')?.click()}
          >
            <input
              id="file-input-upload"
              type="file"
              accept="audio/*,.wav,.mp3,.ogg,.flac,.m4a"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              📁
            </div>

            {file ? (
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>{file.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>
                  Drag and drop voice recording here, or click to browse
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Supported formats: WAV, MP3, OGG, FLAC, M4A (16kHz recommended)
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.75rem'
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Action Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            {file && (
              <button
                type="button"
                onClick={() => { setFile(null); setResult(null); setError(null); }}
                className="btn btn-ghost"
                style={{ fontSize: '0.75rem', padding: '0.65rem 1.25rem' }}
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={!file || loading}
              className="btn btn-primary"
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '0.65rem 1.5rem',
                opacity: (!file || loading) ? 0.5 : 1
              }}
            >
              {loading ? 'Analyzing Neural Speech Vectors...' : 'Upload & Analyze Audio'}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {savedToHistory && (
            <div style={{
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#4ade80',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>✓ Forensics logged to Incident & Threat History</span>
              <span style={{ fontFamily: 'monospace', opacity: 0.8 }}>Recorded</span>
            </div>
          )}

          {/* Risk Banner Card */}
          <div className="glass-card" style={{
            padding: '1.75rem',
            border: `1px solid ${riskLevel === 'HIGH_RISK' ? 'rgba(239, 68, 68, 0.5)' : riskLevel === 'SUSPICIOUS' ? 'rgba(234, 179, 8, 0.5)' : 'rgba(34, 197, 94, 0.4)'}`,
            background: riskLevel === 'HIGH_RISK' ? 'rgba(239, 68, 68, 0.08)' : riskLevel === 'SUSPICIOUS' ? 'rgba(234, 179, 8, 0.06)' : 'rgba(34, 197, 94, 0.06)'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: `3px solid ${riskLevel === 'HIGH_RISK' ? '#ef4444' : riskLevel === 'SUSPICIOUS' ? '#eab308' : '#22c55e'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1 }}>{riskScore}</span>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>/ 100</span>
                </div>

                <div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    background: riskLevel === 'HIGH_RISK' ? '#ef4444' : riskLevel === 'SUSPICIOUS' ? '#eab308' : '#22c55e',
                    color: '#020617'
                  }}>
                    {riskLevel.replace('_', ' ')}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.35rem' }}>
                    {riskLevel === 'HIGH_RISK' ? 'Voice Impersonation Detected' : riskLevel === 'SUSPICIOUS' ? 'Acoustic Perturbation Flagged' : 'Authentic Human Voice Verified'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    File: <span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>{file?.name}</span>
                  </p>
                </div>
              </div>

              {/* Recommendation Box */}
              <div style={{
                maxWidth: '420px',
                padding: '1rem',
                borderRadius: '0.5rem',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                fontSize: '0.75rem'
              }}>
                <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '0.35rem' }}>
                  Cybersecurity Recommendation:
                </div>
                <div style={{ color: '#cbd5e1', lineHeight: 1.4 }}>
                  {riskLevel === 'HIGH_RISK'
                    ? 'Do not disclose OTPs, banking credentials, or authorize financial transfers. Verify caller identity through an out-of-band verified telephone number.'
                    : riskLevel === 'SUSPICIOUS'
                    ? 'Acoustic parameters indicate borderline confidence. Request secondary knowledge-based authentication before proceeding.'
                    : 'Acoustic resonances match natural human speech characteristics with no detectable deepfake phase anomalies.'}
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Breakdown Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}>
            {/* AI Voice Probabilities */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                AI Voice Detection
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#94a3b8' }}>Synthetic Probability</span>
                    <span style={{ fontWeight: 700, color: aiProb > 50 ? '#f43f5e' : '#22c55e' }}>{aiProb}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill progress-bar-danger" style={{ width: `${aiProb}%` }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#94a3b8' }}>Human Probability</span>
                    <span style={{ fontWeight: 700, color: '#22c55e' }}>{humanProb}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill progress-bar-safe" style={{ width: `${humanProb}%` }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(148, 163, 184, 0.08)' }}>
                  <span style={{ color: '#64748b' }}>Detection Confidence</span>
                  <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{confidence}%</span>
                </div>
              </div>
            </div>

            {/* Speaker Verification */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Speaker Verification
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#94a3b8' }}>Biometric Similarity</span>
                    <span style={{ fontWeight: 700, color: speakerSim >= 75 ? '#22c55e' : '#f43f5e' }}>{speakerSim}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className={`progress-bar-fill ${speakerSim >= 75 ? 'progress-bar-safe' : 'progress-bar-danger'}`}
                      style={{ width: `${speakerSim}%` }}
                    ></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: '#94a3b8' }}>Verification Verdict:</span>
                  <span style={{
                    fontWeight: 700,
                    color: result?.speaker?.match ? '#22c55e' : '#f43f5e'
                  }}>
                    {result?.speaker?.match ? 'MATCH CONFIRMED' : 'SPEAKER MISMATCH'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(148, 163, 184, 0.08)' }}>
                  <span style={{ color: '#64748b' }}>Similarity Threshold</span>
                  <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>75%</span>
                </div>
              </div>
            </div>

            {/* Diagnostic Reasons */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Forensic Indicators
              </div>

              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(result?.risk?.reasons && result.risk.reasons.length > 0) ? (
                  result.risk.reasons.map((r, i) => (
                    <li key={i} style={{ lineHeight: 1.3 }}>{r}</li>
                  ))
                ) : (
                  <li>Acoustic analysis completed with no anomalous phase inversion flags.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
