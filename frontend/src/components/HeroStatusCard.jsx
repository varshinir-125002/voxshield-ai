/**
 * VoxShield AI — Hero Status Card (Overview Page)
 * Central dashboard card showing live voice security state
 */
import React from 'react';
import WaveformNew from './WaveformNew';

function getMicState(isRecording, wsStatus, riskLevel) {
  if (!isRecording) return { label: 'MICROPHONE READY', color: '#475569', bg: 'rgba(71,85,105,0.1)', border: 'rgba(71,85,105,0.2)' };
  if (riskLevel === 'HIGH_RISK') return { label: 'THREAT DETECTED', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' };
  if (riskLevel === 'SUSPICIOUS') return { label: 'ANALYZING — SUSPICIOUS', color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)' };
  return { label: 'LISTENING ACTIVE', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.3)' };
}

export default function HeroStatusCard({
  isRecording,
  wsStatus,
  riskLevel,
  riskScore,
  onStart,
  onStop,
  onOpenUpload,
  audioData,
  error,
}) {
  const micState = getMicState(isRecording, wsStatus, riskLevel);
  const isConnected = wsStatus === 'CONNECTED';

  return (
    <div className="glass-card" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
      {/* Scan overlay when recording */}
      {isRecording && <div className="scan-overlay" />}

      {/* Background glow based on risk */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
        background: riskLevel === 'HIGH_RISK'
          ? 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.06), transparent 60%)'
          : isRecording
            ? 'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.05), transparent 60%)'
            : 'none',
        transition: 'background 0.6s ease',
      }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 6 }}>Live Voice Security</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Voice Monitoring System
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
              {isRecording
                ? 'Streaming audio through multi-signal AI pipeline...'
                : 'Start microphone to begin real-time voice analysis'}
            </div>
          </div>

          {/* Status badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
            borderRadius: 999, background: micState.bg, border: `1px solid ${micState.border}`,
            flexShrink: 0, transition: 'all 0.4s ease',
          }}>
            <div
              className={isRecording ? 'status-dot-pulse' : ''}
              style={{ width: 8, height: 8, borderRadius: '50%', background: micState.color }}
            />
            <span style={{ fontSize: 11, fontWeight: 700, color: micState.color, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
              {micState.label}
            </span>
          </div>
        </div>

        {/* Microphone icon + waveform */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Mic icon */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isRecording
              ? 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.2))'
              : 'rgba(255,255,255,0.04)',
            border: isRecording ? '2px solid rgba(6,182,212,0.4)' : '2px solid rgba(255,255,255,0.08)',
            transition: 'all 0.4s ease',
          }}
            className={isRecording ? 'pulse-ring-cyan' : ''}
          >
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke={isRecording ? '#06b6d4' : '#475569'} strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>

          {/* Waveform */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <WaveformNew audioData={audioData} isRecording={isRecording} />
          </div>
        </div>

        {/* Quick stats row */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div className="metric-tile" style={{ flex: 1, minWidth: 110 }}>
            <div style={{ fontSize: 11, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>FREQUENCY</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#06b6d4', fontFamily: 'JetBrains Mono, monospace' }}>16,000 Hz</div>
          </div>
          <div className="metric-tile" style={{ flex: 1, minWidth: 110 }}>
            <div style={{ fontSize: 11, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>CHANNEL</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', fontFamily: 'JetBrains Mono, monospace' }}>Mono</div>
          </div>
          <div className="metric-tile" style={{ flex: 1, minWidth: 110 }}>
            <div style={{ fontSize: 11, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>WEBSOCKET</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: isConnected ? '#10b981' : '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>
              {isConnected ? 'Connected' : wsStatus}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 10,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span style={{ fontSize: 12, color: '#fca5a5' }}>{error}</span>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {!isRecording ? (
            <button className="btn-primary" onClick={onStart} style={{ flex: 1, minWidth: 140 }}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" opacity="0.3"/>
                <path d="M10 8.5l5 3.5-5 3.5z"/>
              </svg>
              Start Monitoring
            </button>
          ) : (
            <button className="btn-danger" onClick={onStop} style={{ flex: 1, minWidth: 140 }}>
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              Stop Monitoring
            </button>
          )}
          <button className="btn-ghost" onClick={onOpenUpload} style={{ minWidth: 150 }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Analyze Audio File
          </button>
        </div>
      </div>
    </div>
  );
}
