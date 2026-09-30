import frame from './frame.svg';

// Bifrost motion 07, enterprise (Figma Portfolio-2026, frame 225:113239, 865 × 812): Motion Lab's
// bifrost-content/motion-07 has no motion of its own, only its frame image (a vector export, which
// also draws Figma's "Motion 8" label; no live text).
export default function Enterprise() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#f6f6f6' }}>
      <img src={frame} alt="" decoding="async" style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
