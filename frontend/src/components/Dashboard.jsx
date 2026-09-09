import React, { useState, useEffect } from 'react';
import AudioCapture from './AudioCapture';
import VoiceAnalysis from './VoiceAnalysis';
import SpeakerVerification from './SpeakerVerification';
import Transcript from './Transcript';
import RiskScore from './RiskScore';
import ThreatAlert from './ThreatAlert';
import { fetchRecentAlerts } from '../services/api';

export default function Dashboard({
  isRecording,
  onStartRecording,
  onStopRecording,
  audioData,
  analysisData,
  liveTranscript,
  error,
  wsStatus,
  selectedSpeakerId,
  onSelectSpeaker,
  onSimulateScenario,
}) {
  const [recentAlerts, setRecentAlerts] = useState([]);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 6000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    const alerts = await fetchRecentAlerts();
    setRecentAlerts(alerts || []);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* High Risk Threat Alert Banner */}
      <ThreatAlert riskData={analysisData?.risk} />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Audio, Authenticity, Speaker Verification (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Audio Capture & Waveform Visualizer */}
          <AudioCapture
            isRecording={isRecording}
            onStart={onStartRecording}
            onStop={onStopRecording}
            audioData={audioData}
            error={error}
            wsStatus={wsStatus}
            onSimulateScenario={onSimulateScenario}
          />

          {/* AI Voice Authenticity Card */}
          <VoiceAnalysis voiceData={analysisData?.voice} />

          {/* Speaker Identity Verification Card */}
          <SpeakerVerification
            speakerData={analysisData?.speaker}
            selectedSpeakerId={selectedSpeakerId}
            onSelectSpeaker={onSelectSpeaker}
          />
        </div>

        {/* Right Column: Overall Risk Engine, Live Transcript, Incident Logs (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Multi-Signal Risk Score & Reasons */}
          <RiskScore riskData={analysisData?.risk} />

          {/* Live Transcript & Social Engineering Flags */}
          <Transcript
            transcriptData={analysisData?.transcript}
            liveTranscript={liveTranscript}
          />

          {/* Incident History Card */}
          <div className="vox-card p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-100 text-sm">Security Incident Log</h3>
              <span className="text-[10px] font-mono text-slate-400">
                {recentAlerts.length} RECORDED
              </span>
            </div>
            <div className="h-40 overflow-y-auto flex flex-col gap-2 pr-1">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert, i) => (
                  <div
                    key={alert.alert_id || i}
                    className="p-2 rounded bg-slate-900/60 border border-slate-800 text-xs flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{alert.reason}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {alert.created_at || 'Just now'} • {alert.alert_id}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        alert.threat_level === 'HIGH_RISK'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {alert.risk_score}/100
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-xs text-center py-6 font-mono">
                  No critical security incidents recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
