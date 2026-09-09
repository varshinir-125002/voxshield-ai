import React, { useState } from 'react';
import { createAlert } from '../services/api';

export default function ThreatAlert({ riskData, onDismissWarning }) {
  const [isQuarantined, setIsQuarantined] = useState(false);
  const [reported, setReported] = useState(false);

  const score = riskData?.score !== undefined ? riskData.score : 0;
  const level = (riskData?.level || 'SAFE').toUpperCase();

  // Show prominent alert when threat is SUSPICIOUS, HIGH_RISK, HIGH, or CRITICAL
  const isThreat = level === 'HIGH_RISK' || level === 'SUSPICIOUS' || level === 'CRITICAL' || level === 'HIGH';
  if (!isThreat) {
    return null;
  }

  const isHighRisk = level === 'HIGH_RISK' || level === 'CRITICAL';

  const handleSimulatedBlock = async () => {
    setIsQuarantined(true);
    if (!reported) {
      await createAlert(score, level, 'Interaction blocked by user via threat alert panel.');
      setReported(true);
    }
  };

  return (
    <div
      className={`p-4 rounded-xl border ${
        isHighRisk
          ? 'bg-rose-950/70 border-rose-500/50 glow-red'
          : 'bg-amber-950/60 border-amber-500/40'
      } transition-all duration-300`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Warning Title and Recommendation */}
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              isHighRisk ? 'bg-rose-900/60 text-rose-300' : 'bg-amber-900/60 text-amber-300'
            }`}
          >
            <svg className="w-6 h-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className={`text-sm font-bold tracking-wide ${isHighRisk ? 'text-rose-200' : 'text-amber-200'}`}>
                {isHighRisk ? '⚠ HIGH RISK VOICE IMPERSONATION DETECTED' : '⚠ SUSPICIOUS VOICE ACTIVITY DETECTED'}
              </h4>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700">
                SCORE: {score}/100
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
              <strong>Recommendation:</strong> Do not share OTPs, passwords, banking information, or transfer money. Verify the caller using an independent trusted channel (e.g. standard phone callback).
            </p>
          </div>
        </div>

        {/* Prevention Action Button */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {!isQuarantined ? (
            <button
              onClick={handleSimulatedBlock}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/40 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z" />
              </svg>
              Block / Quarantine Interaction
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-rose-300 bg-rose-900/50 px-3 py-1.5 rounded border border-rose-500/40">
                INTERACTION QUARANTINED
              </span>
              <span className="text-[10px] font-mono text-slate-400 block">(Prototype Simulation)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
