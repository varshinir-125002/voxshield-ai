import React, { useState, useEffect } from 'react';
import { fetchRiskConfig, fetchSystemStatus, fetchHealth, API_BASE } from '../services/api';
import { DEFAULT_WS_URL } from '../services/websocket';

export default function SettingsPage() {
  const [riskConfig, setRiskConfig] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [config, status, h] = await Promise.all([
        fetchRiskConfig(),
        fetchSystemStatus(),
        fetchHealth(),
      ]);
      setRiskConfig(config);
      setSystemStatus(status);
      setHealth(h);
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>Engine Configuration & System Telemetry</span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              SIH 2026 PROTOTYPE
            </span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Inspect risk scoring thresholds, multi-signal weights, and backend inference pipeline health.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSettings}
          className="btn btn-ghost"
          style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh Config'}
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Multi-Signal Weights Card */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Multi-Signal Risk Weights
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Configured dynamic weights applied across acoustic, biometric, and natural language vectors:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.08)', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#cbd5e1' }}>AI Synthetic Voice Authenticity:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>
                {Math.round((riskConfig?.ai_voice_weight || 0.45) * 100)}% (0.45)
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.08)', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#cbd5e1' }}>Speaker Identity Biometrics:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#818cf8' }}>
                {Math.round((riskConfig?.speaker_weight || 0.30) * 100)}% (0.30)
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.08)', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#cbd5e1' }}>Transcript Behavioral Intent:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b' }}>
                {Math.round((riskConfig?.transcript_weight || 0.15) * 100)}% (0.15)
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#cbd5e1' }}>Acoustic Discontinuity Anomaly:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f43f5e' }}>
                {Math.round((riskConfig?.audio_anomaly_weight || 0.10) * 100)}% (0.10)
              </span>
            </div>
          </div>
        </div>

        {/* Classification Thresholds Card */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Risk Classification Thresholds
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Defensive response trigger levels based on composite risk calculation:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', borderRadius: '0.4rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <div>
                <strong style={{ color: '#22c55e' }}>SAFE:</strong>
                <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>0 – 39 score</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#22c55e' }}>Normal Call Flow</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', borderRadius: '0.4rem', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
              <div>
                <strong style={{ color: '#eab308' }}>SUSPICIOUS:</strong>
                <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>40 – 69 score</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#eab308' }}>Step-up Warning</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', borderRadius: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div>
                <strong style={{ color: '#ef4444' }}>HIGH RISK:</strong>
                <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>70 – 100 score</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>Defensive Quarantine</span>
            </div>
          </div>
        </div>

        {/* Backend Pipeline Health */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Backend Infrastructure Health
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.08)', paddingBottom: '0.4rem' }}>
              <span style={{ color: '#94a3b8' }}>API Server:</span>
              <span style={{ fontFamily: 'monospace', color: health?.status === 'ok' ? '#22c55e' : '#f59e0b' }}>
                {API_BASE} ({systemStatus?.backend || health?.status || 'ONLINE'})
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.08)', paddingBottom: '0.4rem' }}>
              <span style={{ color: '#94a3b8' }}>WebSocket Gateway:</span>
              <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{DEFAULT_WS_URL} ({systemStatus?.websocket || 'available'})</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.08)', paddingBottom: '0.4rem' }}>
              <span style={{ color: '#94a3b8' }}>Voice Detector:</span>
              <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{systemStatus?.voice_detector || 'acoustic_prototype'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.08)', paddingBottom: '0.4rem' }}>
              <span style={{ color: '#94a3b8' }}>Speaker Verifier:</span>
              <span style={{ fontFamily: 'monospace', color: '#22c55e' }}>{systemStatus?.speaker_verifier || 'available'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.08)', paddingBottom: '0.4rem' }}>
              <span style={{ color: '#94a3b8' }}>Speech-to-Text:</span>
              <span style={{ fontFamily: 'monospace', color: '#22c55e' }}>{systemStatus?.stt || 'available'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(148, 163, 184, 0.08)', paddingBottom: '0.4rem' }}>
              <span style={{ color: '#94a3b8' }}>Neural Checkpoint:</span>
              <span style={{ fontFamily: 'monospace', color: '#ef4444' }}>{systemStatus?.neural_checkpoint || 'not_loaded'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Database Layer:</span>
              <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>SQLite 3 (voxshield.db)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
