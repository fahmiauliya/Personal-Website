import { createOutlined } from '../../../../components/outlined/Outlined';
import frame from './frame.webp';
import visual from './visual.svg';
import { GLYPHS, TEXT } from './glyphs';
import '../labFrame.css';

// Bifrost motion 10, the architecture layers (Figma Portfolio-2026, frame 225:113972, 698 × 1126,
// card 221:103040 inside frame 213:89790), in code: Motion Lab's bifrost-content/motion-10 as the
// site had it (the frame holding the title and artwork draws its inside stroke over them, as
// Figma does, and the artwork is the site's build of visual.svg, with the current load-balancer
// layer), with its frame image. The card is code; the isometric artwork and its labels
// (221:101581) are a vector export, already outlines. Text is outlines (./glyphs), so no font loads.
const T = createOutlined(GLYPHS, TEXT);
const MONO = "'Geist Mono', ui-monospace, monospace";
const SANS = "Geist, 'DM Sans', Arial, sans-serif";
const LINE = 'rgba(0,0,0,0.1)';

const PLUG_SVG = `<svg width="11.5707" height="11.5707" viewBox="0 0 11.5707 11.5707" fill="none" xmlns="http://www.w3.org/2000/svg"> <g id="Frame" clip-path="url(#clip0_0_4)"> <g id="Vector"> </g> <path id="Vector_2" d="M6.51015 2.89268L8.31808 1.08476" stroke="#177B62" stroke-width="0.723171" stroke-linecap="round" stroke-linejoin="round"/> <path id="Vector_3" d="M10.4874 3.25425L8.67945 5.06218" stroke="#177B62" stroke-width="0.723171" stroke-linecap="round" stroke-linejoin="round"/> <path id="Vector_4" d="M10.1293 6.50855L5.06706 1.44635" stroke="#177B62" stroke-width="0.723171" stroke-linecap="round" stroke-linejoin="round"/> <path id="Vector_5" d="M9.58247 5.96619L6.93251 8.61616C6.66127 8.88733 6.29344 9.03967 5.9099 9.03967C5.52636 9.03967 5.15852 8.88733 4.88729 8.61616L2.95507 6.68394C2.68389 6.4127 2.53155 6.04487 2.53155 5.66133C2.53155 5.27779 2.68389 4.90995 2.95507 4.63872L5.60504 1.98875" stroke="#177B62" stroke-width="0.723171" stroke-linecap="round" stroke-linejoin="round"/> <path id="Vector_6" d="M3.92306 7.64977L1.44846 10.1244" stroke="#177B62" stroke-width="0.723171" stroke-linecap="round" stroke-linejoin="round"/> </g> <defs> <clipPath id="clip0_0_4"> <rect width="11.5707" height="11.5707" fill="white"/> </clipPath> </defs> </svg>`;

function Card() {
  return (
    <div style={{ position: 'absolute', inset: 0, padding: 10, boxSizing: 'border-box', background: '#fff' }}>
      <div style={{ width: 593, height: 650.339, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5.785, height: 31.966, padding: 8.678, boxSizing: 'border-box', background: '#fff', border: `0.723px solid ${LINE}` }}>
          <span style={{ display: 'block', width: 11.571, height: 11.571, lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: PLUG_SVG }} />
          <T k="eyebrow" style={{ fontFamily: MONO, fontWeight: 500, fontSize: 8.678, letterSpacing: 0.5207, lineHeight: 1.6, color: '#177b62', whiteSpace: 'nowrap' }}>[PLUG ANY MODEL IN]</T>
        </div>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5.785, padding: 8.678, boxSizing: 'border-box', borderBottom: `0.723px solid ${LINE}` }}>
          <T k="title" style={{ fontFamily: SANS, fontWeight: 500, fontSize: 20.249, letterSpacing: -0.405, lineHeight: 1.2, color: 'rgba(0,0,0,0.95)', whiteSpace: 'normal' }}>Built for Real-World Scale</T>
          <T k="lede" style={{ fontFamily: SANS, fontSize: 10.124, lineHeight: 1.4, color: '#525252', whiteSpace: 'normal' }}>Compatible with all model SDKs, with outputs sent anywhere you need</T>
        </div>
        <div style={{ position: 'relative', width: 593, height: 557.232, overflow: 'hidden' }}>
          <img src={visual} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        </div>
        {/* The frame's inside stroke, over its content and taking no space. */}
        <span aria-hidden="true" style={{ position: 'absolute', inset: 0, borderLeft: `0.723px solid ${LINE}`, borderRight: `0.723px solid ${LINE}`, borderBottom: `0.723px solid ${LINE}`, pointerEvents: 'none' }} />
        </div>
      </div>
    </div>
  );
}

/** The motion's frame (698 × 1126): its image, and the card in its content box. */
export default function Architecture() {
  return (
    <div className="bifrost-lab-frame" style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#00251a' }}>
      <img src={frame} alt="" decoding="async" style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', left: 43, top: 227.34, width: 613, height: 670.34 }}>
        <Card />
      </div>
    </div>
  );
}
