import type { CSSProperties } from 'react';
import Halftone from './Halftone';
import { pageGrain } from './pageGrain';
import gradient1 from './assets/images/gradient-1.webp';
import gradient2 from './assets/images/gradient-2.webp';
import person1 from './assets/images/person-1.webp';
import person2 from './assets/images/person-2.webp';
import person3 from './assets/images/person-3.webp';
import person4 from './assets/images/person-4.webp';
import antimetal from './assets/logos/antimetal.svg';
import attention from './assets/logos/attention.svg';
import plutoLogomark from './assets/logos/pluto-logomark.svg';
import rho from './assets/logos/rho.svg';
import ycMark from './assets/logos/yc-mark.svg';
import ycWordmark from './assets/logos/yc-wordmark.svg';
import play from './assets/icons/play.svg';
import { createOutlined } from '../../../../components/outlined/Outlined';
import { GLYPHS, TEXT } from './glyphs';
import styles from './CareerAgentCard.module.css';

// The card's text is outlines (./glyphs, traced from TikTok Sans and Inter where the browser set
// it), so the card loads no font. Each piece keeps its parent's wrapping (the live text, before
// tracing, is measured laid out as the card lays it out).
const Outlined = createOutlined(GLYPHS, TEXT);
const T = ({ k, children }: { k: string; children: string }) => <Outlined k={k} style={{ whiteSpace: 'inherit' }}>{children}</Outlined>;

// Figma: Portfolio-2026, "Hero - Career Agent" 285:19188 (536 × 410.204071). A Pluto landing
// page in code, one element per Figma layer (node ids kept), over the halftone dots. Photos
// are Figma's greyscale renders; gradients are the source JPEGs, as WebP at 1280 px.

const WIDTH = 536;
const HEIGHT = 410.2040710449219;

type Stat = { value: string; label: string };
type Story = {
  gradient: { src: string; style: CSSProperties };
  person: { src: string; style: CSSProperties; flip?: boolean; opacity?: number };
  logo: { src: string; style: CSSProperties };
  quote?: string[];
  stats?: { items: [Stat, Stat]; gap: number };
};

// Photo boxes are Figma's; "flip" is its -scale-y-100 + rotate-180, i.e. a horizontal mirror.
const gradientLeft = { src: gradient1, style: { left: -51.35, top: 0 } };
const quote1 = ['I didn’t have to search through job boards. Pluto found the roles that made ', 'sense for me.”'];
// The four stories. Figma's row shows five cards: these four, then the first again.
const stories: Story[] = [{
  gradient: gradientLeft,
  person: { src: person1, style: { right: -172.76, top: -28.31, width: 401.859, height: 226.166 } },
  logo: { src: rho, style: { left: 105.99, top: 10.2, width: 15.436, height: 6.598 } },
  quote: quote1,
}, {
  gradient: gradientLeft,
  person: { src: person2, style: { right: -28.31, top: -28.31, width: 437.308, height: 246.117 }, flip: true },
  logo: { src: antimetal, style: { left: 87.89, top: 7.57 + 3.555, width: 33.669, height: 4.74 } },
  stats: { items: [{ value: '7 days', label: 'My 1st real startup intro' }, { value: '4 better-fit paths', label: 'Pluto helped me compare' }], gap: 3.95 },
}, {
  gradient: { src: gradient2, style: { left: 'calc(50% - 0.07px)', top: 'calc(50% + 0.04px)', transform: 'translate(-50%, -50%)' } },
  person: { src: person3, style: { left: -238.09, top: -53.98, width: 462.249, height: 252.086 }, flip: true, opacity: 0.9 },
  logo: { src: rho, style: { left: 10.21, top: 10.2, width: 15.436, height: 6.598 } },
  quote: ['“Pluto helped us meet candidates who were already aligned with what we needed, not just people who matched keywords.”'],
}, {
  gradient: gradientLeft,
  person: { src: person4, style: { right: 33.9, top: -23.7, width: 320.394, height: 180.318 }, flip: true },
  logo: { src: attention, style: { left: 95.13, top: 10.2, width: 26.485, height: 6.517 } },
  stats: { items: [{ value: '10 min chat', label: 'to build my profile' }, { value: '3 startup matches', label: 'after one conversation' }], gap: 1.185 },
}];

// The story carousel (285:19278). Cards step right to left one story at a time: the lab's
// timeline holds, slides one step (eased), holds again, for STORY_STEPS steps, then loops.
// After four steps the row shows the same stories as at the start, so the loop never jumps.
export const STORY_STEPS = stories.length;
const CARD = 131.666;
const GAP = 3.95;
const PITCH = CARD + GAP;
// Figma centres its five cards in the 452.932px row, so the first starts 110.599px left of it.
const FIRST_X = (452.932 - (5 * CARD + 4 * GAP)) / 2;
const FIGMA_NODES = ['285:19279', '285:19297', '285:19344', '285:19362', '285:19400'];
// Nine cards cover the page at every position from 0 to STORY_STEPS.
const TRACK = Array.from({ length: 9 }, (_, index) => index);

