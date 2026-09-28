import{r as g,j as S,L as xe,l as Ee}from"./index-G6wkZDu_.js";const Te={Shape:{Size:1,Width:1.1,Height:1.2,Depth:1.1,OffsetX:0,OffsetY:0},Logo:{Size:2.8,OffsetX:0,OffsetY:0},Glass:{Index:1.45,Dispersion:.003,Distance:1.9,Milk:.14,Tint:"#f0f0f0",Reflection:1,Sheen:.3,Edges:.28},Shadow:{Shadow:.07,Caustic:.12,Drop:.3},Rotation:{Yaw:45,Pitch:0,Roll:0},Motion:{Sway:.2,Speed:.22,Scroll:.004,Lean:.05,Cant:.1,Bob:0,PointerRoll:.15,PointerPitch:.08}},be={values:Te},Me={Shape:{Size:1,Width:1.1,Height:1.2,Depth:1.1,OffsetX:0,OffsetY:0},Logo:{Size:2.8,OffsetX:0,OffsetY:0},Glass:{Index:1.45,Dispersion:.003,Distance:1.9,Milk:.14,Tint:"#f0f0f0",Reflection:1,Sheen:.3,Edges:.28},Shadow:{Shadow:.07,Caustic:.12,Drop:.3},Rotation:{Yaw:45,Pitch:0,Roll:0},Motion:{Sway:.2,Speed:.22,Scroll:.004,Lean:.05,Cant:.1,Bob:0,PointerRoll:.15,PointerPitch:.08}};function De(o=be.values??{}){const r={};for(const[a,i]of Object.entries(Me)){r[a]={...i};for(const[s,u]of Object.entries(i)){const l=o[a]?.[s];typeof l==typeof u&&(r[a][s]=l)}}return r}const I=160,ye=2,P=12,Ae=`#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0., 1.); }`,Ie=`#version 300 es
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
  // Facet edges read as thin darker lines, like cut glass.
  float edge = 1. - smoothstep(0., 0.035, edgeDistance(p0));
  col *= 1. - uEdge * edge;
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
}`,Z=1024,J=16;function Pe(){const o=document.createElement("canvas");o.width=o.height=Z;const r=o.getContext("2d"),a=Z/J;r.setTransform(a,0,0,a,a,a),r.fillStyle="#fff";for(const i of Ee)r.fill(new Path2D(i.d));return o}function $(o,r,a){const i=o.createShader(r);if(o.shaderSource(i,a),o.compileShader(i),!o.getShaderParameter(i,o.COMPILE_STATUS))throw new Error(o.getShaderInfoLog(i)??"shader");return i}const L=o=>{const r=/^#([0-9a-f]{6})$/i.exec(o.trim());return r?[0,2,4].map(a=>parseInt(r[1].slice(a,a+2),16)/255):[.94,.94,.94]},k=o=>o*Math.PI/180;function Le(o,r,a){const i=Math.cos(o),s=Math.sin(o),u=Math.cos(r),l=Math.sin(r),f=Math.cos(a),e=Math.sin(a);return new Float32Array([f*i+e*l*s,e*i-f*l*s,-u*s,-e*u,f*u,l,f*s-e*l*i,e*s+f*l*i,u*i])}function _e({anchor:o,settings:r}){const a=g.useRef(null),i=g.useRef(null),s=g.useRef(r??De());s.current=r??s.current;const u=g.useRef(()=>{});return g.useEffect(()=>{u.current()},[r]),g.useEffect(()=>{const l=a.current,f=l?.parentElement;if(!l||!f)return;const e=l.getContext("webgl2",{antialias:!1,alpha:!1,depth:!1,stencil:!1,powerPreference:"low-power"});if(!e){i.current?.removeAttribute("hidden");return}const _=window.matchMedia("(prefers-reduced-motion: reduce)").matches,h=e.createProgram();e.attachShader(h,$(e,e.VERTEX_SHADER,Ae)),e.attachShader(h,$(e,e.FRAGMENT_SHADER,Ie)),e.linkProgram(h),e.useProgram(h);const K=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,K),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const O=e.getAttribLocation(h,"p");e.enableVertexAttribArray(O),e.vertexAttribPointer(O,2,e.FLOAT,!1,0,0);const Q=e.createTexture();e.bindTexture(e.TEXTURE_2D,Q),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,Pe()),e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const n=t=>e.getUniformLocation(h,t),C=getComputedStyle(document.documentElement);e.uniform3fv(n("uInk"),L(C.getPropertyValue("--color-ink").trim()||"#1b1b1b")),e.uniform3fv(n("uPaper"),L(C.getPropertyValue("--color-footer").trim()||"#fafafa")),e.uniform1f(n("uCam"),P),e.uniform1i(n("uLogo"),0);const ee=n("uScale"),te=n("uCentre"),oe=n("uReach"),ne=n("uRot"),re=n("uHalf"),ae=n("uTexSize"),ie=n("uLogoOffset"),ce=n("uBack"),se=n("uIor"),le=n("uTint"),fe=n("uMilk"),ue=n("uReflect"),de=n("uSheen"),he=n("uEdge"),ve=n("uShadow"),me=n("uCaustic"),pe=n("uDrop");let d=1,v=I,R=1,w=1,z=0,G=0;const X=()=>{const t=f.getBoundingClientRect();d=Math.min(window.devicePixelRatio||1,ye),R=t.width,w=t.height,l.width=Math.max(1,Math.round(R*d)),l.height=Math.max(1,Math.round(w*d)),e.viewport(0,0,l.width,l.height),v=Math.min(I,R/2.9);const c=o.current?.getBoundingClientRect();z=c?c.left+c.width/2-t.left:R/2,G=c?c.top+c.height/2-t.top:w/2};let m=.8,b=0,M=0,D=0,y=0,p=0,x=0,F=window.scrollY;const E=()=>{const t=s.current,c=[t.Shape.Width*t.Shape.Size,t.Shape.Height*t.Shape.Size,t.Shape.Depth*t.Shape.Size],T=-t.Glass.Distance,W=Math.hypot(...c)*(P-T)/P*1.08+.05,V=t.Motion.Bob*Math.sin(m*.9),ge=w-G-t.Shape.OffsetY+V*v;e.uniform1f(ee,v*d),e.uniform2f(te,(z+t.Shape.OffsetX)*d,ge*d),e.uniform1f(oe,W*v*d),e.uniform3fv(re,c),e.uniform1f(ae,t.Logo.Size*J/14),e.uniform2f(ie,(t.Logo.OffsetX-t.Shape.OffsetX)/v,(t.Shape.OffsetY-t.Logo.OffsetY)/v-V),e.uniform1f(ce,T),e.uniform3f(se,t.Glass.Index-t.Glass.Dispersion,t.Glass.Index,t.Glass.Index+t.Glass.Dispersion),e.uniform3fv(le,L(t.Glass.Tint)),e.uniform1f(fe,t.Glass.Milk),e.uniform1f(ue,t.Glass.Reflection),e.uniform1f(de,t.Glass.Sheen),e.uniform1f(he,t.Glass.Edges),e.uniform1f(ve,t.Shadow.Shadow),e.uniform1f(me,t.Shadow.Caustic),e.uniform1f(pe,t.Shadow.Drop);const Se=k(t.Rotation.Yaw)+t.Motion.Sway*Math.sin(m),Re=t.Motion.Lean*Math.sin(m*.7+1.2),we=t.Motion.Cant*Math.sin(m*.5+2.4);e.uniformMatrix3fv(ne,!1,Le(Se,k(t.Rotation.Pitch)+b+Re,k(t.Rotation.Roll)+D+we)),e.drawArrays(e.TRIANGLES,0,3)};X();const A=new ResizeObserver(()=>{X(),_&&E()});if(A.observe(f),u.current=()=>{p||E()},_)return E(),()=>{A.disconnect(),u.current=()=>{}};const N=t=>{const c=x?Math.min(.05,(t-x)/1e3):0;x=t,m+=s.current.Motion.Speed*c,b+=(M-b)*(1-Math.exp(-c/.18)),D+=(y-D)*(1-Math.exp(-c/.18)),E(),p=requestAnimationFrame(N)},U=()=>{!p&&!document.hidden&&(x=0,p=requestAnimationFrame(N))},B=()=>{cancelAnimationFrame(p),p=0},Y=()=>{const t=window.scrollY;m+=(t-F)*s.current.Motion.Scroll,F=t},H=t=>{const c=f.getBoundingClientRect(),T=(t.clientX-c.left)/c.width-.5;M=((t.clientY-c.top)/c.height-.5)*s.current.Motion.PointerPitch,y=-T*s.current.Motion.PointerRoll},j=()=>{M=0,y=0},q=()=>document.hidden?B():U();return window.addEventListener("scroll",Y,{passive:!0}),f.addEventListener("pointermove",H),f.addEventListener("pointerleave",j),document.addEventListener("visibilitychange",q),U(),()=>{B(),u.current=()=>{},A.disconnect(),window.removeEventListener("scroll",Y),f.removeEventListener("pointermove",H),f.removeEventListener("pointerleave",j),document.removeEventListener("visibilitychange",q),e.getExtension("WEBGL_lose_context")?.loseContext()}},[o]),S.jsxs(S.Fragment,{children:[S.jsx("canvas",{ref:a,className:"contact-glass","aria-hidden":"true"}),S.jsx("div",{ref:i,className:"contact-glass-fallback",hidden:!0,"aria-hidden":"true",children:S.jsx(xe,{size:s.current.Logo.Size*I,color:"var(--color-ink)"})})]})}export{_e as default,Me as glassDefaults,De as glassSettings};
