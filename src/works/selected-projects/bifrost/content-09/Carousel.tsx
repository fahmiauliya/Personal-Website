import { useEffect, useRef, useState } from 'react';
import { useNearView } from '../../../../components/motion/useNearView';
import { createOutlined } from '../../../../components/outlined/Outlined';
import RiveVisual, { type RiveVisualName } from '../rive-visual/RiveVisual';
import { runTimeline, type Ease, type Step } from '../shared/timeline';
import frame from '../shared/frame-dither.webp';
import { GLYPHS, TEXT } from './glyphs';
import styles from './Carousel.module.css';
import '../labFrame.css';

// Bifrost motion 09, the feature cards carousel (Figma Portfolio-2026, frame 225:113720 and card
// section 241:1657, 698 × 557), in code: Motion Lab's bifrost-content/motion-09 and its frame image.
// Cards slide left → right on the lab's saved timeline (settings.json: 2s holds, 1.2s slides, four
// steps, 12.8s a loop). Each card's visual was a Rive file (motion-9-6th…9th_visual); they are
// ../rive-visual here, mounted only while their card is near the frame, as the lab's were (so each
// starts over when it comes round). Text is outlines (./glyphs), so no font loads.
const T = createOutlined(GLYPHS, TEXT);
const CARD_W = 240.573;
const CARD_H = 349.198;
const CARD_Y = 103.901;
const PITCH = 280.667; // centre-to-centre spacing from Figma's card row
const CENTER_X = 228.714;
const cards: { title: string; body: string; visual: RiveVisualName }[] = [
  { title: '06 Unified Interface', body: 'One consistent API for all providers. Switch models without changing code.', visual: 'motion-9-6th' },
  { title: '07 Drop-in Replacement', body: 'Replace your existing SDK with just one line change. Compatible with OpenAI, Anthropic, LiteLLM, Google Genai, Langchain and more.', visual: 'motion-9-7th' },
  { title: '08 Built-in Observability', body: 'Out-of-the-box OpenTelemetry support for observability. Built-in dashboard for quick glances without any complex setup.', visual: 'motion-9-8th' },
  { title: '09 Community Support', body: 'Active Discord community with responsive support and regular updates.', visual: 'motion-9-9th' },
];

// The saved timeline (settings.json): 2s holds (eased in place) and 1.2s slides, four steps.
const HOLD: Ease = [0.88, 0.02, 0.7, 1];
const SLIDE: Ease = [0.65, 0, 0.35, 1];
const STEPS: Step[] = [0, 1, 2, 3].flatMap(i => [{ duration: 2, to: i, ease: HOLD }, { duration: 1.2, to: i + 1, ease: SLIDE }]);
// The copies whose card is near the frame (their visuals mounted), at a row shift.
const COPIES = cards.length * 3;
function nearCopies(shift: number) {
  const near: number[] = [];
  for (let index = 0; index < COPIES; index += 1) {
    const left = CENTER_X + (index - 2 * cards.length) * PITCH + shift;
    if (left > -CARD_W - PITCH && left < 698 + PITCH) near.push(index);
  }
  return near.join(',');
}

function FeatureCard({ card, renderVisual, live }: { card: typeof cards[number]; renderVisual: boolean; live: boolean }) {
  return <div className={styles.card}>
    <div className={styles.cardInner}>
      <div className={styles.cardVisual}>
        {renderVisual && <RiveVisual name={card.visual} fit="contain" live={live} />}
      </div>
      <div className={styles.cardCaption}>
        <T k={`title:${card.visual}`} className={styles.cardTitle}>{card.title}</T>
        <T k={`body:${card.visual}`} className={styles.cardBody} style={{ whiteSpace: 'normal' }}>{card.body}</T>
      </div>
    </div>
  </div>;
}

export default function Carousel() {
  const ref = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const live = useNearView(ref, false, 'screen');
  const [near, setNear] = useState(() => nearCopies(0));
  const clock = useRef({ elapsed: 0 });
  // The timeline runs while the motion is near the screen; far away it holds where it is.
  useEffect(() => runTimeline(STEPS, live, clock.current, position => {
    const row = rowRef.current;
    if (!row) return;
    // Positive shift moves the row to the right.
    const shift = Math.max(0, Math.min(cards.length, position)) * PITCH;
    row.style.transform = `translateX(${shift}px)`;
    setNear(nearCopies(shift));
  }), [live]);
  const nearSet = new Set(near.split(',').map(Number));
  return (
    <div ref={ref} className="bifrost-lab-frame" style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#00281e' }}>
      <img src={frame} alt="" decoding="async" style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div ref={rowRef} style={{ position: 'absolute', left: CENTER_X, top: CARD_Y, width: CARD_W, height: CARD_H }}>
          {Array.from({ length: COPIES }, (_, index) => (
            <div key={index} style={{ position: 'absolute', left: (index - 2 * cards.length) * PITCH, top: 0 }}>
              <FeatureCard card={cards[index % cards.length]} renderVisual={nearSet.has(index)} live={live} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