const navLinks = [
  { label: 'How it works', width: 28.967 },
  { label: 'Why Pluto', width: 27.321 },
  { label: 'Stories' },
  { label: 'For companies' },
];

function StoryCard({ story, index, node, left }: { story: Story; index: number; node?: string; left: number }) {
  const { person } = story;
  return <div className={styles.story} style={{ left }} data-node-id={node}>
    <img className={styles.gradient} src={story.gradient.src} alt="" style={story.gradient.style} />
    <img
      className={styles.person}
      src={person.src}
      alt=""
      style={{ ...person.style, transform: person.flip ? 'scaleX(-1)' : undefined, opacity: person.opacity }}
    />
    <div className={styles.storyBox}>
      {story.quote && <p className={styles.quote}>{story.quote.map((line, n) => <span key={line}><T k={`s${index}:quote:${n}`}>{line}</T></span>)}</p>}
      {story.stats && <div className={styles.stats}>
        {story.stats.items.map(stat => <div key={stat.value} className={styles.stat} style={{ gap: story.stats!.gap }}>
          <p className={styles.statValue}><T k={`s${index}:value:${stat.value}`}>{stat.value}</T></p>
          <p className={styles.statLabel}><T k={`s${index}:label:${stat.value}`}>{stat.label}</T></p>
        </div>)}
      </div>}
    </div>
    <div className={styles.storyFooter}>
      <div className={styles.personName}>
        <p><T k="personName">Devonaire Ortiz</T></p>
        <p><T k="personRole">VP of people &amp; talent</T></p>
      </div>
      <div className={styles.watch}>
        <span className={styles.playButton}><img src={play} alt="" /></span>
        <span className={styles.watchLabel}><T k="watch">Watch</T></span>
      </div>
    </div>
    <img className={styles.storyLogo} src={story.logo.src} alt="" style={story.logo.style} />
  </div>;
}

/** `position` is the carousel step (0 to STORY_STEPS) from the lab's timeline; 0 is Figma's layout. */
export default function CareerAgentCard({ position = 0 }: { position?: number }) {
  const grain = pageGrain();
  const shift = Math.min(STORY_STEPS, Math.max(0, position)) * PITCH;
  return <figure className={styles.card} aria-label="Career Agent" data-node-id="285:19188">
    <Halftone className={styles.halftone} width={WIDTH} height={HEIGHT} />
    <div
      className={styles.page}
      data-node-id="285:19230"
      style={{ backgroundImage: `url(${grain.url})`, backgroundSize: `${grain.size}px ${grain.size}px` }}
    >
      <nav className={styles.nav} data-node-id="285:19232">
        <img className={styles.logomark} src={plutoLogomark} alt="" data-node-id="289:56610" />
        <div className={styles.links} data-node-id="285:19240">
          {navLinks.map(link => <span key={link.label} className={styles.link} style={{ width: link.width }}><T k={`nav:${link.label}`}>{link.label}</T></span>)}
        </div>
        <div className={styles.navActions} data-node-id="285:19235">
          <span className={styles.signIn} data-node-id="285:19236"><T k="signIn">Sign in</T></span>
          <span className={styles.talk} data-node-id="285:19238"><T k="talk">Talk to pluto</T></span>
        </div>
      </nav>

      <div className={styles.hero} data-node-id="285:19249">
        <div className={styles.heroText} data-node-id="285:19250">
          <div className={styles.backed} data-node-id="285:19251">
            <span><T k="backed">Backed by</T></span>
            <span className={styles.yc} data-node-id="285:19253">
              <img className={styles.ycMark} src={ycMark} alt="" />
              <img className={styles.ycWordmark} src={ycWordmark} alt="Y Combinator" />
            </span>
          </div>
          <div className={styles.headline} data-node-id="285:19268">
            <h1><T k="headline">Your career needs an agent.</T></h1>
            <p><T k="lede">Pluto is your AI career agent. It understands your background, helps the right opportunities find you, and represents you when there is a strong match.</T></p>
          </div>
        </div>
        <div className={styles.phone} data-node-id="285:19271">
          <div className={styles.phoneField} data-node-id="285:19273">
            <span className={styles.placeholder} data-node-id="285:19274"><T k="phone">Enter your phone</T></span>
            <span className={styles.callMe} data-node-id="285:19276"><T k="callMe">Call Me</T></span>
          </div>
        </div>
      </div>

      <div className={styles.stories} data-node-id="285:19278">
        <div className={styles.track} style={{ transform: `translate3d(${-shift}px, 0, 0)` }}>
          {TRACK.map(index => <StoryCard key={index} story={stories[index % STORY_STEPS]} index={index % STORY_STEPS} node={FIGMA_NODES[index]} left={FIRST_X + index * PITCH} />)}
        </div>
      </div>
    </div>
  </figure>;
}
