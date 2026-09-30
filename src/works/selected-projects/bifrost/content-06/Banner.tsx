import frame from './frame.webp';

// Bifrost motion 06, the vertical banner (Figma Portfolio-2026, frame 225:113236, 531 × 812):
// Motion Lab's bifrost-content/motion-06 has no motion of its own, only its frame image.
export default function Banner() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#1f1f1f' }}>
      <img src={frame} alt="" decoding="async" style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
