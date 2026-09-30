import{r as x,j as t,a as Q0}from"./index-BUc1r-YT.js";const d0={"Orb Colour":{Blue:"#1787ee",Yellow:"#dbb82e",Bloom:1,Exposure:1},"Orb Motion":{Speed:1,Wander:.6},"Orb Shape":{Radius:.72,Density:1.6,CoreX:.2,CoreY:.2,CoreSize:3.5,RimStrength:0},"Orb Edge":{EdgeSoftness:0,Glow:.6}},h0={values:d0},K={cream:[.905,.89,.8],milk:[.935,.93,.9],paleBlue:[.64,.725,.78],steelBlue:[.37,.61,.8],blue:[.09,.53,.935],deepBlue:[0,.4,.99],paleYellow:[.9,.86,.6],yellow:[.86,.72,.18],amber:[.86,.555,.02],orange:[.86,.47,0]};function V(e){return`vec3(${K[e].map(o=>o.toFixed(3)).join(", ")})`}function L(e){return`#${K[e].map(o=>Math.round(o*255).toString(16).padStart(2,"0")).join("")}`}function S(e){const o=/^#?([0-9a-f]{6})$/i.exec(e.trim());if(!o)return[0,0,0];const l=parseInt(o[1],16);return[(l>>16&255)/255,(l>>8&255)/255,(l&255)/255]}const u0={deepBlue:["cool",1],blue:["cool",1],steelBlue:["cool",.8],paleBlue:["cool",.5],orange:["warm",1],amber:["warm",1],yellow:["warm",1],paleYellow:["warm",.6],cream:["warm",.15],milk:null};function b(e,o){const l=u0[e];return!o||!l?V(e):`clamp(${V(e)} + ${l[1].toFixed(2)} * ${o[l[0]]}, 0.0, 1.0)`}function J(e){const o=l=>b(l,e);return`
vec3 ramp(vec3 a, vec3 b, float t, float from, float to) {
  return mix(a, b, smoothstep(from, to, t));
}

vec3 palette(float v) {
  vec3 cream = ${o("cream")};
  if (v < 0.0) {
    float t = -v;
    vec3 c = ramp(cream, ${o("paleBlue")}, t, 0.00, 0.16);
    c = ramp(c, ${o("steelBlue")}, t, 0.16, 0.38);
    c = ramp(c, ${o("blue")}, t, 0.38, 0.66);
    return ramp(c, ${o("deepBlue")}, t, 0.66, 1.00);
  }
  vec3 c = ramp(cream, ${o("paleYellow")}, v, 0.00, 0.16);
  c = ramp(c, ${o("yellow")}, v, 0.16, 0.42);
  c = ramp(c, ${o("amber")}, v, 0.42, 0.72);
  return ramp(c, ${o("orange")}, v, 0.72, 1.00);
}
`}const p0=J(),f0=`
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;function U(e,o,l){const Q=e.createShader(o);return Q?(e.shaderSource(Q,l),e.compileShader(Q),e.getShaderParameter(Q,e.COMPILE_STATUS)?Q:(console.error(e.getShaderInfoLog(Q)),e.deleteShader(Q),null)):null}function e0({fragment:e,width:o,height:l,maxPixelRatio:Q,transparent:a=!1,time:r,render:p,onFrame:n,redrawKey:f=""}){const c=x.useRef(null),m=x.useRef(null),d=x.useRef({render:p,onFrame:n,time:r});d.current={render:p,onFrame:n,time:r};const[k,i0]=x.useState(0);return x.useEffect(()=>{const u=c.current,s=u?.getContext("webgl",{antialias:!1,alpha:a,premultipliedAlpha:a});if(!u||!s)return;const R=U(s,s.VERTEX_SHADER,f0),Z=U(s,s.FRAGMENT_SHADER,e),g=s.createProgram();if(!R||!Z||!g||(s.attachShader(g,R),s.attachShader(g,Z),s.linkProgram(g),!s.getProgramParameter(g,s.LINK_STATUS)))return;s.useProgram(g);const q=s.createBuffer();s.bindBuffer(s.ARRAY_BUFFER,q),s.bufferData(s.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),s.STATIC_DRAW);const F=s.getAttribLocation(g,"aPosition");s.enableVertexAttribArray(F),s.vertexAttribPointer(F,2,s.FLOAT,!1,0,0);const y={gl:s,canvas:u,pixelRatio:1,uniform:()=>null},O=()=>{const h=u.getBoundingClientRect(),c0=window.devicePixelRatio||1,T=h.width>0?Math.min(Q,Math.max(1,h.width/o*c0)):y.pixelRatio,B=Math.round(o*T),E=Math.round(l*T);B===u.width&&E===u.height||(u.width=B,u.height=E,y.pixelRatio=T,s.viewport(0,0,B,E))};O();const j=new Map,s0=h=>(j.has(h)||j.set(h,s.getUniformLocation(g,h)),j.get(h)??null);y.uniform=s0;let A=!1,a0=0;const z=h=>{A||(++a0%30===0&&O(),d.current.render(y,h),s.drawArrays(s.TRIANGLE_STRIP,0,4),d.current.onFrame?.(u))};m.current=z,u.dataset.ready="true";let C=0,D=!0;const I=new IntersectionObserver(([h])=>{D=h.isIntersecting});I.observe(u);const n0=window.matchMedia("(prefers-reduced-motion: reduce)").matches,l0=performance.now(),Y=h=>{C=requestAnimationFrame(Y),!(d.current.time!==void 0||!D)&&z(n0?0:(h-l0)/1e3)};z(d.current.time??0),C=requestAnimationFrame(Y);const G=h=>{h.preventDefault(),A=!0,cancelAnimationFrame(C)},W=()=>i0(h=>h+1);return u.addEventListener("webglcontextlost",G),u.addEventListener("webglcontextrestored",W),()=>{cancelAnimationFrame(C),I.disconnect(),u.removeEventListener("webglcontextlost",G),u.removeEventListener("webglcontextrestored",W),m.current=null,delete u.dataset.ready,!A&&(s.deleteProgram(g),s.deleteShader(R),s.deleteShader(Z),s.deleteBuffer(q))}},[e,o,l,Q,a,k]),x.useEffect(()=>{r!==void 0&&m.current?.(r)},[r,f]),c}const H=30,t0={Flow:1,Band:1,Grain:.035},v0=`
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uFlow;
uniform float uBand;
uniform float uGrain;
uniform float uPixelRatio;

#define TAU 6.28318530718
const float LOOP = ${H.toFixed(1)};

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

${p0}
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
  color = mix(color, ${V("milk")}, 0.55 * exp(-pow(v / band, 2.0)));
  color += 0.05 * exp(-pow((v + 0.30) / (0.45 * band), 2.0));
  float steep = smoothstep(0.5, 5.0, length(slope));
  color += 0.035 * steep * dot(normalize(slope + 1e-5), normalize(vec2(-0.6, -0.8)));

  // Grain: a fixed speckle about one CSS pixel across, stronger in the light areas.
  float grain = hash(floor(gl_FragCoord.xy / max(1.0, uPixelRatio))) - 0.5;
  float light = dot(color, vec3(0.299, 0.587, 0.114));
  color += grain * uGrain * (0.5 + 0.8 * light);

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;function m0({width:e,height:o,time:l,settings:Q,onFrame:a,className:r}){const p={...t0,...Q},n=e0({fragment:v0,width:e,height:o,maxPixelRatio:2,time:l,onFrame:a,redrawKey:`${p.Flow} ${p.Band} ${p.Grain}`,render:({gl:f,canvas:c,pixelRatio:m,uniform:d},k)=>{f.uniform2f(d("uResolution"),c.width,c.height),f.uniform1f(d("uTime"),(k%H+H)%H),f.uniform1f(d("uFlow"),p.Flow),f.uniform1f(d("uBand"),p.Band),f.uniform1f(d("uGrain"),p.Grain),f.uniform1f(d("uPixelRatio"),m)}});return t.jsx("canvas",{ref:n,className:r,style:{width:e,height:o},"aria-hidden":!0})}const o0={Bloom:1,Exposure:1,Speed:1,Radius:.72,Density:1.35,CoreX:.2,CoreY:.14,CoreSize:9,RimStrength:1,EdgeSoftness:.005,Glow:0},g0={Blue:L("blue"),Yellow:L("yellow"),Wander:.6},w0={...o0,...g0},M=h0.values??{},r0={...w0,...M["Orb Colour"],...M["Orb Motion"],...M["Orb Shape"],...M["Orb Edge"]};function b0(e){return{...r0,...e?.["Orb Colour"],...e?.["Orb Motion"],...e?.["Orb Shape"],...e?.["Orb Edge"]}}const w={cool:"uBlueShift",warm:"uYellowShift"},$=S(L("blue")),N=S(L("yellow")),x0=`
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
const float LOOP = ${H.toFixed(1)};

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

