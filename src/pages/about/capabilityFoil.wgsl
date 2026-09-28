// Adapted from vercel-labs/vgpu: holographic-card, revision 6fa27bb458ffc3f498727090f09dce3fe5faabb43689fd669d633a2a23dc36bb.
// MIT, Copyright (c) 2025 Vercel, Inc. See vendor/vgpu-holographic-card/LICENSE.
// Original diffraction / pearl / grain and grazing-light model; flat white portfolio surface.
struct Params {
  resolution: vec2f,
  size: vec2f,
  pointer: vec2f,
  origin: vec2f,
  material: f32,
  structure: f32,
  texture: f32,
  edge: f32,
  edgeGlow: f32,
  reflection: f32,
  saturation: f32,
  reflectionWidth: f32,
  angle: f32,
  edgeIntensity: f32,
}
@group(0) @binding(0) var<uniform> params: Params;

// Approximate visible wavelengths in micrometers with smooth display RGB responses.
fn wavelengthColor(wavelength: f32) -> vec3f {
  let response = (vec3f(wavelength) - vec3f(0.610, 0.545, 0.460)) / vec3f(0.045, 0.038, 0.032);
  let visible = smoothstep(0.380, 0.410, wavelength) * (1.0 - smoothstep(0.700, 0.780, wavelength));
  return exp(-0.5 * response * response) * visible;
}

// Reflection grating approximation: m * wavelength = d * dot(L + V, across).
// L and V point away from the surface; across is perpendicular to the grooves.
// Based on the diffraction-order model in GPU Gems, chapter 8 (Jos Stam).
fn diffraction(across: vec2f, lightAndView: vec2f, spacing: f32) -> vec3f {
  let pathDifference = spacing * abs(dot(lightAndView, across));
  let along = dot(lightAndView, vec2f(-across.y, across.x));
  // Finite, imperfect groove patches broaden the directional reflection.
  let envelope = exp(-along * along / 0.36);
  var reflected = vec3f(0);
  for (var order = 1; order <= 3; order++) {
    let m = f32(order);
    reflected += wavelengthColor(pathDifference / m) / (m * m);
  }
  return reflected * envelope;
}

// Broad, art-directed pearlescence underneath the finer diffraction detail.
fn pearlColor(phase: f32) -> vec3f {
  return vec3f(0.55, 0.52, 0.64) + vec3f(0.43, 0.40, 0.34)
    * cos(6.2831853 * (phase + vec3f(0.05, 0.38, 0.63)));
}

fn grain(point: vec2f) -> f32 {
  let p = vec2u(abs(point) * 2400.0);
  var n = (p.x * 1597334677u) ^ (p.y * 3812015801u);
  n = (n ^ (n >> 16u)) * 2246822519u;
  return f32(n & 1023u) / 1023.0 - 0.5;
}


fn cubic(p: vec4f, t: f32) -> f32 {
  let s = 1.0 - t;
  return s*s*s*p.x + 3.0*s*s*t*p.y + 3.0*s*t*t*p.z + t*t*t*p.w;
}

// Match the portfolio's existing topographic SVG paths exactly.
fn contourY(x: f32) -> f32 {
  var xs = vec4f(-38, -3, 25, 54);
  var ys = vec4f(0, -22, -30, -9);
  if (x >= 130.0) {
    xs = vec4f(130, 154, 180, 228); ys = vec4f(6, -13, -29, -6);
  } else if (x >= 54.0) {
    xs = vec4f(54, 82, 104, 130); ys = vec4f(-9, 14, 25, 6);
  }
  var t = clamp((x - xs.x) / (xs.w - xs.x), 0.0, 1.0);
  for (var i = 0; i < 4; i++) {
    let s = 1.0 - t;
    let derivative = 3.0*s*s*(xs.y-xs.x) + 6.0*s*t*(xs.z-xs.y) + 3.0*t*t*(xs.w-xs.z);
    t = clamp(t - (cubic(xs,t)-x) / derivative, 0.0, 1.0);
  }
  return cubic(ys,t);
}

fn contourPoint(uv: vec2f) -> vec2f {
  return vec2f(uv.x, uv.y - .35 * contourY(uv.x * 190.0) / 165.0);
}

