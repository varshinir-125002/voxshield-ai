/**
 * VoxShield AI — Top Navigation Bar
 */
import React from 'react';

export default function TopBar({ wsStatus, isRecording, onMenuToggle, currentPage, onNavigate }) {
  const isConnected = wsStatus?.toUpperCase() === 'CONNECTED';

  const PAGE_LABELS = {
    overview: 'Overview',
    monitor: 'Live Monitor',
    analysis: 'Voice Analysis',
    speaker: 'Speaker Verification',
    history: 'Threat History',
    upload: 'Audio File Analysis',
    settings: 'Engine Configuration',
  };

  return (
    <header className="topbar">
      {/* Left: Mobile menu + page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          style={{
            display: 'none',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#94a3b8', padding: 4,
          }}
          className="menu-toggle"
          aria-label="Open menu"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>
            {PAGE_LABELS[currentPage] || 'Dashboard'}
          </div>
          <div style={{ fontSize: 11, color: '#475569', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
            Real-Time Voice Security
          </div>
        </div>
      </div>

      {/* Right: Status indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Recording indicator */}
        {isRecording && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}>
            <div
              className="status-dot-pulse"
              style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }}
            />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>
              LIVE
            </span>
          </div>
        )}

        {/* System status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 14px', borderRadius: 999,
          background: isConnected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
        }}>
          <div
            className={isConnected ? 'status-dot-pulse' : ''}
            style={{
              width: 7, height: 7, borderRadius: '50%',
              background: isConnected ? '#10b981' : '#ef4444',
            }}
          />
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
            color: isConnected ? '#10b981' : '#ef4444',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {isConnected ? 'SYSTEM ONLINE' : 'OFFLINE'}
          </span>
        </div>

        {/* Settings icon */}
        <button
          type="button"
          onClick={() => onNavigate?.('settings')}
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: 7, cursor: 'pointer', color: '#64748b',
            transition: 'color 0.2s, background 0.2s', display: 'flex',
          }}
          title="Engine Configuration"
          onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .menu-toggle { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
