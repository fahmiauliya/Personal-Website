import{r as w,j as m,L as ee,l as te}from"./index-D6TCZIjI.js";const U=160,oe=1.5,_=[1.1,1.2,1.1],X=2.8,A=12,B=-1.9,ne=.12,re=.0025,G=.22,ae=`#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0., 1.); }`,ce=`#version 300 es
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
}`,H=1024,j=16;function ie(){const o=document.createElement("canvas");o.width=o.height=H;const r=o.getContext("2d"),c=H/j;r.setTransform(c,0,0,c,c,c),r.fillStyle="#fff";for(const t of te)r.fill(new Path2D(t.d));return o}function q(o,r,c){const t=o.createShader(r);if(o.shaderSource(t,c),o.compileShader(t),!o.getShaderParameter(t,o.COMPILE_STATUS))throw new Error(o.getShaderInfoLog(t)??"shader");return t}const Y=o=>[1,3,5].map(r=>parseInt(o.slice(r,r+2),16)/255);function se(o,r,c){const t=Math.cos(o),a=Math.sin(o),e=Math.cos(r),d=Math.sin(r),i=Math.cos(c),f=Math.sin(c);return new Float32Array([i*t+f*d*a,f*t-i*d*a,-e*a,-f*e,i*e,d,i*a-f*d*t,f*a+i*d*t,e*t])}function ue({anchor:o}){const r=w.useRef(null),c=w.useRef(null);return w.useEffect(()=>{const t=r.current,a=t?.parentElement;if(!t||!a)return;const e=t.getContext("webgl2",{antialias:!1,alpha:!1,depth:!1,stencil:!1,powerPreference:"low-power"});if(!e){c.current?.removeAttribute("hidden");return}const d=window.matchMedia("(prefers-reduced-motion: reduce)").matches,i=e.createProgram();e.attachShader(i,q(e,e.VERTEX_SHADER,ae)),e.attachShader(i,q(e,e.FRAGMENT_SHADER,ce)),e.linkProgram(i),e.useProgram(i);const f=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,f),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const y=e.getAttribLocation(i,"p");e.enableVertexAttribArray(y),e.vertexAttribPointer(y,2,e.FLOAT,!1,0,0);const V=e.createTexture();e.bindTexture(e.TEXTURE_2D,V),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,ie()),e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const s=n=>e.getUniformLocation(i,n),I=getComputedStyle(document.documentElement);e.uniform3fv(s("uInk"),Y(I.getPropertyValue("--color-ink").trim()||"#1b1b1b")),e.uniform3fv(s("uPaper"),Y(I.getPropertyValue("--color-footer").trim()||"#fafafa")),e.uniform3fv(s("uHalf"),_),e.uniform1f(s("uTexSize"),X*j/14),e.uniform1f(s("uCam"),A),e.uniform1f(s("uBack"),B),e.uniform1i(s("uLogo"),0);const W=s("uScale"),Z=s("uCentre"),K=s("uRot"),J=s("uReach"),Q=Math.hypot(..._)*(A-B)/A*1.08;let h=1;const S=()=>{const n=a.getBoundingClientRect();h=Math.min(window.devicePixelRatio||1,oe),t.width=Math.max(1,Math.round(n.width*h)),t.height=Math.max(1,Math.round(n.height*h)),e.viewport(0,0,t.width,t.height);const l=Math.min(U,n.width/(_[0]*2.6));e.uniform1f(W,l*h),e.uniform1f(J,Q*l*h);const u=o.current?.getBoundingClientRect(),O=u?u.left+u.width/2-n.left:n.width/2,$=u?u.top+u.height/2-n.top:n.height/2;e.uniform2f(Z,O*h,(n.height-$)*h)};S();const g=new ResizeObserver(S);g.observe(a);let E=.6,x=0,R=0,T=0,b=0,v=0,p=0,L=window.scrollY;const P=()=>{e.uniformMatrix3fv(K,!1,se(E,x,T)),e.drawArrays(e.TRIANGLES,0,3)};if(d)return P(),()=>g.disconnect();const k=n=>{const l=p?Math.min(.05,(n-p)/1e3):0;p=n,E+=ne*l,x+=(R-x)*(1-Math.exp(-l/.18)),T+=(b-T)*(1-Math.exp(-l/.18)),P(),v=requestAnimationFrame(k)},M=()=>{!v&&!document.hidden&&(p=0,v=requestAnimationFrame(k))},C=()=>{cancelAnimationFrame(v),v=0},D=()=>{const n=window.scrollY;E+=(n-L)*re,L=n},z=n=>{const l=a.getBoundingClientRect(),u=(n.clientX-l.left)/l.width-.5;R=((n.clientY-l.top)/l.height-.5)*G,b=-u*G*.5},F=()=>{R=0,b=0},N=()=>document.hidden?C():M();return window.addEventListener("scroll",D,{passive:!0}),a.addEventListener("pointermove",z),a.addEventListener("pointerleave",F),document.addEventListener("visibilitychange",N),M(),()=>{C(),g.disconnect(),window.removeEventListener("scroll",D),a.removeEventListener("pointermove",z),a.removeEventListener("pointerleave",F),document.removeEventListener("visibilitychange",N),e.getExtension("WEBGL_lose_context")?.loseContext()}},[o]),m.jsxs(m.Fragment,{children:[m.jsx("canvas",{ref:r,className:"contact-glass","aria-hidden":"true"}),m.jsx("div",{ref:c,className:"contact-glass-fallback",hidden:!0,"aria-hidden":"true",children:m.jsx(ee,{size:X*U,color:"var(--color-ink)"})})]})}export{ue as default};
