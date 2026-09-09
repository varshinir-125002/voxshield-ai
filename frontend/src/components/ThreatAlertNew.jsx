/**
 * VoxShield AI — Threat Alert Panel (redesigned)
 */
import React, { useState } from 'react';
import { createAlert } from '../services/api';

export default function ThreatAlertNew({ riskData, voiceData, speakerData }) {
  const [quarantined, setQuarantined] = useState(false);
  const [reported, setReported] = useState(false);

  const { score = 0, level = 'SAFE' } = riskData || {};
  const { ai_probability = 0 } = voiceData || {};
  const { similarity = 0 } = speakerData || {};

  if (level !== 'HIGH_RISK' && level !== 'SUSPICIOUS') return null;

  const isHigh = level === 'HIGH_RISK';

  const handleBlock = async () => {
    setQuarantined(true);
    if (!reported) {
      await createAlert(score, level, 'Interaction flagged and quarantined by user via alert panel.');
      setReported(true);
    }
  };

  return (
    <div
      className={`animate-fade-in-up ${isHigh ? 'alert-flash-border' : ''}`}
      style={{
        borderRadius: 16,
        border: `1px solid ${isHigh ? 'rgba(239,68,68,0.45)' : 'rgba(249,115,22,0.35)'}`,
        background: isHigh
          ? 'linear-gradient(135deg, rgba(127,29,29,0.5), rgba(69,10,10,0.4))'
          : 'linear-gradient(135deg, rgba(124,45,18,0.4), rgba(67,20,7,0.35))',
        boxShadow: isHigh ? '0 0 40px rgba(239,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
        padding: '20px 22px',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Alert header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: isHigh ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.15)',
            border: `1px solid ${isHigh ? 'rgba(239,68,68,0.3)' : 'rgba(249,115,22,0.3)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={isHigh ? '#ef4444' : '#f97316'} strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h4 style={{
                fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em',
                color: isHigh ? '#fca5a5' : '#fed7aa',
              }}>
                {isHigh ? '⚠ HIGH-RISK VOICE IMPERSONATION DETECTED' : '⚠ SUSPICIOUS VOICE ACTIVITY'}
              </h4>
              <span style={{
                fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                padding: '2px 10px', borderRadius: 999,
                background: isHigh ? 'rgba(239,68,68,0.2)' : 'rgba(249,115,22,0.2)',
                color: isHigh ? '#f87171' : '#fb923c',
                border: `1px solid ${isHigh ? 'rgba(239,68,68,0.35)' : 'rgba(249,115,22,0.35)'}`,
              }}>
                SCORE: {score}/100
              </span>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: '#cbd5e1' }}>
                <span style={{ color: '#94a3b8' }}>AI Probability: </span>
                <span style={{ fontWeight: 700, color: '#f87171', fontFamily: 'JetBrains Mono, monospace' }}>
                  {Math.round(ai_probability * 100)}%
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#cbd5e1' }}>
                <span style={{ color: '#94a3b8' }}>Speaker Match: </span>
                <span style={{ fontWeight: 700, color: '#f87171', fontFamily: 'JetBrains Mono, monospace' }}>
                  {Math.round(similarity * 100)}%
                </span>
              </div>
            </div>

            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              <strong style={{ color: '#cbd5e1' }}>Recommendation:</strong> Do not share OTPs, passwords, banking information, or authorize transfers. Verify the caller using an independent trusted channel.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {!quarantined ? (
            <>
              <button
                onClick={handleBlock}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                  border: 'none', color: '#fff', fontWeight: 700, fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(239,68,68,0.35)',
                }}
              >
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
                </svg>
                Block / Quarantine Interaction
              </button>
              <button
                onClick={() => {}}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#cbd5e1', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}
              >
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Verify Caller
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 18px', borderRadius: 10,
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                color: '#34d399', fontWeight: 700, fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
              }}>
                ✓ INTERACTION QUARANTINED
              </div>
              <span style={{ fontSize: 11, color: '#475569', fontStyle: 'italic' }}>(Prototype Simulation Action)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
