import { useEffect, useRef } from 'react';
import saved from './footerGlass.settings.json';
import { LogoMark, logoPetals } from './transition/LogoMark';

// The footer's glass: a clear octahedron (a diamond) floating in front of the logo, drawn
// in the site's ink, so the mark bends, flips and splits into colour fringes through the
// facets. One WebGL2 fragment shader does everything: it traces each pixel's ray into the
// octahedron (eight planes), refracts it in, bounces it to an exit face, refracts it out,
// and reads the logo where the ray lands on the plane behind, once per colour channel at
// its own index of refraction (the dispersion). The entry face reflects a procedural
// studio (a wide window, three soft boxes, two glints); the exit face adds its own faint
// reflection inside the body. Around the object, the plane carries a soft shadow with a
// brighter caustic core.
//
// The world's unit is UNIT css px at the background plane, whose coordinates map 1:1 to
// canvas pixels, so the logo sits exactly where the DOM would put it and only the glass
// bends it. Pixels within the glass's reach take eight rays each (its outline, facet edges
// and the bent strokes come out smooth); the plane beyond takes one. The loop only runs
// while the footer is near the screen (ContactFooter mounts this through useNearView) and
// the tab is visible.
//
// Every look and motion value is a setting (footerGlass.settings.json, written by the
// dev-only panel in FooterGlassDials.tsx, "Save to local"); glassDefaults documents them.

export const glassDefaults = {
  /** The octahedron: a scale, its half extents in world units, and its place (css px). */
  Shape: { Size: 0.85, Width: 1.1, Height: 1.15, Depth: 1.1, OffsetX: 0, OffsetY: 0 },
  /** The logo behind: its height in world units and its place (css px). */
  Logo: { Size: 2.4, OffsetX: 0, OffsetY: 0 },
  /**
   * Index of refraction, the spread between colour channels, how far behind the glass the
   * logo's plane is (the lens's strength), a milky tint mixed into the view through it,
   * the surface reflection's strength, the glossy sheen, the dark facet-edge lines and the
   * bright rim on them. Round blends the flat facets' normals toward a smooth ellipsoid, so
   * the glass bends like a soft lens rather than a hard prism (the reference's liquid look).
   */
  Glass: { Index: 1.45, Dispersion: 0.004, Distance: 1.4, Milk: 0.3, Tint: '#dfe4e8', Reflection: 1, Sheen: 0.35, Edges: 0, Rim: 0.45, Round: 0.75, Blur: 1.2 },
  /**
   * The light in the glass: Glow is the studio's lights seen refracted through the body,
   * Inner their reflection off the far faces seen from inside, Glints the small sharp
   * highlights of the point lights on the surface.
   */
  Light: { Glow: 0.22, Inner: 0.3, Glints: 1 },
  /** The liquid surface: slow travelling ripples, finer noise, and how fast they flow. */
  Liquid: { Ripple: 0.06, Noise: 0.03, Flow: 1 },
  /** The soft shadow on the plane, the brighter caustic core, and how far below they fall. */
  Shadow: { Shadow: 0.07, Caustic: 0.12, Drop: 0.3 },
  /** The rest pose, in degrees: 45° yaw is edge-on, a vertical edge toward the viewer. */
  Rotation: { Yaw: 45, Pitch: 0, Roll: 0 },
  /**
   * A continuous spin about the vertical axis (rad/s); the sway about the rest yaw (radians)
   * and its speed; how much a scroll adds (rad/px); the small idle lean and cant; the
   * floating: Bob is how far it rises and sinks (world units), Float how fast (rad/s);
   * the pointer's roll and pitch.
   */
  Motion: { Spin: 0.12, Sway: 0.2, Speed: 0.22, Scroll: 0.004, Lean: 0.05, Cant: 0.1, Bob: 0.1, Float: 0.7, PointerRoll: 0.15, PointerPitch: 0.08 },
};
export type GlassSettings = typeof glassDefaults;

