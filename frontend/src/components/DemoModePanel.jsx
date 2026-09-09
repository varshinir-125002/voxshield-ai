import React, { useState } from 'react';

/**
 * DemoModePanel
 * SIH 2026 Prototype Simulation Presets
 * Clearly labeled as demo/simulation scenarios.
 */
export default function DemoModePanel({ onSimulateScenario, currentLevel }) {
  const [activePreset, setActivePreset] = useState(null);

  const handleSelect = (scenario) => {
    setActivePreset(scenario);
    if (onSimulateScenario) {
      onSimulateScenario(scenario);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
      {/* Top Banner indicating Demo mode */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#38bdf8',
            fontSize: '0.7rem',
            fontWeight: 800
          }}>
            ⚡
          </span>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#94a3b8'
          }}>
            Prototype Simulation Presets
          </span>
        </div>
        <span style={{
          fontSize: '0.65rem',
          fontFamily: 'monospace',
          padding: '0.15rem 0.5rem',
          borderRadius: '9999px',
          background: 'rgba(148, 163, 184, 0.1)',
          color: '#cbd5e1',
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}>
          DEMO MODE
        </span>
      </div>

      <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4, marginBottom: '1rem' }}>
        Inject multi-signal synthetic test vectors into the live pipeline to demonstrate real-time classification, risk scoring, and defense mitigation.
      </p>

      {/* Preset Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.6rem' }}>
        <button
          type="button"
          onClick={() => handleSelect('SAFE')}
          style={{
            padding: '0.6rem 0.75rem',
            borderRadius: '0.5rem',
            background: activePreset === 'SAFE' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(15, 23, 42, 0.6)',
            border: `1px solid ${activePreset === 'SAFE' ? '#22c55e' : 'rgba(34, 197, 94, 0.3)'}`,
            color: '#22c55e',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem'
          }}
          title="Simulate authenticated speaker, genuine acoustic signature"
        >
          <span style={{ fontSize: '1rem' }}>🛡️</span>
          <span>Safe Caller</span>
          <span style={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: 500 }}>Risk ~15%</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect('SUSPICIOUS')}
          style={{
            padding: '0.6rem 0.75rem',
            borderRadius: '0.5rem',
            background: activePreset === 'SUSPICIOUS' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(15, 23, 42, 0.6)',
            border: `1px solid ${activePreset === 'SUSPICIOUS' ? '#eab308' : 'rgba(234, 179, 8, 0.3)'}`,
            color: '#eab308',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem'
          }}
          title="Simulate acoustic perturbation, borderline similarity"
        >
          <span style={{ fontSize: '1rem' }}>⚠️</span>
          <span>Suspicious</span>
          <span style={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: 500 }}>Risk ~55%</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect('HIGH_RISK')}
          style={{
            padding: '0.6rem 0.75rem',
            borderRadius: '0.5rem',
            background: activePreset === 'HIGH_RISK' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(15, 23, 42, 0.6)',
            border: `1px solid ${activePreset === 'HIGH_RISK' ? '#ef4444' : 'rgba(239, 68, 68, 0.4)'}`,
            color: '#ef4444',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem'
          }}
          title="Simulate deepfake voice clone, speaker mismatch, urgent financial demand"
        >
          <span style={{ fontSize: '1rem' }}>🚨</span>
          <span>High-Risk Scam</span>
          <span style={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: 500 }}>Risk ~94%</span>
        </button>
      </div>

      <div style={{
        marginTop: '0.75rem',
        fontSize: '0.68rem',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        borderTop: '1px solid rgba(148, 163, 184, 0.08)',
        paddingTop: '0.6rem'
      }}>
        <span style={{ color: '#06b6d4' }}>ℹ</span>
        <span>For evaluation only. Simulates voice cloning vectors without calling external phone networks.</span>
      </div>
    </div>
  );
}
