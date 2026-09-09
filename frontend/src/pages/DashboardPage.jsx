import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import OverviewPage from './OverviewPage';
import LiveMonitorPage from './LiveMonitorPage';
import VoiceAnalysisPage from './VoiceAnalysisPage';
import SpeakerPage from './SpeakerPage';
import ThreatHistoryPage from './ThreatHistoryPage';
import FileAnalysisPage from './FileAnalysisPage';
import SettingsPage from './SettingsPage';
import { useVoiceStream } from '../hooks/useVoiceStream';

export default function DashboardPage() {
  const {
    isRecording,
    wsStatus,
    error,
    analysisData,
    liveTranscript,
    audioFrequencyData,
    selectedSpeakerId,
    setSelectedSpeakerId,
    startMicrophone,
    stopMicrophone,
    simulateScenario,
  } = useVoiceStream();

  const [activePage, setActivePage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderActivePage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <OverviewPage
            isRecording={isRecording}
            onStartRecording={startMicrophone}
            onStopRecording={stopMicrophone}
            onOpenUpload={() => setActivePage('upload')}
            wsStatus={wsStatus}
            error={error}
            analysisData={analysisData}
            liveTranscript={liveTranscript}
            audioFrequencyData={audioFrequencyData}
            selectedSpeakerId={selectedSpeakerId}
            onSelectSpeaker={setSelectedSpeakerId}
            onSimulateScenario={simulateScenario}
          />
        );

      case 'monitor':
        return (
          <LiveMonitorPage
            isRecording={isRecording}
            onStartRecording={startMicrophone}
            onStopRecording={stopMicrophone}
            audioData={audioFrequencyData}
            wsStatus={wsStatus}
            analysisData={analysisData}
          />
        );

      case 'analysis':
        return (
          <VoiceAnalysisPage
            analysisData={analysisData}
            audioFrequencyData={audioFrequencyData}
          />
        );

      case 'speaker':
        return (
          <SpeakerPage
            speakerData={analysisData?.speaker}
            selectedSpeakerId={selectedSpeakerId}
            onSelectSpeaker={setSelectedSpeakerId}
          />
        );

      case 'history':
        return <ThreatHistoryPage />;

      case 'upload':
        return <FileAnalysisPage selectedSpeakerId={selectedSpeakerId} />;

      case 'settings':
        return <SettingsPage />;

      default:
        return (
          <OverviewPage
            isRecording={isRecording}
            onStartRecording={startMicrophone}
            onStopRecording={stopMicrophone}
            onOpenUpload={() => setActivePage('upload')}
            wsStatus={wsStatus}
            error={error}
            analysisData={analysisData}
            liveTranscript={liveTranscript}
            audioFrequencyData={audioFrequencyData}
            selectedSpeakerId={selectedSpeakerId}
            onSelectSpeaker={setSelectedSpeakerId}
            onSimulateScenario={simulateScenario}
          />
        );
    }
  };

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', width: '100%', background: '#020617', color: '#f8fafc' }}>
      {/* Navigation Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={(pageId) => {
          setActivePage(pageId);
          setSidebarOpen(false);
        }}
        wsStatus={wsStatus}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        marginLeft: 'var(--sidebar-width, 240px)',
        transition: 'margin-left 0.25s ease'
      }}>
        {/* Fixed / Sticky Top Bar */}
        <TopBar
          wsStatus={wsStatus}
          isRecording={isRecording}
          currentPage={activePage}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onNavigate={(pageId) => setActivePage(pageId)}
        />

        {/* Global Error Banner */}
        {error && (
          <div style={{
            margin: '1rem 1.5rem 0',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Check microphone permissions or backend logs</span>
          </div>
        )}

        {/* Page Content Container */}
        <main style={{
          flex: 1,
          padding: '1.5rem',
          maxWidth: '100%',
          overflowX: 'hidden'
        }}>
          {renderActivePage()}
        </main>

        {/* Professional Footer */}
        <footer style={{
          padding: '1.25rem 1.5rem',
          borderTop: '1px solid rgba(148, 163, 184, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          fontSize: '0.7rem',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, color: '#94a3b8' }}>VoxShield AI</span>
            <span>•</span>
            <span>Real-time AI-powered voice impersonation defense</span>
          </div>
          <div style={{ fontFamily: 'monospace', color: '#475569' }}>
            Smart India Hackathon 2026 Prototype
          </div>
        </footer>
      </div>

      {/* Responsive adjustments */}
      <style>{`
        @media (max-width: 1024px) {
          .main-content-wrapper {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