type Values = Record<string, Record<string, number | string>>;
/** The saved settings over the defaults (a saved file can be partial or from an older shape). */
export function glassSettings(values: Values = (saved as { values?: Values }).values ?? {}): GlassSettings {
  const result = {} as Record<string, Record<string, number | string>>;
  for (const [group, controls] of Object.entries(glassDefaults)) {
    result[group] = { ...controls };
    for (const [name, fallback] of Object.entries(controls)) {
      const value = values[group]?.[name];
      if (typeof value === typeof fallback) result[group][name] = value;
    }
  }
  return result as GlassSettings;
}

const UNIT = 160;
const MAX_DENSITY = 2;
const CAMERA_Z = 12;

const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0., 1.); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform float uScale;
uniform vec2 uCentre;
uniform float uReach;
uniform mat3 uRot;
uniform vec3 uHalf;
uniform float uTexSize;
uniform vec2 uLogoOffset;
uniform sampler2D uLogo;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform float uCam;
uniform float uBack;
uniform vec3 uIor;
uniform vec3 uTint;
uniform float uMilk;
uniform float uReflect;
uniform float uSheen;
uniform float uEdge;
uniform float uShadow;
uniform float uCaustic;
uniform float uDrop;
uniform float uRim;
uniform float uRound;
uniform float uRipple;
uniform float uNoise;
uniform float uTime;
uniform float uGlow;
uniform float uInner;
uniform float uGlints;
uniform float uLod;

const vec3 S[8] = vec3[8](
  vec3(1., 1., 1.), vec3(1., 1., -1.), vec3(1., -1., 1.), vec3(1., -1., -1.),
  vec3(-1., 1., 1.), vec3(-1., 1., -1.), vec3(-1., -1., 1.), vec3(-1., -1., -1.));

// The convex octahedron |x|/a + |y|/b + |z|/c <= 1 as eight half-spaces N.p <= 1.
bool hitOct(vec3 o, vec3 d, out float tIn, out float tOut, out vec3 nIn, out vec3 nOut) {
  tIn = -1e9; tOut = 1e9; nIn = vec3(0.); nOut = vec3(0.);
  for (int i = 0; i < 8; i++) {
    vec3 N = S[i] / uHalf;
    float nd = dot(N, d), t = (1. - dot(N, o)) / nd;
    if (nd > 0.) { if (t < tOut) { tOut = t; nOut = normalize(N); } }
    else if (nd < 0.) { if (t > tIn) { tIn = t; nIn = normalize(N); } }
  }
  return tIn <= tOut;
}

// Distance from a surface point to the nearest facet edge: the second-smallest slack.
float edgeDistance(vec3 p) {
  float a = 1e9, b = 1e9;
  for (int i = 0; i < 8; i++) {
    vec3 N = S[i] / uHalf;
    float s = abs(1. - dot(N, p)) / length(N);
    if (s < a) { b = a; a = s; } else if (s < b) { b = s; }
  }
  return b;
}

// The shading normal at a surface point: the facet's, rounded toward the ellipsoid's, with
// the liquid's travelling ripples and finer noise laid over it.
vec3 liquidNormal(vec3 p, vec3 facet) {
  vec3 round = normalize(p / (uHalf * uHalf));
  vec3 n = normalize(mix(facet, round, uRound));
  // Broad, slow waves (one or two across the body) and a finer, fainter grain.
  vec3 wave = vec3(
    sin(p.y * 2.6 + uTime * 1.3) * cos(p.z * 2.2 - uTime * 0.9),
    sin(p.z * 2.4 - uTime * 1.1) * cos(p.x * 2.8 + uTime * 0.7),
    sin(p.x * 2.6 + uTime * 0.8) * cos(p.y * 2.2 + uTime * 1.2));
  vec3 grain = vec3(
    sin(p.x * 7.0 + p.y * 5.0 + uTime * 2.0),
    sin(p.y * 6.5 - p.z * 5.5 + uTime * 1.7),
    sin(p.z * 7.5 + p.x * 4.5 - uTime * 2.3));
  return normalize(n + uRipple * 0.12 * wave + uNoise * 0.06 * grain);
}

