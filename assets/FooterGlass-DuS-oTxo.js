import{r as w,j as m,L as K,l as J}from"./index-B7tGb3ql.js";const O=160,Q=1.5,F=[1.1,1.45,1.1],U=2.4,$=7,ee=-1.35,te=.12,oe=.0025,X=.22,ne=`#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0., 1.); }`,re=`#version 300 es
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

const vec3 S[8] = vec3[8](
  vec3(1., 1., 1.), vec3(1., 1., -1.), vec3(1., -1., 1.), vec3(1., -1., -1.),
  vec3(-1., 1., 1.), vec3(-1., 1., -1.), vec3(-1., -1., 1.), vec3(-1., -1., -1.));
const vec3 IOR = vec3(1.37, 1.385, 1.40);

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

// The studio the glass reflects: brighter above, three soft boxes, two sharp glints.
float env(vec3 d) {
  float e = mix(0.58, 0.9, smoothstep(-1., 1., d.y));
  e += 0.38 * softbox(d, normalize(vec3(-0.45, 0.75, 0.5)), 0.4, 0.12, 0.3);
  e += 0.28 * softbox(d, normalize(vec3(0.7, 0.25, 0.65)), 0.14, 0.32, 0.3);
  e += 0.18 * softbox(d, normalize(vec3(0.1, -0.55, 0.83)), 0.5, 0.08, 0.45);
  e += 0.7 * pow(max(dot(d, normalize(vec3(-0.5, 0.7, 0.52))), 0.), 500.);
  e += 0.55 * pow(max(dot(d, normalize(vec3(0.62, 0.5, 0.6))), 0.), 320.);
  return e;
}

// The plane behind: the logo on the footer, with the glass's shadow and caustic.
vec3 background(vec2 p) {
  vec2 uv = p / uTexSize + 0.5;
  uv.y = 1. - uv.y;
  float inside = step(0., uv.x) * step(uv.x, 1.) * step(0., uv.y) * step(uv.y, 1.);
  float a = texture(uLogo, uv).a * inside;
  vec3 c = mix(uPaper, uInk, a);
  vec2 q = (p - vec2(0., -0.3)) / vec2(uHalf.x * 1.15, uHalf.y * 0.9);
  float shadow = (1. - smoothstep(0.7, 1.3, length(q))) * 0.07;
  vec2 k = (p - vec2(0.08, -0.42)) / vec2(0.62, 0.32);
  float caustic = (1. - smoothstep(0., 1., length(k))) * 0.12;
  c *= 1. - shadow;
  return mix(c, vec3(1.), caustic);
}

float channel(vec3 v, int c) { return c == 0 ? v.r : (c == 1 ? v.g : v.b); }
float schlick(float cosI) { return 0.04 + 0.96 * pow(1. - cosI, 5.); }

void main() {
  vec2 s = (gl_FragCoord.xy - uCentre) / uScale;
  vec3 o = vec3(0., 0., uCam);
  vec3 d = normalize(vec3(s, uBack) - o);
  mat3 Ri = transpose(uRot);
  vec3 oo = Ri * o, dd = Ri * d;
  float t0, t1; vec3 n0, n1;
  vec3 paper = background(s);
  if (!hitOct(oo, dd, t0, t1, n0, n1) || t1 < 0.) { fragColor = vec4(paper, 1.); return; }

  vec3 p0 = oo + dd * t0;
  vec3 nw = uRot * n0;
  float cosI = clamp(dot(-dd, n0), 0., 1.);
  float F = schlick(cosI);
  float reflection = env(reflect(d, nw));

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
  // Facet edges read as thin darker lines, like cut glass.
  float edge = 1. - smoothstep(0., 0.035, edgeDistance(p0));
  col *= 1. - 0.28 * edge;
  // Silhouette: the ray's path through the glass thins to nothing at the outline.
  float aa = smoothstep(0., 0.02, t1 - t0);
  fragColor = vec4(mix(paper, col, aa), 1.);
}`,B=1024,q=16;function ae(){const o=document.createElement("canvas");o.width=o.height=B;const r=o.getContext("2d"),c=B/q;r.setTransform(c,0,0,c,c,c),r.fillStyle="#fff";for(const t of J)r.fill(new Path2D(t.d));return o}function G(o,r,c){const t=o.createShader(r);if(o.shaderSource(t,c),o.compileShader(t),!o.getShaderParameter(t,o.COMPILE_STATUS))throw new Error(o.getShaderInfoLog(t)??"shader");return t}const H=o=>[1,3,5].map(r=>parseInt(o.slice(r,r+2),16)/255);function ce(o,r,c){const t=Math.cos(o),a=Math.sin(o),e=Math.cos(r),d=Math.sin(r),i=Math.cos(c),f=Math.sin(c);return new Float32Array([i*t+f*d*a,f*t-i*d*a,-e*a,-f*e,i*e,d,i*a-f*d*t,f*a+i*d*t,e*t])}function se({anchor:o}){const r=w.useRef(null),c=w.useRef(null);return w.useEffect(()=>{const t=r.current,a=t?.parentElement;if(!t||!a)return;const e=t.getContext("webgl2",{antialias:!1,alpha:!1,depth:!1,stencil:!1,powerPreference:"low-power"});if(!e){c.current?.removeAttribute("hidden");return}const d=window.matchMedia("(prefers-reduced-motion: reduce)").matches,i=e.createProgram();e.attachShader(i,G(e,e.VERTEX_SHADER,ne)),e.attachShader(i,G(e,e.FRAGMENT_SHADER,re)),e.linkProgram(i),e.useProgram(i);const f=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,f),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);const _=e.getAttribLocation(i,"p");e.enableVertexAttribArray(_),e.vertexAttribPointer(_,2,e.FLOAT,!1,0,0);const Y=e.createTexture();e.bindTexture(e.TEXTURE_2D,Y),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,ae()),e.generateMipmap(e.TEXTURE_2D),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const s=n=>e.getUniformLocation(i,n),A=getComputedStyle(document.documentElement);e.uniform3fv(s("uInk"),H(A.getPropertyValue("--color-ink").trim()||"#1b1b1b")),e.uniform3fv(s("uPaper"),H(A.getPropertyValue("--color-footer").trim()||"#fafafa")),e.uniform3fv(s("uHalf"),F),e.uniform1f(s("uTexSize"),U*q/14),e.uniform1f(s("uCam"),$),e.uniform1f(s("uBack"),ee),e.uniform1i(s("uLogo"),0);const j=s("uScale"),V=s("uCentre"),W=s("uRot");let v=1;const I=()=>{const n=a.getBoundingClientRect();v=Math.min(window.devicePixelRatio||1,Q),t.width=Math.max(1,Math.round(n.width*v)),t.height=Math.max(1,Math.round(n.height*v)),e.viewport(0,0,t.width,t.height);const l=Math.min(O,n.width/(F[0]*2.6));e.uniform1f(j,l*v);const u=o.current?.getBoundingClientRect(),z=u?u.left+u.width/2-n.left:n.width/2,Z=u?u.top+u.height/2-n.top:n.height/2;e.uniform2f(V,z*v,(n.height-Z)*v)};I();const g=new ResizeObserver(I);g.observe(a);let E=.6,R=0,x=0,T=0,b=0,h=0,p=0,S=window.scrollY;const L=()=>{e.uniformMatrix3fv(W,!1,ce(E,R,T)),e.drawArrays(e.TRIANGLES,0,3)};if(d)return L(),()=>g.disconnect();const y=n=>{const l=p?Math.min(.05,(n-p)/1e3):0;p=n,E+=te*l,R+=(x-R)*(1-Math.exp(-l/.18)),T+=(b-T)*(1-Math.exp(-l/.18)),L(),h=requestAnimationFrame(y)},P=()=>{!h&&!document.hidden&&(p=0,h=requestAnimationFrame(y))},M=()=>{cancelAnimationFrame(h),h=0},D=()=>{const n=window.scrollY;E+=(n-S)*oe,S=n},k=n=>{const l=a.getBoundingClientRect(),u=(n.clientX-l.left)/l.width-.5;x=((n.clientY-l.top)/l.height-.5)*X,b=-u*X*.5},C=()=>{x=0,b=0},N=()=>document.hidden?M():P();return window.addEventListener("scroll",D,{passive:!0}),a.addEventListener("pointermove",k),a.addEventListener("pointerleave",C),document.addEventListener("visibilitychange",N),P(),()=>{M(),g.disconnect(),window.removeEventListener("scroll",D),a.removeEventListener("pointermove",k),a.removeEventListener("pointerleave",C),document.removeEventListener("visibilitychange",N),e.getExtension("WEBGL_lose_context")?.loseContext()}},[o]),m.jsxs(m.Fragment,{children:[m.jsx("canvas",{ref:r,className:"contact-glass","aria-hidden":"true"}),m.jsx("div",{ref:c,className:"contact-glass-fallback",hidden:!0,"aria-hidden":"true",children:m.jsx(K,{size:U*O,color:"var(--color-ink)"})})]})}export{se as default};
