import React from 'react';

export default function VoiceAnalysis({ voiceData }) {
  const {
    ai_probability = 0.0,
    human_probability = 1.0,
    confidence = 0.0,
    status = 'LIKELY_HUMAN',
  } = voiceData || {};

  const aiPercent = Math.round(ai_probability * 100);
  const humanPercent = Math.round(human_probability * 100);
  const confidencePercent = Math.round(confidence * 100);

  // Status Badge Colors
  let badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  if (status === 'UNCERTAIN') {
    badgeColor = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  } else if (status === 'LIKELY_AI') {
    badgeColor = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  }

  return (
    <div className="vox-card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-100 text-sm">AI Voice Authenticity</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/20 text-cyan-400">
              Prototype Detection Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Multi-feature spectral and prosodic artifact estimation</p>
        </div>

        {/* Status Badge */}
        <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold border tracking-wider ${badgeColor}`}>
          {status.replace('_', ' ')}
        </span>
      </div>

      {/* Probability Bars */}
      <div className="flex flex-col gap-3">
        {/* AI Probability */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium">AI Synthetic Probability</span>
            <span className={`font-mono font-bold ${aiPercent > 60 ? 'text-rose-400' : 'text-slate-200'}`}>
              {aiPercent}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                aiPercent > 70
                  ? 'bg-rose-500'
                  : aiPercent > 30
                  ? 'bg-amber-500'
                  : 'bg-cyan-500'
              }`}
              style={{ width: `${aiPercent}%` }}
            />
          </div>
        </div>

        {/* Human Probability */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium">Human Natural Probability</span>
            <span className={`font-mono font-bold ${humanPercent > 60 ? 'text-emerald-400' : 'text-slate-200'}`}>
              {humanPercent}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${humanPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono block">DETECTION CONFIDENCE</span>
          <span className="text-base font-bold font-mono text-cyan-400">{confidencePercent}%</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono block">SPECTRAL ARTIFACTS</span>
          <span className={`text-base font-bold font-mono ${aiPercent > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {aiPercent > 70 ? 'HIGH DISCONTINUITY' : aiPercent > 40 ? 'MODERATE' : 'NORMAL'}
          </span>
        </div>
      </div>
    </div>
  );
}