// A soft rounded-rectangle light seen in direction c. Directions at a grazing angle to it
// are cut off before the projection blows up (the GPU's fast maths turns infinities to NaN).
float softbox(vec3 d, vec3 c, float w, float h, float soft) {
  vec3 u = normalize(cross(c, vec3(0., 1., 0.)));
  vec3 v = cross(u, c);
  float z = dot(d, c);
  if (z <= 0.05) return 0.;
  vec2 q = abs(vec2(dot(d, u), dot(d, v)) / z) - vec2(w, h);
  float sd = length(max(q, 0.)) + min(max(q.x, q.y), 0.);
  return 1. - smoothstep(0., soft, sd);
}

// The studio's soft lights: a wide window, four soft boxes (one facing the glass, so it
// shows as a pale rectangle on facets turned to the viewer) and a low strip.
float softLights(vec3 d) {
  float e = 0.25 * softbox(d, normalize(vec3(-0.3, 0.45, 0.85)), 0.9, 0.55, 1.0);
  e += 0.45 * softbox(d, normalize(vec3(-0.45, 0.75, 0.5)), 0.45, 0.14, 0.35);
  e += 0.35 * softbox(d, normalize(vec3(0.7, 0.25, 0.65)), 0.16, 0.36, 0.35);
  e += 0.3 * softbox(d, normalize(vec3(0.15, 0.15, 0.98)), 0.28, 0.12, 0.3);
  e += 0.18 * softbox(d, normalize(vec3(0.1, -0.55, 0.83)), 0.5, 0.08, 0.45);
  return e;
}
// A small sharp glint of a point light in direction l: exp(-k (1 - cos)), the same peak
// as pow(cos, k) for large k, without pow (which the GPU's fast maths makes NaN at 0).
float glint(vec3 d, vec3 l, float k) { return exp(-k * (1. - min(dot(d, l), 1.))); }
// The point lights.
float glints(vec3 d) {
  float e = 0.7 * glint(d, normalize(vec3(-0.5, 0.7, 0.52)), 500.);
  e += 0.55 * glint(d, normalize(vec3(0.62, 0.5, 0.6)), 320.);
  e += 0.5 * glint(d, normalize(vec3(-0.15, 0.35, 0.92)), 700.);
  e += 0.45 * glint(d, normalize(vec3(0.3, -0.2, 0.93)), 600.);
  e += 0.4 * glint(d, normalize(vec3(-0.7, 0.1, 0.7)), 450.);
  return e * uGlints;
}
float lights(vec3 d) { return softLights(d) + glints(d); }
// The studio the glass reflects: brighter above, plus its lights.
float env(vec3 d) { return mix(0.58, 0.9, smoothstep(-1., 1., d.y)) + lights(d); }

// The plane behind: the logo on the footer, with the glass's shadow and caustic.
vec3 background(vec2 p) {
  vec2 uv = (p - uLogoOffset) / uTexSize + 0.5;
  uv.y = 1. - uv.y;
  float inside = step(0., uv.x) * step(uv.x, 1.) * step(0., uv.y) * step(uv.y, 1.);
  // An explicit mip level: the logo's own on-screen level plus the Blur setting, which
  // softens it as seen through the glass. (Implicit levels need screen derivatives, which
  // the rays' branching leaves undefined.)
  float a = textureLod(uLogo, uv, uLod).a * inside;
  vec3 c = mix(uPaper, uInk, a);
  vec2 q = (p - vec2(0., -uDrop)) / vec2(uHalf.x * 1.15, uHalf.y * 0.9);
  float shadow = (1. - smoothstep(0.7, 1.3, length(q))) * uShadow;
  vec2 k = (p - vec2(0.08, -uDrop - 0.45)) / vec2(0.7, 0.34);
  float caustic = (1. - smoothstep(0., 1., length(k))) * uCaustic;
  c *= 1. - shadow;
  return mix(c, vec3(1.), caustic);
}

