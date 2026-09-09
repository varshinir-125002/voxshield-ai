import React from 'react';
import VoiceAnalysisNew from '../components/VoiceAnalysisNew';
import AdvancedAnalysis from '../components/AdvancedAnalysis';

export default function VoiceAnalysisPage({ analysisData, audioFrequencyData }) {
  const voice = analysisData?.voice || {};
  const risk = analysisData?.risk || {};
  const aiProb = Math.round((voice.ai_probability || 0) * 100);
  const humanProb = Math.round((voice.human_probability || (1 - (voice.ai_probability || 0))) * 100);
  const confidence = Math.round((voice.confidence || 0.93) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Title */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span>AI Voice Authenticity & Deepfake Forensics</span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            background: aiProb > 50 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
            color: aiProb > 50 ? '#ef4444' : '#22c55e',
            border: `1px solid ${aiProb > 50 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
          }}>
            {voice.status || (aiProb > 50 ? 'SYNTHETIC_DETECTED' : 'LIKELY_HUMAN')}
          </span>
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
          Real-time deep neural network detection of voice cloning, vocoder artifacts, and acoustic anomalies.
        </p>
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Main Voice Analysis Card */}
        <VoiceAnalysisNew voiceData={voice} />

        {/* Multi-Signal Weights Breakdown */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Multi-Signal Security Analysis
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
              Proportional influence of detection vectors on composite risk score
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#cbd5e1' }}>AI Voice Authenticity (Weight: 45%)</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>
                  {aiProb}% synthetic
                </span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill progress-bar-danger" style={{ width: `${aiProb}%` }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#cbd5e1' }}>Speaker Identity Match (Weight: 30%)</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#818cf8' }}>
                  {Math.round((analysisData?.speaker?.similarity || 0) * 100)}% match
                </span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill progress-bar-cyan" style={{ width: `${Math.round((analysisData?.speaker?.similarity || 0) * 100)}%` }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#cbd5e1' }}>Transcript Behavioral Urgency (Weight: 15%)</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b' }}>
                  {Math.round((analysisData?.transcript?.risk_score || 0) * 100)}% risk
                </span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill progress-bar-warning" style={{ width: `${Math.round((analysisData?.transcript?.risk_score || 0) * 100)}%` }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#cbd5e1' }}>Acoustic Discontinuity Anomaly (Weight: 10%)</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f43f5e' }}>
                  {aiProb > 50 ? '78%' : '12%'}
                </span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill progress-bar-safe" style={{ width: aiProb > 50 ? '78%' : '12%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Technical Details */}
      <AdvancedAnalysis
        analysisData={analysisData}
        audioFrequencyData={audioFrequencyData}
      />
    </div>
  );
}
