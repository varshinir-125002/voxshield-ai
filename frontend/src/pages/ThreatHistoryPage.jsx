import React, { useState, useEffect } from 'react';
import { fetchRecentAlerts } from '../services/api';

const DEFAULT_HISTORY = [
  {
    id: 'th-1',
    time: '14:28:10',
    timestamp: Date.now() - 1000 * 60 * 22,
    risk_score: 94,
    ai_prob: 93,
    speaker_match: 38,
    level: 'HIGH_RISK',
    action: 'Quarantine / Warning Issued',
    reason: 'Deepfake synthetic voice detected with speaker biometric mismatch & financial extortion urgency'
  },
  {
    id: 'th-2',
    time: '14:15:02',
    timestamp: Date.now() - 1000 * 60 * 35,
    risk_score: 21,
    ai_prob: 8,
    speaker_match: 91,
    level: 'SAFE',
    action: 'Pass (Authorized)',
    reason: 'Organic vocal tract resonance verified against enrolled biometric profile'
  },
  {
    id: 'th-3',
    time: '13:50:44',
    timestamp: Date.now() - 1000 * 60 * 59,
    risk_score: 58,
    ai_prob: 61,
    speaker_match: 68,
    level: 'SUSPICIOUS',
    action: 'Step-up Verification Sent',
    reason: 'Acoustic anomalies detected, borderline similarity score near threshold'
  }
];

export default function ThreatHistoryPage() {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const serverAlerts = await fetchRecentAlerts();
      const localAlertsRaw = localStorage.getItem('voxshield_threat_history');
      const localAlerts = localAlertsRaw ? JSON.parse(localAlertsRaw) : [];

      // Format server alerts
      const formattedServerAlerts = (serverAlerts || []).map((a) => ({
        id: a.id || `srv-${Math.random()}`,
        time: a.created_at ? new Date(a.created_at).toLocaleTimeString() : 'Recent',
        timestamp: a.created_at ? new Date(a.created_at).getTime() : Date.now(),
        risk_score: a.risk_score || 85,
        ai_prob: a.risk_score > 70 ? 92 : 45,
        speaker_match: a.risk_score > 70 ? 32 : 78,
        level: a.threat_level || (a.risk_score >= 70 ? 'HIGH_RISK' : a.risk_score >= 40 ? 'SUSPICIOUS' : 'SAFE'),
        action: a.risk_score >= 70 ? 'Warning / Quarantine' : 'Logged Incident',
        reason: a.reason || 'Telemetry threshold exceeded'
      }));

      // Combine defaults + server + local
      const combined = [...localAlerts, ...formattedServerAlerts];
      if (combined.length === 0) {
        setHistory(DEFAULT_HISTORY);
      } else {
        // Merge without duplicates by ID
        const seen = new Set();
        const merged = [...combined, ...DEFAULT_HISTORY].filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setHistory(merged);
      }
    } catch (err) {
      console.error('Failed to load threat history:', err);
      setHistory(DEFAULT_HISTORY);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear all locally cached threat events?')) {
      localStorage.removeItem('voxshield_threat_history');
      setHistory(DEFAULT_HISTORY);
    }
  };

  const filteredItems = history.filter((item) => {
    const matchesFilter =
      filter === 'ALL' ||
      item.level === filter ||
      (filter === 'HIGH' && item.level === 'HIGH_RISK');

    const matchesSearch =
      item.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.level?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getBadgeStyle = (lvl) => {
    const level = (lvl || '').toUpperCase();
    if (level === 'HIGH_RISK' || level === 'HIGH') {
      return { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' };
    }
    if (level === 'SUSPICIOUS') {
      return { background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.3)' };
    }
    return { background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>Incident & Threat History</span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              {filteredItems.length} Logged Events
            </span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Chronological audit log of voice impersonation detections, synthetic speech incidents, and defense actions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={loadHistory}
            className="btn btn-ghost"
            style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh Logs'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-ghost"
            style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem', color: '#f43f5e' }}
          >
            Clear Local Logs
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'HIGH_RISK', 'SUSPICIOUS', 'SAFE'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid',
                background: filter === tab ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                borderColor: filter === tab ? '#38bdf8' : 'rgba(148, 163, 184, 0.15)',
                color: filter === tab ? '#38bdf8' : '#94a3b8',
                transition: 'all 0.15s ease'
              }}
            >
              {tab === 'ALL' ? 'All Events' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div style={{ flex: '1', minWidth: '220px', maxWidth: '360px' }}>
          <input
            type="text"
            placeholder="Search by reason or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.85rem',
              borderRadius: '0.4rem',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: '#f8fafc',
              fontSize: '0.75rem'
            }}
          />
        </div>
      </div>

      {/* Incident Table / Cards */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Time</th>
                <th style={{ padding: '0.85rem 1rem' }}>Threat Level</th>
                <th style={{ padding: '0.85rem 1rem' }}>Risk Score</th>
                <th style={{ padding: '0.85rem 1rem' }}>AI Synthetic</th>
                <th style={{ padding: '0.85rem 1rem' }}>Speaker Match</th>
                <th style={{ padding: '0.85rem 1rem' }}>Action Taken</th>
                <th style={{ padding: '0.85rem 1rem' }}>Primary Diagnostic Reason</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                    No incident records matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid rgba(148, 163, 184, 0.06)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#94a3b8' }}>
                      {item.time}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        ...getBadgeStyle(item.level)
                      }}>
                        {item.level.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 800 }}>
                      <span style={{
                        color: item.risk_score >= 70 ? '#ef4444' : item.risk_score >= 40 ? '#eab308' : '#22c55e'
                      }}>
                        {item.risk_score} / 100
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: item.ai_prob > 50 ? '#f43f5e' : '#22c55e' }}>
                      {item.ai_prob}%
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: item.speaker_match < 75 ? '#f43f5e' : '#22c55e' }}>
                      {item.speaker_match}%
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#e2e8f0' }}>
                      {item.action}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', maxWidth: '340px' }}>
                      {item.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