// A bit-level test for NaN or infinity: the GPU's fast maths may optimise isnan() away.
bool bad(float x) { return (floatBitsToUint(x) & 0x7fffffffu) >= 0x7f800000u; }
float channel(vec3 v, int c) { return c == 0 ? v.r : (c == 1 ? v.g : v.b); }
float schlick(float cosI) { return 0.04 + 0.96 * pow(1. - cosI, 5.); }

// One ray, from a canvas position: the plane behind, or the glass in front of it.
vec3 shade(vec2 pixel) {
  vec2 s = (pixel - uCentre) / uScale;
  vec3 o = vec3(0., 0., uCam);
  vec3 d = normalize(vec3(s, uBack) - o);
  mat3 Ri = transpose(uRot);
  vec3 oo = Ri * o, dd = Ri * d;
  float t0, t1; vec3 n0, n1;
  vec3 paper = background(s);
  if (!hitOct(oo, dd, t0, t1, n0, n1) || t1 < 0.) return paper;

  vec3 p0 = oo + dd * t0;
  vec3 facet0 = n0;
  n0 = liquidNormal(p0, n0);
  // A strongly perturbed normal can face away from the ray; the facet's then stands in.
  if (dot(dd, n0) >= -0.02) n0 = facet0;
  vec3 nw = uRot * n0;
  float cosI = clamp(dot(-dd, n0), 0., 1.);
  float F = min(1., schlick(cosI) * uReflect);
  vec3 mirrored = reflect(d, nw);
  float reflection = env(mirrored);
  // A glossy sheen: the lights show on the surface even face-on, like coated glass.
  float sheen = lights(mirrored);

  vec3 seen = vec3(0.);
  float inner = 0., glow = 0.;
  for (int c = 0; c < 3; c++) {
    float ior = channel(uIor, c);
    vec3 p = p0, dir = refract(dd, n0, 1. / ior), outDir = dir;
    bool escaped = false;
    for (int b = 0; b < 3; b++) {
      float a0, a1; vec3 m0, m1;
      // No exit face (a perturbed normal sent the ray outward): leave along it.
      if (!hitOct(p + dir * 1e-4, dir, a0, a1, m0, m1) || a1 <= 0. || a1 > 1e6) break;
      p += dir * a1;
      m1 = liquidNormal(p, m1);
      if (dot(dir, m1) < 0.) m1 = -m1;
      vec3 r = refract(dir, -m1, ior);
      if (c == 1 && b == 0) inner = env(uRot * reflect(dir, -m1)) * schlick(clamp(dot(-dir, -m1), 0., 1.));
      if (dot(r, r) > 0.) { outDir = r; escaped = true; break; }
      dir = reflect(dir, -m1);
    }
    if (!escaped) outDir = dir;
    vec3 pw = uRot * p, dw = uRot * outDir;
    // The lights seen through the glass, where the refracted view points at them.
    if (c == 1) glow = lights(dw);
    float value;
    if (dw.z < 0.) {
      float tb = (uBack - pw.z) / dw.z;
      value = channel(background(pw.xy + dw.xy * tb), c);
    } else {
      value = env(dw);
    }
    seen[c] = value;
  }

  // The body: the view through it, the milk, the inner glint, then the surface.
  vec3 col = mix(seen, uTint, uMilk);
  col += vec3(inner) * uInner;
  col += vec3(glow) * uGlow;
  col = mix(col, vec3(reflection), F);
  col += vec3(sheen) * uSheen;
  // Facet edges: thin darker lines like cut glass, and a wide soft glow catching the light.
  float slack = edgeDistance(p0);
  float edge = 1. - smoothstep(0., 0.035, slack);
  float glowEdge = 1. - smoothstep(0., 0.16, slack);
  col *= 1. - uEdge * edge;
  col += uRim * 0.5 * glowEdge * glowEdge * (0.6 + 0.4 * dot(facet0, vec3(0., 0.6, 0.8)));
  // Whatever still went wrong must not paint black: the tinted body stands in.
  if (bad(col.r) || bad(col.g) || bad(col.b)) return mix(paper, uTint, 0.5);
  return col;
}

