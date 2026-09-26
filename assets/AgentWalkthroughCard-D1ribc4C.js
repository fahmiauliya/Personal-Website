import{a as _,j as o}from"./index-BAyNie58.js";const ce={"Orb Colour":{Blue:"#1787ee",Yellow:"#dbb82e",Bloom:1,Exposure:1},"Orb Motion":{Speed:1,Wander:.6},"Orb Shape":{Radius:.72,Density:1.6,CoreX:.2,CoreY:.2,CoreSize:3.5,RimStrength:0},"Orb Edge":{EdgeSoftness:0,Glow:.6}},de={values:ce},K={cream:[.905,.89,.8],milk:[.935,.93,.9],paleBlue:[.64,.725,.78],steelBlue:[.37,.61,.8],blue:[.09,.53,.935],deepBlue:[0,.4,.99],paleYellow:[.9,.86,.6],yellow:[.86,.72,.18],amber:[.86,.555,.02],orange:[.86,.47,0]};function C(e){return`vec3(${K[e].map(t=>t.toFixed(3)).join(", ")})`}function j(e){return`#${K[e].map(t=>Math.round(t*255).toString(16).padStart(2,"0")).join("")}`}function M(e){const t=/^#?([0-9a-f]{6})$/i.exec(e.trim());if(!t)return[0,0,0];const l=parseInt(t[1],16);return[(l>>16&255)/255,(l>>8&255)/255,(l&255)/255]}const ue={deepBlue:["cool",1],blue:["cool",1],steelBlue:["cool",.8],paleBlue:["cool",.5],orange:["warm",1],amber:["warm",1],yellow:["warm",1],paleYellow:["warm",.6],cream:["warm",.15],milk:null};function x(e,t){const l=ue[e];return!t||!l?C(e):`clamp(${C(e)} + ${l[1].toFixed(2)} * ${t[l[0]]}, 0.0, 1.0)`}function J(e){const t=l=>x(l,e);return`
vec3 ramp(vec3 a, vec3 b, float t, float from, float to) {
  return mix(a, b, smoothstep(from, to, t));
}

vec3 palette(float v) {
  vec3 cream = ${t("cream")};
  if (v < 0.0) {
    float t = -v;
    vec3 c = ramp(cream, ${t("paleBlue")}, t, 0.00, 0.16);
    c = ramp(c, ${t("steelBlue")}, t, 0.16, 0.38);
    c = ramp(c, ${t("blue")}, t, 0.38, 0.66);
    return ramp(c, ${t("deepBlue")}, t, 0.66, 1.00);
  }
  vec3 c = ramp(cream, ${t("paleYellow")}, v, 0.00, 0.16);
  c = ramp(c, ${t("yellow")}, v, 0.16, 0.42);
  c = ramp(c, ${t("amber")}, v, 0.42, 0.72);
  return ramp(c, ${t("orange")}, v, 0.72, 1.00);
}
`}const he=J(),pe=`
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;function U(e,t,l){const d=e.createShader(t);return d?(e.shaderSource(d,l),e.compileShader(d),e.getShaderParameter(d,e.COMPILE_STATUS)?d:(console.error(e.getShaderInfoLog(d)),e.deleteShader(d),null)):null}function Q({fragment:e,width:t,height:l,maxPixelRatio:d,transparent:i=!1,time:a,render:f,onFrame:n,redrawKey:v=""}){const c=_.useRef(null),g=_.useRef(null),u=_.useRef({render:f,onFrame:n,time:a});u.current={render:f,onFrame:n,time:a};const[k,re]=_.useState(0);return _.useEffect(()=>{const p=c.current,s=p?.getContext("webgl",{antialias:!1,alpha:i,premultipliedAlpha:i});if(!p||!s)return;const T=U(s,s.VERTEX_SHADER,pe),B=U(s,s.FRAGMENT_SHADER,e),w=s.createProgram();if(!T||!B||!w||(s.attachShader(w,T),s.attachShader(w,B),s.linkProgram(w),!s.getProgramParameter(w,s.LINK_STATUS)))return;s.useProgram(w);const D=s.createBuffer();s.bindBuffer(s.ARRAY_BUFFER,D),s.bufferData(s.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),s.STATIC_DRAW);const I=s.getAttribLocation(w,"aPosition");s.enableVertexAttribArray(I),s.vertexAttribPointer(I,2,s.FLOAT,!1,0,0);const S={gl:s,canvas:p,pixelRatio:1,uniform:()=>null},Y=()=>{const h=p.getBoundingClientRect(),le=window.devicePixelRatio||1,P=h.width>0?Math.min(d,Math.max(1,h.width/t*le)):S.pixelRatio,$=Math.round(t*P),F=Math.round(l*P);$===p.width&&F===p.height||(p.width=$,p.height=F,S.pixelRatio=P,s.viewport(0,0,$,F))};Y();const E=new Map,ae=h=>(E.has(h)||E.set(h,s.getUniformLocation(w,h)),E.get(h)??null);S.uniform=ae;let z=!1,se=0;const L=h=>{z||(++se%30===0&&Y(),u.current.render(S,h),s.drawArrays(s.TRIANGLE_STRIP,0,4),u.current.onFrame?.(p))};g.current=L,p.dataset.ready="true";let R=0,G=!0;const W=new IntersectionObserver(([h])=>{G=h.isIntersecting});W.observe(p);const ie=window.matchMedia("(prefers-reduced-motion: reduce)").matches,ne=performance.now(),Z=h=>{R=requestAnimationFrame(Z),!(u.current.time!==void 0||!G)&&L(ie?0:(h-ne)/1e3)};L(u.current.time??0),R=requestAnimationFrame(Z);const q=h=>{h.preventDefault(),z=!0,cancelAnimationFrame(R)},H=()=>re(h=>h+1);return p.addEventListener("webglcontextlost",q),p.addEventListener("webglcontextrestored",H),()=>{cancelAnimationFrame(R),W.disconnect(),p.removeEventListener("webglcontextlost",q),p.removeEventListener("webglcontextrestored",H),g.current=null,delete p.dataset.ready,!z&&(s.deleteProgram(w),s.deleteShader(T),s.deleteShader(B),s.deleteBuffer(D))}},[e,t,l,d,i,k]),_.useEffect(()=>{a!==void 0&&g.current?.(a)},[a,v]),c}const y=30,ee={Flow:1,Band:1,Grain:.035},fe=`
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uFlow;
uniform float uBand;
uniform float uGrain;
uniform float uPixelRatio;

#define TAU 6.28318530718
const float LOOP = ${y.toFixed(1)};

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

${he}
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
  color = mix(color, ${C("milk")}, 0.55 * exp(-pow(v / band, 2.0)));
  color += 0.05 * exp(-pow((v + 0.30) / (0.45 * band), 2.0));
  float steep = smoothstep(0.5, 5.0, length(slope));
  color += 0.035 * steep * dot(normalize(slope + 1e-5), normalize(vec2(-0.6, -0.8)));

  // Grain: a fixed speckle about one CSS pixel across, stronger in the light areas.
  float grain = hash(floor(gl_FragCoord.xy / max(1.0, uPixelRatio))) - 0.5;
  float light = dot(color, vec3(0.299, 0.587, 0.114));
  color += grain * uGrain * (0.5 + 0.8 * light);

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;function ve({width:e,height:t,time:l,settings:d,onFrame:i,className:a}){const f={...ee,...d},n=Q({fragment:fe,width:e,height:t,maxPixelRatio:2,time:l,onFrame:i,redrawKey:`${f.Flow} ${f.Band} ${f.Grain}`,render:({gl:v,canvas:c,pixelRatio:g,uniform:u},k)=>{v.uniform2f(u("uResolution"),c.width,c.height),v.uniform1f(u("uTime"),(k%y+y)%y),v.uniform1f(u("uFlow"),f.Flow),v.uniform1f(u("uBand"),f.Band),v.uniform1f(u("uGrain"),f.Grain),v.uniform1f(u("uPixelRatio"),g)}});return o.jsx("canvas",{ref:n,className:a,style:{width:e,height:t},"aria-hidden":!0})}const te={Bloom:1,Exposure:1,Speed:1,Radius:.72,Density:1.35,CoreX:.2,CoreY:.14,CoreSize:9,RimStrength:1,EdgeSoftness:.005,Glow:0},me={Blue:j("blue"),Yellow:j("yellow"),Wander:.6},ge={...te,...me},A=de.values??{},oe={...ge,...A["Orb Colour"],...A["Orb Motion"],...A["Orb Shape"],...A["Orb Edge"]};function we(e){return{...oe,...e?.["Orb Colour"],...e?.["Orb Motion"],...e?.["Orb Shape"],...e?.["Orb Edge"]}}const b={cool:"uBlueShift",warm:"uYellowShift"},N=M(j("blue")),O=M(j("yellow")),be=`
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
const float LOOP = ${y.toFixed(1)};

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

