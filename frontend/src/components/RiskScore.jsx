import React from 'react';

export default function RiskScore({ riskData, score: propScore, level: propLevel, reasons: propReasons }) {
  const score = propScore !== undefined ? propScore : (riskData?.score ?? 0);
  const rawLevel = (propLevel || riskData?.level || 'SAFE').toUpperCase();
  const reasons = (propReasons && propReasons.length > 0) ? propReasons : (riskData?.reasons || ['System idle — awaiting speech input']);

  // Threat colors
  let color = '#10b981'; // SAFE / LOW green
  let glowClass = 'glow-green';
  let badgeBorder = 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10';

  if (rawLevel === 'CAUTION' || rawLevel === 'MEDIUM') {
    color = '#f59e0b';
    glowClass = '';
    badgeBorder = 'border-amber-500/30 text-amber-400 bg-amber-500/10';
  } else if (rawLevel === 'SUSPICIOUS' || rawLevel === 'HIGH') {
    color = '#f97316';
    glowClass = '';
    badgeBorder = 'border-orange-500/30 text-orange-400 bg-orange-500/10';
  } else if (rawLevel === 'HIGH_RISK' || rawLevel === 'CRITICAL') {
    color = '#ef4444';
    glowClass = 'glow-red';
    badgeBorder = 'border-rose-500/30 text-rose-400 bg-rose-500/10';
  }

  // Radial Gauge Math
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`vox-card p-5 flex flex-col gap-4 ${level === 'HIGH_RISK' ? glowClass : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-slate-100 text-sm">Overall Security Risk Score</h3>
          <p className="text-xs text-slate-400">Explainable multi-signal threat evaluation</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-mono font-bold border tracking-wider ${badgeBorder}`}>
          {level.replace('_', ' ')}
        </span>
      </div>

      {/* Main Gauge & Visual Score */}
      <div className="flex items-center justify-around py-2">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-800"
            />
            {/* Value Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={color}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          {/* Centered Score */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {score}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              / 100
            </span>
          </div>
        </div>

        {/* Threat Formula Weights breakdown */}
        <div className="flex flex-col gap-1.5 text-[11px] font-mono text-slate-400">
          <div className="text-xs font-semibold text-slate-200 mb-0.5">MULTI-SIGNAL MATRIX</div>
          <div className="flex justify-between gap-4">
            <span>AI Voice Authenticity:</span>
            <span className="text-cyan-400 font-bold">45%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Speaker Identity Match:</span>
            <span className="text-cyan-400 font-bold">30%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Transcript Behavior:</span>
            <span className="text-cyan-400 font-bold">15%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Acoustic Anomaly:</span>
            <span className="text-cyan-400 font-bold">10%</span>
          </div>
        </div>
      </div>

      {/* Explainability Reasons Section */}
      <div className="pt-2 border-t border-slate-800/80">
        <span className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Diagnostic Risk Factors:
        </span>
        <ul className="flex flex-col gap-1 text-xs text-slate-300">
          {reasons && reasons.length > 0 ? (
            reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className={`text-[10px] mt-0.5 ${score > 59 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ●
                </span>
                <span>{reason}</span>
              </li>
            ))
          ) : (
            <li className="text-slate-500">No anomalous risk factors identified.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
