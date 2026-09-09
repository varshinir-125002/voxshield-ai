/**
 * VoxShield AI — Speaker Verification Card (redesigned)
 */
import React, { useState, useEffect } from 'react';
import { fetchSpeakers, registerSpeaker } from '../services/api';

export default function SpeakerVerificationNew({ speakerData, selectedSpeakerId, onSelectSpeaker }) {
  const [speakersList, setSpeakersList] = useState([]);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [enrollFile, setEnrollFile] = useState(null);
  const [enrollStatus, setEnrollStatus] = useState(null);

  const {
    match = false,
    similarity = 0,
    registered_speaker = null,
  } = speakerData || {};

  const simPct = Math.round(similarity * 100);
  const hasProfile = Boolean(selectedSpeakerId || registered_speaker);

  useEffect(() => { loadSpeakers(); }, []);

  const loadSpeakers = async () => {
    const list = await fetchSpeakers();
    setSpeakersList(list || []);
    if (list?.length > 0 && !selectedSpeakerId) onSelectSpeaker(list[0].id);
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!newName || !enrollFile) { setEnrollStatus({ error: 'Provide speaker name and audio file.' }); return; }
    setEnrollStatus({ loading: true });
    try {
      const res = await registerSpeaker(newName, enrollFile);
      setEnrollStatus({ success: `Enrolled "${res.speaker_name}" successfully!` });
      await loadSpeakers();
      onSelectSpeaker(res.speaker_id);
      setTimeout(() => { setIsEnrollOpen(false); setNewName(''); setEnrollFile(null); setEnrollStatus(null); }, 1800);
    } catch (err) {
      setEnrollStatus({ error: err.message || 'Enrollment failed.' });
    }
  };

  const matchBadge = match ? 'badge-safe' : hasProfile ? 'badge-danger' : 'badge-neutral';
  const matchLabel = match ? 'SPEAKER MATCHED' : hasProfile ? 'MISMATCH' : 'NO PROFILE';

  return (
    <div className="glass-card" style={{ padding: 22 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Speaker Verification</div>
            <div style={{ fontSize: 11, color: '#475569' }}>Vocal tract embedding comparison</div>
          </div>
        </div>
        <span className={`badge ${matchBadge}`}>{matchLabel}</span>
      </div>

      {/* Speaker selector + enroll */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select
          className="vox-select"
          value={selectedSpeakerId || ''}
          onChange={(e) => onSelectSpeaker(e.target.value || null)}
          style={{ flex: 1 }}
        >
          <option value="">— General Check (No Profile) —</option>
          {speakersList.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button
          onClick={() => setIsEnrollOpen(!isEnrollOpen)}
          className="btn-ghost"
          style={{ padding: '9px 14px', fontSize: 12, whiteSpace: 'nowrap' }}
        >
          + Enroll
        </button>
      </div>

      {/* Enrollment panel */}
      {isEnrollOpen && (
        <div style={{
          padding: 16, borderRadius: 12, marginBottom: 16,
          background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.15)',
        }} className="animate-fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#06b6d4' }}>Register Trusted Speaker</span>
            <button onClick={() => setIsEnrollOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 16 }}>×</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              className="vox-input"
              type="text"
              placeholder="Speaker name (e.g. Chief Officer)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <div>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 6 }}>Reference voice recording (.wav / .mp3)</div>
              <input
                type="file" accept="audio/*"
                onChange={(e) => setEnrollFile(e.target.files[0])}
                style={{ fontSize: 12, color: '#94a3b8' }}
              />
            </div>
            {enrollStatus?.error && <div style={{ fontSize: 11, color: '#f87171' }}>{enrollStatus.error}</div>}
            {enrollStatus?.success && <div style={{ fontSize: 11, color: '#34d399' }}>{enrollStatus.success}</div>}
            <button
              onClick={handleEnroll}
              disabled={enrollStatus?.loading}
              className="btn-primary"
              style={{ width: '100%', padding: '9px' }}
            >
              {enrollStatus?.loading ? 'Extracting Vocal Embedding...' : 'Save Speaker Profile'}
            </button>
          </div>
        </div>
      )}

      {/* Similarity gauge */}
      {hasProfile ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Embedding Cosine Similarity</span>
            <span style={{
              fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
              color: match ? '#10b981' : '#ef4444',
            }}>
              {simPct}%
            </span>
          </div>
          <div className="progress-track" style={{ height: 10, marginBottom: 8 }}>
            <div className="progress-fill" style={{
              width: `${simPct}%`,
              background: match ? 'linear-gradient(90deg,#059669,#10b981)' : 'linear-gradient(90deg,#dc2626,#ef4444)',
            }} />
          </div>
          {/* Threshold marker visual */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
            <span>0%</span>
            <span style={{ color: '#f59e0b' }}>Threshold: 75%</span>
            <span>100%</span>
          </div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="metric-tile">
              <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>SPEAKER MATCH</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: match ? '#10b981' : '#ef4444' }}>
                {simPct}%
              </div>
            </div>
            <div className="metric-tile">
              <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>THRESHOLD</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b' }}>75%</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '20px', borderRadius: 12, textAlign: 'center',
          background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)',
        }}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#334155" strokeWidth={1.5} style={{ margin: '0 auto 8px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div style={{ fontSize: 12, color: '#475569' }}>No speaker profile selected</div>
          <div style={{ fontSize: 11, color: '#334155', marginTop: 4 }}>Enroll a trusted speaker to enable identity verification</div>
        </div>
      )}
    </div>
  );
}