${J(b)}
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
  color += 0.10 * uBloom * hot * ${x("paleYellow",b)};
  // Cloud edges catch the core's light: a cream lining where a veil thins out near the core.
  color = mix(color, ${x("cream",b)}, 0.45 * wide * veil * (1.0 - veil) * 4.0 * (1.0 - hot));

  // Depth: a touch darker towards the limb, then glass: a soft sheen and a luminous rim.
  color *= mix(0.9, 1.0, sqrt(nz));
  vec2 sheen = s - vec2(-0.38, 0.46);
  color = mix(color, ${C("milk")}, 0.2 * exp(-dot(sheen, sheen) * 7.0));
  float fresnel = pow(1.0 - nz, 2.5) * uRim;
  float coreSide = 0.5 + 0.5 * dot(normalize(s + 1e-5), normalize(core + 1e-5));
  vec3 rim = mix(mix(${x("paleBlue",b)}, ${x("paleYellow",b)}, coreSide), ${C("milk")}, 0.4);
  color = mix(color, rim, clamp(fresnel * 0.7, 0.0, 1.0));
  // A crisp glass highlight, and a fine bright line on the very edge that keeps the outline clean.
  vec3 halfway = normalize(normalize(vec3(-0.45, 0.6, 0.66)) + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(normal, halfway), 0.0), 70.0);
  color = mix(color, ${C("milk")}, 0.7 * spec);
  float edgeLine = smoothstep(1.0 - 2.5 * footprint, 1.0 - 0.5 * footprint, rs);
  color = mix(color, ${C("milk")}, 0.35 * edgeLine * uRim);

  color *= uExposure;
  color = color / (1.0 + max(color - 1.0, 0.0));

  // --- Edge: coverage, halo and edge glow. ---
  float soft = uEdgeSoftness + pixel;
  float body = 1.0 - smoothstep(uRadius - soft, uRadius + soft, r);

  float outside = max(r - uRadius, 0.0);
  float fade = 1.0 - smoothstep(0.82, 1.0, r);
  vec2 dir = normalize(uv + 1e-5);
  float haloSide = 0.5 + 0.5 * dot(dir, normalize(core + 1e-5));
  vec3 haloColor = mix(${x("steelBlue",b)}, ${x("amber",b)}, haloSide);
  float halo = uBloom * 0.22 * exp(-outside / 0.08) * fade * (0.6 + 0.4 * haloSide);

  float ring = uGlow * 0.6 * exp(-abs(r - uRadius) / 0.02) * fade;
  vec3 ringColor = ${x("orange",b)};

  // Premultiplied: the orb over its halo, the edge glow on top.
  float haloAlpha = clamp(halo, 0.0, 1.0) * (1.0 - body);
  vec3 rgb = color * body + haloColor * haloAlpha + ringColor * ring;
  float alpha = clamp(body + haloAlpha + ring, 0.0, 1.0);
  gl_FragColor = vec4(min(rgb, vec3(alpha)), alpha);
}
`;function xe({size:e,time:t,settings:l,className:d}){const i={...oe,...l},a=e/te.Radius,f=Q({fragment:be,width:a,height:a,maxPixelRatio:4,transparent:!0,time:t,redrawKey:Object.values(i).join(" "),render:({gl:n,canvas:v,uniform:c},g)=>{n.uniform2f(c("uResolution"),v.width,v.height),n.uniform1f(c("uTime"),g*i.Speed),n.uniform1f(c("uRadius"),i.Radius),n.uniform1f(c("uDensity"),i.Density),n.uniform2f(c("uCore"),i.CoreX,i.CoreY),n.uniform1f(c("uCoreSize"),i.CoreSize),n.uniform1f(c("uRim"),i.RimStrength),n.uniform1f(c("uBloom"),i.Bloom),n.uniform1f(c("uExposure"),i.Exposure),n.uniform1f(c("uEdgeSoftness"),i.EdgeSoftness),n.uniform1f(c("uGlow"),i.Glow),n.uniform1f(c("uWander"),i.Wander);const u=M(i.Blue),k=M(i.Yellow);n.uniform3f(c("uBlueShift"),u[0]-N[0],u[1]-N[1],u[2]-N[2]),n.uniform3f(c("uYellowShift"),k[0]-O[0],k[1]-O[1],k[2]-O[2])}});return o.jsx("canvas",{ref:f,className:d,style:{width:a,height:a},"aria-hidden":!0})}const X="/assets/background-DdVpnBPL.png",_e="data:image/svg+xml,%3csvg%20preserveAspectRatio='none'%20overflow='visible'%20style='display:%20block;'%20width='10.5671'%20height='10.5671'%20viewBox='0%200%2010.5671%2010.5671'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20id='Frame'%20opacity='0.4'%20clip-path='url(%23clip0_0_30)'%3e%3cg%20id='Vector'%3e%3c/g%3e%3cpath%20id='Vector_2'%20d='M3.96094%202.64196L6.60271%205.28372L3.96094%207.92549'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_0_30'%3e%3crect%20width='10.5671'%20height='10.5671'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e",ke="data:image/svg+xml,%3csvg%20preserveAspectRatio='none'%20overflow='visible'%20style='display:%20block;'%20width='10.5671'%20height='10.5671'%20viewBox='0%200%2010.5671%2010.5671'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20id='Frame'%20clip-path='url(%23clip0_0_33)'%3e%3cg%20id='Vector'%3e%3c/g%3e%3cpath%20id='Vector_2'%20d='M1.32048%203.96286C1.32048%203.72931%201.41326%203.50533%201.5784%203.34019C1.74354%203.17505%201.96752%203.08227%202.20107%203.08227H8.36519C8.59874%203.08227%208.82272%203.17505%208.98786%203.34019C9.153%203.50533%209.24578%203.72931%209.24578%203.96286V7.92551C9.24578%208.15905%209.153%208.38304%208.98786%208.54818C8.82272%208.71332%208.59874%208.8061%208.36519%208.8061H2.20107C1.96752%208.8061%201.74354%208.71332%201.5784%208.54818C1.41326%208.38304%201.32048%208.15905%201.32048%207.92551V3.96286Z'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_3'%20d='M3.52214%203.08175V2.20116C3.52214%201.96762%203.61491%201.74364%203.78006%201.57849C3.9452%201.41335%204.16918%201.32058%204.40273%201.32058H6.1639C6.39745%201.32058%206.62143%201.41335%206.78657%201.57849C6.95172%201.74364%207.04449%201.96762%207.04449%202.20116V3.08175'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_0_33'%3e%3crect%20width='10.5671'%20height='10.5671'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e",Ce="data:image/svg+xml,%3csvg%20preserveAspectRatio='none'%20overflow='visible'%20style='display:%20block;'%20width='10.5671'%20height='10.5671'%20viewBox='0%200%2010.5671%2010.5671'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20id='Frame'%20clip-path='url(%23clip0_0_19)'%3e%3cg%20id='Vector'%3e%3c/g%3e%3cpath%20id='Vector_2'%20d='M2.61079%203.05391L3.17216%204.92472M5.64089%207.39433L7.51259%207.95571'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_3'%20d='M5.14519%205.4232L7.68085%202.88754'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_4'%20d='M1.76229%202.42127C1.76229%202.508%201.77937%202.59389%201.81257%202.67401C1.84576%202.75414%201.8944%202.82695%201.95573%202.88828C2.01706%202.9496%202.08987%202.99825%202.16999%203.03144C2.25012%203.06463%202.336%203.08172%202.42273%203.08172C2.50946%203.08172%202.59535%203.06463%202.67547%203.03144C2.7556%202.99825%202.82841%202.9496%202.88974%202.88828C2.95106%202.82695%202.99971%202.75414%203.0329%202.67401C3.06609%202.59389%203.08318%202.508%203.08318%202.42127C3.08318%202.33454%203.06609%202.24866%203.0329%202.16853C2.99971%202.08841%202.95106%202.0156%202.88974%201.95427C2.82841%201.89294%202.7556%201.8443%202.67547%201.81111C2.59535%201.77792%202.50946%201.76083%202.42273%201.76083C2.336%201.76083%202.25012%201.77792%202.16999%201.81111C2.08987%201.8443%202.01706%201.89294%201.95573%201.95427C1.8944%202.0156%201.84576%202.08841%201.81257%202.16853C1.77937%202.24866%201.76229%202.33454%201.76229%202.42127Z'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_5'%20d='M7.48549%202.42127C7.48549%202.59643%207.55507%202.76442%207.67893%202.88828C7.80279%203.01213%207.97077%203.08172%208.14593%203.08172C8.32109%203.08172%208.48908%203.01213%208.61293%202.88828C8.73679%202.76442%208.80637%202.59643%208.80637%202.42127C8.80637%202.24611%208.73679%202.07813%208.61293%201.95427C8.48908%201.83041%208.32109%201.76083%208.14593%201.76083C7.97077%201.76083%207.80279%201.83041%207.67893%201.95427C7.55507%202.07813%207.48549%202.24611%207.48549%202.42127Z'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_6'%20d='M7.48549%208.1454C7.48549%208.32056%207.55507%208.48854%207.67893%208.6124C7.80279%208.73626%207.97077%208.80584%208.14593%208.80584C8.32109%208.80584%208.48908%208.73626%208.61293%208.6124C8.73679%208.48854%208.80637%208.32056%208.80637%208.1454C8.80637%207.97024%208.73679%207.80225%208.61293%207.67839C8.48908%207.55454%208.32109%207.48495%208.14593%207.48495C7.97077%207.48495%207.80279%207.55454%207.67893%207.67839C7.55507%207.80225%207.48549%207.97024%207.48549%208.1454Z'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_7'%20d='M2.34261%208.22474C1.97104%207.85317%201.76229%207.34922%201.76229%206.82374C1.76229%206.29826%201.97104%205.7943%202.34261%205.42273C2.71418%205.05116%203.21814%204.84241%203.74362%204.84241C4.2691%204.84241%204.77305%205.05116%205.14462%205.42273C5.51619%205.7943%205.72494%206.29826%205.72494%206.82374C5.72494%207.34922%205.51619%207.85317%205.14462%208.22474C4.77305%208.59631%204.2691%208.80506%203.74362%208.80506C3.21814%208.80506%202.71418%208.59631%202.34261%208.22474Z'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_0_19'%3e%3crect%20width='10.5671'%20height='10.5671'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e",ye="data:image/svg+xml,%3csvg%20preserveAspectRatio='none'%20overflow='visible'%20style='display:%20block;'%20width='10.5671'%20height='10.5671'%20viewBox='0%200%2010.5671%2010.5671'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20id='Frame'%20clip-path='url(%23clip0_0_12)'%3e%3cg%20id='Vector'%3e%3c/g%3e%3cpath%20id='Vector_2'%20d='M2.02021%208.5486C1.85507%208.38346%201.76229%208.15948%201.76229%207.92593C1.76229%207.69238%201.85507%207.4684%202.02021%207.30326C2.18535%207.13812%202.40933%207.04534%202.64288%207.04534C2.87643%207.04534%203.10041%207.13812%203.26555%207.30326C3.43069%207.4684%203.52347%207.69238%203.52347%207.92593C3.52347%208.15948%203.43069%208.38346%203.26555%208.5486C3.10041%208.71374%202.87643%208.80652%202.64288%208.80652C2.40933%208.80652%202.18535%208.71374%202.02021%208.5486Z'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_3'%20d='M7.04553%207.92593C7.04553%208.15948%207.1383%208.38346%207.30345%208.5486C7.46859%208.71374%207.69257%208.80652%207.92612%208.80652C8.15966%208.80652%208.38364%208.71374%208.54879%208.5486C8.71393%208.38346%208.80671%208.15948%208.80671%207.92593C8.80671%207.69238%208.71393%207.4684%208.54879%207.30326C8.38364%207.13812%208.15966%207.04534%207.92612%207.04534C7.69257%207.04534%207.46859%207.13812%207.30345%207.30326C7.1383%207.4684%207.04553%207.69238%207.04553%207.92593Z'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_4'%20d='M2.64222%205.28446V4.40387C2.64222%203.70323%202.92054%203.03129%203.41597%202.53586C3.9114%202.04043%204.58334%201.7621%205.28398%201.7621C5.98462%201.7621%206.65656%202.04043%207.15199%202.53586C7.64742%203.03129%207.92575%203.70323%207.92575%204.40387V5.28446'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_5'%20d='M6.60557%203.96376L7.92645%205.28464L9.24733%203.96376'%20stroke='black'%20stroke-width='0.660441'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_0_12'%3e%3crect%20width='10.5671'%20height='10.5671'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e",Se="data:image/svg+xml,%3csvg%20preserveAspectRatio='none'%20overflow='visible'%20style='display:%20block;'%20width='11.5577'%20height='11.5577'%20viewBox='0%200%2011.5577%2011.5577'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20id='Frame'%20clip-path='url(%23clip0_0_4)'%3e%3cg%20id='Vector'%3e%3c/g%3e%3cpath%20id='Vector_2'%20d='M5.77785%202.40742V9.14943'%20stroke='white'%20stroke-width='0.963144'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_3'%20d='M8.66728%205.29686L5.77785%202.40742'%20stroke='white'%20stroke-width='0.963144'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20id='Vector_4'%20d='M2.88852%205.29686L5.77795%202.40742'%20stroke='white'%20stroke-width='0.963144'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_0_4'%3e%3crect%20width='11.5577'%20height='11.5577'%20fill='white'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e",Re="_card_1u6aa_8",Ae="_background_1u6aa_26",je="_glass_1u6aa_32",Me="_lens_1u6aa_42",Te="_lensLive_1u6aa_60",Be="_panel_1u6aa_83",Ee="_row_1u6aa_99",ze="_input_1u6aa_99",Le="_send_1u6aa_99",Pe="_badgeActive_1u6aa_99",$e="_steps_1u6aa_111",Fe="_step_1u6aa_111",Ne="_stepCentred_1u6aa_121",Oe="_stepLabel_1u6aa_122",Ve="_stepActive_1u6aa_123",De="_badge_1u6aa_99",Ie="_body_1u6aa_152",Ye="_intro_1u6aa_162",Ge="_avatar_1u6aa_163",We="_orb_1u6aa_165",Ze="_introText_1u6aa_166",qe="_introTitle_1u6aa_167",He="_introSubtitle_1u6aa_168",Ue="_actions_1u6aa_171",Xe="_rows_1u6aa_172",Ke="_rowMain_1u6aa_184",Je="_rowIcon_1u6aa_185",Qe="_chevron_1u6aa_186",e0="_rowText_1u6aa_187",t0="_rowTitle_1u6aa_188",o0="_rowDescription_1u6aa_189",r0="_placeholder_1u6aa_203",r={card:Re,background:Ae,glass:je,lens:Me,lensLive:Te,panel:Be,row:Ee,input:ze,send:Le,badgeActive:Pe,steps:$e,step:Fe,stepCentred:Ne,stepLabel:Oe,stepActive:Ve,badge:De,body:Ie,intro:Ye,avatar:Ge,orb:We,introText:Ze,introTitle:qe,introSubtitle:He,actions:Ue,rows:Xe,rowMain:Ke,rowIcon:Je,chevron:Qe,rowText:e0,rowTitle:t0,rowDescription:o0,placeholder:r0},a0=[{number:1,label:"Start",active:!0,centred:!0,node:"287:55353"},{number:2,label:"Verify",node:"287:55357"},{number:3,label:"Select",node:"287:55361"},{number:4,label:"Review",centred:!0,node:"287:55365"},{number:5,label:"Setup",centred:!0,node:"287:55369"}],s0=[{title:"Max Agent",description:"Build and train your personal career agent",icon:ke,node:"287:55382"},{title:"Network",description:"Invite 4 friend so join the TalentPluto network",icon:Ce,node:"287:55395"},{title:"Opportunities",description:"Top roles matched directly from background",icon:ye,node:"287:55411"}],V={width:536,height:410.2040710449219},m={x:110,y:43,width:315.87774658203125,height:324.22918701171875,zoom:1.8,margin:60,resolution:.25};function i0(e,t){const l=e?.getContext("2d");if(!e||!l)return;const d=m.width+m.margin*2,i=m.height+m.margin*2,a=Math.round(d*m.resolution),f=Math.round(i*m.resolution);e.width!==a&&(e.width=a),e.height!==f&&(e.height=f);const n=t.width/V.width,v=m.x+m.width/2,c=m.y+m.height/2,g=d/m.zoom,u=i/m.zoom;l.drawImage(t,(v-g/2)*n,(c-u/2)*n,g*n,u*n,0,0,a,f)}function l0({position:e,values:t}){const l={...ee,...t?.Background??{}},d=_.useRef(null),i=_.useCallback(a=>i0(d.current,a),[]);return o.jsxs("figure",{className:r.card,"aria-label":"Agent Walkthrough","data-node-id":"285:43271",children:[o.jsx("img",{className:r.background,src:X,alt:"",draggable:!1,"data-node-id":"287:55437"}),o.jsx(ve,{className:r.background,width:V.width,height:V.height,time:e,settings:l,onFrame:i}),o.jsxs("div",{className:r.glass,"data-node-id":"287:55459",children:[o.jsx("img",{className:r.lens,src:X,alt:"",draggable:!1}),o.jsx("canvas",{ref:d,className:r.lensLive,"aria-hidden":!0}),o.jsxs("div",{className:r.panel,"data-node-id":"287:55351",children:[o.jsx("div",{className:r.steps,"data-node-id":"287:55352",children:a0.map(a=>o.jsxs("div",{className:`${r.step} ${a.centred?r.stepCentred:""} ${a.active?r.stepActive:""}`,"data-node-id":a.node,children:[o.jsx("span",{className:`${r.badge} ${a.active?r.badgeActive:""}`,children:a.number}),o.jsx("span",{className:r.stepLabel,children:a.label})]},a.number))}),o.jsxs("div",{className:r.body,"data-node-id":"287:55373",children:[o.jsxs("div",{className:r.intro,"data-node-id":"287:55374",children:[o.jsx("span",{className:r.avatar,"data-node-id":"287:55375",children:o.jsx(xe,{className:r.orb,size:31.701,time:e,settings:we(t)})}),o.jsxs("div",{className:r.introText,"data-node-id":"287:55377",children:[o.jsx("p",{className:r.introTitle,children:"Talk to Agent"}),o.jsx("p",{className:r.introSubtitle,children:"Have a real conversation about you"})]})]}),o.jsxs("div",{className:r.actions,"data-node-id":"287:55380",children:[o.jsx("div",{className:r.rows,"data-node-id":"287:55381",children:s0.map(a=>o.jsxs("div",{className:r.row,"data-node-id":a.node,children:[o.jsxs("div",{className:r.rowMain,children:[o.jsx("span",{className:r.rowIcon,children:o.jsx("img",{src:a.icon,alt:""})}),o.jsxs("div",{className:r.rowText,children:[o.jsx("p",{className:r.rowTitle,children:a.title}),o.jsx("p",{className:r.rowDescription,children:a.description})]})]}),o.jsx("img",{className:r.chevron,src:_e,alt:""})]},a.title))}),o.jsxs("div",{className:r.input,"data-node-id":"287:55425",children:[o.jsx("p",{className:r.placeholder,children:"Ask agent anything ..."}),o.jsx("span",{className:r.send,"data-node-id":"287:55427",children:o.jsx("img",{src:Se,alt:""})})]})]})]})]})]})]})}export{l0 as default};
