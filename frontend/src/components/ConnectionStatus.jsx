import React from 'react';

export default function ConnectionStatus({ wsStatus, isRecording, backendOnline = true }) {
  const isWsConnected = wsStatus === 'CONNECTED';

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
      {/* Backend API Pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800">
        <span
          className={`w-2 h-2 rounded-full ${
            backendOnline ? 'bg-emerald-400 status-dot-pulse' : 'bg-red-500'
          }`}
        />
        <span className="text-slate-400">BACKEND:</span>
        <span className={backendOnline ? 'text-emerald-400 font-semibold' : 'text-red-400'}>
          {backendOnline ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>

      {/* WebSocket Pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800">
        <span
          className={`w-2 h-2 rounded-full ${
            isWsConnected
              ? 'bg-cyan-400 status-dot-pulse'
              : wsStatus === 'CONNECTING'
              ? 'bg-amber-400'
              : 'bg-red-500'
          }`}
        />
        <span className="text-slate-400">WS:</span>
        <span
          className={
            isWsConnected
              ? 'text-cyan-400 font-semibold'
              : wsStatus === 'CONNECTING'
              ? 'text-amber-400'
              : 'text-red-400'
          }
        >
          {wsStatus}
        </span>
      </div>

      {/* Microphone State Pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800">
        <span
          className={`w-2 h-2 rounded-full ${
            isRecording ? 'bg-emerald-400 status-dot-pulse' : 'bg-slate-500'
          }`}
        />
        <span className="text-slate-400">MIC:</span>
        <span className={isRecording ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
          {isRecording ? 'STREAMING' : 'MUTED'}
        </span>
      </div>
    </div>
  );
}
