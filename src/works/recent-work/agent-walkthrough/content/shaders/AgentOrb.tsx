import savedOrb from '../../orb/settings.json';
import { LOOP_SECONDS } from './AnimatedBackground';
import { glsl, glslColor, glslPaletteFn, hex, rgb, type PaletteShift } from './palette';
import { useShaderCanvas } from './useShaderCanvas';

/**
 * The agent avatar as a live nebula orb, after MetalForge's "Nebula Orb" (same controls and
 * defaults), painted in the background's colours: a blue nebula in a glass sphere, lit from a
 * cream-white core that wanders through it, warming to yellow at its hottest. Two colour inputs,
 * Blue and Yellow, move each colour family together. It spins, churns and wanders on whole
 * cycles of LOOP_SECONDS, so at Speed 1 it loops with the background.
 */
export const metalForgeDefaults = {
  Bloom: 1,
  Exposure: 1,
  Speed: 1,
  Radius: 0.72,
  Density: 1.35,
  CoreX: 0.2,
  CoreY: 0.14,
  CoreSize: 9,
  RimStrength: 1,
  EdgeSoftness: 0.005,
  Glow: 0,
};

/** Added to MetalForge's set: the two colour inputs, and how far the core wanders. */
export const orbExtras = {
  Blue: hex('blue'),
  Yellow: hex('yellow'),
  Wander: 0.6,
};
const baseDefaults = { ...metalForgeDefaults, ...orbExtras };
export type OrbSettings = typeof baseDefaults;

/**
 * The orb's settings: MetalForge's defaults, then the values saved from the orb's own lab page
 * (agent-walkthrough/orb, "Save to local"). The card and the website use these.
 */
const saved = (savedOrb as { values?: Record<string, Partial<OrbSettings>> }).values ?? {};
export const orbDefaults: OrbSettings = { ...baseDefaults, ...saved['Orb Colour'], ...saved['Orb Motion'], ...saved['Orb Shape'], ...saved['Orb Edge'] };

/** Reads the orb's dial groups out of the lab's values. */
export function orbSettings(values?: Record<string, Record<string, number | string>>): OrbSettings {
  return { ...orbDefaults, ...values?.['Orb Colour'], ...values?.['Orb Motion'], ...values?.['Orb Shape'], ...values?.['Orb Edge'] };
}

/** The uniforms that carry the Blue and Yellow inputs into the palette. */
const SHIFT: PaletteShift = { cool: 'uBlueShift', warm: 'uYellowShift' };
const BASE_BLUE = rgb(hex('blue'));
const BASE_YELLOW = rgb(hex('yellow'));

