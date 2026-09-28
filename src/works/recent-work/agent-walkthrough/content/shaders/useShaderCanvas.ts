import { useEffect, useRef, useState } from 'react';

const VERTEX = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

export type ShaderFrame = {
  gl: WebGLRenderingContext;
  canvas: HTMLCanvasElement;
  pixelRatio: number;
  uniform: (name: string) => WebGLUniformLocation | null;
};

type Options = {
  /** The fragment shader. It is drawn over one quad covering the canvas. */
  fragment: string;
  /** Canvas size in CSS px. */
  width: number;
  height: number;
  /**
   * The most bitmap pixels per CSS px. The canvas renders at its true on-screen size (browser
   * zoom, screen density and any CSS scale included), up to this.
   */
  maxPixelRatio: number;
  /** A see-through canvas: the shader writes premultiplied colour and alpha. */
  transparent?: boolean;
  /** Seconds. Given, the caller drives the clock (the lab's timeline); omitted, the canvas runs its own. */
  time?: number;
  /** Sets the uniforms for the frame at `seconds`. */
  render: (frame: ShaderFrame, seconds: number) => void;
  /** Called right after each draw with the canvas, while its pixels can still be read. */
  onFrame?: (canvas: HTMLCanvasElement) => void;
  /** Changes when a setting changes, so a caller-driven frame redraws. */
  redrawKey?: string;
};

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * One WebGL canvas drawing one fragment shader. Without `time` it runs its own clock, pauses
 * while off screen and holds frame 0 for reduced motion; with `time` it draws only when the
 * time or `redrawKey` changes. If the browser drops the WebGL context, it rebuilds on restore.
 */
export function useShaderCanvas({ fragment, width, height, maxPixelRatio, transparent = false, time, render, onFrame, redrawKey = '' }: Options) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef<((seconds: number) => void) | null>(null);
  const live = useRef({ render, onFrame, time });
  live.current = { render, onFrame, time };
  // Bumped when a lost WebGL context comes back, to set everything up again.
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', { antialias: false, alpha: transparent, premultipliedAlpha: transparent });
    if (!canvas || !gl) return;

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, fragment);
    const program = gl.createProgram();
    if (!vertex || !fragmentShader || !program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    // Match the bitmap to the canvas's size on screen, so it is drawn pixel for pixel: sharp
    // when zoomed in, and no bigger than needed when the lab shows the frame scaled down.
    const shaderFrame: ShaderFrame = { gl, canvas, pixelRatio: 1, uniform: () => null };
    const fit = () => {
      const rect = canvas.getBoundingClientRect();
      const density = window.devicePixelRatio || 1;
      const scale = rect.width > 0 ? Math.min(maxPixelRatio, Math.max(1, (rect.width / width) * density)) : shaderFrame.pixelRatio;
      const pixelWidth = Math.round(width * scale);
      const pixelHeight = Math.round(height * scale);
      if (pixelWidth === canvas.width && pixelHeight === canvas.height) return;
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      shaderFrame.pixelRatio = scale;
      gl.viewport(0, 0, pixelWidth, pixelHeight);
    };
    fit();

    const locations = new Map<string, WebGLUniformLocation | null>();
    const uniform = (name: string) => {
      if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
      return locations.get(name) ?? null;
    };
    shaderFrame.uniform = uniform;

    let lost = false;
    let draws = 0;
    const draw = (seconds: number) => {
      if (lost) return;
      // Re-measure now and then: zooming or resizing changes the on-screen size.
      if (++draws % 30 === 0) fit();
      live.current.render(shaderFrame, seconds);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      // Read the canvas in the same task as the draw, before the buffer is cleared.
      live.current.onFrame?.(canvas);
    };
    drawRef.current = draw;
    canvas.dataset.ready = 'true';

    let frame = 0;
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(canvas);
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (live.current.time !== undefined || !visible) return;
      draw(still ? 0 : (now - start) / 1000);
    };
    draw(live.current.time ?? 0);
    frame = requestAnimationFrame(tick);

    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(frame);
    };
    const onRestored = () => setGeneration(value => value + 1);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      drawRef.current = null;
      delete canvas.dataset.ready;
      if (lost) return;
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(buffer);
    };
  }, [fragment, width, height, maxPixelRatio, transparent, generation]);

  // Driven by the caller: redraw whenever the time or a setting changes.
  useEffect(() => {
    if (time !== undefined) drawRef.current?.(time);
  }, [time, redrawKey]);

  return canvasRef;
}
