import { useEffect } from 'react';
import { TimelineStore } from 'dialkit';

// Live mode advances the same timeline transport at the chosen playback speed.
// Once the opening finishes, FloatingImages continues the idle motion independently.
export default function useLiveOpening({ live, paused, speed, enabled, end, blocked, replayKey, timelineId }) {
  useEffect(() => {
    if (!live || paused || !enabled || blocked) return;
    let frame;
    let last = performance.now();
    function tick(now) {
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      const current = TimelineStore.getTransport(timelineId).time;
      if (current >= end) return;
      if (!document.hidden) TimelineStore.seek(timelineId, Math.min(end, current + delta * speed));
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [live, paused, speed, enabled, end, blocked, replayKey, timelineId]);
}
