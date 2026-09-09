import React, { useState, useEffect } from 'react';
import SpeakerVerificationNew from '../components/SpeakerVerificationNew';
import { fetchSpeakers } from '../services/api';

export default function SpeakerPage({
  speakerData,
  selectedSpeakerId,
  onSelectSpeaker,
}) {
  const [speakersList, setSpeakersList] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSpeakers = async () => {
    setLoading(true);
    try {
      const data = await fetchSpeakers();
      setSpeakersList(data || []);
    } catch (err) {
      console.error('Failed to load speakers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpeakers();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Page Title */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>Speaker Biometric Verification & Enrollment</span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              background: 'rgba(129, 140, 248, 0.15)',
              color: '#818cf8',
              border: '1px solid rgba(129, 140, 248, 0.3)'
            }}>
              VOICE BIOMETRICS
            </span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Acoustic d-vector embedding extraction and cosine similarity verification against enrolled voiceprints.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSpeakers}
          className="btn btn-ghost"
          style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh Profiles'}
        </button>
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Verification Component */}
        <SpeakerVerificationNew
          speakerData={speakerData}
          selectedSpeakerId={selectedSpeakerId}
          onSelectSpeaker={onSelectSpeaker}
          onSpeakerRegistered={loadSpeakers}
        />

        {/* Enrolled Profiles Directory */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Enrolled Voice Biometrics Directory
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                Authorized identities enrolled in local biometric database
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#818cf8' }}>
              {speakersList.length} Profile(s)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '360px', overflowY: 'auto' }}>
            {speakersList.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                No speaker profiles enrolled yet. Use the "+ Enroll Speaker" button to add a reference sample.
              </div>
            ) : (
              speakersList.map((s) => {
                const isCurrent = (selectedSpeakerId === (s.speaker_id || s.id));
                return (
                  <div
                    key={s.speaker_id || s.id}
                    onClick={() => onSelectSpeaker(s.speaker_id || s.id)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '0.5rem',
                      background: isCurrent ? 'rgba(129, 140, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${isCurrent ? '#818cf8' : 'rgba(148, 163, 184, 0.1)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isCurrent ? '#818cf8' : 'rgba(148, 163, 184, 0.1)',
                        color: isCurrent ? '#020617' : '#e2e8f0',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {(s.name || s.speaker_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                          {s.name || s.speaker_name}
                        </div>
                        <div style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#64748b' }}>
                          ID: {(s.speaker_id || s.id)?.substring(0, 12)}...
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isCurrent && (
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: '#818cf8',
                          color: '#020617'
                        }}>
                          ACTIVE
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {isCurrent ? '●' : 'Select'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{
            padding: '0.85rem',
            borderRadius: '0.5rem',
            background: 'rgba(15, 23, 42, 0.4)',
            border: '1px solid rgba(148, 163, 184, 0.08)',
            fontSize: '0.72rem',
            color: '#94a3b8',
            lineHeight: 1.4
          }}>
            <strong style={{ color: '#cbd5e1' }}>Verification Logic: </strong>
            Extracts a 192-dimensional d-vector embedding from the reference audio. Live audio is continuously projected into the embedding space, computing cosine similarity against the selected identity profile.
          </div>
        </div>
      </div>
    </div>
  );
}
