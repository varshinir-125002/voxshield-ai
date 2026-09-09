import React, { useRef, useEffect } from 'react';

export default function Waveform({ audioData, isRecording }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw subtle grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let y = 15; y < height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (!isRecording || !audioData || audioData.length === 0) {
      // Idle flatline
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    // Active live visualizer (Dual mirror frequency spectrum)
    const barCount = 48;
    const barWidth = (width / barCount) - 2;
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.8)');
    gradient.addColorStop(0.6, 'rgba(59, 130, 246, 0.9)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.95)');

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * audioData.length);
      const val = audioData[dataIndex] || 0;
      const barHeight = Math.max(4, (val / 255) * (height - 10));

      const x = i * (barWidth + 2);
      const y = (height - barHeight) / 2;

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 2, 2]);
      ctx.fill();
    }
  }, [audioData, isRecording]);

  return (
    <div className="w-full relative overflow-hidden rounded-lg bg-slate-950/60 border border-slate-800/80 p-2">
      <div className="flex justify-between items-center px-2 pb-1 text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-cyan-400 status-dot-pulse' : 'bg-slate-600'}`} />
          REAL-TIME SPECTRO-ACOUSTIC FEED
        </span>
        <span>16,000 Hz / MONO</span>
      </div>
      <canvas
        ref={canvasRef}
        width={560}
        height={85}
        className="w-full h-[85px] block rounded"
      />
    </div>
  );
}
