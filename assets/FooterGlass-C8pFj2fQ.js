import{r as m,j as S,L as Ue,l as Xe}from"./index-BUc1r-YT.js";const qe={Shape:{Size:.94,Width:1.18,Height:1.15,Depth:1.15,OffsetX:0,OffsetY:0},Logo:{Size:.5,OffsetX:0,OffsetY:0},Glass:{Index:2.09,Dispersion:.0065,Distance:.2,Milk:.38,Tint:"#dfe4e8",Reflection:.55,Sheen:.35,Edges:0,Rim:0,Round:.6,Blur:0},Light:{Glow:0,Inner:.44,Glints:0},Liquid:{Ripple:.18,Noise:0,Flow:.69},Shadow:{Shadow:.025,Caustic:0,Drop:.3},Rotation:{Yaw:45,Pitch:0,Roll:0},Motion:{Spin:.205,Sway:.4,Speed:.22,Scroll:.0045,Lean:.225,Cant:.4,Bob:.175,Float:.7,PointerRoll:0,PointerPitch:0}},Ye={values:qe},He={Shape:{Size:.85,Width:1.1,Height:1.15,Depth:1.1,OffsetX:0,OffsetY:0},Logo:{Size:2.4,OffsetX:0,OffsetY:0},Glass:{Index:1.45,Dispersion:.004,Distance:1.4,Milk:.3,Tint:"#dfe4e8",Reflection:1,Sheen:.35,Edges:0,Rim:.45,Round:.75,Blur:1.2},Light:{Glow:.22,Inner:.3,Glints:1},Liquid:{Ripple:.06,Noise:.03,Flow:1},Shadow:{Shadow:.07,Caustic:.12,Drop:.3},Rotation:{Yaw:45,Pitch:0,Roll:0},Motion:{Spin:.12,Sway:.2,Speed:.22,Scroll:.004,Lean:.05,Cant:.1,Bob:.1,Float:.7,PointerRoll:.15,PointerPitch:.08}};function je(n=Ye.values??{}){const r={};for(const[i,a]of Object.entries(He)){r[i]={...a};for(const[l,d]of Object.entries(a)){const u=n[i]?.[l];typeof u==typeof d&&(r[i][l]=u)}}return r}const N=160,We=2,O=12,Ve=80,Ze=`#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0., 1.); }`,$e=`#version 300 es
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
}`,F=1024,B=16;function Je(){const n=document.createElement("canvas");n.width=n.height=F;const r=n.getContext("2d"),i=F/B;r.setTransform(i,0,0,i,i,i),r.fillStyle="#fff";for(const a of Xe)r.fill(new Path2D(a.d));return n}function ce(n,r,i){const a=n.createShader(r);if(n.shaderSource(a,i),n.compileShader(a),!n.getShaderParameter(a,n.COMPILE_STATUS))throw new Error(n.getShaderInfoLog(a)??"shader");return a}const _=n=>{const r=/^#([0-9a-f]{6})$/i.exec(n.trim());return r?[0,2,4].map(i=>parseInt(r[1].slice(i,i+2),16)/255):[.94,.94,.94]},C=n=>n*Math.PI/180;function Ke(n,r,i){const a=Math.cos(n),l=Math.sin(n),d=Math.cos(r),u=Math.sin(r),c=Math.cos(i),f=Math.sin(i);return new Float32Array([c*a+f*u*l,f*a-c*u*l,-d*l,-f*d,c*d,u,c*l-f*u*a,f*l+c*u*a,d*a])}function et({anchor:n,settings:r,playing:i=!0}){const a=m.useRef(i),l=m.useRef({start:()=>{},stop:()=>{}});m.useEffect(()=>{a.current=i,i?l.current.start():l.current.stop()},[i]);const d=m.useRef(null),u=m.useRef(null),c=m.useRef(r??je());c.current=r??c.current;const f=m.useRef(()=>{});return m.useEffect(()=>{f.current()},[r]),m.useEffect(()=>{const g=d.current,h=g?.parentElement;if(!g||!h)return;const e=g.getContext("webgl2",{antialias:!1,alpha:!1,depth:!1,stencil:!1,powerPreference:"low-power"});if(!e){u.current?.removeAttribute("hidden");return}const U=window.matchMedia("(prefers-reduced-motion: reduce)").matches,w=e.createProgram();try{e.attachShader(w,ce(e,e.VERTEX_SHADER,Ze)),e.attachShader(w,ce(e,e.FRAGMENT_SHADER,$e))}catch(t){console.warn("FooterGlass: shader unavailable.",t),u.current?.removeAttribute("hidden");return}e.linkProgram(w),e.useProgram(w);const X=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,X),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const q=e.getAttribLocation(w,"p");e.enableVertexAttribArray(q),e.vertexAttribPointer(q,2,e.FLOAT,!1,0,0);const Y=e.createTexture();e.bindTexture(e.TEXTURE_2D,Y),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,Je()),e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const o=t=>e.getUniformLocation(w,t),H=getComputedStyle(document.documentElement);e.uniform3fv(o("uInk"),_(H.getPropertyValue("--color-ink").trim()||"#1b1b1b")),e.uniform3fv(o("uPaper"),_(H.getPropertyValue("--color-footer").trim()||"#fafafa")),e.uniform1f(o("uCam"),O),e.uniform1i(o("uLogo"),0);const le=o("uScale"),ue=o("uCentre"),fe=o("uReach"),de=o("uRot"),he=o("uHalf"),me=o("uTexSize"),ve=o("uLogoOffset"),pe=o("uBack"),ge=o("uIor"),we=o("uTint"),Re=o("uMilk"),xe=o("uReflect"),Se=o("uSheen"),Te=o("uEdge"),be=o("uShadow"),Ee=o("uCaustic"),ye=o("uDrop"),Le=o("uRim"),Me=o("uRound"),ke=o("uRipple"),Ie=o("uNoise"),Ae=o("uTime"),Pe=o("uGlow"),ze=o("uInner"),De=o("uGlints"),Ge=o("uLod");let v=1,p=N,T=1,b=1,j=0,W=0;const V=()=>{const t=h.getBoundingClientRect();v=Math.min(window.devicePixelRatio||1,We),T=t.width,b=t.height,g.width=Math.max(1,Math.round(T*v)),g.height=Math.max(1,Math.round(b*v)),e.viewport(0,0,g.width,g.height),p=Math.min(N,T/2.9);const s=n.current?.getBoundingClientRect();j=T/2,W=s?s.top-t.top:b};let x=.8,Z=0,$=0,J=0,M=0,k=0,I=0,A=0;const P=h.closest(".project-layer"),K=()=>P?P.scrollTop:window.scrollY;let R=0,E=0,Q=K();const y=()=>{const t=c.current,s=[t.Shape.Width*t.Shape.Size,t.Shape.Height*t.Shape.Size,t.Shape.Depth*t.Shape.Size],L=-t.Glass.Distance,ae=Math.hypot(...s)*(O-L)/O*1.08+.05,se=t.Motion.Bob*Math.sin(J),Ne=W-Ve-s[1]*p*.93,Oe=b-Ne-t.Shape.OffsetY+se*p;e.uniform1f(le,p*v),e.uniform2f(ue,(j+t.Shape.OffsetX)*v,Oe*v),e.uniform1f(fe,ae*p*v),e.uniform3fv(he,s),e.uniform1f(me,t.Logo.Size*B/14),e.uniform2f(ve,(t.Logo.OffsetX-t.Shape.OffsetX)/p,(t.Shape.OffsetY-t.Logo.OffsetY)/p-se),e.uniform1f(pe,L),e.uniform3f(ge,t.Glass.Index-t.Glass.Dispersion,t.Glass.Index,t.Glass.Index+t.Glass.Dispersion),e.uniform3fv(we,_(t.Glass.Tint)),e.uniform1f(Re,t.Glass.Milk),e.uniform1f(xe,t.Glass.Reflection),e.uniform1f(Se,t.Glass.Sheen),e.uniform1f(Te,t.Glass.Edges),e.uniform1f(be,t.Shadow.Shadow),e.uniform1f(Ee,t.Shadow.Caustic),e.uniform1f(ye,t.Shadow.Drop),e.uniform1f(Le,t.Glass.Rim),e.uniform1f(Me,t.Glass.Round),e.uniform1f(ke,t.Liquid.Ripple),e.uniform1f(Ie,t.Liquid.Noise),e.uniform1f(Ae,$),e.uniform1f(Pe,t.Light.Glow),e.uniform1f(ze,t.Light.Inner),e.uniform1f(De,t.Light.Glints);const _e=t.Logo.Size*B/14*p*v;e.uniform1f(Ge,Math.max(0,Math.log2(F/_e)+t.Glass.Blur));const Ce=C(t.Rotation.Yaw)+Z+t.Motion.Sway*Math.sin(x),Fe=t.Motion.Lean*Math.sin(x*.7+1.2),Be=t.Motion.Cant*Math.sin(x*.5+2.4);e.uniformMatrix3fv(de,!1,Ke(Ce,C(t.Rotation.Pitch)+M+Fe,C(t.Rotation.Roll)+I+Be)),e.drawArrays(e.TRIANGLES,0,3)};V();const z=new ResizeObserver(()=>{V(),U&&y()});if(z.observe(h),f.current=()=>{R||y()},U)return y(),()=>{z.disconnect(),f.current=()=>{}};const ee=t=>{const s=E?Math.min(.05,(t-E)/1e3):0;E=t,x+=c.current.Motion.Speed*s,Z+=c.current.Motion.Spin*s,J+=c.current.Motion.Float*s,$+=c.current.Liquid.Flow*s,M+=(k-M)*(1-Math.exp(-s/.18)),I+=(A-I)*(1-Math.exp(-s/.18)),y(),R=requestAnimationFrame(ee)},D=()=>{!R&&!document.hidden&&a.current&&(E=0,R=requestAnimationFrame(ee))},G=()=>{cancelAnimationFrame(R),R=0};l.current={start:D,stop:G};const te=()=>{const t=K();x+=(t-Q)*c.current.Motion.Scroll,Q=t},oe=t=>{const s=h.getBoundingClientRect(),L=(t.clientX-s.left)/s.width-.5;k=((t.clientY-s.top)/s.height-.5)*c.current.Motion.PointerPitch,A=-L*c.current.Motion.PointerRoll},ne=()=>{k=0,A=0},ie=()=>document.hidden?G():D(),re=P??window;return re.addEventListener("scroll",te,{passive:!0}),h.addEventListener("pointermove",oe),h.addEventListener("pointerleave",ne),document.addEventListener("visibilitychange",ie),D(),()=>{G(),l.current={start:()=>{},stop:()=>{}},f.current=()=>{},z.disconnect(),re.removeEventListener("scroll",te),h.removeEventListener("pointermove",oe),h.removeEventListener("pointerleave",ne),document.removeEventListener("visibilitychange",ie),e.deleteTexture(Y),e.deleteBuffer(X),e.deleteProgram(w)}},[n]),S.jsxs(S.Fragment,{children:[S.jsx("canvas",{ref:d,className:"contact-glass","aria-hidden":"true"}),S.jsx("div",{ref:u,className:"contact-glass-fallback",hidden:!0,"aria-hidden":"true",children:S.jsx(Ue,{size:c.current.Logo.Size*N,color:"var(--color-ink)"})})]})}export{et as default,He as glassDefaults,je as glassSettings};
