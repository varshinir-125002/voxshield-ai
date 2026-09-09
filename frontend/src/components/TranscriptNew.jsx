/**
 * VoxShield AI — Transcript Card (redesigned)
 */
import React, { useRef, useEffect } from 'react';

const SUSPICIOUS_KEYWORDS = [
  'otp', 'password', 'pin', 'credit card', 'debit card', 'cvv', 'bank', 'account',
  'immediately', 'urgent', 'police', 'arrest', 'wire transfer', 'suspended', 'send',
  'verify', 'confirm', 'freeze', 'blocked', 'legal action',
];

function highlightText(text) {
  if (!text) return '';
  const regex = new RegExp(`\\b(${SUSPICIOUS_KEYWORDS.join('|')})\\b`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (SUSPICIOUS_KEYWORDS.some(k => k.toLowerCase() === part.toLowerCase())) {
      return (
        <mark key={i} style={{
          background: 'rgba(239,68,68,0.15)', color: '#fca5a5',
          fontWeight: 700, padding: '1px 5px', borderRadius: 4,
          border: '1px solid rgba(239,68,68,0.3)',
        }}>
          {part}
        </mark>
      );
    }
    return part;
  });
}

export default function TranscriptNew({
  transcriptData,
  liveTranscript,
  transcriptText,
  riskScore,
  flags: propFlags,
  isLive,
}) {
  const containerRef = useRef(null);
  const textFromData = typeof transcriptData === 'string' ? transcriptData : (transcriptData?.text || '');
  const displayText = liveTranscript || transcriptText || textFromData || null;
  const risk_score = riskScore !== undefined ? riskScore : (transcriptData?.risk_score || 0);
  const flags = (propFlags && propFlags.length > 0) ? propFlags : (transcriptData?.flags || []);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [displayText]);

  const riskPct = Math.round(risk_score * 100);

  return (
    <div className="glass-card" style={{ padding: 22 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#8b5cf6" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Live Transcript</div>
            <div style={{ fontSize: 11, color: '#475569' }}>NLP behavioral risk analysis</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>TRANSCRIPT RISK</span>
          <span style={{
            fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
            padding: '2px 10px', borderRadius: 999,
            background: riskPct > 60 ? 'rgba(239,68,68,0.1)' : riskPct > 30 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
            color: riskPct > 60 ? '#f87171' : riskPct > 30 ? '#fbbf24' : '#34d399',
            border: `1px solid ${riskPct > 60 ? 'rgba(239,68,68,0.25)' : riskPct > 30 ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)'}`,
          }}>
            {riskPct}%
          </span>
        </div>
      </div>

      {/* Threat flags */}
      {flags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {flags.map((flag, i) => (
            <span key={i} style={{
              fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
              padding: '3px 10px', borderRadius: 999,
              background: 'rgba(239,68,68,0.1)', color: '#f87171',
              border: '1px solid rgba(239,68,68,0.25)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              ⚠ {flag}
            </span>
          ))}
        </div>
      )}

      {/* Transcript box */}
      <div
        ref={containerRef}
        style={{
          height: 100, overflowY: 'auto', padding: '12px 14px',
          borderRadius: 12, background: 'rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.06)',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
          lineHeight: 1.7, color: displayText ? '#cbd5e1' : '#334155',
          fontStyle: displayText ? 'normal' : 'italic',
        }}
      >
        {displayText
          ? highlightText(displayText)
          : 'Conversation transcript will appear here in real time as speech is detected...'
        }
      </div>
    </div>
  );
}
