/**
 * VoxShield AI — Premium Risk Score Gauge (redesigned)
 */
import React from 'react';

function getRiskStyle(level) {
  switch (level) {
    case 'HIGH_RISK':
    case 'CRITICAL':
    case 'HIGH':
      return { color: '#ef4444', label: 'HIGH RISK', glow: '0 0 30px rgba(239,68,68,0.4)' };
    case 'SUSPICIOUS':
      return { color: '#f97316', label: 'SUSPICIOUS', glow: '0 0 24px rgba(249,115,22,0.3)' };
    case 'CAUTION':
    case 'MEDIUM':
      return { color: '#f59e0b', label: 'CAUTION', glow: '0 0 24px rgba(245,158,11,0.3)' };
    case 'SAFE':
    case 'LOW':
    default:
      return { color: '#10b981', label: 'SAFE', glow: '0 0 20px rgba(16,185,129,0.3)' };
  }
}

const SIGNALS = [
  { key: 'ai',         label: 'AI Voice Authenticity',  weight: 45, color: '#06b6d4' },
  { key: 'speaker',    label: 'Speaker Identity Match',  weight: 30, color: '#3b82f6' },
  { key: 'transcript', label: 'Transcript Behavior',     weight: 15, color: '#8b5cf6' },
  { key: 'anomaly',    label: 'Acoustic Anomaly',        weight: 10, color: '#6366f1' },
];

export default function RiskScoreNew({ riskData, score: propScore, level: propLevel, reasons: propReasons, signals: propSignals }) {
  const score = propScore !== undefined ? propScore : (riskData?.score ?? 0);
  const level = (propLevel || riskData?.level || 'SAFE').toUpperCase();
  const reasons = (propReasons && propReasons.length > 0) ? propReasons : (riskData?.reasons || ['System idle — awaiting speech input']);

  const style = getRiskStyle(level);

  // Radial gauge math
  const R = 72;
  const circ = 2 * Math.PI * R;
  const offset = circ - (score / 100) * circ;

  const isHigh = level === 'HIGH_RISK' || level === 'CRITICAL' || level === 'HIGH';
  const isSuspicious = level === 'SUSPICIOUS';
  const isCaution = level === 'CAUTION' || level === 'MEDIUM';

  const badgeClass = isHigh ? 'badge-danger'
    : isSuspicious ? 'badge-suspicious'
    : isCaution ? 'badge-caution'
    : 'badge-safe';

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 4 }}>Multi-Signal Risk Score</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Threat Evaluation</div>
        </div>
        <span className={`badge ${badgeClass}`}>{style.label}</span>
      </div>

      {/* Gauge + signals side by side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        {/* Circular gauge */}
        <div style={{ position: 'relative', width: 168, height: 168, flexShrink: 0 }}>
          <svg width="168" height="168" viewBox="0 0 168 168" style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx="84" cy="84" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} />
            {/* Value arc */}
            <circle
              cx="84" cy="84" r={R}
              fill="none"
              stroke={style.color}
              strokeWidth={14}
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="risk-arc"
              style={{ filter: `drop-shadow(0 0 6px ${style.color}60)` }}
            />
          </svg>
          {/* Center label */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              fontSize: 40, fontWeight: 900, color: style.color,
              fontFamily: 'JetBrains Mono, monospace', lineHeight: 1,
              textShadow: style.glow,
              transition: 'color 0.5s ease, text-shadow 0.5s ease',
            }}>
              {score}
            </div>
            <div style={{ fontSize: 11, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>/ 100</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: style.color, marginTop: 4, letterSpacing: '0.06em', fontFamily: 'JetBrains Mono, monospace' }}>
              {style.label}
            </div>
          </div>
        </div>

        {/* Signal weights */}
        <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', marginBottom: 2 }}>
            SIGNAL WEIGHTS
          </div>
          {SIGNALS.map((sig) => (
            <div key={sig.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{sig.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: sig.color, fontFamily: 'JetBrains Mono, monospace' }}>{sig.weight}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${sig.weight}%`, background: sig.color, opacity: 0.7 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reasons */}
      <hr className="divider" style={{ margin: '20px 0' }} />
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#06b6d4" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', fontFamily: 'JetBrains Mono, monospace' }}>
            DIAGNOSTIC FACTORS
          </span>
        </div>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {reasons.map((r, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#94a3b8' }}>
              <span style={{ color: score > 59 ? '#ef4444' : '#10b981', marginTop: 1, fontSize: 8, flexShrink: 0 }}>●</span>
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
