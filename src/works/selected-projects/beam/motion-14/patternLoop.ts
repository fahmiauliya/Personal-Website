const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

// Travel keeps its steady cruise, then eases out over the last stretch so the
// front arrives at 100 with zero velocity instead of stopping dead.
const TRAVEL_START = 0.15;
const CRUISE_SHARE = 0.8;
const CRUISE_SLOPE = 2 / (1 + CRUISE_SHARE);
const TRAVEL_DURATION = 5.4 * CRUISE_SLOPE;
const TRAVEL_END = TRAVEL_START + TRAVEL_DURATION;
const CRUISE_END = CRUISE_SLOPE * CRUISE_SHARE;
const EASE_RATE = CRUISE_SLOPE / (2 * (1 - CRUISE_SHARE));

// At arrival the dots dissolve into a calm green glow, the completed state
// holds briefly, then the glow and line clear before the next pass.
const DOTS_FADE_START = TRAVEL_END - 0.1;
const DOTS_FADE_END = TRAVEL_END + 0.45;
const GLOW_START = TRAVEL_END - 0.15;
const GLOW_END = TRAVEL_END + 0.35;
const RESET_START = TRAVEL_END + 1.45;
const RESET_END = RESET_START + 0.5;
export const patternLoopDuration = RESET_END + 0.2;

function travelAt(share: number) {
  const u = Math.max(0, Math.min(1, share));
  if (u >= 1) return 1;
  if (u <= CRUISE_SHARE) return CRUISE_SLOPE * u;
  const glide = u - CRUISE_SHARE;
  return CRUISE_END + CRUISE_SLOPE * glide - EASE_RATE * glide * glide;
}

/** Seconds into the loop when the front reaches `fraction` (0–1) of the width. */
export function patternArrivalAt(fraction: number) {
  const target = Math.max(0, Math.min(1, fraction));
  const share = target <= CRUISE_END
    ? target / CRUISE_SLOPE
    : CRUISE_SHARE + (1 - CRUISE_SHARE) * (1 - Math.sqrt(Math.max(0, 1 - (target - CRUISE_END) / (1 - CRUISE_END))));
  return TRAVEL_START + share * TRAVEL_DURATION;
}

export function patternLoopAt(seconds: number) {
  const time = ((seconds % patternLoopDuration) + patternLoopDuration) % patternLoopDuration;
  const progress = travelAt((time - TRAVEL_START) / TRAVEL_DURATION) * 100;
  const opacity = 1 - smooth((time - DOTS_FADE_START) / (DOTS_FADE_END - DOTS_FADE_START));
  const reset = 1 - smooth((time - RESET_START) / (RESET_END - RESET_START));
  const glow = smooth((time - GLOW_START) / (GLOW_END - GLOW_START)) * reset;
  return { progress, opacity, glow, reset, time };
}
