import{r as w,j as p,L as ee,l as te}from"./index-WGYuUC4S.js";const U=160,oe=1.5,A=[1.1,1.2,1.1],B=2.8,_=12,X=-1.9,ne=Math.PI/4,ae=.34,re=.22,ce=.004,G=.22,ie=`#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0., 1.); }`,se=`#version 300 es
precision highp float;
out vec4 fragColor;
uniform float uScale;
uniform vec2 uCentre;
uniform mat3 uRot;
uniform vec3 uHalf;
uniform float uTexSize;
uniform sampler2D uLogo;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform float uCam;
uniform float uBack;
uniform float uReach;

const vec3 S[8] = vec3[8](
  vec3(1., 1., 1.), vec3(1., 1., -1.), vec3(1., -1., 1.), vec3(1., -1., -1.),
  vec3(-1., 1., 1.), vec3(-1., 1., -1.), vec3(-1., -1., 1.), vec3(-1., -1., -1.));
// The spread between channels is tiny: the plane is far enough behind the glass that even
// this puts a few pixels of fringe on the strokes.
const vec3 IOR = vec3(1.4485, 1.45, 1.4515);

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

// The studio's lights: three soft boxes and two sharp glints.
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
  vec2 uv = p / uTexSize + 0.5;
  uv.y = 1. - uv.y;
  float inside = step(0., uv.x) * step(uv.x, 1.) * step(0., uv.y) * step(uv.y, 1.);
  float a = texture(uLogo, uv).a * inside;
  vec3 c = mix(uPaper, uInk, a);
  vec2 q = (p - vec2(0., -0.3)) / vec2(uHalf.x * 1.15, uHalf.y * 0.9);
  float shadow = (1. - smoothstep(0.7, 1.3, length(q))) * 0.07;
  vec2 k = (p - vec2(0.08, -0.75)) / vec2(0.7, 0.34);
  float caustic = (1. - smoothstep(0., 1., length(k))) * 0.12;
  c *= 1. - shadow;
  return mix(c, vec3(1.), caustic);
}

float channel(vec3 v, int c) { return c == 0 ? v.r : (c == 1 ? v.g : v.b); }
float schlick(float cosI) { return 0.04 + 0.96 * pow(1. - cosI, 5.); }

// One ray, from a canvas position: the plane behind, or the glass in front of it.
vec3 shade(vec2 pixel, out bool hit) {
  vec2 s = (pixel - uCentre) / uScale;
  vec3 o = vec3(0., 0., uCam);
  vec3 d = normalize(vec3(s, uBack) - o);
  mat3 Ri = transpose(uRot);
  vec3 oo = Ri * o, dd = Ri * d;
  float t0, t1; vec3 n0, n1;
  vec3 paper = background(s);
  hit = hitOct(oo, dd, t0, t1, n0, n1) && t1 >= 0.;
  if (!hit) return paper;

  vec3 p0 = oo + dd * t0;
  vec3 nw = uRot * n0;
  float cosI = clamp(dot(-dd, n0), 0., 1.);
  float F = schlick(cosI);
  vec3 mirrored = reflect(d, nw);
  float reflection = env(mirrored);
  // A glossy sheen: the lights show on the surface even face-on, like coated glass.
  float sheen = lights(mirrored);

  vec3 seen = vec3(0.);
  float inner = 0.;
  for (int c = 0; c < 3; c++) {
    float ior = channel(IOR, c);
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

  // The body: the view through it, a little milk, the inner glint, then the surface.
  vec3 col = mix(seen, vec3(0.94), 0.14);
  col += vec3(inner) * 0.35;
  col = mix(col, vec3(reflection), F);
  col += vec3(sheen) * 0.3;
  // Facet edges read as thin darker lines, like cut glass.
  float edge = 1. - smoothstep(0., 0.035, edgeDistance(p0));
  col *= 1. - 0.28 * edge;
  // Silhouette: the ray's path through the glass thins to nothing at the outline.
  return col;
}

// Pixels within the glass's reach take eight rays (an 8-rooks pattern), so its outline,
// facet edges and the bent strokes inside come out smooth; the plane beyond needs one.
const vec2 TAPS[8] = vec2[8](
  vec2(0.0625, -0.4375), vec2(-0.0625, 0.4375), vec2(0.3125, 0.1875), vec2(-0.3125, -0.1875),
  vec2(0.4375, -0.0625), vec2(-0.4375, 0.0625), vec2(0.1875, 0.3125), vec2(-0.1875, -0.3125));
void main() {
  bool hit;
  if (length(gl_FragCoord.xy - uCentre) > uReach) { fragColor = vec4(shade(gl_FragCoord.xy, hit), 1.); return; }
  vec3 col = vec3(0.);
  for (int i = 0; i < 8; i++) col += shade(gl_FragCoord.xy + TAPS[i], hit);
  fragColor = vec4(col * 0.125, 1.);
}`,H=1024,j=16;function le(){const n=document.createElement("canvas");n.width=n.height=H;const a=n.getContext("2d"),i=H/j;a.setTransform(i,0,0,i,i,i),a.fillStyle="#fff";for(const t of te)a.fill(new Path2D(t.d));return n}function Y(n,a,i){const t=n.createShader(a);if(n.shaderSource(t,i),n.compileShader(t),!n.getShaderParameter(t,n.COMPILE_STATUS))throw new Error(n.getShaderInfoLog(t)??"shader");return t}const q=n=>[1,3,5].map(a=>parseInt(n.slice(a,a+2),16)/255);function ue(n,a,i){const t=Math.cos(n),r=Math.sin(n),e=Math.cos(a),d=Math.sin(a),s=Math.cos(i),f=Math.sin(i);return new Float32Array([s*t+f*d*r,f*t-s*d*r,-e*r,-f*e,s*e,d,s*r-f*d*t,f*r+s*d*t,e*t])}function fe({anchor:n}){const a=w.useRef(null),i=w.useRef(null);return w.useEffect(()=>{const t=a.current,r=t?.parentElement;if(!t||!r)return;const e=t.getContext("webgl2",{antialias:!1,alpha:!1,depth:!1,stencil:!1,powerPreference:"low-power"});if(!e){i.current?.removeAttribute("hidden");return}const d=window.matchMedia("(prefers-reduced-motion: reduce)").matches,s=e.createProgram();e.attachShader(s,Y(e,e.VERTEX_SHADER,ie)),e.attachShader(s,Y(e,e.FRAGMENT_SHADER,se)),e.linkProgram(s),e.useProgram(s);const f=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,f),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const y=e.getAttribLocation(s,"p");e.enableVertexAttribArray(y),e.vertexAttribPointer(y,2,e.FLOAT,!1,0,0);const V=e.createTexture();e.bindTexture(e.TEXTURE_2D,V),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,le()),e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const l=o=>e.getUniformLocation(s,o),I=getComputedStyle(document.documentElement);e.uniform3fv(l("uInk"),q(I.getPropertyValue("--color-ink").trim()||"#1b1b1b")),e.uniform3fv(l("uPaper"),q(I.getPropertyValue("--color-footer").trim()||"#fafafa")),e.uniform3fv(l("uHalf"),A),e.uniform1f(l("uTexSize"),B*j/14),e.uniform1f(l("uCam"),_),e.uniform1f(l("uBack"),X),e.uniform1i(l("uLogo"),0);const W=l("uScale"),Z=l("uCentre"),K=l("uRot"),J=l("uReach"),Q=Math.hypot(...A)*(_-X)/_*1.08;let h=1;const S=()=>{const o=r.getBoundingClientRect();h=Math.min(window.devicePixelRatio||1,oe),t.width=Math.max(1,Math.round(o.width*h)),t.height=Math.max(1,Math.round(o.height*h)),e.viewport(0,0,t.width,t.height);const c=Math.min(U,o.width/(A[0]*2.6));e.uniform1f(W,c*h),e.uniform1f(J,Q*c*h);const u=n.current?.getBoundingClientRect(),O=u?u.left+u.width/2-o.left:o.width/2,$=u?u.top+u.height/2-o.top:o.height/2;e.uniform2f(Z,O*h,(o.height-$)*h)};S();const E=new ResizeObserver(S);E.observe(r);let v=.8,x=0,R=0,T=0,b=0,m=0,g=0,M=window.scrollY;const P=()=>{const o=ne+ae*Math.sin(v),c=.05*Math.sin(v*.7+1.2),u=.1*Math.sin(v*.5+2.4);e.uniformMatrix3fv(K,!1,ue(o,x+c,T+u)),e.drawArrays(e.TRIANGLES,0,3)};if(d)return P(),()=>E.disconnect();const L=o=>{const c=g?Math.min(.05,(o-g)/1e3):0;g=o,v+=re*c,x+=(R-x)*(1-Math.exp(-c/.18)),T+=(b-T)*(1-Math.exp(-c/.18)),P(),m=requestAnimationFrame(L)},k=()=>{!m&&!document.hidden&&(g=0,m=requestAnimationFrame(L))},C=()=>{cancelAnimationFrame(m),m=0},D=()=>{const o=window.scrollY;v+=(o-M)*ce,M=o},z=o=>{const c=r.getBoundingClientRect(),u=(o.clientX-c.left)/c.width-.5;R=((o.clientY-c.top)/c.height-.5)*G,b=-u*G*.5},F=()=>{R=0,b=0},N=()=>document.hidden?C():k();return window.addEventListener("scroll",D,{passive:!0}),r.addEventListener("pointermove",z),r.addEventListener("pointerleave",F),document.addEventListener("visibilitychange",N),k(),()=>{C(),E.disconnect(),window.removeEventListener("scroll",D),r.removeEventListener("pointermove",z),r.removeEventListener("pointerleave",F),document.removeEventListener("visibilitychange",N),e.getExtension("WEBGL_lose_context")?.loseContext()}},[n]),p.jsxs(p.Fragment,{children:[p.jsx("canvas",{ref:a,className:"contact-glass","aria-hidden":"true"}),p.jsx("div",{ref:i,className:"contact-glass-fallback",hidden:!0,"aria-hidden":"true",children:p.jsx(ee,{size:B*U,color:"var(--color-ink)"})})]})}export{fe as default};
