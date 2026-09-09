import React, { useState, useEffect } from 'react';
import { fetchSpeakers, registerSpeaker } from '../services/api';

export default function SpeakerVerification({
  speakerData,
  selectedSpeakerId,
  onSelectSpeaker,
}) {
  const [speakersList, setSpeakersList] = useState([]);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newSpeakerName, setNewSpeakerName] = useState('');
  const [enrollmentFile, setEnrollmentFile] = useState(null);
  const [enrollStatus, setEnrollStatus] = useState(null);

  const {
    match = false,
    similarity = 0.0,
    registered_speaker = null,
  } = speakerData || {};

  const simPercent = Math.round(similarity * 100);
  const hasRegisteredSpeaker = Boolean(selectedSpeakerId || registered_speaker);

  useEffect(() => {
    loadSpeakers();
  }, []);

  const loadSpeakers = async () => {
    const list = await fetchSpeakers();
    setSpeakersList(list);
    if (list.length > 0 && !selectedSpeakerId) {
      onSelectSpeaker(list[0].id);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!newSpeakerName || !enrollmentFile) {
      setEnrollStatus({ error: 'Please provide both speaker name and an audio file (WAV/MP3).' });
      return;
    }

    setEnrollStatus({ loading: true });
    try {
      const res = await registerSpeaker(newSpeakerName, enrollmentFile);
      setEnrollStatus({ success: `Enrolled ${res.speaker_name} successfully!` });
      await loadSpeakers();
      onSelectSpeaker(res.speaker_id);
      setTimeout(() => {
        setIsRegisterOpen(false);
        setNewSpeakerName('');
        setEnrollmentFile(null);
        setEnrollStatus(null);
      }, 1500);
    } catch (err) {
      setEnrollStatus({ error: err.message || 'Enrollment failed.' });
    }
  };

  return (
    <div className="vox-card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-slate-100 text-sm">Speaker Verification</h3>
          <p className="text-xs text-slate-400">Vocal tract acoustic embedding comparison</p>
        </div>

        {/* Match / Mismatch Badge */}
        {hasRegisteredSpeaker ? (
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold border tracking-wider ${
              match
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            {match ? 'SPEAKER MATCHED' : 'SPEAKER MISMATCH'}
          </span>
        ) : (
          <span className="text-xs px-2.5 py-1 rounded-full font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700">
            NO SPEAKER ENROLLED
          </span>
        )}
      </div>

      {/* Speaker Selector & Enrollment Button */}
      <div className="flex items-center gap-2">
        <select
          value={selectedSpeakerId || ''}
          onChange={(e) => onSelectSpeaker(e.target.value || null)}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
        >
          <option value="">-- No Speaker Selected (General Check) --</option>
          {speakersList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.id})
            </option>
          ))}
        </select>
        <button
          onClick={() => setIsRegisterOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-medium text-cyan-400 cursor-pointer whitespace-nowrap"
        >
          + Enroll Speaker
        </button>
      </div>

      {/* Enrollment Modal */}
      {isRegisterOpen && (
        <div className="p-3 rounded-lg bg-slate-900/90 border border-cyan-500/30 flex flex-col gap-2.5 text-xs">
          <div className="flex justify-between items-center font-semibold text-cyan-400">
            <span>Register Trusted Speaker Profile</span>
            <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <input
            type="text"
            placeholder="Speaker Name (e.g. CEO John Doe)"
            value={newSpeakerName}
            onChange={(e) => setNewSpeakerName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200"
          />
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Upload reference voice recording (.wav / .mp3):</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setEnrollmentFile(e.target.files[0])}
              className="w-full text-slate-300 text-xs"
            />
          </div>
          {enrollStatus?.error && <div className="text-red-400">{enrollStatus.error}</div>}
          {enrollStatus?.success && <div className="text-emerald-400">{enrollStatus.success}</div>}
          <button
            onClick={handleEnroll}
            disabled={enrollStatus?.loading}
            className="w-full py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold cursor-pointer"
          >
            {enrollStatus?.loading ? 'Extracting Vocal Embedding...' : 'Save Profile'}
          </button>
        </div>
      )}

      {/* Similarity Gauge */}
      {hasRegisteredSpeaker ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Embedding Cosine Similarity</span>
            <span className={`font-mono font-bold ${match ? 'text-emerald-400' : 'text-rose-400'}`}>
              {simPercent}% (Threshold: 75%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                match ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${simPercent}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-slate-400 text-xs text-center font-mono">
          Speaker verification unavailable — no registered speaker
        </div>
      )}
    </div>
  );
}