fn bridge(p: vec2f, anchor: vec2f, pointer: vec2f) -> f32 {
  let a = contourPoint(anchor);
  let b = contourPoint(pointer);
  let v = b - a;
  let t = clamp(dot(p-a,v) / max(dot(v,v), .00001), 0.0, 1.0);
  let d = length(p-a-v*t) / .13;
  return 1.0 - smoothstep(0.0, 1.0, d*d);
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let size = max(params.size, vec2f(1));
  let p = (uv-.5) * vec2f(1.28, 1.28 * size.y/size.x);
  let lightCenter = (params.pointer-.5) * vec2f(1.28, 1.28 * size.y/size.x);
  let delta = p-lightCenter;
  let plane = contourPoint(uv);
  let pointerPlane = contourPoint(params.pointer);
  let localized = (plane-pointerPlane) / vec2f(.40, .47);
  let support = 1.0 - smoothstep(.12, 1.0, dot(localized,localized));

  // The example's directional band, glint, and spatial spotlight, softened on white.
  let sweepAngle = (params.angle-22.0)*.0174532925;
  let sweepDelta = vec2f(delta.x*cos(sweepAngle)-delta.y*sin(sweepAngle),
    delta.x*sin(sweepAngle)+delta.y*cos(sweepAngle));
  let sweep = sweepDelta.x * .72 + sweepDelta.y * .52
    + (sin(p.y*4.0+p.x*3.0) - sin(lightCenter.y*4.0+lightCenter.x*3.0)) * .08;
  let bandDistance = sweep / .36;
  let lightBand = exp(-bandDistance*bandDistance);
  let glintDistance = sweep / max(.04, params.reflectionWidth * 2.65);
  let glint = exp(-glintDistance*glintDistance);
  let spotlight = exp(-dot(delta*vec2f(1.05,.72),delta*vec2f(1.05,.72))*2.6) * support;
  let light = lightBand * spotlight;
  let hit = vec3f(p,0);
  let lightDirection = normalize(vec3f(lightCenter,1.2)-hit);
  let viewDirection = normalize(vec3f(0,0,4.5)-hit);
  let lightAndView = (lightDirection+viewDirection).xy;
  let illumination = lightDirection.z * viewDirection.z;

  let row = (uv.y*165.0-contourY(uv.x*190.0)+54.0) / 9.0;
  let phase = row * 3.14159265;
  let dx = dpdx(p);
  let dy = dpdy(p);
  let gradient = vec2f(dpdx(phase)*dy.y-dpdy(phase)*dx.y, dpdy(phase)*dx.x-dpdx(phase)*dy.x);
  let across = gradient / max(length(gradient),.00000001);
  let spectral = diffraction(across,lightAndView,1.65)*illumination;
  let pearlPhase = dot(lightAndView,vec2f(.48,-.32)) + p.y*.32 + phase*.003;
  let pearl = pearlColor(pearlPhase);

  // Nearest-edge weights blend light on the boundaries without moving the rim inward.
  let distances = vec4f(params.pointer.x*size.x,(1.0-params.pointer.x)*size.x,
    params.pointer.y*size.y,(1.0-params.pointer.y)*size.y);
  let nearest = min(min(distances.x,distances.y),min(distances.z,distances.w));
  let rawWeights = exp(-(distances-nearest)/8.0);
  let weights = rawWeights / dot(rawWeights,vec4f(1));
  let connecting = dot(weights,vec4f(
    bridge(plane,vec2f(0,params.pointer.y),params.pointer),
    bridge(plane,vec2f(1,params.pointer.y),params.pointer),
    bridge(plane,vec2f(params.pointer.x,0),params.pointer),
    bridge(plane,vec2f(params.pointer.x,1),params.pointer)));
  let normal = vec4f(uv.x*size.x,(1.0-uv.x)*size.x,uv.y*size.y,(1.0-uv.y)*size.y);
  let tangent = abs((uv-params.pointer)*size);
  let shortSide = min(size.x,size.y);
  let radius = normal/(shortSide*.115);
  let along = vec4f(tangent.y,tangent.y,tangent.x,tangent.x)/(shortSide*.32);
  let edgeField = vec4f(1)-smoothstep(vec4f(0),vec4f(1),radius*radius+along*along);
  let edgeLight = dot(edgeField,weights)*params.edge*params.edgeGlow*params.edgeIntensity;

  // Entrance remains staged. Surface color has no global/base hover opacity.
  let arrival = .12 + .42*distance(contourPoint(params.origin),plane);
  let development = smoothstep(arrival-.10,arrival+.16,params.material)*params.material;
  let structureIn = smoothstep(arrival-.12,arrival+.20,params.structure)*params.structure;
  let surface = vec3f(250.0/255.0);
  let softPearl = mix(surface,clamp(pearl+spectral*.20,vec3f(0),vec3f(1)),.28*params.saturation);
  var color = mix(surface,softPearl,light*development);
  color = mix(color,mix(surface,pearl,.09),edgeLight*.62);

  // Fine antialiased engraving and its white lip; the connection is much fainter.
  let contourPixels = 9.0*size.y/165.0;
  let aa = max(fwidth(row)*contourPixels*.65, .22*size.y/max(params.resolution.y,1.0));
  let lineDistance = abs(fract(row+.5)-.5)*contourPixels;
  let contours = 1.0-smoothstep(.17,.17+aa,lineDistance);
  let lipRow = row + .35/9.0;
  let lips = 1.0-smoothstep(.13,.13+aa,abs(fract(lipRow+.5)-.5)*contourPixels);
  let lineReveal = min(1.0,support + connecting*.24);
  let lineColor = mix(vec3f(.86),clamp(pearl+spectral*.16,vec3f(0),vec3f(1)),.26*params.saturation);
  color = mix(color,lineColor,contours*lineReveal*(structureIn*.20+development*.24));
  color = mix(color,vec3f(1),lips*lineReveal*params.reflection*.42);

  // Local polish and surface-locked grain from the upstream example; no animated noise.
  color = mix(color,vec3f(1),glint*spotlight*params.reflection*.42);
  let noise = grain(p+vec2f(2));
  color += noise*.006*light*params.texture;
  let sparkle = pow(max(noise+.5,0.0),24.0)*glint*spotlight*params.reflection;
  color += pearl*sparkle*.025;
  return vec4f(clamp(color,vec3f(0),vec3f(1)),1);
}