${J(w)}
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
  color += 0.10 * uBloom * hot * ${b("paleYellow",w)};
  // Cloud edges catch the core's light: a cream lining where a veil thins out near the core.
  color = mix(color, ${b("cream",w)}, 0.45 * wide * veil * (1.0 - veil) * 4.0 * (1.0 - hot));

  // Depth: a touch darker towards the limb, then glass: a soft sheen and a luminous rim.
  color *= mix(0.9, 1.0, sqrt(nz));
  vec2 sheen = s - vec2(-0.38, 0.46);
  color = mix(color, ${V("milk")}, 0.2 * exp(-dot(sheen, sheen) * 7.0));
  float fresnel = pow(1.0 - nz, 2.5) * uRim;
  float coreSide = 0.5 + 0.5 * dot(normalize(s + 1e-5), normalize(core + 1e-5));
  vec3 rim = mix(mix(${b("paleBlue",w)}, ${b("paleYellow",w)}, coreSide), ${V("milk")}, 0.4);
  color = mix(color, rim, clamp(fresnel * 0.7, 0.0, 1.0));
  // A crisp glass highlight, and a fine bright line on the very edge that keeps the outline clean.
  vec3 halfway = normalize(normalize(vec3(-0.45, 0.6, 0.66)) + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(normal, halfway), 0.0), 70.0);
  color = mix(color, ${V("milk")}, 0.7 * spec);
  float edgeLine = smoothstep(1.0 - 2.5 * footprint, 1.0 - 0.5 * footprint, rs);
  color = mix(color, ${V("milk")}, 0.35 * edgeLine * uRim);

  color *= uExposure;
  color = color / (1.0 + max(color - 1.0, 0.0));

  // --- Edge: coverage, halo and edge glow. ---
  float soft = uEdgeSoftness + pixel;
  float body = 1.0 - smoothstep(uRadius - soft, uRadius + soft, r);

  float outside = max(r - uRadius, 0.0);
  float fade = 1.0 - smoothstep(0.82, 1.0, r);
  vec2 dir = normalize(uv + 1e-5);
  float haloSide = 0.5 + 0.5 * dot(dir, normalize(core + 1e-5));
  vec3 haloColor = mix(${b("steelBlue",w)}, ${b("amber",w)}, haloSide);
  float halo = uBloom * 0.22 * exp(-outside / 0.08) * fade * (0.6 + 0.4 * haloSide);

  float ring = uGlow * 0.6 * exp(-abs(r - uRadius) / 0.02) * fade;
  vec3 ringColor = ${b("orange",w)};

  // Premultiplied: the orb over its halo, the edge glow on top.
  float haloAlpha = clamp(halo, 0.0, 1.0) * (1.0 - body);
  vec3 rgb = color * body + haloColor * haloAlpha + ringColor * ring;
  float alpha = clamp(body + haloAlpha + ring, 0.0, 1.0);
  gl_FragColor = vec4(min(rgb, vec3(alpha)), alpha);
}
`;function k0({size:e,time:o,settings:l,className:Q}){const a={...r0,...l},r=e/o0.Radius,p=e0({fragment:x0,width:r,height:r,maxPixelRatio:4,transparent:!0,time:o,redrawKey:Object.values(a).join(" "),render:({gl:n,canvas:f,uniform:c},m)=>{n.uniform2f(c("uResolution"),f.width,f.height),n.uniform1f(c("uTime"),m*a.Speed),n.uniform1f(c("uRadius"),a.Radius),n.uniform1f(c("uDensity"),a.Density),n.uniform2f(c("uCore"),a.CoreX,a.CoreY),n.uniform1f(c("uCoreSize"),a.CoreSize),n.uniform1f(c("uRim"),a.RimStrength),n.uniform1f(c("uBloom"),a.Bloom),n.uniform1f(c("uExposure"),a.Exposure),n.uniform1f(c("uEdgeSoftness"),a.EdgeSoftness),n.uniform1f(c("uGlow"),a.Glow),n.uniform1f(c("uWander"),a.Wander);const d=S(a.Blue),k=S(a.Yellow);n.uniform3f(c("uBlueShift"),d[0]-$[0],d[1]-$[1],d[2]-$[2]),n.uniform3f(c("uYellowShift"),k[0]-N[0],k[1]-N[1],k[2]-N[2])}});return t.jsx("canvas",{ref:p,className:Q,style:{width:r,height:r},"aria-hidden":!0})}const X="/assets/background-DeswdmTt.webp",_0="data:image/svg+xml,%3csvg%20preserveAspectRatio='none'%20overflow='visible'%20style='display:%20block;'%20width='10.5671'%20height='10.5671'%20viewBox='0%200%2010.5671%2010.5671'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20id='Frame'%20opacity='0.4'%20clip-path='url(%23clip0_0_30)'%3e%3cg%20id='Vector'%3e%3c/g%3e%3cpath%20id='Vector_2'%20d='M3.96094%202.64196L6.60271%205.28372L3.96094%207.92549'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_0_30'%3e%3crect%20width='10.5671'%20height='10.5671'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e",V0="data:image/svg+xml,%3csvg%20preserveAspectRatio='none'%20overflow='visible'%20style='display:%20block;'%20width='10.5671'%20height='10.5671'%20viewBox='0%200%2010.5671%2010.5671'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20id='Frame'%20clip-path='url(%23clip0_0_33)'%3e%3cg%20id='Vector'%3e%3c/g%3e%3cpath%20id='Vector_2'%20d='M1.32048%203.96286C1.32048%203.72931%201.41326%203.50533%201.5784%203.34019C1.74354%203.17505%201.96752%203.08227%202.20107%203.08227H8.36519C8.59874%203.08227%208.82272%203.17505%208.98786%203.34019C9.153%203.50533%209.24578%203.72931%209.24578%203.96286V7.92551C9.24578%208.15905%209.153%208.38304%208.98786%208.54818C8.82272%208.71332%208.59874%208.8061%208.36519%208.8061H2.20107C1.96752%208.8061%201.74354%208.71332%201.5784%208.54818C1.41326%208.38304%201.32048%208.15905%201.32048%207.92551V3.96286Z'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_3'%20d='M3.52214%203.08175V2.20116C3.52214%201.96762%203.61491%201.74364%203.78006%201.57849C3.9452%201.41335%204.16918%201.32058%204.40273%201.32058H6.1639C6.39745%201.32058%206.62143%201.41335%206.78657%201.57849C6.95172%201.74364%207.04449%201.96762%207.04449%202.20116V3.08175'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_0_33'%3e%3crect%20width='10.5671'%20height='10.5671'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e",H0="data:image/svg+xml,%3csvg%20preserveAspectRatio='none'%20overflow='visible'%20style='display:%20block;'%20width='10.5671'%20height='10.5671'%20viewBox='0%200%2010.5671%2010.5671'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20id='Frame'%20clip-path='url(%23clip0_0_19)'%3e%3cg%20id='Vector'%3e%3c/g%3e%3cpath%20id='Vector_2'%20d='M2.61079%203.05391L3.17216%204.92472M5.64089%207.39433L7.51259%207.95571'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_3'%20d='M5.14519%205.4232L7.68085%202.88754'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_4'%20d='M1.76229%202.42127C1.76229%202.508%201.77937%202.59389%201.81257%202.67401C1.84576%202.75414%201.8944%202.82695%201.95573%202.88828C2.01706%202.9496%202.08987%202.99825%202.16999%203.03144C2.25012%203.06463%202.336%203.08172%202.42273%203.08172C2.50946%203.08172%202.59535%203.06463%202.67547%203.03144C2.7556%202.99825%202.82841%202.9496%202.88974%202.88828C2.95106%202.82695%202.99971%202.75414%203.0329%202.67401C3.06609%202.59389%203.08318%202.508%203.08318%202.42127C3.08318%202.33454%203.06609%202.24866%203.0329%202.16853C2.99971%202.08841%202.95106%202.0156%202.88974%201.95427C2.82841%201.89294%202.7556%201.8443%202.67547%201.81111C2.59535%201.77792%202.50946%201.76083%202.42273%201.76083C2.336%201.76083%202.25012%201.77792%202.16999%201.81111C2.08987%201.8443%202.01706%201.89294%201.95573%201.95427C1.8944%202.0156%201.84576%202.08841%201.81257%202.16853C1.77937%202.24866%201.76229%202.33454%201.76229%202.42127Z'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_5'%20d='M7.48549%202.42127C7.48549%202.59643%207.55507%202.76442%207.67893%202.88828C7.80279%203.01213%207.97077%203.08172%208.14593%203.08172C8.32109%203.08172%208.48908%203.01213%208.61293%202.88828C8.73679%202.76442%208.80637%202.59643%208.80637%202.42127C8.80637%202.24611%208.73679%202.07813%208.61293%201.95427C8.48908%201.83041%208.32109%201.76083%208.14593%201.76083C7.97077%201.76083%207.80279%201.83041%207.67893%201.95427C7.55507%202.07813%207.48549%202.24611%207.48549%202.42127Z'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_6'%20d='M7.48549%208.1454C7.48549%208.32056%207.55507%208.48854%207.67893%208.6124C7.80279%208.73626%207.97077%208.80584%208.14593%208.80584C8.32109%208.80584%208.48908%208.73626%208.61293%208.6124C8.73679%208.48854%208.80637%208.32056%208.80637%208.1454C8.80637%207.97024%208.73679%207.80225%208.61293%207.67839C8.48908%207.55454%208.32109%207.48495%208.14593%207.48495C7.97077%207.48495%207.80279%207.55454%207.67893%207.67839C7.55507%207.80225%207.48549%207.97024%207.48549%208.1454Z'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_7'%20d='M2.34261%208.22474C1.97104%207.85317%201.76229%207.34922%201.76229%206.82374C1.76229%206.29826%201.97104%205.7943%202.34261%205.42273C2.71418%205.05116%203.21814%204.84241%203.74362%204.84241C4.2691%204.84241%204.77305%205.05116%205.14462%205.42273C5.51619%205.7943%205.72494%206.29826%205.72494%206.82374C5.72494%207.34922%205.51619%207.85317%205.14462%208.22474C4.77305%208.59631%204.2691%208.80506%203.74362%208.80506C3.21814%208.80506%202.71418%208.59631%202.34261%208.22474Z'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_0_19'%3e%3crect%20width='10.5671'%20height='10.5671'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e",y0="data:image/svg+xml,%3csvg%20preserveAspectRatio='none'%20overflow='visible'%20style='display:%20block;'%20width='10.5671'%20height='10.5671'%20viewBox='0%200%2010.5671%2010.5671'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20id='Frame'%20clip-path='url(%23clip0_0_12)'%3e%3cg%20id='Vector'%3e%3c/g%3e%3cpath%20id='Vector_2'%20d='M2.02021%208.5486C1.85507%208.38346%201.76229%208.15948%201.76229%207.92593C1.76229%207.69238%201.85507%207.4684%202.02021%207.30326C2.18535%207.13812%202.40933%207.04534%202.64288%207.04534C2.87643%207.04534%203.10041%207.13812%203.26555%207.30326C3.43069%207.4684%203.52347%207.69238%203.52347%207.92593C3.52347%208.15948%203.43069%208.38346%203.26555%208.5486C3.10041%208.71374%202.87643%208.80652%202.64288%208.80652C2.40933%208.80652%202.18535%208.71374%202.02021%208.5486Z'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_3'%20d='M7.04553%207.92593C7.04553%208.15948%207.1383%208.38346%207.30345%208.5486C7.46859%208.71374%207.69257%208.80652%207.92612%208.80652C8.15966%208.80652%208.38364%208.71374%208.54879%208.5486C8.71393%208.38346%208.80671%208.15948%208.80671%207.92593C8.80671%207.69238%208.71393%207.4684%208.54879%207.30326C8.38364%207.13812%208.15966%207.04534%207.92612%207.04534C7.69257%207.04534%207.46859%207.13812%207.30345%207.30326C7.1383%207.4684%207.04553%207.69238%207.04553%207.92593Z'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_4'%20d='M2.64222%205.28446V4.40387C2.64222%203.70323%202.92054%203.03129%203.41597%202.53586C3.9114%202.04043%204.58334%201.7621%205.28398%201.7621C5.98462%201.7621%206.65656%202.04043%207.15199%202.53586C7.64742%203.03129%207.92575%203.70323%207.92575%204.40387V5.28446'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_5'%20d='M6.60557%203.96376L7.92645%205.28464L9.24733%203.96376'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_0_12'%3e%3crect%20width='10.5671'%20height='10.5671'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e",C0="data:image/svg+xml,%3csvg%20preserveAspectRatio='none'%20overflow='visible'%20style='display:%20block;'%20width='11.5577'%20height='11.5577'%20viewBox='0%200%2011.5577%2011.5577'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20id='Frame'%20clip-path='url(%23clip0_0_4)'%3e%3cg%20id='Vector'%3e%3c/g%3e%3cpath%20id='Vector_2'%20d='M5.77785%202.40742V9.14943'%20stroke='white'%20stroke-width='0.963144'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_3'%20d='M8.66728%205.29686L5.77785%202.40742'%20stroke='white'%20stroke-width='0.963144'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_4'%20d='M2.88852%205.29686L5.77795%202.40742'%20stroke='white'%20stroke-width='0.963144'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_0_4'%3e%3crect%20width='11.5577'%20height='11.5577'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e",M0={"inter-600-14":{1:"M0.35 -0.7275V0H0.2205V-0.6114H0.2156L0.0458 -0.4893V-0.6135L0.2058 -0.7275Z"},"inter-400-14":{".":"M0.144 0.0063Q0.1167 0.0063 0.0974 -0.0129Q0.0781 -0.0322 0.0781 -0.0596Q0.0781 -0.0869 0.0974 -0.1062Q0.1167 -0.1255 0.144 -0.1255Q0.1714 -0.1255 0.1907 -0.1062Q0.21 -0.0869 0.21 -0.0596Q0.21 -0.0322 0.1907 -0.0129Q0.1714 0.0063 0.144 0.0063Z",4:"M0.0586 -0.1479V-0.2236L0.377 -0.7275H0.4331V-0.6113H0.3955L0.1577 -0.2354V-0.2295H0.5884V-0.1479ZM0.4009 0V-0.1704L0.4014 -0.2061V-0.7275H0.4897V0Z",A:"M0.0254 0 0.2896 -0.7275H0.397L0.6646 0H0.5669L0.4126 -0.4316Q0.3984 -0.4717 0.3796 -0.5315Q0.3608 -0.5913 0.334 -0.6841H0.3516Q0.3252 -0.5903 0.3059 -0.5295Q0.2866 -0.4688 0.2739 -0.4316L0.124 0ZM0.1582 -0.2031V-0.2842H0.5317V-0.2031Z",B:"M0.0879 0V-0.7275H0.3457Q0.4219 -0.7275 0.4714 -0.7014Q0.521 -0.6753 0.5452 -0.6316Q0.5693 -0.5879 0.5693 -0.5347Q0.5693 -0.4878 0.5527 -0.4573Q0.5361 -0.4268 0.509 -0.4087Q0.4819 -0.3906 0.4502 -0.3818V-0.375Q0.4844 -0.373 0.5183 -0.3516Q0.5522 -0.3301 0.575 -0.2905Q0.5977 -0.251 0.5977 -0.1938Q0.5977 -0.1392 0.5725 -0.0952Q0.5474 -0.0513 0.4937 -0.0256Q0.4399 0 0.354 0ZM0.1807 -0.082H0.3516Q0.4365 -0.082 0.4724 -0.1147Q0.5083 -0.1475 0.5083 -0.1948Q0.5083 -0.2314 0.4897 -0.2622Q0.4712 -0.293 0.4373 -0.3115Q0.4033 -0.3301 0.3564 -0.3301H0.1807ZM0.1807 -0.4082H0.3408Q0.3799 -0.4082 0.4116 -0.4236Q0.4434 -0.439 0.4619 -0.467Q0.4805 -0.4951 0.4805 -0.5327Q0.4805 -0.5801 0.4475 -0.6128Q0.4146 -0.6455 0.3438 -0.6455H0.1807Z",H:"M0.0879 0V-0.7275H0.1807V-0.4131H0.5625V-0.7275H0.6553V0H0.5625V-0.3311H0.1807V0Z",I:"M0.1807 -0.7275V0H0.0879V-0.7275Z",M:"M0.0879 0V-0.7275H0.2197L0.3989 -0.2686Q0.4053 -0.2524 0.4133 -0.2283Q0.4214 -0.2041 0.4304 -0.1758Q0.4395 -0.1475 0.4478 -0.1194Q0.4561 -0.0913 0.4624 -0.0674H0.4419Q0.4487 -0.0898 0.457 -0.1174Q0.4653 -0.145 0.4744 -0.1736Q0.4834 -0.2021 0.4917 -0.2271Q0.5 -0.252 0.5063 -0.2686L0.6831 -0.7275H0.8154V0H0.7241V-0.4155Q0.7241 -0.438 0.7244 -0.4668Q0.7246 -0.4956 0.7253 -0.5273Q0.7261 -0.5591 0.7268 -0.5918Q0.7275 -0.6245 0.728 -0.6553H0.7358Q0.7256 -0.6216 0.7141 -0.5867Q0.7026 -0.5518 0.6917 -0.5193Q0.6807 -0.4868 0.6709 -0.46Q0.6611 -0.4331 0.6543 -0.4155L0.4917 0H0.4111L0.2461 -0.4155Q0.2393 -0.4326 0.23 -0.4587Q0.2207 -0.4849 0.2097 -0.5168Q0.1987 -0.5488 0.187 -0.5842Q0.1753 -0.6196 0.1631 -0.6553H0.1719Q0.1729 -0.6279 0.1736 -0.5962Q0.1743 -0.5645 0.1748 -0.532Q0.1753 -0.4995 0.1758 -0.4695Q0.1763 -0.4395 0.1763 -0.4155V0Z",N:"M0.0879 0V-0.7275H0.1973L0.4932 -0.2622Q0.5049 -0.2441 0.5215 -0.2158Q0.5381 -0.1875 0.5574 -0.1519Q0.5767 -0.1162 0.5952 -0.0757H0.582Q0.5776 -0.1177 0.5757 -0.156Q0.5737 -0.1943 0.5732 -0.2266Q0.5728 -0.2588 0.5728 -0.2812V-0.7275H0.6655V0H0.5552L0.2915 -0.4141Q0.2734 -0.4429 0.2551 -0.4734Q0.2368 -0.5039 0.2134 -0.5457Q0.1899 -0.5874 0.1553 -0.6489H0.1724Q0.1748 -0.5947 0.1768 -0.5488Q0.1787 -0.5029 0.1799 -0.4688Q0.1812 -0.4346 0.1812 -0.415V0Z",O:"M0.3828 0.0098Q0.2896 0.0098 0.2166 -0.0354Q0.1436 -0.0806 0.1016 -0.1643Q0.0596 -0.248 0.0596 -0.3633Q0.0596 -0.479 0.1016 -0.5627Q0.1436 -0.6465 0.2166 -0.6919Q0.2896 -0.7373 0.3828 -0.7373Q0.4761 -0.7373 0.5488 -0.6919Q0.6216 -0.6465 0.6633 -0.5627Q0.7051 -0.479 0.7051 -0.3633Q0.7051 -0.248 0.6633 -0.1643Q0.6216 -0.0806 0.5488 -0.0354Q0.4761 0.0098 0.3828 0.0098ZM0.3828 -0.0762Q0.4478 -0.0762 0.5002 -0.1091Q0.5527 -0.1421 0.5837 -0.2063Q0.6147 -0.2705 0.6147 -0.3633Q0.6147 -0.457 0.5837 -0.5212Q0.5527 -0.5854 0.5002 -0.6184Q0.4478 -0.6514 0.3828 -0.6514Q0.3174 -0.6514 0.2646 -0.6182Q0.2119 -0.585 0.1809 -0.5208Q0.1499 -0.4565 0.1499 -0.3633Q0.1499 -0.2705 0.1809 -0.2065Q0.2119 -0.1426 0.2646 -0.1094Q0.3174 -0.0762 0.3828 -0.0762Z",P:"M0.0879 0V-0.7275H0.3369Q0.4219 -0.7275 0.4768 -0.6965Q0.5317 -0.6655 0.5583 -0.6133Q0.585 -0.561 0.585 -0.4961Q0.585 -0.4312 0.5583 -0.3784Q0.5317 -0.3257 0.4771 -0.2944Q0.4224 -0.2632 0.3374 -0.2632H0.1611V-0.3447H0.333Q0.3906 -0.3447 0.4258 -0.3645Q0.4609 -0.3843 0.4768 -0.4187Q0.4927 -0.4531 0.4927 -0.4961Q0.4927 -0.5391 0.4768 -0.573Q0.4609 -0.6069 0.4255 -0.6265Q0.3901 -0.646 0.332 -0.646H0.1807V0Z",R:"M0.0879 0V-0.7275H0.3369Q0.4219 -0.7275 0.4768 -0.6985Q0.5317 -0.6694 0.5583 -0.6187Q0.585 -0.5679 0.585 -0.5029Q0.585 -0.438 0.5583 -0.3882Q0.5317 -0.3384 0.4771 -0.3103Q0.4224 -0.2822 0.3374 -0.2822H0.1396V-0.3647H0.333Q0.3906 -0.3647 0.4255 -0.3816Q0.4604 -0.3984 0.4766 -0.4294Q0.4927 -0.4604 0.4927 -0.5029Q0.4927 -0.5464 0.4766 -0.5784Q0.4604 -0.6104 0.4253 -0.6282Q0.3901 -0.646 0.332 -0.646H0.1807V0ZM0.5059 0 0.3301 -0.3276H0.4346L0.6133 0Z",S:"M0.3208 0.0127Q0.2422 0.0127 0.1843 -0.0127Q0.1265 -0.0381 0.0938 -0.0837Q0.061 -0.1294 0.0566 -0.1904H0.1519Q0.1558 -0.1494 0.1797 -0.1228Q0.2036 -0.0962 0.241 -0.0833Q0.2783 -0.0703 0.3208 -0.0703Q0.3701 -0.0703 0.4094 -0.0864Q0.4487 -0.1025 0.4717 -0.1318Q0.4946 -0.1611 0.4946 -0.1997Q0.4946 -0.2349 0.4749 -0.2568Q0.4551 -0.2788 0.4224 -0.293Q0.3896 -0.3071 0.3506 -0.3179L0.2627 -0.3428Q0.1748 -0.3677 0.126 -0.4141Q0.0771 -0.4604 0.0771 -0.5327Q0.0771 -0.5942 0.1104 -0.6404Q0.1436 -0.6865 0.2002 -0.7119Q0.2568 -0.7373 0.3271 -0.7373Q0.3989 -0.7373 0.4541 -0.7119Q0.5093 -0.6865 0.5413 -0.6428Q0.5732 -0.5991 0.5752 -0.5439H0.4844Q0.478 -0.5972 0.4336 -0.6262Q0.3892 -0.6553 0.3242 -0.6553Q0.2773 -0.6553 0.2419 -0.6399Q0.2065 -0.6245 0.187 -0.5979Q0.1675 -0.5713 0.1675 -0.5371Q0.1675 -0.499 0.1912 -0.4758Q0.2148 -0.4526 0.2473 -0.4397Q0.2798 -0.4268 0.3062 -0.4194L0.3789 -0.3994Q0.4082 -0.3916 0.4436 -0.3779Q0.479 -0.3643 0.5112 -0.3416Q0.5435 -0.3188 0.5642 -0.2839Q0.585 -0.249 0.585 -0.1982Q0.585 -0.1387 0.554 -0.0908Q0.5229 -0.043 0.4639 -0.0151Q0.4048 0.0127 0.3208 0.0127Z",T:"M0.0479 -0.6455V-0.7275H0.5977V-0.6455H0.3696V0H0.2769V-0.6455Z",V:"M0.293 0 0.0254 -0.7275H0.123L0.2769 -0.2959Q0.29 -0.2588 0.3098 -0.1968Q0.3296 -0.1348 0.356 -0.0439H0.3379Q0.3643 -0.1372 0.3838 -0.198Q0.4033 -0.2588 0.416 -0.2959L0.5659 -0.7275H0.6646L0.3999 0Z",a:"M0.23 0.0127Q0.1782 0.0127 0.136 -0.0068Q0.0938 -0.0264 0.0688 -0.064Q0.0439 -0.1016 0.0439 -0.1553Q0.0439 -0.2021 0.0625 -0.2314Q0.0811 -0.2607 0.1121 -0.2776Q0.1431 -0.2944 0.1807 -0.3027Q0.2183 -0.311 0.2563 -0.3159Q0.3052 -0.3223 0.3359 -0.3257Q0.3667 -0.3291 0.3816 -0.3374Q0.3965 -0.3457 0.3965 -0.3657V-0.3687Q0.3965 -0.4028 0.3838 -0.4265Q0.3711 -0.4502 0.3457 -0.4629Q0.3203 -0.4756 0.2822 -0.4756Q0.2432 -0.4756 0.2153 -0.4634Q0.1875 -0.4512 0.1702 -0.4329Q0.1528 -0.4146 0.144 -0.3955L0.0596 -0.4233Q0.0806 -0.4731 0.1162 -0.5012Q0.1519 -0.5293 0.1948 -0.541Q0.2378 -0.5527 0.2798 -0.5527Q0.3071 -0.5527 0.342 -0.5461Q0.377 -0.5396 0.4094 -0.52Q0.4419 -0.5005 0.4631 -0.4622Q0.4844 -0.4238 0.4844 -0.3599V0H0.3979V-0.0742H0.3921Q0.3828 -0.0552 0.3623 -0.0349Q0.3418 -0.0146 0.3091 -0.001Q0.2764 0.0127 0.23 0.0127ZM0.2451 -0.0649Q0.2939 -0.0649 0.3276 -0.084Q0.3613 -0.103 0.3789 -0.1335Q0.3965 -0.1641 0.3965 -0.1973V-0.2729Q0.3911 -0.2666 0.373 -0.2615Q0.355 -0.2563 0.3318 -0.2524Q0.3086 -0.2485 0.2869 -0.2458Q0.2651 -0.2432 0.2524 -0.2417Q0.2207 -0.2378 0.1931 -0.2283Q0.1655 -0.2188 0.1489 -0.2004Q0.1323 -0.1821 0.1323 -0.1509Q0.1323 -0.1226 0.147 -0.1035Q0.1616 -0.0845 0.187 -0.0747Q0.2124 -0.0649 0.2451 -0.0649Z",b:"M0.3306 0.0117Q0.2788 0.0117 0.2471 -0.0061Q0.2153 -0.0239 0.1982 -0.0466Q0.1812 -0.0693 0.1719 -0.0845H0.1621V0H0.0771V-0.7275H0.165V-0.4585H0.1719Q0.1812 -0.4731 0.1978 -0.4954Q0.2144 -0.5176 0.2456 -0.5352Q0.2769 -0.5527 0.3301 -0.5527Q0.3984 -0.5527 0.4504 -0.5186Q0.5024 -0.4844 0.532 -0.4211Q0.5615 -0.3579 0.5615 -0.2715Q0.5615 -0.1846 0.5322 -0.1211Q0.5029 -0.0576 0.4509 -0.0229Q0.3989 0.0117 0.3306 0.0117ZM0.3174 -0.0669Q0.3687 -0.0669 0.4031 -0.0945Q0.4375 -0.1221 0.4548 -0.1687Q0.4722 -0.2153 0.4722 -0.2725Q0.4722 -0.3291 0.4551 -0.3748Q0.438 -0.4204 0.4036 -0.4473Q0.3691 -0.4741 0.3174 -0.4741Q0.2671 -0.4741 0.2329 -0.4487Q0.1987 -0.4233 0.1814 -0.3782Q0.1641 -0.333 0.1641 -0.2725Q0.1641 -0.2119 0.1816 -0.1655Q0.1992 -0.1191 0.2336 -0.093Q0.2681 -0.0669 0.3174 -0.0669Z",c:"M0.2993 0.0117Q0.2251 0.0117 0.1692 -0.0234Q0.1133 -0.0586 0.082 -0.1221Q0.0508 -0.1855 0.0508 -0.2695Q0.0508 -0.355 0.082 -0.4187Q0.1133 -0.4824 0.1692 -0.5176Q0.2251 -0.5527 0.2993 -0.5527Q0.3389 -0.5527 0.374 -0.5425Q0.4092 -0.5322 0.4382 -0.5129Q0.4673 -0.4937 0.4883 -0.4656Q0.5093 -0.4375 0.5205 -0.4019L0.436 -0.3779Q0.4302 -0.3989 0.418 -0.4165Q0.4058 -0.4341 0.3884 -0.447Q0.3711 -0.46 0.3486 -0.467Q0.3262 -0.4741 0.2993 -0.4741Q0.2446 -0.4741 0.2095 -0.4456Q0.1743 -0.417 0.1572 -0.3706Q0.1401 -0.3242 0.1401 -0.2695Q0.1401 -0.2158 0.1572 -0.1697Q0.1743 -0.1235 0.2095 -0.0952Q0.2446 -0.0669 0.2993 -0.0669Q0.3267 -0.0669 0.3496 -0.0742Q0.3726 -0.0815 0.3904 -0.095Q0.4082 -0.1084 0.4204 -0.127Q0.4326 -0.1455 0.4385 -0.1675L0.5225 -0.1436Q0.5117 -0.1069 0.4905 -0.0784Q0.4692 -0.0498 0.4399 -0.0295Q0.4106 -0.0093 0.375 0.0012Q0.3394 0.0117 0.2993 0.0117Z",d:"M0.2817 0.0117Q0.2139 0.0117 0.1616 -0.0229Q0.1094 -0.0576 0.0801 -0.1211Q0.0508 -0.1846 0.0508 -0.2715Q0.0508 -0.3579 0.0803 -0.4211Q0.1099 -0.4844 0.1621 -0.5186Q0.2144 -0.5527 0.2822 -0.5527Q0.3354 -0.5527 0.3667 -0.5352Q0.3979 -0.5176 0.4148 -0.4954Q0.4316 -0.4731 0.4404 -0.4585H0.4473V-0.7275H0.5352V0H0.4502V-0.0845H0.4404Q0.4316 -0.0693 0.4143 -0.0466Q0.397 -0.0239 0.3655 -0.0061Q0.334 0.0117 0.2817 0.0117ZM0.2949 -0.0669Q0.3447 -0.0669 0.3789 -0.093Q0.4131 -0.1191 0.4307 -0.1655Q0.4482 -0.2119 0.4482 -0.2725Q0.4482 -0.333 0.4309 -0.3782Q0.4136 -0.4233 0.3794 -0.4487Q0.3452 -0.4741 0.2949 -0.4741Q0.2432 -0.4741 0.2087 -0.4473Q0.1743 -0.4204 0.1572 -0.3748Q0.1401 -0.3291 0.1401 -0.2725Q0.1401 -0.2153 0.1575 -0.1687Q0.1748 -0.1221 0.2095 -0.0945Q0.2441 -0.0669 0.2949 -0.0669Z",e:"M0.3066 0.0117Q0.2275 0.0117 0.1702 -0.0234Q0.1128 -0.0586 0.0818 -0.1216Q0.0508 -0.1846 0.0508 -0.2686Q0.0508 -0.3525 0.0811 -0.4165Q0.1113 -0.4805 0.1667 -0.5166Q0.2222 -0.5527 0.2964 -0.5527Q0.3398 -0.5527 0.3821 -0.5383Q0.4243 -0.5239 0.4587 -0.4919Q0.4932 -0.46 0.5137 -0.4077Q0.5342 -0.3555 0.5342 -0.2798V-0.2432H0.1104V-0.3174H0.4868L0.4458 -0.29Q0.4458 -0.3438 0.429 -0.3855Q0.4121 -0.4272 0.3789 -0.4509Q0.3457 -0.4746 0.2964 -0.4746Q0.2471 -0.4746 0.2119 -0.4504Q0.1768 -0.4263 0.1582 -0.3875Q0.1396 -0.3486 0.1396 -0.3042V-0.2549Q0.1396 -0.1943 0.1606 -0.1521Q0.1816 -0.1099 0.2195 -0.0881Q0.2573 -0.0664 0.3071 -0.0664Q0.3394 -0.0664 0.3657 -0.0757Q0.3921 -0.085 0.4111 -0.1038Q0.4302 -0.1226 0.4404 -0.1504L0.5254 -0.127Q0.5127 -0.0859 0.4824 -0.0547Q0.4521 -0.0234 0.4075 -0.0059Q0.3628 0.0117 0.3066 0.0117Z",f:"M0.3311 -0.5459V-0.4707H0.0098V-0.5459ZM0.1172 0V-0.6187Q0.1172 -0.666 0.1394 -0.6978Q0.1616 -0.7295 0.1973 -0.7456Q0.2329 -0.7617 0.2725 -0.7617Q0.3037 -0.7617 0.3242 -0.7566Q0.3447 -0.7515 0.3545 -0.7471L0.3301 -0.6719Q0.3232 -0.6743 0.3123 -0.6772Q0.3013 -0.6802 0.2827 -0.6802Q0.2422 -0.6802 0.2236 -0.6594Q0.2051 -0.6387 0.2051 -0.5991V0Z",g:"M0.2983 0.2158Q0.2378 0.2158 0.1936 0.2004Q0.1494 0.1851 0.1201 0.1597Q0.0908 0.1343 0.0737 0.1045L0.145 0.0586Q0.1567 0.0742 0.1741 0.0933Q0.1914 0.1123 0.2209 0.1257Q0.2505 0.1392 0.2983 0.1392Q0.3638 0.1392 0.406 0.1079Q0.4482 0.0767 0.4482 0.0093V-0.1001H0.4399Q0.4307 -0.0845 0.4138 -0.063Q0.397 -0.0415 0.3655 -0.0251Q0.334 -0.0088 0.2812 -0.0088Q0.2158 -0.0088 0.1636 -0.0398Q0.1113 -0.0708 0.0811 -0.1304Q0.0508 -0.1899 0.0508 -0.2754Q0.0508 -0.3599 0.0806 -0.4221Q0.1104 -0.4844 0.1628 -0.5186Q0.2153 -0.5527 0.2832 -0.5527Q0.3359 -0.5527 0.3674 -0.5354Q0.3989 -0.5181 0.416 -0.4956Q0.4331 -0.4731 0.4424 -0.4585H0.4507V-0.5459H0.5361V0.0142Q0.5361 0.0845 0.5044 0.1292Q0.4727 0.1738 0.4187 0.1948Q0.3647 0.2158 0.2983 0.2158ZM0.2959 -0.0869Q0.3457 -0.0869 0.3799 -0.1096Q0.4141 -0.1323 0.4316 -0.175Q0.4492 -0.2178 0.4492 -0.2773Q0.4492 -0.3354 0.4319 -0.3796Q0.4146 -0.4238 0.3804 -0.449Q0.3462 -0.4741 0.2959 -0.4741Q0.2441 -0.4741 0.2095 -0.4475Q0.1748 -0.4209 0.1575 -0.3765Q0.1401 -0.332 0.1401 -0.2773Q0.1401 -0.2212 0.1577 -0.1782Q0.1753 -0.1353 0.21 -0.1111Q0.2446 -0.0869 0.2959 -0.0869Z",h:"M0.165 -0.3271V0H0.0771V-0.7275H0.165V-0.4136H0.1499Q0.1748 -0.4893 0.2209 -0.521Q0.2671 -0.5527 0.3291 -0.5527Q0.3843 -0.5527 0.426 -0.53Q0.4678 -0.5073 0.491 -0.4617Q0.5142 -0.416 0.5142 -0.3467V0H0.4258V-0.3394Q0.4258 -0.4023 0.3928 -0.438Q0.3599 -0.4736 0.3027 -0.4736Q0.2637 -0.4736 0.2324 -0.4565Q0.2012 -0.4395 0.1831 -0.4067Q0.165 -0.374 0.165 -0.3271Z",i:"M0.0771 0V-0.5459H0.165V0ZM0.1216 -0.6353Q0.0967 -0.6353 0.0786 -0.6523Q0.0605 -0.6694 0.0605 -0.6934Q0.0605 -0.7178 0.0786 -0.7346Q0.0967 -0.7515 0.1216 -0.7515Q0.147 -0.7515 0.165 -0.7346Q0.1831 -0.7178 0.1831 -0.6934Q0.1831 -0.6694 0.165 -0.6523Q0.147 -0.6353 0.1216 -0.6353Z",j:"M0.0767 -0.5459H0.165V0.0391Q0.1655 0.0908 0.1475 0.1279Q0.1294 0.165 0.0938 0.1846Q0.0581 0.2041 0.0049 0.2041H-0.0127V0.123H0.0034Q0.0415 0.123 0.0591 0.1013Q0.0767 0.0796 0.0767 0.0391ZM0.1211 -0.6353Q0.0962 -0.6353 0.0781 -0.6523Q0.0601 -0.6694 0.0601 -0.6934Q0.0601 -0.7178 0.0781 -0.7346Q0.0962 -0.7515 0.1211 -0.7515Q0.1465 -0.7515 0.1646 -0.7346Q0.1826 -0.7178 0.1826 -0.6934Q0.1826 -0.6694 0.1646 -0.6523Q0.1465 -0.6353 0.1211 -0.6353Z",k:"M0.1597 -0.1963V-0.3052H0.1758L0.4092 -0.5459H0.5181L0.2656 -0.2866H0.2559ZM0.0771 0V-0.7275H0.165V0ZM0.4224 0 0.2134 -0.2671 0.2759 -0.3291 0.5352 0Z",l:"M0.165 -0.7275V0H0.0771V-0.7275Z",m:"M0.0771 0V-0.5459H0.1626L0.1631 -0.4238H0.1562Q0.1675 -0.4683 0.1917 -0.4973Q0.2158 -0.5264 0.2483 -0.541Q0.2808 -0.5557 0.3159 -0.5557Q0.3755 -0.5557 0.4124 -0.519Q0.4492 -0.4824 0.46 -0.4229H0.4482Q0.458 -0.4639 0.4839 -0.4937Q0.5098 -0.5234 0.5466 -0.5396Q0.5835 -0.5557 0.627 -0.5557Q0.6743 -0.5557 0.7134 -0.5352Q0.7524 -0.5146 0.7756 -0.4731Q0.7988 -0.4316 0.7988 -0.3682V0H0.7109V-0.3657Q0.7109 -0.4248 0.6777 -0.4502Q0.6445 -0.4756 0.6006 -0.4756Q0.564 -0.4756 0.5374 -0.4602Q0.5107 -0.4448 0.4963 -0.418Q0.4819 -0.3911 0.4819 -0.3564V0H0.394V-0.3745Q0.394 -0.4199 0.3638 -0.4478Q0.3335 -0.4756 0.2871 -0.4756Q0.2554 -0.4756 0.2273 -0.4607Q0.1992 -0.4458 0.1821 -0.4165Q0.165 -0.3872 0.165 -0.3438V0Z",n:"M0.165 -0.3271V0H0.0771V-0.5459H0.1616L0.1621 -0.4136H0.1499Q0.1748 -0.4893 0.2209 -0.521Q0.2671 -0.5527 0.3291 -0.5527Q0.3843 -0.5527 0.4258 -0.53Q0.4673 -0.5073 0.4905 -0.4617Q0.5137 -0.416 0.5137 -0.3467V0H0.4258V-0.3394Q0.4258 -0.4023 0.3928 -0.438Q0.3599 -0.4736 0.3027 -0.4736Q0.2637 -0.4736 0.2324 -0.4565Q0.2012 -0.4395 0.1831 -0.4067Q0.165 -0.374 0.165 -0.3271Z",o:"M0.2993 0.0117Q0.2251 0.0117 0.1692 -0.0234Q0.1133 -0.0586 0.082 -0.1221Q0.0508 -0.1855 0.0508 -0.2695Q0.0508 -0.355 0.082 -0.4187Q0.1133 -0.4824 0.1692 -0.5176Q0.2251 -0.5527 0.2993 -0.5527Q0.374 -0.5527 0.4302 -0.5176Q0.4863 -0.4824 0.5176 -0.4187Q0.5488 -0.355 0.5488 -0.2695Q0.5488 -0.1855 0.5176 -0.1221Q0.4863 -0.0586 0.4302 -0.0234Q0.374 0.0117 0.2993 0.0117ZM0.2993 -0.0669Q0.3545 -0.0669 0.3901 -0.0952Q0.4258 -0.1235 0.4429 -0.1697Q0.46 -0.2158 0.46 -0.2695Q0.46 -0.3237 0.4429 -0.3704Q0.4258 -0.417 0.3901 -0.4456Q0.3545 -0.4741 0.2993 -0.4741Q0.2446 -0.4741 0.2095 -0.4456Q0.1743 -0.417 0.1572 -0.3706Q0.1401 -0.3242 0.1401 -0.2695Q0.1401 -0.2158 0.1572 -0.1697Q0.1743 -0.1235 0.2095 -0.0952Q0.2446 -0.0669 0.2993 -0.0669Z",p:"M0.0771 0.2041V-0.5459H0.1621V-0.4585H0.1719Q0.1812 -0.4731 0.1978 -0.4954Q0.2144 -0.5176 0.2456 -0.5352Q0.2769 -0.5527 0.3301 -0.5527Q0.3984 -0.5527 0.4504 -0.5186Q0.5024 -0.4844 0.532 -0.4211Q0.5615 -0.3579 0.5615 -0.2715Q0.5615 -0.1846 0.5322 -0.1211Q0.5029 -0.0576 0.4509 -0.0229Q0.3989 0.0117 0.3306 0.0117Q0.2788 0.0117 0.2471 -0.0061Q0.2153 -0.0239 0.1982 -0.0466Q0.1812 -0.0693 0.1719 -0.0845H0.165V0.2041ZM0.3174 -0.0669Q0.3687 -0.0669 0.4031 -0.0945Q0.4375 -0.1221 0.4548 -0.1687Q0.4722 -0.2153 0.4722 -0.2725Q0.4722 -0.3291 0.4551 -0.3748Q0.438 -0.4204 0.4036 -0.4473Q0.3691 -0.4741 0.3174 -0.4741Q0.2671 -0.4741 0.2329 -0.4487Q0.1987 -0.4233 0.1814 -0.3782Q0.1641 -0.333 0.1641 -0.2725Q0.1641 -0.2119 0.1816 -0.1655Q0.1992 -0.1191 0.2336 -0.093Q0.2681 -0.0669 0.3174 -0.0669Z",r:"M0.0771 0V-0.5459H0.1621V-0.4619H0.168Q0.1831 -0.5034 0.2219 -0.5286Q0.2607 -0.5537 0.3096 -0.5537Q0.3193 -0.5537 0.3328 -0.5532Q0.3462 -0.5527 0.354 -0.5522V-0.4639Q0.3501 -0.4648 0.3345 -0.4668Q0.3188 -0.4688 0.3013 -0.4688Q0.2622 -0.4688 0.2312 -0.4524Q0.2002 -0.436 0.1826 -0.4075Q0.165 -0.3789 0.165 -0.3418V0Z",s:"M0.2627 0.0117Q0.2065 0.0117 0.1628 -0.0046Q0.1191 -0.021 0.0908 -0.0532Q0.0625 -0.0854 0.0527 -0.1323L0.1362 -0.1523Q0.1479 -0.1074 0.1804 -0.0864Q0.2129 -0.0654 0.2617 -0.0654Q0.3188 -0.0654 0.3528 -0.0898Q0.3867 -0.1143 0.3867 -0.1479Q0.3867 -0.1763 0.3669 -0.1951Q0.3472 -0.2139 0.3066 -0.2231L0.2158 -0.2446Q0.1416 -0.2622 0.1055 -0.2991Q0.0693 -0.3359 0.0693 -0.3936Q0.0693 -0.4404 0.0957 -0.4763Q0.1221 -0.5122 0.1677 -0.5325Q0.2134 -0.5527 0.2715 -0.5527Q0.3276 -0.5527 0.3669 -0.5359Q0.4062 -0.519 0.4309 -0.4895Q0.4556 -0.46 0.4678 -0.4214L0.3882 -0.4009Q0.377 -0.4302 0.3508 -0.4541Q0.3247 -0.478 0.272 -0.478Q0.2231 -0.478 0.1907 -0.4556Q0.1582 -0.4331 0.1582 -0.3989Q0.1582 -0.3687 0.1802 -0.3503Q0.2021 -0.332 0.25 -0.3208L0.3325 -0.3013Q0.4067 -0.2837 0.4424 -0.2468Q0.478 -0.21 0.478 -0.1538Q0.478 -0.106 0.4509 -0.0686Q0.4238 -0.0312 0.3752 -0.0098Q0.3267 0.0117 0.2627 0.0117Z",t:"M0.292 -0.5459V-0.4707H0.0098V-0.5459ZM0.0918 -0.6758H0.1797V-0.1416Q0.1797 -0.105 0.1946 -0.0881Q0.2095 -0.0713 0.2441 -0.0713Q0.2524 -0.0713 0.2654 -0.0732Q0.2783 -0.0752 0.2891 -0.0771L0.3071 -0.0029Q0.2935 0.002 0.2761 0.0044Q0.2588 0.0068 0.2417 0.0068Q0.1709 0.0068 0.1313 -0.0305Q0.0918 -0.0679 0.0918 -0.1348Z",u:"M0.2622 0.0068Q0.207 0.0068 0.1653 -0.0159Q0.1235 -0.0386 0.1003 -0.0845Q0.0771 -0.1304 0.0771 -0.1992V-0.5459H0.165V-0.2065Q0.165 -0.1436 0.1982 -0.1079Q0.2314 -0.0723 0.2886 -0.0723Q0.3276 -0.0723 0.3586 -0.0894Q0.3896 -0.1064 0.4077 -0.1394Q0.4258 -0.1724 0.4258 -0.2188V-0.5459H0.5142V0H0.4292V-0.1323H0.4409Q0.4155 -0.0557 0.3689 -0.0244Q0.3223 0.0068 0.2622 0.0068Z",v:"M0.2349 0 0.0264 -0.5459H0.1226L0.2388 -0.2222Q0.2573 -0.1719 0.2703 -0.1218Q0.2832 -0.0718 0.2974 -0.0249H0.2651Q0.2793 -0.0718 0.2922 -0.1218Q0.3052 -0.1719 0.3232 -0.2222L0.4395 -0.5459H0.5356L0.3271 0Z",w:"M0.1997 0 0.0342 -0.5459H0.1274L0.1938 -0.3076Q0.2075 -0.2588 0.2231 -0.197Q0.2388 -0.1353 0.2539 -0.0571H0.2388Q0.2534 -0.1318 0.2686 -0.1938Q0.2837 -0.2559 0.2979 -0.3076L0.3633 -0.5459H0.457L0.5215 -0.3076Q0.5352 -0.2573 0.55 -0.1956Q0.5649 -0.1338 0.5796 -0.0571H0.564Q0.5796 -0.1328 0.595 -0.1946Q0.6104 -0.2563 0.6245 -0.3076L0.6909 -0.5459H0.7842L0.6187 0H0.5312L0.4604 -0.2471Q0.4497 -0.2847 0.4395 -0.3237Q0.4292 -0.3628 0.4194 -0.4038Q0.4097 -0.4448 0.3994 -0.4873H0.4189Q0.4092 -0.4453 0.3992 -0.4041Q0.3892 -0.3628 0.3789 -0.3232Q0.3687 -0.2837 0.3579 -0.2471L0.2871 0Z",x:"M0.0317 0 0.2471 -0.314 0.2466 -0.2466 0.043 -0.5459H0.1455L0.2134 -0.4399Q0.2397 -0.3989 0.259 -0.3633Q0.2783 -0.3276 0.2988 -0.2944H0.2529Q0.2739 -0.3276 0.2913 -0.3633Q0.3086 -0.3989 0.3354 -0.4399L0.4048 -0.5459H0.5054L0.3008 -0.2427V-0.3076L0.5142 0H0.4121L0.332 -0.1226Q0.3062 -0.1626 0.2874 -0.197Q0.2686 -0.2314 0.2485 -0.2632H0.2949Q0.2749 -0.2314 0.2578 -0.197Q0.2407 -0.1626 0.2144 -0.1226L0.1333 0Z",y:"M0.0684 0.1978 0.0908 0.1216 0.1001 0.124Q0.127 0.1309 0.1489 0.1277Q0.1709 0.1245 0.1885 0.106Q0.2061 0.0874 0.2192 0.0483L0.2349 0.0029L0.0264 -0.5459H0.1226L0.2388 -0.2222Q0.2573 -0.1714 0.27 -0.1216Q0.2827 -0.0718 0.2969 -0.0249H0.2646Q0.2788 -0.0718 0.2917 -0.1218Q0.3047 -0.1719 0.3228 -0.2222L0.4399 -0.5459H0.5356L0.2959 0.0815Q0.2793 0.125 0.2561 0.1531Q0.2329 0.1812 0.2021 0.1946Q0.1714 0.208 0.1328 0.208Q0.1094 0.208 0.0923 0.2046Q0.0752 0.2012 0.0684 0.1978Z"},"inter-500-14":{2:"M0.0703 0V-0.0803L0.3173 -0.3358Q0.3554 -0.3759 0.3809 -0.4066Q0.4065 -0.4374 0.4196 -0.4658Q0.4327 -0.4942 0.4327 -0.5265Q0.4327 -0.5628 0.4157 -0.5891Q0.3987 -0.6155 0.3698 -0.6297Q0.3408 -0.6438 0.3039 -0.6438Q0.2649 -0.6438 0.2362 -0.628Q0.2074 -0.6122 0.1917 -0.5834Q0.176 -0.5546 0.176 -0.5155H0.0694Q0.0694 -0.5821 0.1 -0.6321Q0.1307 -0.6821 0.184 -0.7097Q0.2374 -0.7373 0.3059 -0.7373Q0.3749 -0.7373 0.4274 -0.7101Q0.48 -0.6828 0.5097 -0.6361Q0.5394 -0.5894 0.5394 -0.5303Q0.5394 -0.4903 0.5246 -0.4523Q0.5099 -0.4142 0.4726 -0.3663Q0.4353 -0.3184 0.3674 -0.25L0.2246 -0.1008V-0.0952H0.5508V0Z",3:"M0.314 0.0098Q0.2401 0.0098 0.1828 -0.0156Q0.1256 -0.0409 0.0922 -0.0859Q0.0587 -0.131 0.0567 -0.1904H0.1693Q0.1717 -0.1582 0.191 -0.1347Q0.2103 -0.1111 0.2422 -0.0984Q0.274 -0.0858 0.3132 -0.0858Q0.3557 -0.0858 0.3885 -0.1005Q0.4213 -0.1153 0.4401 -0.142Q0.459 -0.1687 0.459 -0.2036Q0.459 -0.24 0.4404 -0.2677Q0.4217 -0.2954 0.3866 -0.3111Q0.3514 -0.3268 0.3011 -0.3268H0.2393V-0.4175H0.3011Q0.3412 -0.4175 0.3719 -0.4319Q0.4026 -0.4462 0.4197 -0.4721Q0.4368 -0.4979 0.4368 -0.5327Q0.4368 -0.5662 0.4218 -0.5911Q0.4069 -0.6161 0.3795 -0.6299Q0.3521 -0.6438 0.3152 -0.6438Q0.2798 -0.6438 0.2494 -0.6311Q0.2189 -0.6184 0.1997 -0.5949Q0.1806 -0.5715 0.1794 -0.5382H0.072Q0.0736 -0.5971 0.1066 -0.6419Q0.1396 -0.6868 0.1945 -0.7121Q0.2495 -0.7373 0.3168 -0.7373Q0.3869 -0.7373 0.4383 -0.71Q0.4897 -0.6826 0.5176 -0.6376Q0.5455 -0.5925 0.5455 -0.539Q0.5455 -0.4777 0.5113 -0.4353Q0.4771 -0.393 0.4197 -0.3781V-0.3724Q0.4683 -0.3653 0.5024 -0.3417Q0.5364 -0.318 0.5542 -0.2817Q0.5719 -0.2454 0.5719 -0.1998Q0.5719 -0.1394 0.5385 -0.0921Q0.5052 -0.0447 0.4469 -0.0175Q0.3886 0.0098 0.314 0.0098Z",4:"M0.0554 -0.1417V-0.2314L0.3692 -0.7275H0.4402V-0.5953H0.3952L0.1717 -0.242V-0.2362H0.6027V-0.1417ZM0.3997 0V-0.1686L0.401 -0.2099V-0.7275H0.5067V0Z",5:"M0.2963 0.0098Q0.2287 0.0098 0.1754 -0.0162Q0.1221 -0.0421 0.0906 -0.0873Q0.0591 -0.1326 0.0569 -0.1904H0.1652Q0.1676 -0.1595 0.1856 -0.1354Q0.2036 -0.1112 0.2325 -0.0976Q0.2615 -0.084 0.2963 -0.084Q0.3378 -0.084 0.3701 -0.1031Q0.4024 -0.1223 0.4207 -0.1561Q0.4391 -0.19 0.4391 -0.2333Q0.4391 -0.2776 0.4199 -0.3123Q0.4008 -0.347 0.3677 -0.3667Q0.3346 -0.3864 0.2915 -0.3864Q0.2581 -0.3864 0.225 -0.3749Q0.1919 -0.3634 0.172 -0.345L0.0694 -0.36L0.1098 -0.7275H0.5117V-0.6322H0.203L0.1801 -0.4292H0.184Q0.2055 -0.4504 0.2411 -0.4641Q0.2767 -0.4777 0.3175 -0.4777Q0.367 -0.4777 0.4091 -0.4599Q0.4511 -0.442 0.4822 -0.4093Q0.5133 -0.3766 0.5306 -0.3324Q0.5478 -0.2881 0.5478 -0.2356Q0.5478 -0.1646 0.5155 -0.1092Q0.4832 -0.0538 0.4265 -0.022Q0.3699 0.0098 0.2963 0.0098Z"}},L0={"step:1":{width:2.797,height:7.922,size:6.604,weight:"inter-600-14",chars:[["1",0,5]]},"label:1":{width:17.859,height:10,size:7.925,weight:"inter-400-14",chars:[["S",0,8],["t",5.078,8],["a",7.703,8],["r",12.156,8],["t",15.25,8]]},"step:2":{width:4.078,height:7.922,size:6.604,weight:"inter-500-14",chars:[["2",0,5]]},"label:2":{width:22.047,height:10,size:7.925,weight:"inter-400-14",chars:[["V",0,8],["e",5.047,8],["r",9.672,8],["i",12.734,8],["f",14.656,8],["y",17.578,8]]},"step:3":{width:4.141,height:7.922,size:6.604,weight:"inter-500-14",chars:[["3",0,5]]},"label:3":{width:23.359,height:10,size:7.925,weight:"inter-400-14",chars:[["S",0,8],["e",5.078,8],["l",9.688,8],["e",11.609,8],["c",16.234,8],["t",20.75,8]]},"step:4":{width:4.344,height:7.922,size:6.604,weight:"inter-500-14",chars:[["4",0,5]]},"label:4":{width:26.781,height:10,size:7.925,weight:"inter-400-14",chars:[["R",0,8],["e",4.969,8],["v",9.437,8],["i",13.891,8],["e",15.812,8],["w",20.281,8]]},"step:5":{width:3.984,height:7.922,size:6.604,weight:"inter-500-14",chars:[["5",0,5]]},"label:5":{width:21.828,height:10,size:7.925,weight:"inter-400-14",chars:[["S",0,8],["e",5.078,8],["t",9.687,8],["u",12.281,8],["p",16.969,8]]},introTitle:{width:57.375,height:11,size:9.246,weight:"inter-400-14",chars:[["T",0,9],["a",5.281,9],["l",10.469,9],["k",12.703,9],["t",20.375,9],["o",23.313,9],["A",31.453,9],["g",37.828,9],["e",43.484,9],["n",48.875,9],["t",54.328,9]]},introSubtitle:{width:126.594,height:10,size:7.925,weight:"inter-400-14",chars:[["H",0,8],["a",5.719,8],["v",9.891,8],["e",14.031,8],["a",20.563,8],["r",26.922,8],["e",29.609,8],["a",34.141,8],["l",38.438,8],["c",42.266,8],["o",46.625,8],["n",51.219,8],["v",55.625,8],["e",59.766,8],["r",64.219,8],["s",67.047,8],["a",71.063,8],["t",75.36,8],["i",77.781,8],["o",79.547,8],["n",84.141,8],["a",90.719,8],["b",95.016,8],["o",99.703,8],["u",104.297,8],["t",108.828,8],["y",113.328,8],["o",117.453,8],["u",122.047,8]]},"title:Max Agent":{width:156.953,height:10,size:7.925,weight:"inter-400-14",chars:[["M",0,8],["a",7.141,8],["x",11.594,8],["A",18.141,8],["g",23.609,8],["e",28.469,8],["n",33.078,8],["t",37.766,8]]},"description:Max Agent":{width:156.953,height:10,size:7.925,weight:"inter-400-14",chars:[["B",0,8],["u",5.172,8],["i",9.859,8],["l",11.781,8],["d",13.687,8],["a",20.766,8],["n",25.219,8],["d",29.891,8],["t",36.969,8],["r",39.562,8],["a",42.547,8],["i",47,8],["n",48.906,8],["y",55.812,8],["o",60.109,8],["u",64.859,8],["r",69.547,8],["p",74.75,8],["e",79.609,8],["r",84.219,8],["s",87.203,8],["o",91.391,8],["n",96.141,8],["a",100.812,8],["l",105.266,8],["c",109.406,8],["a",114.016,8],["r",118.453,8],["e",121.312,8],["e",125.922,8],["r",130.547,8],["a",135.75,8],["g",140.203,8],["e",145.047,8],["n",149.672,8],["t",154.344,8]]},"title:Network":{width:169.297,height:10,size:7.925,weight:"inter-400-14",chars:[["N",0,8],["e",5.953,8],["t",10.578,8],["w",13.281,8],["o",19.625,8],["r",24.375,8],["k",27.469,8]]},"description:Network":{width:169.297,height:10,size:7.925,weight:"inter-400-14",chars:[["I",0,8],["n",2.125,8],["v",6.688,8],["i",11.141,8],["t",13.047,8],["e",15.563,8],["4",22.406,8],["f",29.75,8],["r",32.688,8],["i",35.75,8],["e",37.656,8],["n",42.281,8],["d",46.953,8],["s",54.031,8],["o",58.219,8],["j",65.188,8],["o",67.109,8],["i",71.859,8],["n",73.781,8],["t",80.688,8],["h",83.281,8],["e",87.953,8],["T",94.797,8],["a",99.344,8],["l",103.781,8],["e",105.703,8],["n",110.313,8],["t",115,8],["P",117.594,8],["l",122.641,8],["u",124.563,8],["t",129.25,8],["o",131.766,8],["n",138.734,8],["e",143.422,8],["t",148.031,8],["w",150.75,8],["o",157.078,8],["r",161.828,8],["k",164.938,8]]},"title:Opportunities":{width:166.094,height:10,size:7.925,weight:"inter-400-14",chars:[["O",0,8],["p",6.047,8],["p",10.891,8],["o",15.75,8],["r",20.5,8],["t",23.594,8],["u",26.188,8],["n",30.875,8],["i",35.563,8],["t",37.469,8],["i",40.063,8],["e",41.984,8],["s",46.594,8]]},"description:Opportunities":{width:166.094,height:10,size:7.925,weight:"inter-400-14",chars:[["T",0,8],["o",4.484,8],["p",9.234,8],["r",16.313,8],["o",19.156,8],["l",23.906,8],["e",25.828,8],["s",30.453,8],["m",36.859,8],["a",43.797,8],["t",48.234,8],["c",50.75,8],["h",55.281,8],["e",59.953,8],["d",64.578,8],["d",71.656,8],["i",76.5,8],["r",78.422,8],["e",81.266,8],["c",85.891,8],["t",90.422,8],["l",93,8],["y",94.969,8],["f",101.641,8],["r",104.578,8],["o",107.422,8],["m",112.172,8],["b",121.344,8],["a",126.266,8],["c",130.703,8],["k",135.235,8],["g",139.406,8],["r",144.266,8],["o",147.11,8],["u",151.86,8],["n",156.547,8],["d",161.219,8]]},placeholder:{width:252.312,height:10,size:7.925,weight:"inter-400-14",chars:[["A",0,8],["s",5.453,8],["k",9.641,8],["a",16.219,8],["g",20.656,8],["e",25.516,8],["n",30.141,8],["t",34.812,8],["a",39.625,8],["n",44.078,8],["y",48.641,8],["t",53.203,8],["h",55.797,8],["i",60.484,8],["n",62.406,8],["g",67.078,8],[".",74.172,8],[".",76.453,8],[".",78.734,8]]}},S0="_card_1eqe3_7",R0="_background_1eqe3_25",Z0="_glass_1eqe3_31",j0="_lens_1eqe3_41",A0="_lensLive_1eqe3_59",z0="_panel_1eqe3_82",T0="_row_1eqe3_98",B0="_input_1eqe3_98",E0="_send_1eqe3_98",$0="_badgeActive_1eqe3_98",N0="_steps_1eqe3_110",P0="_step_1eqe3_110",q0="_stepCentred_1eqe3_120",F0="_stepLabel_1eqe3_121",O0="_stepActive_1eqe3_122",D0="_badge_1eqe3_98",I0="_body_1eqe3_151",Y0="_intro_1eqe3_161",G0="_avatar_1eqe3_162",W0="_orb_1eqe3_164",U0="_introText_1eqe3_165",X0="_introTitle_1eqe3_166",K0="_introSubtitle_1eqe3_167",J0="_actions_1eqe3_170",e2="_rows_1eqe3_171",t2="_rowMain_1eqe3_183",o2="_rowIcon_1eqe3_184",r2="_chevron_1eqe3_185",i2="_rowText_1eqe3_186",s2="_rowTitle_1eqe3_187",a2="_rowDescription_1eqe3_188",n2="_placeholder_1eqe3_202",i={card:S0,background:R0,glass:Z0,lens:j0,lensLive:A0,panel:z0,row:T0,input:B0,send:E0,badgeActive:$0,steps:N0,step:P0,stepCentred:q0,stepLabel:F0,stepActive:O0,badge:D0,body:I0,intro:Y0,avatar:G0,orb:W0,introText:U0,introTitle:X0,introSubtitle:K0,actions:J0,rows:e2,rowMain:t2,rowIcon:o2,chevron:r2,rowText:i2,rowTitle:s2,rowDescription:a2,placeholder:n2},l2=Q0(M0,L0),_=({k:e,children:o})=>t.jsx(l2,{k:e,style:{whiteSpace:"inherit"},children:o}),c2=[{number:1,label:"Start",active:!0,centred:!0,node:"287:55353"},{number:2,label:"Verify",node:"287:55357"},{number:3,label:"Select",node:"287:55361"},{number:4,label:"Review",centred:!0,node:"287:55365"},{number:5,label:"Setup",centred:!0,node:"287:55369"}],Q2=[{title:"Max Agent",description:"Build and train your personal career agent",icon:V0,node:"287:55382"},{title:"Network",description:"Invite 4 friend so join the TalentPluto network",icon:H0,node:"287:55395"},{title:"Opportunities",description:"Top roles matched directly from background",icon:y0,node:"287:55411"}],P={width:536,height:410.2040710449219},v={x:110,y:43,width:315.87774658203125,height:324.22918701171875,zoom:1.8,margin:60,resolution:.25};function d2(e,o){const l=e?.getContext("2d");if(!e||!l)return;const Q=v.width+v.margin*2,a=v.height+v.margin*2,r=Math.round(Q*v.resolution),p=Math.round(a*v.resolution);e.width!==r&&(e.width=r),e.height!==p&&(e.height=p);const n=o.width/P.width,f=v.x+v.width/2,c=v.y+v.height/2,m=Q/v.zoom,d=a/v.zoom;l.drawImage(o,(f-m/2)*n,(c-d/2)*n,m*n,d*n,0,0,r,p)}function u2({position:e,values:o}){const l={...t0,...o?.Background??{}},Q=x.useRef(null),a=x.useCallback(r=>d2(Q.current,r),[]);return t.jsxs("figure",{className:i.card,"aria-label":"Agent Walkthrough","data-node-id":"285:43271",children:[t.jsx("img",{className:i.background,src:X,alt:"",draggable:!1,"data-node-id":"287:55437"}),t.jsx(m0,{className:i.background,width:P.width,height:P.height,time:e,settings:l,onFrame:a}),t.jsxs("div",{className:i.glass,"data-node-id":"287:55459",children:[t.jsx("img",{className:i.lens,src:X,alt:"",draggable:!1}),t.jsx("canvas",{ref:Q,className:i.lensLive,"aria-hidden":!0}),t.jsxs("div",{className:i.panel,"data-node-id":"287:55351",children:[t.jsx("div",{className:i.steps,"data-node-id":"287:55352",children:c2.map(r=>t.jsxs("div",{className:`${i.step} ${r.centred?i.stepCentred:""} ${r.active?i.stepActive:""}`,"data-node-id":r.node,children:[t.jsx("span",{className:`${i.badge} ${r.active?i.badgeActive:""}`,children:t.jsx(_,{k:`step:${r.number}`,children:String(r.number)})}),t.jsx("span",{className:i.stepLabel,children:t.jsx(_,{k:`label:${r.number}`,children:r.label})})]},r.number))}),t.jsxs("div",{className:i.body,"data-node-id":"287:55373",children:[t.jsxs("div",{className:i.intro,"data-node-id":"287:55374",children:[t.jsx("span",{className:i.avatar,"data-node-id":"287:55375",children:t.jsx(k0,{className:i.orb,size:31.701,time:e,settings:b0(o)})}),t.jsxs("div",{className:i.introText,"data-node-id":"287:55377",children:[t.jsx("p",{className:i.introTitle,children:t.jsx(_,{k:"introTitle",children:"Talk to Agent"})}),t.jsx("p",{className:i.introSubtitle,children:t.jsx(_,{k:"introSubtitle",children:"Have a real conversation about you"})})]})]}),t.jsxs("div",{className:i.actions,"data-node-id":"287:55380",children:[t.jsx("div",{className:i.rows,"data-node-id":"287:55381",children:Q2.map(r=>t.jsxs("div",{className:i.row,"data-node-id":r.node,children:[t.jsxs("div",{className:i.rowMain,children:[t.jsx("span",{className:i.rowIcon,children:t.jsx("img",{src:r.icon,alt:""})}),t.jsxs("div",{className:i.rowText,children:[t.jsx("p",{className:i.rowTitle,children:t.jsx(_,{k:`title:${r.title}`,children:r.title})}),t.jsx("p",{className:i.rowDescription,children:t.jsx(_,{k:`description:${r.title}`,children:r.description})})]})]}),t.jsx("img",{className:i.chevron,src:_0,alt:""})]},r.title))}),t.jsxs("div",{className:i.input,"data-node-id":"287:55425",children:[t.jsx("p",{className:i.placeholder,children:t.jsx(_,{k:"placeholder",children:"Ask agent anything ..."})}),t.jsx("span",{className:i.send,"data-node-id":"287:55427",children:t.jsx("img",{src:C0,alt:""})})]})]})]})]})]})]})}export{u2 as default};