// An 8-rooks pattern within the glass's reach; one ray beyond it.
const vec2 TAPS[8] = vec2[8](
  vec2(0.0625, -0.4375), vec2(-0.0625, 0.4375), vec2(0.3125, 0.1875), vec2(-0.3125, -0.1875),
  vec2(0.4375, -0.0625), vec2(-0.4375, 0.0625), vec2(0.1875, 0.3125), vec2(-0.1875, -0.3125));
void main() {
  if (length(gl_FragCoord.xy - uCentre) > uReach) { fragColor = vec4(shade(gl_FragCoord.xy), 1.); return; }
  vec3 col = vec3(0.);
  for (int i = 0; i < 8; i++) col += shade(gl_FragCoord.xy + TAPS[i]);
  fragColor = vec4(col * 0.125, 1.);
}`;

// The logo rasterised for the shader: the petals, in white, on a transparent square with
// one logo-unit of margin (the tips reach just past Figma's box). Only the alpha is read.
const TEXTURE_SIZE = 1024;
const TEXTURE_UNITS = 16;
function logoTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = TEXTURE_SIZE;
  const context = canvas.getContext('2d')!;
  const scale = TEXTURE_SIZE / TEXTURE_UNITS;
  context.setTransform(scale, 0, 0, scale, scale, scale);
  context.fillStyle = '#fff';
  for (const petal of logoPetals) context.fill(new Path2D(petal.d));
  return canvas;
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader');
  return shader;
}

const hex = (value: string): [number, number, number] => {
  const match = /^#([0-9a-f]{6})$/i.exec(value.trim());
  if (!match) return [0.94, 0.94, 0.94];
  return [0, 2, 4].map(i => parseInt(match[1].slice(i, i + 2), 16) / 255) as [number, number, number];
};
const radians = (degrees: number) => degrees * Math.PI / 180;

// Object → world rotation, column-major: R = Rz(roll) · Rx(pitch) · Ry(yaw).
function rotation(yaw: number, pitch: number, roll: number) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
  return new Float32Array([
    cr * cy + sr * sp * sy, sr * cy - cr * sp * sy, -cp * sy,
    -sr * cp, cr * cp, sp,
    cr * sy - sr * sp * cy, sr * sy + cr * sp * cy, cp * cy,
  ]);
}

/**
 * `anchor` is the element the glass centres on (the pill). `settings` overrides the saved
 * values live (the dev panel); without it the saved values apply.
 */
export default function FooterGlass({ anchor, settings }: { anchor: React.RefObject<HTMLElement | null>; settings?: GlassSettings }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallback = useRef<HTMLDivElement>(null);
  const live = useRef(settings ?? glassSettings());
  live.current = settings ?? live.current;
  // A single frame on demand (reduced motion, where no loop runs, still shows dial changes).
  const redraw = useRef<() => void>(() => undefined);
  useEffect(() => { redraw.current(); }, [settings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const area = canvas?.parentElement;
    if (!canvas || !area) return;
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power' });
    if (!gl) { fallback.current?.removeAttribute('hidden'); return; }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const program = gl.createProgram()!;
    try {
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    } catch (error) {
      // A GPU that can't run the shader shows the logo alone, like one without WebGL2.
      console.warn('FooterGlass: shader unavailable.', error);
      fallback.current?.removeAttribute('hidden');
      return;
    }
    gl.linkProgram(program);
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, logoTexture());
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const styles = getComputedStyle(document.documentElement);
    gl.uniform3fv(u('uInk'), hex(styles.getPropertyValue('--color-ink').trim() || '#1b1b1b'));
    gl.uniform3fv(u('uPaper'), hex(styles.getPropertyValue('--color-footer').trim() || '#fafafa'));
    gl.uniform1f(u('uCam'), CAMERA_Z);
    gl.uniform1i(u('uLogo'), 0);
    const uScale = u('uScale'), uCentre = u('uCentre'), uReach = u('uReach'), uRot = u('uRot'), uHalf = u('uHalf');
    const uTexSize = u('uTexSize'), uLogoOffset = u('uLogoOffset'), uBack = u('uBack'), uIor = u('uIor'), uTint = u('uTint');
    const uMilk = u('uMilk'), uReflect = u('uReflect'), uSheen = u('uSheen'), uEdge = u('uEdge');
    const uShadow = u('uShadow'), uCaustic = u('uCaustic'), uDrop = u('uDrop');
    const uRim = u('uRim'), uRound = u('uRound'), uRipple = u('uRipple'), uNoise = u('uNoise'), uTime = u('uTime');
    const uGlow = u('uGlow'), uInner = u('uInner'), uGlints = u('uGlints'), uLod = u('uLod');

    // Size follows the footer; the object is centred in the open space above the pill
    // (the anchor). Narrow screens scale the unit down so the diamond keeps fitting.
    let density = 1, unit = UNIT, width = 1, height = 1, cx = 0, cy = 0;
    const resize = () => {
      const box = area.getBoundingClientRect();
      density = Math.min(window.devicePixelRatio || 1, MAX_DENSITY);
      width = box.width;
      height = box.height;
      canvas.width = Math.max(1, Math.round(width * density));
      canvas.height = Math.max(1, Math.round(height * density));
      gl.viewport(0, 0, canvas.width, canvas.height);
      unit = Math.min(UNIT, width / 2.9);
      const target = anchor.current?.getBoundingClientRect();
      cx = width / 2;
      cy = (target ? target.top - box.top : height) / 2;
    };

    let phase = 0.8, spin = 0, flow = 0, floating = 0, pitch = 0, pitchTarget = 0, roll = 0, rollTarget = 0;
    let frame = 0, last = 0, lastScroll = window.scrollY;
    const draw = () => {
      const s = live.current;
      const half = [s.Shape.Width * s.Shape.Size, s.Shape.Height * s.Shape.Size, s.Shape.Depth * s.Shape.Size];
      const back = -s.Glass.Distance;
      // The glass's furthest possible extent on screen: its longest half-diagonal, as the
      // camera magnifies it in front of the plane, with a margin.
      const reach = Math.hypot(...half) * (CAMERA_Z - back) / CAMERA_Z * 1.08 + 0.05;
      // Floating: an easy rise and sink on its own clock, separate from the sway.
      const bob = s.Motion.Bob * Math.sin(floating);
      // Offsets are css px, y downward; the shader's y is upward.
      const centreY = height - cy - s.Shape.OffsetY + bob * unit;
      gl.uniform1f(uScale, unit * density);
      gl.uniform2f(uCentre, (cx + s.Shape.OffsetX) * density, centreY * density);
      gl.uniform1f(uReach, reach * unit * density);
      gl.uniform3fv(uHalf, half);
      gl.uniform1f(uTexSize, s.Logo.Size * TEXTURE_UNITS / 14);
      gl.uniform2f(uLogoOffset, (s.Logo.OffsetX - s.Shape.OffsetX) / unit, (s.Shape.OffsetY - s.Logo.OffsetY) / unit - bob);
      gl.uniform1f(uBack, back);
      gl.uniform3f(uIor, s.Glass.Index - s.Glass.Dispersion, s.Glass.Index, s.Glass.Index + s.Glass.Dispersion);
      gl.uniform3fv(uTint, hex(s.Glass.Tint));
      gl.uniform1f(uMilk, s.Glass.Milk);
      gl.uniform1f(uReflect, s.Glass.Reflection);
      gl.uniform1f(uSheen, s.Glass.Sheen);
      gl.uniform1f(uEdge, s.Glass.Edges);
      gl.uniform1f(uShadow, s.Shadow.Shadow);
      gl.uniform1f(uCaustic, s.Shadow.Caustic);
      gl.uniform1f(uDrop, s.Shadow.Drop);
      gl.uniform1f(uRim, s.Glass.Rim);
      gl.uniform1f(uRound, s.Glass.Round);
      gl.uniform1f(uRipple, s.Liquid.Ripple);
      gl.uniform1f(uNoise, s.Liquid.Noise);
      gl.uniform1f(uTime, flow);
      gl.uniform1f(uGlow, s.Light.Glow);
      gl.uniform1f(uInner, s.Light.Inner);
      gl.uniform1f(uGlints, s.Light.Glints);
      const texturePx = s.Logo.Size * TEXTURE_UNITS / 14 * unit * density;
      gl.uniform1f(uLod, Math.max(0, Math.log2(TEXTURE_SIZE / texturePx) + s.Glass.Blur));
      const yaw = radians(s.Rotation.Yaw) + spin + s.Motion.Sway * Math.sin(phase);
      const lean = s.Motion.Lean * Math.sin(phase * 0.7 + 1.2);
      const cant = s.Motion.Cant * Math.sin(phase * 0.5 + 2.4);
      gl.uniformMatrix3fv(uRot, false, rotation(yaw, radians(s.Rotation.Pitch) + pitch + lean, radians(s.Rotation.Roll) + roll + cant));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    resize();
    const observer = new ResizeObserver(() => { resize(); if (reducedMotion) draw(); });
    observer.observe(area);
    redraw.current = () => { if (!frame) draw(); };
    if (reducedMotion) { draw(); return () => { observer.disconnect(); redraw.current = () => undefined; }; }

    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      phase += live.current.Motion.Speed * dt;
      spin += live.current.Motion.Spin * dt;
      floating += live.current.Motion.Float * dt;
      flow += live.current.Liquid.Flow * dt;
      pitch += (pitchTarget - pitch) * (1 - Math.exp(-dt / 0.18));
      roll += (rollTarget - roll) * (1 - Math.exp(-dt / 0.18));
      draw();
      frame = requestAnimationFrame(tick);
    };
    const start = () => { if (!frame && !document.hidden) { last = 0; frame = requestAnimationFrame(tick); } };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; };
    const onScroll = () => {
      const y = window.scrollY;
      phase += (y - lastScroll) * live.current.Motion.Scroll;
      lastScroll = y;
    };
    const onPointer = (event: PointerEvent) => {
      const box = area.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      pitchTarget = y * live.current.Motion.PointerPitch;
      rollTarget = -x * live.current.Motion.PointerRoll;
    };
    const onLeave = () => { pitchTarget = 0; rollTarget = 0; };
    const onVisibility = () => (document.hidden ? stop() : start());
    window.addEventListener('scroll', onScroll, { passive: true });
    area.addEventListener('pointermove', onPointer);
    area.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
    start();
    return () => {
      stop();
      redraw.current = () => undefined;
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      area.removeEventListener('pointermove', onPointer);
      area.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      // Free the GPU resources, but keep the context: the canvas may mount again (StrictMode
      // in development, or the footer coming back into reach), and getContext() would then
      // return this same context, dead for good had it been lost.
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [anchor]);

  return <>
    <canvas ref={canvasRef} className="contact-glass" aria-hidden="true" />
    {/* Without WebGL2: the logo alone, where the glass would have been. */}
    <div ref={fallback} className="contact-glass-fallback" hidden aria-hidden="true"><LogoMark size={live.current.Logo.Size * UNIT} color="var(--color-ink)" /></div>
  </>;
}
