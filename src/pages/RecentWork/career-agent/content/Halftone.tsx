import { useEffect, useRef } from 'react';
import dots from './halftone-dots.json';

// Figma 285:31388 "Halftone Effect": 109 × 109 dots of #8e8e8e on an exact grid, group opacity
// 0.3. Only the dot radii are stored (halftone-dots.json, radius × 1000, row by row); the grid
// comes from the Figma layout and is accurate to 0.003px.
const GRID = 109;
const ORIGIN_X = -68 - 1.866711139678955 + 3.1002226; // frame 285:31386 + halftone + first dot
const ORIGIN_Y = -10 - 43.399532318115234 + 2.32418714;
const PITCH_X = 6.19938843;
const PITCH_Y = 4.64954117;

export default function Halftone({ width, height, className }: { width: number; height: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const scale = Math.min(3, Math.max(2, window.devicePixelRatio || 1));
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.fillStyle = 'rgb(142 142 142 / 30%)';
    context.beginPath();
    for (let row = 0; row < GRID; row += 1) {
      const y = ORIGIN_Y + row * PITCH_Y;
      if (y < -2 || y > height + 2) continue;
      for (let column = 0; column < GRID; column += 1) {
        const x = ORIGIN_X + column * PITCH_X;
        if (x < -2 || x > width + 2) continue;
        const radius = dots[row * GRID + column] / 1000;
        context.moveTo(x + radius, y);
        context.arc(x, y, radius, 0, Math.PI * 2);
      }
    }
    context.fill();
  }, [width, height]);

  return <canvas ref={canvasRef} className={className} style={{ width, height }} aria-hidden />;
}
