/**
 * The Agent Walkthrough colours (0–1 RGB), measured from the Figma background (287:55437). The
 * animated background is drawn from them, and the orb takes its colours from the same set.
 */
export const palette = {
  cream: [0.905, 0.890, 0.800],
  milk: [0.935, 0.930, 0.900],
  paleBlue: [0.640, 0.725, 0.780],
  steelBlue: [0.370, 0.610, 0.800],
  blue: [0.090, 0.530, 0.935],
  deepBlue: [0.000, 0.400, 0.990],
  paleYellow: [0.900, 0.860, 0.600],
  yellow: [0.860, 0.720, 0.180],
  amber: [0.860, 0.555, 0.020],
  orange: [0.860, 0.470, 0.000],
} as const;

export type PaletteColor = keyof typeof palette;

/** A palette colour as a GLSL `vec3(...)` literal. */
export function glsl(name: PaletteColor) {
  return `vec3(${palette[name].map(channel => channel.toFixed(3)).join(', ')})`;
}

/** A palette colour as a hex string, e.g. for a colour picker's default. */
export function hex(name: PaletteColor) {
  return `#${palette[name].map(channel => Math.round(channel * 255).toString(16).padStart(2, '0')).join('')}`;
}

/** A hex colour as 0–1 RGB. */
export function rgb(value: string): [number, number, number] {
  const match = /^#?([0-9a-f]{6})$/i.exec(value.trim());
  if (!match) return [0, 0, 0];
  const number = parseInt(match[1], 16);
  return [(number >> 16 & 255) / 255, (number >> 8 & 255) / 255, (number & 255) / 255];
}

/**
 * Names of GLSL vec3 uniforms that shift a whole colour family: every blue by `cool`, every warm
 * colour by `warm`. The paler a colour, the less it moves, so pale tones stay pale.
 */
export type PaletteShift = { cool: string; warm: string };

const shiftWeights: Record<PaletteColor, ['cool' | 'warm', number] | null> = {
  deepBlue: ['cool', 1], blue: ['cool', 1], steelBlue: ['cool', 0.8], paleBlue: ['cool', 0.5],
  orange: ['warm', 1], amber: ['warm', 1], yellow: ['warm', 1], paleYellow: ['warm', 0.6], cream: ['warm', 0.15],
  milk: null,
};

/** A palette colour in GLSL, moved by its family's shift when one is given. */
export function glslColor(name: PaletteColor, shift?: PaletteShift) {
  const weight = shiftWeights[name];
  if (!shift || !weight) return glsl(name);
  return `clamp(${glsl(name)} + ${weight[1].toFixed(2)} * ${shift[weight[0]]}, 0.0, 1.0)`;
}

/**
 * The background's colour ramp as GLSL: `palette(v)` maps -1 (deep blue) through 0 (cream) to
 * +1 (orange). Both shaders include it, so the orb's colours are the background's; the orb
 * passes a shift so its two colour inputs (Blue, Yellow) move each family together.
 */
export function glslPaletteFn(shift?: PaletteShift) {
  const c = (name: PaletteColor) => glslColor(name, shift);
  return `
vec3 ramp(vec3 a, vec3 b, float t, float from, float to) {
  return mix(a, b, smoothstep(from, to, t));
}

vec3 palette(float v) {
  vec3 cream = ${c('cream')};
  if (v < 0.0) {
    float t = -v;
    vec3 c = ramp(cream, ${c('paleBlue')}, t, 0.00, 0.16);
    c = ramp(c, ${c('steelBlue')}, t, 0.16, 0.38);
    c = ramp(c, ${c('blue')}, t, 0.38, 0.66);
    return ramp(c, ${c('deepBlue')}, t, 0.66, 1.00);
  }
  vec3 c = ramp(cream, ${c('paleYellow')}, v, 0.00, 0.16);
  c = ramp(c, ${c('yellow')}, v, 0.16, 0.42);
  c = ramp(c, ${c('amber')}, v, 0.42, 0.72);
  return ramp(c, ${c('orange')}, v, 0.72, 1.00);
}
`;
}

/** The ramp with the background's own colours. */
export const glslPalette = glslPaletteFn();
