const TAU = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const clamp = (n) => Math.min(1, Math.max(0, n));
const smooth = (n) => { const t = clamp(n); return t * t * (3 - 2 * t); };
const easeOut = (n) => 1 - (1 - clamp(n)) ** 3;
const mix = (a, b, t) => a + (b - a) * t;
export const directionSign = (settings) => settings.floating.direction === 'counterclockwise' ? -1 : 1;

export function selectedArtwork(settings) {
  const count = Math.max(1, Math.min(16, Math.round(settings.formation.imageCount)));
  const top = Math.max(0, Math.min(15, Number(settings.opening.stackImage ?? settings.opening.includedImage ?? 15)));
  return [...Array.from({ length: 16 }, (_, i) => i).filter((i) => i !== top).slice(0, count - 1), top];
}

function formationPosition(index, count, orbitAngle, rotation, settings) {
  if (count === 1) return { x: 0, y: 0, z: 0, scale: 0.92 };
  let x, y, z;
  if (settings.formation.layout === 'sphere') {
    y = 1 - 2 * ((index + 0.5) / count);
    const radius = Math.sqrt(1 - y * y);
    const angle = index * GOLDEN_ANGLE + orbitAngle + rotation.x;
    x = Math.cos(angle) * radius;
    z = Math.sin(angle) * radius;
  } else {
    const scattered = settings.formation.layout === 'scattered';
    const angle = (scattered ? index * GOLDEN_ANGLE : index / count * TAU - Math.PI / 2) + orbitAngle + rotation.x;
    const radius = scattered ? Math.sqrt((index + 0.5) / count) : 0.96;
    x = Math.cos(angle) * radius;
    y = Math.sin(angle) * radius;
    z = 0;
  }
  const tilt = settings.floating.tilt + rotation.y;
  const tiltedY = y * Math.cos(tilt) - z * Math.sin(tilt);
  const tiltedZ = y * Math.sin(tilt) + z * Math.cos(tilt);
  const perspective = 3.6 / (3.6 - tiltedZ * settings.formation.perspective);
  return {
    x: (x * 0.99 - tiltedY * 0.13) * perspective,
    y: (tiltedY * 0.99 + x * 0.13) * perspective,
    z: tiltedZ,
    scale: 0.92 + tiltedZ * settings.formation.depth / 2,
  };
}

function staggered(progress, index, count, fraction) {
  return (progress - index / Math.max(1, count - 1) * fraction) / (1 - fraction);
}

export function gatherBounceScale(sample, opening) {
  const strength = clamp((opening.bounceStrength ?? 65) / 100);
  // Start on the final approach, then fit the rebounds into the stack hold.
  // Sampling timeline time keeps pause, speed changes, and backwards scrubbing exact.
  const start = sample.gather.at + sample.gather.duration * .72;
  const duration = Math.min(opening.bounceDuration ?? .75, sample.unfold.at - start);
  if (!strength || !Number.isFinite(start + duration + sample.time) || duration <= 0) return 1;
  const t = (sample.time - start) / duration;
  if (t <= 0 || t >= 1) return 1;
  const attack = smooth(t / .08);
  const settle = 1 - smooth((t - .8) / .2);
  return 1 - .4 * strength * Math.sin(5 * Math.PI * t) * Math.exp(-2 * t) * attack * settle;
}

export function gatherGooeyAmount(sample, opening) {
  const strength = clamp((opening.gooeyStrength ?? 70) / 100);
  const merging = smooth((sample.gather.current.progress - .25) / .75);
  const releasing = 1 - smooth(sample.unfold.current.progress / .7);
  return strength * merging * releasing;
}

// Both live playback and timeline scrubbing consume the same sampled clip values.
export function cardFrame(index, count, rotation, settings, sample, orbitAngle, complete = false) {
  const target = formationPosition(index, count, orbitAngle, rotation, settings);
  const ringAngle = index / count * TAU - Math.PI / 2 + sample.ring.current.angle;
  const fraction = settings.opening.staggerPercent / 100;
  // Give each card its own slot: no overlapping fades, even with stagger set to zero.
  // Cap the pop at 90 ms so smaller collections still reveal crisply.
  const revealSlot = 1 / count;
  const popDuration = Math.min(revealSlot, 0.09 / sample.reveal.duration);
  const arrival = complete ? 1 : easeOut((sample.reveal.current.progress - index * revealSlot) / popDuration);
  const gather = complete ? 1 : smooth(staggered(sample.gather.current.progress, index, count, fraction * 0.4));
  const unfold = complete ? 1 : easeOut(staggered(sample.unfold.current.progress, index, count, fraction * 0.4));
  const variation = 1 + Math.sin(index * 12.9898 + 1) * settings.formation.sizeVariation / 100;
  const bounce = complete ? 1 : gatherBounceScale(sample, settings.opening);
  const gooey = complete ? 0 : gatherGooeyAmount(sample, settings.opening);
  // Volume-preserving deformation makes the landing feel soft instead of zooming.
  // Approach stretch varies by direction; the centered deck shares one recoil.
  const approachStretch = Math.sin(Math.PI * gather) * .2 * gooey * Math.cos(2 * ringAngle);
  const stretch = Math.exp((1 - bounce) * gooey * 1.8 + approachStretch);
  return {
    x: mix(Math.cos(ringAngle) * 0.97 * (1 - gather), target.x, unfold),
    y: mix(Math.sin(ringAngle) * 0.97 * (1 - gather), target.y, unfold),
    // Variation only enters on unfolding: every stacked image has identical bounds.
    scale: mix(mix(0.3, 0.78, arrival) * mix(bounce, 1, gooey * .75), target.scale * variation, unfold),
    scaleX: stretch,
    scaleY: 1 / stretch,
    skew: (1 - bounce) * gooey * 16,
    gooey,
    opacity: arrival,
    zIndex: index + 1,
    depth: target.z,
    unfold,
  };
}

export function formationRadii(width, height, settings) {
  const f = settings.formation;
  const maximumScale = (0.92 + f.depth / 2) * (1 + f.sizeVariation / 100);
  const cardWidth = width * f.cardSize / 100 * maximumScale;
  // Map the entire slider range to usable space. No plateau from an invisible radius cap.
  return {
    x: Math.max(0, (width - cardWidth) / 2.08) * f.spreadPercent / 100 * f.horizontalSpread / 100,
    y: Math.max(0, (height - cardWidth / 0.85) / 2.08) * f.spreadPercent / 100 * f.verticalSpread / 100,
  };
}
