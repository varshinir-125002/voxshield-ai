import React from 'react';
import Waveform from './Waveform';

export default function AudioCapture({
  isRecording,
  onStart,
  onStop,
  audioData,
  error,
  wsStatus,
  onSimulateScenario,
}) {
  return (
    <div className="vox-card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/20 text-cyan-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">Live Audio Capture</h3>
            <p className="text-xs text-slate-400">Web Audio API streaming over secure WebSocket</p>
          </div>
        </div>

        {/* State Badge */}
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-mono font-medium border ${
            isRecording
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {isRecording ? 'STREAMING ACTIVE' : 'MIC STANDBY'}
        </span>
      </div>

      {/* Real-time Waveform Canvas */}
      <Waveform audioData={audioData} isRecording={isRecording} />

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {!isRecording ? (
          <button
            id="btn-start-mic"
            onClick={onStart}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Start Microphone
          </button>
        ) : (
          <button
            id="btn-stop-mic"
            onClick={onStop}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-semibold text-sm transition-all shadow-lg shadow-rose-600/20 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
            Stop Microphone
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
          <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Evaluator Simulator Bar */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2 text-[11px] font-mono text-slate-400">
          <span>PROTOTYPE TEST PRESETS:</span>
          <span className="text-[10px] text-cyan-400/80 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">Simulation Mode</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onSimulateScenario('SAFE')}
            className="px-2 py-1.5 rounded bg-slate-900 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 text-[11px] text-slate-300 hover:text-emerald-300 font-mono transition-colors"
            title="Simulate verified authentic caller"
          >
            Safe Caller
          </button>
          <button
            onClick={() => onSimulateScenario('SUSPICIOUS')}
            className="px-2 py-1.5 rounded bg-slate-900 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 text-[11px] text-slate-300 hover:text-amber-300 font-mono transition-colors"
            title="Simulate suspicious caller with acoustic mismatch"
          >
            Suspicious
          </button>
          <button
            onClick={() => onSimulateScenario('HIGH_RISK')}
            className="px-2 py-1.5 rounded bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/40 text-[11px] text-slate-300 hover:text-red-300 font-mono transition-colors"
            title="Simulate cloned voice with OTP extortion"
          >
            High-Risk Scam
          </button>
        </div>
      </div>
    </div>
  );
}
