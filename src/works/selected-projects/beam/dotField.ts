// Motion 1's dot field and its reception ripple (Motion Lab beam-content/motion-01/
// SolutionVisual.tsx), shared by content 01 and the Beam cover, which draws the same field.
// Pure functions of their inputs, unchanged from the lab.

const smooth = (value: number) => value * value * (3 - 2 * value);

/** Rail position of the Beam mark. */
export const BEAM_MIDPOINT = 0.5;

/** The dot field's canvas size in px; the field CSS scales it to its box. */
export const DOT_FIELD_SIZE = 420;

export type FieldDot = {
  x: number;
  y: number;
  size: number;
  /** Fixed resting brightness. Static by design — the field never twinkles. */
  glow: number;
  distance: number;
  falloff: number;
};

export type DotFieldOptions = {
  /** Square field size in px. */
  size?: number;
  /** Grid spacing in px. */
  pitch?: number;
  /** Share of grid points left empty. */
  skip?: number;
  /** A dot's side in px, drawn from the seeded random source. */
  dotSize?: (random: () => number) => number;
  /** A dot's resting brightness, drawn from the seeded random source. */
  glow?: (random: () => number) => number;
};

/**
 * The dot field's layout, from a fixed seed so every render draws the same
 * texture. The defaults are motion 1's field; the Beam cover passes a denser one.
 */
export function buildDotField({
  size = DOT_FIELD_SIZE,
  pitch = 6,
  skip = 0.42,
  dotSize = random => (random() > 0.92 ? 3 : random() > 0.62 ? 2 : 1),
  // Varied but constant, so the resting field keeps its texture without any of
  // the dots animating on their own.
  glow = random => 0.11 + random() * 0.3,
}: DotFieldOptions = {}): FieldDot[] {
  const center = size / 2;
  const offset = (pitch * 2) / 3;
  let seed = 0x51a7c3;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const dots: FieldDot[] = [];

  for (let y = offset; y < size; y += pitch) {
    for (let x = offset; x < size; x += pitch) {
      if (random() < skip) continue;

      const distance = Math.hypot(x - center, y - center) / center;
      const falloff = Math.max(0, 1 - Math.pow(distance, 1.85));
      if (falloff <= 0) continue;

      dots.push({ x, y, size: dotSize(random), glow: glow(random), distance, falloff });
    }
  }
  return dots;
}

/*
 * ONE pulse-wave system, used by both states. Beam's reception wave and the
 * failure wave share these values verbatim — same centre, same radial
 * propagation, same wave thickness, same onset and decay. The ONLY difference
 * between the two is colour.
 *
 * The pulse is centred on the dot field in both cases. The pill collision is
 * causal in TIME — it is what starts the wave — not in space; it does not move
 * the wave's origin.
 */
export const FIELD_REACH = 1.18;
export const FIELD_PROPAGATION_MS = 460;
export const FIELD_DECAY_MS = 300;
export const FIELD_ONSET_MS = 50;

/**
 * The field's reaction to the looping laser at one moment of the laser's cycle.
 *
 * `time` and `duration` are the laser animation's clock; `travel` is the share
 * of the cycle spent crossing (`--laser-travel`); `triggerRail` is where the
 * streak clears the source card. Returns null outside the reaction window.
 *
 * `since`  — ms since the streak entered the early trigger zone.
 * `impact` — 0..1 envelope: a subtle pre-response as the laser closes in,
 *            reaching full strength as it arrives at the Beam mark.
 */
export function laserReactionAt(time: number, duration: number, travel: number, triggerRail: number) {
  const railToMs = duration * travel;
  const triggerAt = railToMs * triggerRail;
  // How long after the trigger the streak actually reaches the Beam mark.
  const impactAt = railToMs * (BEAM_MIDPOINT - triggerRail);

  const cyclePosition = ((time % duration) + duration) % duration;
  const since = ((cyclePosition - triggerAt) % duration + duration) % duration;
  if (since > FIELD_PROPAGATION_MS + FIELD_DECAY_MS) return null;

  return {
    since,
    // Stage 1 anticipation -> stage 2 impact. Never a step change.
    impact: since >= impactAt ? 1 : 0.3 + 0.7 * smooth(since / impactAt),
  };
}

/**
 * One dot's answer to Beam's reception wave. Propagation is spatial: a dot's
 * response begins only when the energy front reaches ITS distance.
 */
export function receptionResponse(distance: number, since: number, impact: number) {
  const arrivalMs = (distance / FIELD_REACH) * FIELD_PROPAGATION_MS;
  const localAge = since - arrivalMs;
  if (localAge < 0 || localAge > FIELD_DECAY_MS) return 0;
  // Quick onset, softer decay — an impulse rather than a flash.
  const rise = Math.min(1, localAge / FIELD_ONSET_MS);
  const fall = Math.pow(1 - localAge / FIELD_DECAY_MS, 1.7);
  // Outer dots answer more faintly than those beside the mark.
  const reach = 1 - 0.5 * (distance / FIELD_REACH);
  return rise * fall * reach * impact;
}

/**
 * One dot's answer to a centred pulse, as a pure function of its distance from
 * the field centre and how long ago the wave started.
 *
 * This is the same expression State 2's reception wave uses; State 1 simply
 * paints the result red. Exported so propagation and decay can be verified
 * numerically rather than only by eye.
 */