const FRAGMENT = `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uRadius;
uniform float uDensity;
uniform vec2 uCore;
uniform float uCoreSize;
uniform float uRim;
uniform float uBloom;
uniform float uExposure;
uniform float uEdgeSoftness;
uniform float uGlow;
uniform float uWander;
uniform vec3 uBlueShift;
uniform vec3 uYellowShift;

#define TAU 6.28318530718
const float LOOP = ${LOOP_SECONDS.toFixed(1)};

// A phase that turns k whole times per loop.
float ph(float k, float offset) { return TAU * k * uTime / LOOP + offset; }

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}

// Three soft octaves only: large, smooth cloud forms with no fine speckle at avatar size.
float fbm(vec3 p) {
  float sum = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 4; octave++) {
    sum += amplitude * noise(p);
    p = p * 2.0 + vec3(1.7, 9.2, 5.3);
    amplitude *= 0.48;
  }
  return sum / 0.9255;
}

// The sphere spins once per loop about a tilted axis.
vec3 spin(vec3 p) {
  float a = ph(1.0, 0.0);
  float c = cos(a), s = sin(a);
  p = vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  float tilt = 0.35;
  float ct = cos(tilt), st = sin(tilt);
  return vec3(p.x, ct * p.y - st * p.z, st * p.y + ct * p.z);
}

// Soft cloud cover at q inside the unit sphere. A slow warp on closed loops folds the clouds,
// so they reform as they turn instead of sliding past. On top, fine filaments (ridged noise,
// like gas wisps) that follow the same fold. Each filament octave fades in only once its
// features are a few screen pixels wide (footprint = sphere units per pixel): the large orb
// shows every wisp, the avatar keeps just the ones that render cleanly, never grit.
float clouds(vec3 q, float footprint) {
  vec3 p = spin(q) * 1.8;
  vec3 drift = 0.35 * vec3(sin(ph(1.0, 0.4)), cos(ph(1.0, 1.9)), sin(ph(2.0, 3.1)));
  float fold = fbm(p * 0.8 + drift);
  vec3 w = p + 1.4 * (fold - 0.5) + 0.5 * drift.yzx;
  float cover = fbm(w);

  vec3 f = w * 2.3 + vec3(3.1, 7.7, 1.3);
  float frequency = 1.8 * 2.3;
  float amplitude = 0.22;
  for (int octave = 0; octave < 4; octave++) {
    float visible = smoothstep(2.0, 5.0, 1.0 / (frequency * footprint));
    float ridge = 1.0 - abs(2.0 * noise(f) - 1.0);
    cover += amplitude * visible * (ridge * ridge - 0.45);
    f = f * 2.03 + vec3(1.3, 4.1, 2.7);
    frequency *= 2.03;
    amplitude *= 0.6;
  }
  return cover;
}

// Where the core is now: its Core X/Y, plus a slow looping path (a few whole cycles per loop, at
// different rates, so it never retraces the same line twice in a row). Wander scales the path;
// the core stays inside the sphere's face. At the start of the loop it sits at Core X/Y.
vec2 corePosition() {
  vec2 path = vec2(sin(ph(1.0, 0.3)) + 0.35 * sin(ph(3.0, 1.1)), 0.8 * cos(ph(2.0, 0.7)) + 0.3 * sin(ph(1.0, 2.4)));
  vec2 start = vec2(sin(0.3) + 0.35 * sin(1.1), 0.8 * cos(0.7) + 0.3 * sin(2.4));
  vec2 c = uCore + uWander * 0.45 * (path - start);
  float reach = length(c);
  return reach > 0.62 ? c * (0.62 / reach) : c;
}

${glslPaletteFn(SHIFT)}
void main() {
  vec2 uv = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
  float r = length(uv);
  float pixel = 2.0 / uResolution.y;
  vec2 s = uv / uRadius;
  float rs = length(s);
  // Pixels on the anti-aliased edge sit just outside the sphere; shade them as its rim.
  if (rs > 0.999) { s *= 0.999 / rs; rs = 0.999; }
  float nz = sqrt(max(0.0, 1.0 - rs * rs));
  vec3 normal = vec3(s, nz);

  // --- The sphere: a blue nebula lit from a cream-white core. ---
  // Colours come from the background's ramp, but only along its cool run (deep blue -> blue ->
  // pale blue -> cream) plus the next step warm (pale yellow) at the hottest point. Neighbouring
  // colours only, so the light fades smoothly with no rings.
  vec2 core = corePosition();
  // The core's size breathes a little as it moves.
  float coreSize = uCoreSize * (1.0 + 0.12 * sin(ph(3.0, 2.2)) * uWander);
  vec2 fromCore = s - core;
  float d2 = dot(fromCore, fromCore);
  float hot = exp(-coreSize * d2);
  float wide = exp(-coreSize * 0.25 * d2);

  // Soft clouds at two depths drift across the light as darker blue veils. No thresholds: the
  // cover shades continuously, so the wisps stay soft at any size.
  float footprint = pixel / uRadius;
  float cover = 0.6 * clouds(vec3(s, nz * 0.6), footprint) + 0.4 * clouds(vec3(s, -nz * 0.2), footprint);
  float veil = clamp((cover - 0.30) * 1.8, 0.0, 1.0);
  veil = 1.0 - exp(-veil * uDensity * 1.4);

  // The core light: a hot centre and a broad glow that reaches most of the sphere.
  float glow = exp(-coreSize * 0.10 * d2);
  float breathe = 1.0 + 0.06 * sin(ph(2.0, 0.6));
  float light = breathe * (0.62 * glow * (1.0 - 0.7 * veil) + 0.55 * wide * (1.0 - 0.55 * veil) + 0.5 * hot * (1.0 - 0.25 * veil));
  light = clamp(light, 0.0, 1.0);
  // Deep blue in shadow, through blue and pale blue, to cream in the light; pale yellow at the
  // hottest point. The veils also darken the body on their own, so the clouds read everywhere.
  float v = mix(-1.0, 0.0, pow(light, 0.8)) - 0.28 * veil * (1.0 - light) + 0.3 * hot * hot;
  vec3 color = palette(v);
  color += 0.10 * uBloom * hot * ${glslColor('paleYellow', SHIFT)};
  // Cloud edges catch the core's light: a cream lining where a veil thins out near the core.
  color = mix(color, ${glslColor('cream', SHIFT)}, 0.45 * wide * veil * (1.0 - veil) * 4.0 * (1.0 - hot));

  // Depth: a touch darker towards the limb, then glass: a soft sheen and a luminous rim.
  color *= mix(0.9, 1.0, sqrt(nz));
  vec2 sheen = s - vec2(-0.38, 0.46);
  color = mix(color, ${glsl('milk')}, 0.2 * exp(-dot(sheen, sheen) * 7.0));
  float fresnel = pow(1.0 - nz, 2.5) * uRim;
  float coreSide = 0.5 + 0.5 * dot(normalize(s + 1e-5), normalize(core + 1e-5));
  vec3 rim = mix(mix(${glslColor('paleBlue', SHIFT)}, ${glslColor('paleYellow', SHIFT)}, coreSide), ${glsl('milk')}, 0.4);
  color = mix(color, rim, clamp(fresnel * 0.7, 0.0, 1.0));
  // A crisp glass highlight, and a fine bright line on the very edge that keeps the outline clean.
  vec3 halfway = normalize(normalize(vec3(-0.45, 0.6, 0.66)) + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(normal, halfway), 0.0), 70.0);
  color = mix(color, ${glsl('milk')}, 0.7 * spec);
  float edgeLine = smoothstep(1.0 - 2.5 * footprint, 1.0 - 0.5 * footprint, rs);
  color = mix(color, ${glsl('milk')}, 0.35 * edgeLine * uRim);

  color *= uExposure;
  color = color / (1.0 + max(color - 1.0, 0.0));

  // --- Edge: coverage, halo and edge glow. ---
  float soft = uEdgeSoftness + pixel;
  float body = 1.0 - smoothstep(uRadius - soft, uRadius + soft, r);

  float outside = max(r - uRadius, 0.0);
  float fade = 1.0 - smoothstep(0.82, 1.0, r);
  vec2 dir = normalize(uv + 1e-5);
  float haloSide = 0.5 + 0.5 * dot(dir, normalize(core + 1e-5));
  vec3 haloColor = mix(${glslColor('steelBlue', SHIFT)}, ${glslColor('amber', SHIFT)}, haloSide);
  float halo = uBloom * 0.22 * exp(-outside / 0.08) * fade * (0.6 + 0.4 * haloSide);

  float ring = uGlow * 0.6 * exp(-abs(r - uRadius) / 0.02) * fade;
  vec3 ringColor = ${glslColor('orange', SHIFT)};

  // Premultiplied: the orb over its halo, the edge glow on top.
  float haloAlpha = clamp(halo, 0.0, 1.0) * (1.0 - body);
  vec3 rgb = color * body + haloColor * haloAlpha + ringColor * ring;
  float alpha = clamp(body + haloAlpha + ring, 0.0, 1.0);
  gl_FragColor = vec4(min(rgb, vec3(alpha)), alpha);
}
`;

