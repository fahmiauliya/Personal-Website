import { useCallback, useRef } from 'react';
import AgentOrb, { orbSettings } from './shaders/AgentOrb';
import AnimatedBackground, { backgroundDefaults, type BackgroundSettings } from './shaders/AnimatedBackground';
import background from './assets/background.png';
import chevron from './assets/chevron.svg';
import iconMaxAgent from './assets/icon-max-agent.svg';
import iconNetwork from './assets/icon-network.svg';
import iconOpportunities from './assets/icon-opportunities.svg';
import iconSend from './assets/icon-send.svg';
import styles from './AgentWalkthroughCard.module.css';

// Figma: Portfolio-2026, "Agent Walkthrough" 285:43271 (536 × 410.204071). The background
// is the image layer exported at 2×; the onboarding panel is code, one element per Figma
// layer (node ids on each), so its steps, rows and input can be animated separately.

const steps = [
  { number: 1, label: 'Start', active: true, centred: true, node: '287:55353' },
  { number: 2, label: 'Verify', node: '287:55357' },
  { number: 3, label: 'Select', node: '287:55361' },
  { number: 4, label: 'Review', centred: true, node: '287:55365' },
  { number: 5, label: 'Setup', centred: true, node: '287:55369' },
];

const options = [
  { title: 'Max Agent', description: 'Build and train your personal career agent', icon: iconMaxAgent, node: '287:55382' },
  { title: 'Network', description: 'Invite 4 friend so join the TalentPluto network', icon: iconNetwork, node: '287:55395' },
  { title: 'Opportunities', description: 'Top roles matched directly from background', icon: iconOpportunities, node: '287:55411' },
];

const CARD = { width: 536, height: 410.2040710449219 };
// The glass lens (see .glass in the CSS): 1.8× magnification about the glass centre, blurred.
// The lens canvas reaches LENS.margin past the glass on every side so the blur has no soft edge.
const LENS = { x: 110, y: 43, width: 315.87774658203125, height: 324.22918701171875, zoom: 1.8, margin: 60, resolution: 0.25 };

/** Copies the background under the glass into the lens canvas, magnified about the glass centre. */
function drawLens(target: HTMLCanvasElement | null, source: HTMLCanvasElement) {
  const context = target?.getContext('2d');
  if (!target || !context) return;
  const width = LENS.width + LENS.margin * 2;
  const height = LENS.height + LENS.margin * 2;
  const pixelWidth = Math.round(width * LENS.resolution);
  const pixelHeight = Math.round(height * LENS.resolution);
  if (target.width !== pixelWidth) target.width = pixelWidth;
  if (target.height !== pixelHeight) target.height = pixelHeight;
  const scale = source.width / CARD.width;
  const centreX = LENS.x + LENS.width / 2;
  const centreY = LENS.y + LENS.height / 2;
  const sourceWidth = width / LENS.zoom;
  const sourceHeight = height / LENS.zoom;
  context.drawImage(source, (centreX - sourceWidth / 2) * scale, (centreY - sourceHeight / 2) * scale, sourceWidth * scale, sourceHeight * scale, 0, 0, pixelWidth, pixelHeight);
}

/** `position` is the time in the background loop, in seconds, when the lab's timeline drives it. */
export default function AgentWalkthroughCard({ position, values }: { position?: number; values?: Record<string, Record<string, number>> }) {
  const settings: BackgroundSettings = { ...backgroundDefaults, ...(values?.Background ?? {}) };
  const lensRef = useRef<HTMLCanvasElement>(null);
  const onFrame = useCallback((canvas: HTMLCanvasElement) => drawLens(lensRef.current, canvas), []);
  return <figure className={styles.card} aria-label="Agent Walkthrough" data-node-id="285:43271">
    {/* The Figma image stays underneath as the poster until the shader draws, and if WebGL is off. */}
    <img className={styles.background} src={background} alt="" draggable={false} data-node-id="287:55437" />
    <AnimatedBackground className={styles.background} width={CARD.width} height={CARD.height} time={position} settings={settings} onFrame={onFrame} />
    <div className={styles.glass} data-node-id="287:55459">
      <img className={styles.lens} src={background} alt="" draggable={false} />
      <canvas ref={lensRef} className={styles.lensLive} aria-hidden />
      <div className={styles.panel} data-node-id="287:55351">
        <div className={styles.steps} data-node-id="287:55352">
          {steps.map(step => <div key={step.number} className={`${styles.step} ${step.centred ? styles.stepCentred : ''} ${step.active ? styles.stepActive : ''}`} data-node-id={step.node}>
            <span className={`${styles.badge} ${step.active ? styles.badgeActive : ''}`}>{step.number}</span>
            <span className={styles.stepLabel}>{step.label}</span>
          </div>)}
        </div>
        <div className={styles.body} data-node-id="287:55373">
          <div className={styles.intro} data-node-id="287:55374">
            {/* 287:55375: the avatar, now a live orb (shaders/AgentOrb.tsx) at the same 31.701px. */}
            <span className={styles.avatar} data-node-id="287:55375">
              <AgentOrb className={styles.orb} size={31.701} time={position} settings={orbSettings(values)} />
            </span>
            <div className={styles.introText} data-node-id="287:55377">
              <p className={styles.introTitle}>Talk to Agent</p>
              <p className={styles.introSubtitle}>Have a real conversation about you</p>
            </div>
          </div>
          <div className={styles.actions} data-node-id="287:55380">
            <div className={styles.rows} data-node-id="287:55381">
              {options.map(option => <div key={option.title} className={styles.row} data-node-id={option.node}>
                <div className={styles.rowMain}>
                  <span className={styles.rowIcon}><img src={option.icon} alt="" /></span>
                  <div className={styles.rowText}>
                    <p className={styles.rowTitle}>{option.title}</p>
                    <p className={styles.rowDescription}>{option.description}</p>
                  </div>
                </div>
                <img className={styles.chevron} src={chevron} alt="" />
              </div>)}
            </div>
            <div className={styles.input} data-node-id="287:55425">
              <p className={styles.placeholder}>Ask agent anything ...</p>
              <span className={styles.send} data-node-id="287:55427"><img src={iconSend} alt="" /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </figure>;
}
