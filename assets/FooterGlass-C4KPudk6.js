import{r as g,j as w,L as De,l as Pe}from"./index-DFFnP0_X.js";const Ge={Shape:{Size:.85,Width:1.1,Height:1.15,Depth:1.1,OffsetX:0,OffsetY:0},Logo:{Size:2.4,OffsetX:0,OffsetY:0},Glass:{Index:1.45,Dispersion:.006,Distance:1.5,Milk:.2,Tint:"#eef2f5",Reflection:1,Sheen:.5,Edges:.08,Rim:.3,Round:.15},Light:{Glow:.5,Inner:.5,Glints:1},Liquid:{Ripple:.06,Noise:.03,Flow:1},Shadow:{Shadow:.07,Caustic:.12,Drop:.3},Rotation:{Yaw:45,Pitch:0,Roll:0},Motion:{Spin:.12,Sway:.2,Speed:.22,Scroll:.004,Lean:.05,Cant:.1,Bob:.02,PointerRoll:.15,PointerPitch:.08}},ke={values:Ge},Oe={Shape:{Size:.85,Width:1.1,Height:1.15,Depth:1.1,OffsetX:0,OffsetY:0},Logo:{Size:2.4,OffsetX:0,OffsetY:0},Glass:{Index:1.45,Dispersion:.006,Distance:1.5,Milk:.2,Tint:"#eef2f5",Reflection:1,Sheen:.5,Edges:.08,Rim:.3,Round:.15},Light:{Glow:.5,Inner:.5,Glints:1},Liquid:{Ripple:.06,Noise:.03,Flow:1},Shadow:{Shadow:.07,Caustic:.12,Drop:.3},Rotation:{Yaw:45,Pitch:0,Roll:0},Motion:{Spin:.12,Sway:.2,Speed:.22,Scroll:.004,Lean:.05,Cant:.1,Bob:.02,PointerRoll:.15,PointerPitch:.08}};function _e(n=ke.values??{}){const a={};for(const[s,i]of Object.entries(Oe)){a[s]={...i};for(const[c,f]of Object.entries(i)){const l=n[s]?.[c];typeof l==typeof f&&(a[s][c]=l)}}return a}const z=160,Ce=2,A=12,Ne=`#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0., 1.); }`,Fe=`#version 300 es
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
// The point lights: small sharp glints.
float glints(vec3 d) {
  float e = 0.7 * pow(max(dot(d, normalize(vec3(-0.5, 0.7, 0.52))), 0.), 500.);
  e += 0.55 * pow(max(dot(d, normalize(vec3(0.62, 0.5, 0.6))), 0.), 320.);
  e += 0.5 * pow(max(dot(d, normalize(vec3(-0.15, 0.35, 0.92))), 0.), 700.);
  e += 0.45 * pow(max(dot(d, normalize(vec3(0.3, -0.2, 0.93))), 0.), 600.);
  e += 0.4 * pow(max(dot(d, normalize(vec3(-0.7, 0.1, 0.7))), 0.), 450.);
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
  float inner = 0., glow = 0.;
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
}`,Q=1024,te=16;function Xe(){const n=document.createElement("canvas");n.width=n.height=Q;const a=n.getContext("2d"),s=Q/te;a.setTransform(s,0,0,s,s,s),a.fillStyle="#fff";for(const i of Pe)a.fill(new Path2D(i.d));return n}function ee(n,a,s){const i=n.createShader(a);if(n.shaderSource(i,s),n.compileShader(i),!n.getShaderParameter(i,n.COMPILE_STATUS))throw new Error(n.getShaderInfoLog(i)??"shader");return i}const D=n=>{const a=/^#([0-9a-f]{6})$/i.exec(n.trim());return a?[0,2,4].map(s=>parseInt(a[1].slice(s,s+2),16)/255):[.94,.94,.94]},P=n=>n*Math.PI/180;function Be(n,a,s){const i=Math.cos(n),c=Math.sin(n),f=Math.cos(a),l=Math.sin(a),u=Math.cos(s),e=Math.sin(s);return new Float32Array([u*i+e*l*c,e*i-u*l*c,-f*c,-e*f,u*f,l,u*c-e*l*i,e*c+u*l*i,f*i])}function Ye({anchor:n,settings:a}){const s=g.useRef(null),i=g.useRef(null),c=g.useRef(a??_e());c.current=a??c.current;const f=g.useRef(()=>{});return g.useEffect(()=>{f.current()},[a]),g.useEffect(()=>{const l=s.current,u=l?.parentElement;if(!l||!u)return;const e=l.getContext("webgl2",{antialias:!1,alpha:!1,depth:!1,stencil:!1,powerPreference:"low-power"});if(!e){i.current?.removeAttribute("hidden");return}const G=window.matchMedia("(prefers-reduced-motion: reduce)").matches,d=e.createProgram();try{e.attachShader(d,ee(e,e.VERTEX_SHADER,Ne)),e.attachShader(d,ee(e,e.FRAGMENT_SHADER,Fe))}catch(t){console.warn("FooterGlass: shader unavailable.",t),i.current?.removeAttribute("hidden");return}e.linkProgram(d),e.useProgram(d);const k=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,k),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const O=e.getAttribLocation(d,"p");e.enableVertexAttribArray(O),e.vertexAttribPointer(O,2,e.FLOAT,!1,0,0);const _=e.createTexture();e.bindTexture(e.TEXTURE_2D,_),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,Xe()),e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const o=t=>e.getUniformLocation(d,t),C=getComputedStyle(document.documentElement);e.uniform3fv(o("uInk"),D(C.getPropertyValue("--color-ink").trim()||"#1b1b1b")),e.uniform3fv(o("uPaper"),D(C.getPropertyValue("--color-footer").trim()||"#fafafa")),e.uniform1f(o("uCam"),A),e.uniform1i(o("uLogo"),0);const oe=o("uScale"),ne=o("uCentre"),ie=o("uReach"),re=o("uRot"),ae=o("uHalf"),se=o("uTexSize"),ce=o("uLogoOffset"),le=o("uBack"),ue=o("uIor"),fe=o("uTint"),de=o("uMilk"),he=o("uReflect"),me=o("uSheen"),ve=o("uEdge"),pe=o("uShadow"),ge=o("uCaustic"),we=o("uDrop"),Re=o("uRim"),Se=o("uRound"),Te=o("uRipple"),xe=o("uNoise"),Ee=o("uTime"),be=o("uGlow"),Me=o("uInner"),Le=o("uGlints");let h=1,m=z,R=1,S=1,N=0,F=0;const X=()=>{const t=u.getBoundingClientRect();h=Math.min(window.devicePixelRatio||1,Ce),R=t.width,S=t.height,l.width=Math.max(1,Math.round(R*h)),l.height=Math.max(1,Math.round(S*h)),e.viewport(0,0,l.width,l.height),m=Math.min(z,R/2.9);const r=n.current?.getBoundingClientRect();N=r?r.left+r.width/2-t.left:R/2,F=r?r.top+r.height/2-t.top:S/2};let v=.8,B=0,U=0,b=0,M=0,L=0,I=0,p=0,T=0,Y=window.scrollY;const x=()=>{const t=c.current,r=[t.Shape.Width*t.Shape.Size,t.Shape.Height*t.Shape.Size,t.Shape.Depth*t.Shape.Size],E=-t.Glass.Distance,J=Math.hypot(...r)*(A-E)/A*1.08+.05,K=t.Motion.Bob*Math.sin(v*.9),Ie=S-F-t.Shape.OffsetY+K*m;e.uniform1f(oe,m*h),e.uniform2f(ne,(N+t.Shape.OffsetX)*h,Ie*h),e.uniform1f(ie,J*m*h),e.uniform3fv(ae,r),e.uniform1f(se,t.Logo.Size*te/14),e.uniform2f(ce,(t.Logo.OffsetX-t.Shape.OffsetX)/m,(t.Shape.OffsetY-t.Logo.OffsetY)/m-K),e.uniform1f(le,E),e.uniform3f(ue,t.Glass.Index-t.Glass.Dispersion,t.Glass.Index,t.Glass.Index+t.Glass.Dispersion),e.uniform3fv(fe,D(t.Glass.Tint)),e.uniform1f(de,t.Glass.Milk),e.uniform1f(he,t.Glass.Reflection),e.uniform1f(me,t.Glass.Sheen),e.uniform1f(ve,t.Glass.Edges),e.uniform1f(pe,t.Shadow.Shadow),e.uniform1f(ge,t.Shadow.Caustic),e.uniform1f(we,t.Shadow.Drop),e.uniform1f(Re,t.Glass.Rim),e.uniform1f(Se,t.Glass.Round),e.uniform1f(Te,t.Liquid.Ripple),e.uniform1f(xe,t.Liquid.Noise),e.uniform1f(Ee,U),e.uniform1f(be,t.Light.Glow),e.uniform1f(Me,t.Light.Inner),e.uniform1f(Le,t.Light.Glints);const ye=P(t.Rotation.Yaw)+B+t.Motion.Sway*Math.sin(v),ze=t.Motion.Lean*Math.sin(v*.7+1.2),Ae=t.Motion.Cant*Math.sin(v*.5+2.4);e.uniformMatrix3fv(re,!1,Be(ye,P(t.Rotation.Pitch)+b+ze,P(t.Rotation.Roll)+L+Ae)),e.drawArrays(e.TRIANGLES,0,3)};X();const y=new ResizeObserver(()=>{X(),G&&x()});if(y.observe(u),f.current=()=>{p||x()},G)return x(),()=>{y.disconnect(),f.current=()=>{}};const q=t=>{const r=T?Math.min(.05,(t-T)/1e3):0;T=t,v+=c.current.Motion.Speed*r,B+=c.current.Motion.Spin*r,U+=c.current.Liquid.Flow*r,b+=(M-b)*(1-Math.exp(-r/.18)),L+=(I-L)*(1-Math.exp(-r/.18)),x(),p=requestAnimationFrame(q)},H=()=>{!p&&!document.hidden&&(T=0,p=requestAnimationFrame(q))},j=()=>{cancelAnimationFrame(p),p=0},V=()=>{const t=window.scrollY;v+=(t-Y)*c.current.Motion.Scroll,Y=t},W=t=>{const r=u.getBoundingClientRect(),E=(t.clientX-r.left)/r.width-.5;M=((t.clientY-r.top)/r.height-.5)*c.current.Motion.PointerPitch,I=-E*c.current.Motion.PointerRoll},Z=()=>{M=0,I=0},$=()=>document.hidden?j():H();return window.addEventListener("scroll",V,{passive:!0}),u.addEventListener("pointermove",W),u.addEventListener("pointerleave",Z),document.addEventListener("visibilitychange",$),H(),()=>{j(),f.current=()=>{},y.disconnect(),window.removeEventListener("scroll",V),u.removeEventListener("pointermove",W),u.removeEventListener("pointerleave",Z),document.removeEventListener("visibilitychange",$),e.deleteTexture(_),e.deleteBuffer(k),e.deleteProgram(d)}},[n]),w.jsxs(w.Fragment,{children:[w.jsx("canvas",{ref:s,className:"contact-glass","aria-hidden":"true"}),w.jsx("div",{ref:i,className:"contact-glass-fallback",hidden:!0,"aria-hidden":"true",children:w.jsx(De,{size:c.current.Logo.Size*z,color:"var(--color-ink)"})})]})}export{Ye as default,Oe as glassDefaults,_e as glassSettings};
