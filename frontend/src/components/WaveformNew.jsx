/**
 * VoxShield AI — Premium Waveform Visualizer (redesigned)
 * Canvas-based real-time frequency spectrum
 */
import React, { useRef, useEffect } from 'react';

export default function WaveformNew({ audioData, isRecording }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const idlePhaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isRecording || !audioData || audioData.length === 0) {
        // Idle breathing animation
        idlePhaseRef.current += 0.04;
        const bars = 48;
        const barW = (w / bars) - 1.5;
        for (let i = 0; i < bars; i++) {
          const phase = idlePhaseRef.current + i * 0.4;
          const barH = 3 + Math.abs(Math.sin(phase)) * 10;
          const x = i * (barW + 1.5);
          const y = (h - barH) / 2;
          ctx.fillStyle = `rgba(71, 85, 105, ${0.25 + 0.15 * Math.abs(Math.sin(phase))})`;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(x, y, barW, barH, 2);
          else ctx.rect(x, y, barW, barH);
          ctx.fill();
        }
      } else {
        // Live frequency spectrum
        const bars = 56;
        const barW = (w / bars) - 1;
        const grad = ctx.createLinearGradient(0, h, 0, 0);
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.9)');
        grad.addColorStop(0.5, 'rgba(59, 130, 246, 0.85)');
        grad.addColorStop(1, 'rgba(139, 92, 246, 0.8)');

        for (let i = 0; i < bars; i++) {
          const idx = Math.floor((i / bars) * audioData.length);
          const val = audioData[idx] || 0;
          const barH = Math.max(3, (val / 255) * (h - 6));
          const x = i * (barW + 1);
          const y = (h - barH) / 2;

          ctx.fillStyle = grad;
          ctx.globalAlpha = 0.85 + (val / 255) * 0.15;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(x, y, barW, barH, 2);
          else ctx.rect(x, y, barW, barH);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      animRef.current = requestAnimationFrame(draw);
    }

    // HiDPI setup
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [audioData, isRecording]);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            className={isRecording ? 'status-dot-pulse' : ''}
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: isRecording ? '#06b6d4' : '#334155',
            }}
          />
          <span style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
            {isRecording ? 'REAL-TIME SPECTRO-ACOUSTIC FEED' : 'STANDBY — WAVEFORM IDLE'}
          </span>
        </div>
        <span style={{ fontSize: 10, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>16kHz / MONO</span>
      </div>
      <div style={{
        width: '100%', height: 72,
        background: 'rgba(0,0,0,0.25)',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden',
      }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    </div>
  );
}
