import React, { useState } from 'react';
import HeroStatusCard from '../components/HeroStatusCard';
import ThreatAlertNew from '../components/ThreatAlertNew';
import RiskScoreNew from '../components/RiskScoreNew';
import VoiceAnalysisNew from '../components/VoiceAnalysisNew';
import SpeakerVerificationNew from '../components/SpeakerVerificationNew';
import TranscriptNew from '../components/TranscriptNew';
import DemoModePanel from '../components/DemoModePanel';
import AdvancedAnalysis from '../components/AdvancedAnalysis';

export default function OverviewPage({
  isRecording,
  onStartRecording,
  onStopRecording,
  onOpenUpload,
  wsStatus,
  error,
  analysisData,
  liveTranscript,
  audioFrequencyData,
  selectedSpeakerId,
  onSelectSpeaker,
  onSimulateScenario,
}) {
  const [alertDismissed, setAlertDismissed] = useState(false);

  const voice = analysisData?.voice || {};
  const speaker = analysisData?.speaker || {};
  const risk = analysisData?.risk || { score: 12, level: 'SAFE', reasons: [] };
  const transcript = analysisData?.transcript || {};

  const currentLevel = (risk.level || 'SAFE').toUpperCase();
  const isThreat = (currentLevel === 'HIGH_RISK' || currentLevel === 'SUSPICIOUS');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
      {/* High-Risk Security Alert Banner */}
      {isThreat && !alertDismissed && (
        <ThreatAlertNew
          riskScore={risk.score || 0}
          riskLevel={currentLevel}
          aiProb={Math.round((voice.ai_probability || 0) * 100)}
          speakerMatch={speaker.match}
          reasons={risk.reasons || []}
          transcriptFlags={transcript.flags || []}
          onAcknowledge={() => setAlertDismissed(true)}
        />
      )}

      {/* Main Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Hero Status Card, Voice Authenticity, Speaker Verification */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <HeroStatusCard
            isRecording={isRecording}
            wsStatus={wsStatus}
            audioData={audioFrequencyData}
            onStart={onStartRecording}
            onStop={onStopRecording}
            onOpenUpload={onOpenUpload}
            riskLevel={currentLevel}
            riskScore={risk.score || 0}
            error={error}
          />

          <VoiceAnalysisNew voiceData={voice} />

          <SpeakerVerificationNew
            speakerData={speaker}
            selectedSpeakerId={selectedSpeakerId}
            onSelectSpeaker={onSelectSpeaker}
          />
        </div>

        {/* Right Column: Risk Gauge Centerpiece, Real-time Transcript, Demo Simulation Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <RiskScoreNew
            riskData={risk}
            score={risk.score !== undefined ? risk.score : 0}
            level={currentLevel}
            reasons={risk.reasons || []}
            signals={risk.signals}
          />

          <TranscriptNew
            transcriptData={transcript}
            liveTranscript={liveTranscript}
            transcriptText={liveTranscript || transcript.text || ''}
            riskScore={transcript.risk_score || 0}
            flags={transcript.flags || []}
            isLive={isRecording}
          />

          <DemoModePanel
            onSimulateScenario={onSimulateScenario}
            currentLevel={currentLevel}
          />
        </div>
      </div>

      {/* Expandable Technical Diagnostics & Deep-dive */}
      <AdvancedAnalysis
        analysisData={analysisData}
        audioFrequencyData={audioFrequencyData}
      />
    </div>
  );
}
