import { glsl, glslPalette } from './palette';
import { useShaderCanvas } from './useShaderCanvas';

/**
 * The Agent Walkthrough background as a live shader: soft blue, cream, yellow and orange light
 * that keeps changing shape. Warm masses (orange, yellow) and cool masses (blues) each drift,
 * stretch, compress and turn on their own rhythm; the colour comes from the balance between
 * them, so the milky cream bands sit exactly on the moving boundaries and bend with them.
 * Every rhythm is a whole number of cycles per LOOP_SECONDS, so the loop has no reset.
 */
export const LOOP_SECONDS = 30;

/** Dial defaults: Flow scales the motion, Band the milky boundary width, Grain the texture. */
export const backgroundDefaults = { Flow: 1, Band: 1, Grain: 0.035 };
export type BackgroundSettings = typeof backgroundDefaults;

const FRAGMENT = `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uFlow;
uniform float uBand;
uniform float uGrain;
uniform float uPixelRatio;

#define TAU 6.28318530718
const float LOOP = ${LOOP_SECONDS.toFixed(1)};

// A phase that turns k whole times per loop, so everything returns to its start together.
float ph(float k, float offset) { return TAU * k * uTime / LOOP + offset; }

// A soft, stretched mass: centre c, angle a, radii r.
float mass(vec2 p, vec2 c, float a, vec2 r) {
  vec2 d = p - c;
  float cs = cos(a), sn = sin(a);
  d = vec2(cs * d.x + sn * d.y, -sn * d.x + cs * d.y) / r;
  return exp(-dot(d, d));
}

// An oscillation that is 0 at the start of the loop, so frame 0 is the reference layout.
float osc(float k, float offset) { return sin(ph(k, offset)) - sin(offset); }

// Mass radii below are the reference's colour cores; SIZE spreads them until neighbours meet.
const float SIZE = 1.5;

// One colour mass. Its centre drifts, its angle turns, and it stretches along its length while
// compressing across it (keeping its area), each on its own rhythm (k = cycles per loop).
float flowMass(vec2 p, vec2 c, float a, vec2 r, vec3 k, vec3 o) {
  vec2 centre = c + uFlow * vec2(0.07 * osc(k.x, o.x), 0.06 * osc(k.y, o.y));
  float angle = a + uFlow * 0.35 * osc(k.z, o.z);
  float s = 1.0 + uFlow * 0.28 * osc(k.y, o.x + o.z);
  return mass(p, centre, angle, SIZE * vec2(r.x * s, r.y / s));
}

// -1 is deep blue, 0 the neutral cream, +1 orange. Positions are in card heights (x 0 to 1.307).
float field(vec2 p) {
  // Local currents, each with its own direction, scale and speed, so neighbouring areas bend
  // differently instead of one distortion moving the whole picture. Zero at frame 0.
  vec2 w = vec2(0.0);
  w += 0.045 * vec2(sin(p.y * 3.1 + ph(1.0, 0.3)) - sin(p.y * 3.1 + 0.3), cos(p.x * 2.7 + ph(1.0, 1.7)) - cos(p.x * 2.7 + 1.7));
  w += 0.030 * vec2(sin((p.x + p.y) * 4.3 + ph(2.0, 2.1)) - sin((p.x + p.y) * 4.3 + 2.1), sin((p.x - p.y) * 3.7 - ph(1.0, 0.9)) - sin((p.x - p.y) * 3.7 - 0.9));
  w += 0.018 * vec2(cos(p.y * 6.1 + p.x * 2.0 - ph(3.0, 0.5)) - cos(p.y * 6.1 + p.x * 2.0 - 0.5), sin(p.x * 5.3 + ph(2.0, 4.0)) - sin(p.x * 5.3 + 4.0));
  p += w * uFlow;

  float warm = 0.0;
  warm += 1.30 * flowMass(p, vec2(-0.02, 0.36), 1.45, vec2(0.30, 0.17), vec3(1.0, 1.0, 1.0), vec3(0.0, 1.2, 2.0));  // orange, left
  warm += 1.20 * flowMass(p, vec2(1.10, 0.43), 0.15, vec2(0.23, 0.14), vec3(1.0, 2.0, 1.0), vec3(2.4, 0.3, 4.1));   // orange, right
  warm += 0.55 * flowMass(p, vec2(0.20, 0.04), 0.00, vec2(0.32, 0.12), vec3(2.0, 1.0, 1.0), vec3(3.3, 5.0, 0.7));   // yellow, top left
  warm += 0.45 * flowMass(p, vec2(0.58, 0.11), 0.90, vec2(0.11, 0.05), vec3(1.0, 1.0, 2.0), vec3(1.1, 2.7, 3.0));   // yellow, top middle
  warm += 0.55 * flowMass(p, vec2(1.25, 0.15), -0.50, vec2(0.13, 0.16), vec3(1.0, 2.0, 1.0), vec3(4.4, 0.8, 5.9)); // yellow, top right
  warm += 0.60 * flowMass(p, vec2(1.30, 0.90), 0.80, vec2(0.13, 0.17), vec3(2.0, 1.0, 3.0), vec3(1.0, 2.2, 5.2));   // yellow, bottom right

  float cool = 0.0;
  cool += 1.30 * flowMass(p, vec2(0.37, 0.34), 0.95, vec2(0.21, 0.085), vec3(1.0, 1.0, 1.0), vec3(1.6, 3.9, 1.3));   // blue river, top
  cool += 0.95 * flowMass(p, vec2(0.55, 0.58), 0.90, vec2(0.27, 0.11), vec3(1.0, 2.0, 1.0), vec3(0.5, 4.7, 3.4));   // blue river, middle
  cool += 1.15 * flowMass(p, vec2(0.78, 0.93), 0.60, vec2(0.23, 0.10), vec3(2.0, 1.0, 2.0), vec3(5.5, 2.8, 0.1));   // blue river, bottom
  cool += 0.90 * flowMass(p, vec2(0.85, 0.04), 0.30, vec2(0.14, 0.10), vec3(1.0, 1.0, 2.0), vec3(3.0, 1.9, 4.3));   // blue, top
  cool += 0.45 * flowMass(p, vec2(0.72, 0.22), 2.20, vec2(0.16, 0.07), vec3(1.0, 1.0, 1.0), vec3(4.8, 1.4, 2.9));   // pale blue, joining top and centre
  cool += 0.35 * flowMass(p, vec2(1.02, 0.72), -0.30, vec2(0.17, 0.07), vec3(3.0, 1.0, 1.0), vec3(2.2, 0.4, 3.7)); // blue-grey, right
  cool += 0.30 * flowMass(p, vec2(0.12, 0.72), 0.50, vec2(0.19, 0.10), vec3(1.0, 2.0, 1.0), vec3(1.0, 5.0, 2.6));   // blue-grey, left

  // A soft curve instead of a hard clip, so blue and orange keep shifting tone inside their
  // areas (deeper at the cores) rather than flattening out.
  float x = clamp(1.25 * (warm - cool), -4.0, 4.0);
  float e2 = exp(2.0 * x);
  return (e2 - 1.0) / (e2 + 1.0);
}

${glslPalette}
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  uv.y = 1.0 - uv.y;
  vec2 p = vec2(uv.x * uResolution.x / uResolution.y, uv.y);

  float v = field(p);
  // The field's slope, for the glassy light on each boundary.
  float e = 0.004;
  vec2 slope = vec2(field(p + vec2(e, 0.0)) - v, field(p + vec2(0.0, e)) - v) / e;

  vec3 color = palette(v);

  // Milky light where the colours meet: a bright band on the boundary and a fainter echo
  // just inside the blue, like light bent twice through moving glass.
  float band = 0.12 * uBand;
  color = mix(color, ${glsl('milk')}, 0.55 * exp(-pow(v / band, 2.0)));
  color += 0.05 * exp(-pow((v + 0.30) / (0.45 * band), 2.0));
  float steep = smoothstep(0.5, 5.0, length(slope));
  color += 0.035 * steep * dot(normalize(slope + 1e-5), normalize(vec2(-0.6, -0.8)));

  // Grain: a fixed speckle about one CSS pixel across, stronger in the light areas.
  float grain = hash(floor(gl_FragCoord.xy / max(1.0, uPixelRatio))) - 0.5;
  float light = dot(color, vec3(0.299, 0.587, 0.114));
  color += grain * uGrain * (0.5 + 0.8 * light);

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

type Props = {
  width: number;
  height: number;
  /** Seconds into the loop. Given: the caller drives the clock (the lab's timeline). Omitted: it runs itself. */
  time?: number;
  settings?: Partial<BackgroundSettings>;
  /** Called after each frame with the canvas, e.g. to copy it into the glass lens. */
  onFrame?: (canvas: HTMLCanvasElement) => void;
  className?: string;
};

export default function AnimatedBackground({ width, height, time, settings, onFrame, className }: Props) {
  const s = { ...backgroundDefaults, ...settings };
  const canvasRef = useShaderCanvas({
    fragment: FRAGMENT,
    width,
    height,
    maxPixelRatio: 2,
    time,
    onFrame,
    redrawKey: `${s.Flow} ${s.Band} ${s.Grain}`,
    render: ({ gl, canvas, pixelRatio, uniform }, seconds) => {
      gl.uniform2f(uniform('uResolution'), canvas.width, canvas.height);
      gl.uniform1f(uniform('uTime'), ((seconds % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS);
      gl.uniform1f(uniform('uFlow'), s.Flow);
      gl.uniform1f(uniform('uBand'), s.Band);
      gl.uniform1f(uniform('uGrain'), s.Grain);
      gl.uniform1f(uniform('uPixelRatio'), pixelRatio);
    },
  });

  return <canvas ref={canvasRef} className={className} style={{ width, height }} aria-hidden />;
}
