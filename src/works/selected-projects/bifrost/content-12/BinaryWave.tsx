import { useCallback, useEffect, useRef } from 'react';

// Binary wave canvas (Motion Lab's bifrost-content/motion-12/BinaryWave), ported from the Framer
// code component (property controls dropped, the props stay the same). As in the lab, the digits
// are drawn with the system's monospace font (nothing is downloaded). It draws only while
// `playing`; paused, it holds its last frame and its clock stops.
export type BinaryWaveProps = {
  color?: string;
  background?: string;
  cellSize?: number;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  speed?: number;
  frequency?: number;
  amplitude?: number;
  baseHeight?: number;
  density?: number;
  crestScatter?: number;
  blinkSpeed?: number;
  blinkDepth?: number;
  opacity?: number;
  includeZeros?: boolean;
  zeroChance?: number;
  centerGap?: number;
  seed?: number;
  reflectVertical?: boolean;
  playing?: boolean;
};

const defaults = {
  color: '#9AD5C4',
  background: 'transparent',
  cellSize: 14,
  fontSize: 16,
  fontWeight: 500,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  speed: 2.2,
  frequency: 1.35,
  amplitude: 0.22,
  baseHeight: 0.28,
  density: 0.85,
  crestScatter: 0.65,
  blinkSpeed: 5.5,
  blinkDepth: 0.55,
  opacity: 0.9,
  includeZeros: true,
  zeroChance: 0.18,
  centerGap: 0.22,
  seed: 1337,
  reflectVertical: false,
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Smooth edge for the wave body.
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export default function BinaryWave(props: BinaryWaveProps) {
  const {
    color, background, cellSize, fontSize, fontWeight, fontFamily, speed, frequency, amplitude,
    baseHeight, density, crestScatter, blinkSpeed, blinkDepth, opacity, includeZeros, zeroChance,
    centerGap, seed, reflectVertical, playing = true,
  } = { ...defaults, ...(Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined && !Number.isNaN(value))) as BinaryWaveProps) };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const gridRef = useRef<{ cols: number; rows: number; cellW: number; cellH: number; noise: Float32Array; phase: Float32Array } | null>(null);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    // Layout size, not getBoundingClientRect: the stage scales the frame with a CSS
    // transform, and the canvas must fill its band in unscaled px.
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    if (!width || !height) return;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    // Round the cell count so the grid divides the canvas exactly — no edge padding.
    const cols = Math.max(1, Math.round(width / cellSize));
    const rows = Math.max(1, Math.round(height / cellSize));
    const cellW = width / cols;
    const cellH = height / rows;
    const rng = mulberry32(seed | 0);
    const noise = new Float32Array(cols * rows);
    const phase = new Float32Array(cols * rows);
    for (let i = 0; i < noise.length; i += 1) {
      noise[i] = rng();
      phase[i] = rng() * Math.PI * 2;
    }
    gridRef.current = { cols, rows, cellW, cellH, noise, phase };
  }, [cellSize, seed]);

  useEffect(() => {
    resize();
    const observer = new ResizeObserver(() => resize());
    if (canvasRef.current?.parentElement) observer.observe(canvasRef.current.parentElement);
    return () => observer.disconnect();
  }, [resize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    if (!playing) return;
    // The clock continues from where it paused.
    const start = performance.now() - Number(canvas.dataset.elapsed ?? 0) * 1000;

    const tick = (now: number) => {
      const grid = gridRef.current;
      if (!grid) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const time = (now - start) / 1000;
      canvas.dataset.elapsed = String(time);
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      if (background && background !== 'transparent') {
        context.fillStyle = background;
        context.fillRect(0, 0, width, height);
      }

      context.fillStyle = color;
      context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      context.textBaseline = 'middle';
      context.textAlign = 'center';

      const { cols, rows, cellW, cellH, noise, phase } = grid;
      const travel = time * speed;
      const sigma = Math.max(0.05, centerGap);
      const envelopeAt = (nx: number) => 1 - Math.exp(-Math.pow((nx - 0.5) / sigma, 2));

      for (let cx = 0; cx < cols; cx += 1) {
        const nx = cols <= 1 ? 0 : cx / (cols - 1);
        const env = envelopeAt(nx);
        const wave = (baseHeight
          + amplitude * Math.sin(nx * Math.PI * 2 * frequency + travel)
          + amplitude * 0.35 * Math.sin(nx * Math.PI * 2 * (frequency * 2.1) + travel * 0.7 + 1.7)) * env;
        const waveY = height * clamp01(wave);

        for (let cy = 0; cy < rows; cy += 1) {
          const index = cy * cols + cx;
          const n = noise[index];
          const p = phase[index];
          const x = (cx + 0.5) * cellW;
          const y = (cy + 0.5) * cellH;

          const inside = reflectVertical
            ? smoothstep(waveY - cellH * 1.2, waveY + cellH * 0.8, y)
            : smoothstep(waveY + cellH * 0.8, waveY - cellH * 1.2, y);
          const crestBand = Math.exp(-Math.pow((y - waveY) / (cellH * 2.2), 2));
          const appear = inside * density + crestBand * crestScatter * 0.65;
          if (n > appear) continue;

          const flicker = 1 - blinkDepth * (0.5 + 0.5 * Math.sin(time * blinkSpeed + p + n * 6));
          const alpha = clamp01(opacity * flicker * (0.35 + 0.65 * inside + 0.35 * crestBand));
          if (alpha < 0.02) continue;

          context.globalAlpha = alpha;
          context.fillText(includeZeros && n < zeroChance ? '0' : '1', x, y);
        }
      }

      context.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [color, background, cellSize, fontSize, fontWeight, fontFamily, speed, frequency, amplitude,
    baseHeight, density, crestScatter, blinkSpeed, blinkDepth, opacity, includeZeros, zeroChance,
    centerGap, reflectVertical, playing]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
