import{r as g,j as R,L as Ae,l as De}from"./index-CwOaRg1t.js";const Ie={Shape:{Size:.85,Width:1.1,Height:1.15,Depth:1.1,OffsetX:0,OffsetY:0},Logo:{Size:2.4,OffsetX:0,OffsetY:0},Glass:{Index:1.45,Dispersion:.003,Distance:1.9,Milk:.14,Tint:"#f0f0f0",Reflection:1,Sheen:.3,Edges:.1,Rim:.3,Round:.6},Liquid:{Ripple:.2,Noise:.08,Flow:1},Shadow:{Shadow:.07,Caustic:.12,Drop:.3},Rotation:{Yaw:45,Pitch:0,Roll:0},Motion:{Spin:.12,Sway:.2,Speed:.22,Scroll:.004,Lean:.05,Cant:.1,Bob:.02,PointerRoll:.15,PointerPitch:.08}},Pe={values:Ie},ze={Shape:{Size:.85,Width:1.1,Height:1.15,Depth:1.1,OffsetX:0,OffsetY:0},Logo:{Size:2.4,OffsetX:0,OffsetY:0},Glass:{Index:1.45,Dispersion:.003,Distance:1.9,Milk:.14,Tint:"#f0f0f0",Reflection:1,Sheen:.3,Edges:.1,Rim:.3,Round:.6},Liquid:{Ripple:.2,Noise:.08,Flow:1},Shadow:{Shadow:.07,Caustic:.12,Drop:.3},Rotation:{Yaw:45,Pitch:0,Roll:0},Motion:{Spin:.12,Sway:.2,Speed:.22,Scroll:.004,Lean:.05,Cant:.1,Bob:.02,PointerRoll:.15,PointerPitch:.08}};function ke(n=Pe.values??{}){const a={};for(const[c,i]of Object.entries(ze)){a[c]={...i};for(const[s,f]of Object.entries(i)){const u=n[c]?.[s];typeof u==typeof f&&(a[c][s]=u)}}return a}const D=160,Oe=2,I=12,_e=`#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0., 1.); }`,Ce=`#version 300 es
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
  vec3 wave = vec3(
    sin(p.y * 6.0 + uTime * 1.3) * cos(p.z * 5.0 - uTime * 0.9),
    sin(p.z * 5.5 - uTime * 1.1) * cos(p.x * 6.5 + uTime * 0.7),
    sin(p.x * 6.0 + uTime * 0.8) * cos(p.y * 5.0 + uTime * 1.2));
  vec3 grain = vec3(
    sin(p.x * 23. + p.y * 17. + uTime * 2.0),
    sin(p.y * 21. - p.z * 19. + uTime * 1.7),
    sin(p.z * 25. + p.x * 15. - uTime * 2.3));
  return normalize(n + uRipple * 0.35 * wave + uNoise * 0.25 * grain);
}

// A soft rounded-rectangle light seen in direction c.
float softbox(vec3 d, vec3 c, float w, float h, float soft) {
  vec3 u = normalize(cross(c, vec3(0., 1., 0.)));
  vec3 v = cross(u, c);
  float z = dot(d, c);
  if (z <= 0.) return 0.;
  vec2 q = abs(vec2(dot(d, u), dot(d, v)) / z) - vec2(w, h);
  float sd = length(max(q, 0.)) + min(max(q.x, q.y), 0.);
  return 1. - smoothstep(0., soft, sd);
}

// The studio's lights: a wide window, three soft boxes and two sharp glints.
float lights(vec3 d) {
  float e = 0.22 * softbox(d, normalize(vec3(-0.3, 0.45, 0.85)), 0.9, 0.55, 0.9);
  e += 0.38 * softbox(d, normalize(vec3(-0.45, 0.75, 0.5)), 0.4, 0.12, 0.3);
  e += 0.28 * softbox(d, normalize(vec3(0.7, 0.25, 0.65)), 0.14, 0.32, 0.3);
  e += 0.18 * softbox(d, normalize(vec3(0.1, -0.55, 0.83)), 0.5, 0.08, 0.45);
  e += 0.7 * pow(max(dot(d, normalize(vec3(-0.5, 0.7, 0.52))), 0.), 500.);
  e += 0.55 * pow(max(dot(d, normalize(vec3(0.62, 0.5, 0.6))), 0.), 320.);
  return e;
}
// The studio the glass reflects: brighter above, plus its lights.
float env(vec3 d) { return mix(0.58, 0.9, smoothstep(-1., 1., d.y)) + lights(d); }

// The plane behind: the logo on the footer, with the glass's shadow and caustic.
vec3 background(vec2 p) {
  vec2 uv = (p - uLogoOffset) / uTexSize + 0.5;
  uv.y = 1. - uv.y;
  float inside = step(0., uv.x) * step(uv.x, 1.) * step(0., uv.y) * step(uv.y, 1.);
  float a = texture(uLogo, uv).a * inside;
  vec3 c = mix(uPaper, uInk, a);
  vec2 q = (p - vec2(0., -uDrop)) / vec2(uHalf.x * 1.15, uHalf.y * 0.9);
  float shadow = (1. - smoothstep(0.7, 1.3, length(q))) * uShadow;
  vec2 k = (p - vec2(0.08, -uDrop - 0.45)) / vec2(0.7, 0.34);
  float caustic = (1. - smoothstep(0., 1., length(k))) * uCaustic;
  c *= 1. - shadow;
  return mix(c, vec3(1.), caustic);
}

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
  vec3 nw = uRot * n0;
  float cosI = clamp(dot(-dd, n0), 0., 1.);
  float F = min(1., schlick(cosI) * uReflect);
  vec3 mirrored = reflect(d, nw);
  float reflection = env(mirrored);
  // A glossy sheen: the lights show on the surface even face-on, like coated glass.
  float sheen = lights(mirrored);

  vec3 seen = vec3(0.);
  float inner = 0.;
  for (int c = 0; c < 3; c++) {
    float ior = channel(uIor, c);
    vec3 p = p0, dir = refract(dd, n0, 1. / ior), outDir = dir;
    bool escaped = false;
    for (int b = 0; b < 3; b++) {
      float a0, a1; vec3 m0, m1;
      hitOct(p + dir * 1e-4, dir, a0, a1, m0, m1);
      p += dir * a1;
      m1 = liquidNormal(p, m1);
      vec3 r = refract(dir, -m1, ior);
      if (c == 1 && b == 0) inner = env(uRot * reflect(dir, -m1)) * schlick(clamp(dot(-dir, -m1), 0., 1.));
      if (dot(r, r) > 0.) { outDir = r; escaped = true; break; }
      dir = reflect(dir, -m1);
    }
    if (!escaped) outDir = dir;
    vec3 pw = uRot * p, dw = uRot * outDir;
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
  col += vec3(inner) * 0.35;
  col = mix(col, vec3(reflection), F);
  col += vec3(sheen) * uSheen;
  // Facet edges: thin darker lines like cut glass, and a bright rim catching the light.
  float edge = 1. - smoothstep(0., 0.035, edgeDistance(p0));
  col *= 1. - uEdge * edge;
  col += uRim * 0.6 * edge * (0.6 + 0.4 * dot(facet0, vec3(0., 0.6, 0.8)));
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
}`,Q=1024,te=16;function Ne(){const n=document.createElement("canvas");n.width=n.height=Q;const a=n.getContext("2d"),c=Q/te;a.setTransform(c,0,0,c,c,c),a.fillStyle="#fff";for(const i of De)a.fill(new Path2D(i.d));return n}function ee(n,a,c){const i=n.createShader(a);if(n.shaderSource(i,c),n.compileShader(i),!n.getShaderParameter(i,n.COMPILE_STATUS))throw new Error(n.getShaderInfoLog(i)??"shader");return i}const P=n=>{const a=/^#([0-9a-f]{6})$/i.exec(n.trim());return a?[0,2,4].map(c=>parseInt(a[1].slice(c,c+2),16)/255):[.94,.94,.94]},z=n=>n*Math.PI/180;function Fe(n,a,c){const i=Math.cos(n),s=Math.sin(n),f=Math.cos(a),u=Math.sin(a),l=Math.cos(c),e=Math.sin(c);return new Float32Array([l*i+e*u*s,e*i-l*u*s,-f*s,-e*f,l*f,u,l*s-e*u*i,e*s+l*u*i,f*i])}function Xe({anchor:n,settings:a}){const c=g.useRef(null),i=g.useRef(null),s=g.useRef(a??ke());s.current=a??s.current;const f=g.useRef(()=>{});return g.useEffect(()=>{f.current()},[a]),g.useEffect(()=>{const u=c.current,l=u?.parentElement;if(!u||!l)return;const e=u.getContext("webgl2",{antialias:!1,alpha:!1,depth:!1,stencil:!1,powerPreference:"low-power"});if(!e){i.current?.removeAttribute("hidden");return}const k=window.matchMedia("(prefers-reduced-motion: reduce)").matches,d=e.createProgram();try{e.attachShader(d,ee(e,e.VERTEX_SHADER,_e)),e.attachShader(d,ee(e,e.FRAGMENT_SHADER,Ce))}catch(t){console.warn("FooterGlass: shader unavailable.",t),i.current?.removeAttribute("hidden");return}e.linkProgram(d),e.useProgram(d);const O=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,O),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const _=e.getAttribLocation(d,"p");e.enableVertexAttribArray(_),e.vertexAttribPointer(_,2,e.FLOAT,!1,0,0);const C=e.createTexture();e.bindTexture(e.TEXTURE_2D,C),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,Ne()),e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const o=t=>e.getUniformLocation(d,t),N=getComputedStyle(document.documentElement);e.uniform3fv(o("uInk"),P(N.getPropertyValue("--color-ink").trim()||"#1b1b1b")),e.uniform3fv(o("uPaper"),P(N.getPropertyValue("--color-footer").trim()||"#fafafa")),e.uniform1f(o("uCam"),I),e.uniform1i(o("uLogo"),0);const oe=o("uScale"),ne=o("uCentre"),ie=o("uReach"),re=o("uRot"),ae=o("uHalf"),ce=o("uTexSize"),se=o("uLogoOffset"),ue=o("uBack"),le=o("uIor"),fe=o("uTint"),de=o("uMilk"),he=o("uReflect"),me=o("uSheen"),ve=o("uEdge"),pe=o("uShadow"),ge=o("uCaustic"),Re=o("uDrop"),Se=o("uRim"),we=o("uRound"),Te=o("uRipple"),xe=o("uNoise"),Ee=o("uTime");let h=1,m=D,S=1,w=1,F=0,G=0;const X=()=>{const t=l.getBoundingClientRect();h=Math.min(window.devicePixelRatio||1,Oe),S=t.width,w=t.height,u.width=Math.max(1,Math.round(S*h)),u.height=Math.max(1,Math.round(w*h)),e.viewport(0,0,u.width,u.height),m=Math.min(D,S/2.9);const r=n.current?.getBoundingClientRect();F=r?r.left+r.width/2-t.left:S/2,G=r?r.top+r.height/2-t.top:w/2};let v=.8,U=0,B=0,b=0,M=0,y=0,L=0,p=0,T=0,Y=window.scrollY;const x=()=>{const t=s.current,r=[t.Shape.Width*t.Shape.Size,t.Shape.Height*t.Shape.Size,t.Shape.Depth*t.Shape.Size],E=-t.Glass.Distance,J=Math.hypot(...r)*(I-E)/I*1.08+.05,K=t.Motion.Bob*Math.sin(v*.9),be=w-G-t.Shape.OffsetY+K*m;e.uniform1f(oe,m*h),e.uniform2f(ne,(F+t.Shape.OffsetX)*h,be*h),e.uniform1f(ie,J*m*h),e.uniform3fv(ae,r),e.uniform1f(ce,t.Logo.Size*te/14),e.uniform2f(se,(t.Logo.OffsetX-t.Shape.OffsetX)/m,(t.Shape.OffsetY-t.Logo.OffsetY)/m-K),e.uniform1f(ue,E),e.uniform3f(le,t.Glass.Index-t.Glass.Dispersion,t.Glass.Index,t.Glass.Index+t.Glass.Dispersion),e.uniform3fv(fe,P(t.Glass.Tint)),e.uniform1f(de,t.Glass.Milk),e.uniform1f(he,t.Glass.Reflection),e.uniform1f(me,t.Glass.Sheen),e.uniform1f(ve,t.Glass.Edges),e.uniform1f(pe,t.Shadow.Shadow),e.uniform1f(ge,t.Shadow.Caustic),e.uniform1f(Re,t.Shadow.Drop),e.uniform1f(Se,t.Glass.Rim),e.uniform1f(we,t.Glass.Round),e.uniform1f(Te,t.Liquid.Ripple),e.uniform1f(xe,t.Liquid.Noise),e.uniform1f(Ee,B);const Me=z(t.Rotation.Yaw)+U+t.Motion.Sway*Math.sin(v),ye=t.Motion.Lean*Math.sin(v*.7+1.2),Le=t.Motion.Cant*Math.sin(v*.5+2.4);e.uniformMatrix3fv(re,!1,Fe(Me,z(t.Rotation.Pitch)+b+ye,z(t.Rotation.Roll)+y+Le)),e.drawArrays(e.TRIANGLES,0,3)};X();const A=new ResizeObserver(()=>{X(),k&&x()});if(A.observe(l),f.current=()=>{p||x()},k)return x(),()=>{A.disconnect(),f.current=()=>{}};const q=t=>{const r=T?Math.min(.05,(t-T)/1e3):0;T=t,v+=s.current.Motion.Speed*r,U+=s.current.Motion.Spin*r,B+=s.current.Liquid.Flow*r,b+=(M-b)*(1-Math.exp(-r/.18)),y+=(L-y)*(1-Math.exp(-r/.18)),x(),p=requestAnimationFrame(q)},H=()=>{!p&&!document.hidden&&(T=0,p=requestAnimationFrame(q))},j=()=>{cancelAnimationFrame(p),p=0},V=()=>{const t=window.scrollY;v+=(t-Y)*s.current.Motion.Scroll,Y=t},W=t=>{const r=l.getBoundingClientRect(),E=(t.clientX-r.left)/r.width-.5;M=((t.clientY-r.top)/r.height-.5)*s.current.Motion.PointerPitch,L=-E*s.current.Motion.PointerRoll},Z=()=>{M=0,L=0},$=()=>document.hidden?j():H();return window.addEventListener("scroll",V,{passive:!0}),l.addEventListener("pointermove",W),l.addEventListener("pointerleave",Z),document.addEventListener("visibilitychange",$),H(),()=>{j(),f.current=()=>{},A.disconnect(),window.removeEventListener("scroll",V),l.removeEventListener("pointermove",W),l.removeEventListener("pointerleave",Z),document.removeEventListener("visibilitychange",$),e.deleteTexture(C),e.deleteBuffer(O),e.deleteProgram(d)}},[n]),R.jsxs(R.Fragment,{children:[R.jsx("canvas",{ref:c,className:"contact-glass","aria-hidden":"true"}),R.jsx("div",{ref:i,className:"contact-glass-fallback",hidden:!0,"aria-hidden":"true",children:R.jsx(Ae,{size:s.current.Logo.Size*D,color:"var(--color-ink)"})})]})}export{Xe as default,ze as glassDefaults,ke as glassSettings};
