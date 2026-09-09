/**
 * VoxShield AI — Voice Analysis Card (redesigned)
 */
import React from 'react';

export default function VoiceAnalysisNew({ voiceData }) {
  const {
    ai_probability = 0,
    human_probability = 1,
    confidence = 0,
    status = 'LIKELY_HUMAN',
  } = voiceData || {};

  const aiPct = Math.round(ai_probability * 100);
  const humanPct = Math.round(human_probability * 100);
  const confPct = Math.round(confidence * 100);

  const isAI = status === 'LIKELY_AI';
  const isUncertain = status === 'UNCERTAIN';

  const statusBadge = isAI ? 'badge-danger'
    : isUncertain ? 'badge-caution'
    : 'badge-safe';

  const statusLabel = isAI ? 'SYNTHETIC' : isUncertain ? 'UNCERTAIN' : 'HUMAN VOICE';

  const artifactLevel = aiPct > 70 ? { label: 'HIGH DISCONTINUITY', color: '#ef4444' }
    : aiPct > 40 ? { label: 'MODERATE', color: '#f59e0b' }
    : { label: 'NORMAL', color: '#10b981' };

  return (
    <div className="glass-card" style={{ padding: 22 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#06b6d4" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>AI Voice Detection</div>
            <div style={{ fontSize: 11, color: '#475569' }}>Spectral & prosodic artifact analysis</div>
          </div>
        </div>
        <span className={`badge ${statusBadge}`}>{statusLabel}</span>
      </div>

      {/* Probability bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
        {/* AI */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>AI Synthetic Probability</span>
            <span style={{
              fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
              color: aiPct > 60 ? '#ef4444' : '#64748b',
            }}>{aiPct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{
              width: `${aiPct}%`,
              background: aiPct > 70 ? 'linear-gradient(90deg,#dc2626,#ef4444)'
                : aiPct > 40 ? 'linear-gradient(90deg,#d97706,#f59e0b)'
                : 'linear-gradient(90deg,#0891b2,#06b6d4)',
            }} />
          </div>
        </div>

        {/* Human */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Human Natural Probability</span>
            <span style={{
              fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
              color: humanPct > 60 ? '#10b981' : '#64748b',
            }}>{humanPct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{
              width: `${humanPct}%`,
              background: 'linear-gradient(90deg,#059669,#10b981)',
            }} />
          </div>
        </div>
      </div>

      <hr className="divider" style={{ marginBottom: 16 }} />

      {/* Metric tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="metric-tile">
          <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 5 }}>DETECTION CONFIDENCE</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#06b6d4', fontFamily: 'JetBrains Mono, monospace' }}>{confPct}%</div>
        </div>
        <div className="metric-tile">
          <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 5 }}>SPECTRAL ARTIFACTS</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: artifactLevel.color, fontFamily: 'JetBrains Mono, monospace' }}>
            {artifactLevel.label}
          </div>
        </div>
      </div>
    </div>
  );
}
