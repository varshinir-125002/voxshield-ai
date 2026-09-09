import React, { useRef, useEffect } from 'react';

export default function Transcript({
  transcriptData,
  liveTranscript,
  transcriptText,
  riskScore,
  flags: propFlags,
  isLive,
}) {
  const containerRef = useRef(null);
  const textFromData = typeof transcriptData === 'string' ? transcriptData : (transcriptData?.text || '');
  const displayText = liveTranscript || transcriptText || textFromData || 'Conversation transcript will appear here in real time as speech is detected...';

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayText]);

  // Highlight suspicious words
  const highlightSuspiciousTerms = (str) => {
    if (!str) return '';
    const keywords = [
      'otp',
      'password',
      'pin',
      'credit card',
      'debit card',
      'cvv',
      'bank',
      'account',
      'immediately',
      'urgent',
      'police',
      'arrest',
      'wire transfer',
      'suspended',
    ];

    const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
    const parts = str.split(regex);

    return parts.map((part, i) => {
      if (keywords.some((k) => k.toLowerCase() === part.toLowerCase())) {
        return (
          <mark
            key={i}
            className="bg-rose-500/20 text-rose-300 font-semibold px-1 py-0.5 rounded border border-rose-500/30"
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  return (
    <div className="vox-card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-slate-100 text-sm">Live Conversation Transcript</h3>
          <p className="text-xs text-slate-400">Behavioral NLP analysis for extortion & urgency</p>
        </div>

        {/* Risk Score Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">TRANSCRIPT RISK:</span>
          <span
            className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
              risk_score > 0.6
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : risk_score > 0.3
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {Math.round(risk_score * 100)}%
          </span>
        </div>
      </div>

      {/* Flag Badges */}
      {flags && flags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {flags.map((flag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-500/30 flex items-center gap-1"
            >
              <span>⚠</span>
              <span>{flag}</span>
            </span>
          ))}
        </div>
      )}

      {/* Transcript Scrolling Box */}
      <div
        ref={containerRef}
        className="w-full h-32 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 overflow-y-auto font-mono text-xs leading-relaxed text-slate-300"
      >
        {highlightSuspiciousTerms(displayText)}
      </div>
    </div>
  );
}