type Props = {
  /** The orb's diameter in CSS px at the default Radius (the avatar's 31.701). */
  size: number;
  /** Seconds. Given, the lab's timeline drives it; omitted, it runs its own clock. */
  time?: number;
  settings?: Partial<OrbSettings>;
  className?: string;
};

export default function AgentOrb({ size, time, settings, className }: Props) {
  const s = { ...orbDefaults, ...settings };
  // The canvas leaves room around the orb for its halo: at MetalForge's Radius (0.72) the orb
  // fills `size`, so a larger Radius grows the orb into that room.
  const canvasSize = size / metalForgeDefaults.Radius;
  const canvasRef = useShaderCanvas({
    fragment: FRAGMENT,
    width: canvasSize,
    height: canvasSize,
    maxPixelRatio: 4,
    transparent: true,
    time,
    redrawKey: Object.values(s).join(' '),
    render: ({ gl, canvas, uniform }, seconds) => {
      gl.uniform2f(uniform('uResolution'), canvas.width, canvas.height);
      gl.uniform1f(uniform('uTime'), seconds * s.Speed);
      gl.uniform1f(uniform('uRadius'), s.Radius);
      gl.uniform1f(uniform('uDensity'), s.Density);
      gl.uniform2f(uniform('uCore'), s.CoreX, s.CoreY);
      gl.uniform1f(uniform('uCoreSize'), s.CoreSize);
      gl.uniform1f(uniform('uRim'), s.RimStrength);
      gl.uniform1f(uniform('uBloom'), s.Bloom);
      gl.uniform1f(uniform('uExposure'), s.Exposure);
      gl.uniform1f(uniform('uEdgeSoftness'), s.EdgeSoftness);
      gl.uniform1f(uniform('uGlow'), s.Glow);
      gl.uniform1f(uniform('uWander'), s.Wander);
      // Each input as a shift from the palette's own blue and yellow: zero at the defaults.
      const blue = rgb(s.Blue);
      const yellow = rgb(s.Yellow);
      gl.uniform3f(uniform('uBlueShift'), blue[0] - BASE_BLUE[0], blue[1] - BASE_BLUE[1], blue[2] - BASE_BLUE[2]);
      gl.uniform3f(uniform('uYellowShift'), yellow[0] - BASE_YELLOW[0], yellow[1] - BASE_YELLOW[1], yellow[2] - BASE_YELLOW[2]);
    },
  });

  return <canvas ref={canvasRef} className={className} style={{ width: canvasSize, height: canvasSize }} aria-hidden />;
}
