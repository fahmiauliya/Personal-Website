export const openingEnd = (variant, sample) => Math.max(...variant.openingKeys.map(key => sample[key].at + sample[key].duration));
export function variantPhase(variant, sample) {
  if (sample.time >= openingEnd(variant, sample)) return 'Floating';
  const labels = { reveal: 'Forming a ring', ring: 'Opening', gather: 'Gathering', unfold: 'Unfolding', entrance: 'Entrance' };
  const key = [...variant.openingKeys].reverse().find(key => sample[key].started);
  return key ? labels[key] || key : 'Opening';
}
export function dialTimeline(timeline) {
  return Object.fromEntries(Object.entries(timeline).map(([key, clip]) => [key, {
    ...clip,
    from: Object.fromEntries(Object.entries(clip.from).map(([property, value]) => [property, [value, -30, 30, .001]])),
    to: Object.fromEntries(Object.entries(clip.to).map(([property, value]) => [property, [value, -30, 30, .001]])),
  }]));
}
export function mergeSettings(base, overrides = {}) {
  return Object.fromEntries(Object.entries(base).map(([key, value]) => [key, { ...value, ...overrides[key] }]));
}
