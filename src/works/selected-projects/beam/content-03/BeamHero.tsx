import { useEffect, useRef, useState } from 'react';
import WorkspaceDemo from './WorkspaceDemo';
import { T } from './text';
import beamLogo from './assets/beam-logo.svg';
import arrowRight from './assets/arrow-right.svg';
import claudeIcon from './assets/claude.svg';
import replitIcon from './assets/replit.svg';
import openaiIcon from './assets/openai.svg';
import './BeamHero.css';

// Content 03: Beam's hero (Motion Lab beam-content/motion-03 with its page's navbar), in code,
// at the size the gallery showed its export at (1500 × 865, the desktop layout) and in the
// export's demo loop. It's a picture of the page, so nothing in it is interactive: the buttons
// are drawn at rest. The 1440 × 540 artwork (frame, fade and the workspace demo) is scaled to
// 1454px wide, as the lab's HeroVisual does at this width. The demo runs only while the
// section is on screen. Text is outlines (./text), so it loads no font.

const CANVAS_WIDTH = 1440;
const VISUAL_WIDTH = 1454; // min((1500 - 264) × 1.2365, 1454)

export default function BeamHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), { threshold: 0.08 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="beam-hero" inert>
      <nav className="beam-hero-nav">
        <div className="beam-hero-nav-inner">
          <span className="beam-hero-brand">
            <img src={beamLogo} alt="" width={18.7} height={18.7} />
            <span className="beam-hero-brand-name"><T k="nav:Beam">Beam</T></span>
          </span>
          <span className="beam-hero-nav-actions">
            <span className="beam-hero-signup"><T k="nav:Signup">Signup</T></span>
            <span className="beam-hero-pill beam-hero-pill--light beam-hero-login"><T k="nav:Login">Login</T></span>
          </span>
        </div>
      </nav>

      <div className="beam-hero-intro">
        <div className="beam-hero-copy">
          <div className="beam-hero-offer-row">
            <span className="beam-hero-sale"><T k="sale">SALE</T></span>
            <span className="beam-hero-offer"><T k="offer">Launch offer Get Pro for $10/month</T><img src={arrowRight} alt="" width={12} height={12} /></span>
          </div>
          <h2 className="beam-hero-title"><T k="title">One workspace. Everywhere.</T></h2>
          <p className="beam-hero-lede"><T k="lede">{'Beam keeps your files available across local machines, cloud environments,\nCI, and agent workflows without rebuilding context.'}</T></p>
        </div>
        <div className="beam-hero-actions">
          <span className="beam-hero-pill beam-hero-pill--light beam-hero-copy-prompt">
            <span className="beam-hero-copy-label"><T k="copy-prompt">Copy agent prompt</T></span>
            <span className="beam-hero-divider" />
            <span className="beam-hero-agents">
              <img src={claudeIcon} alt="" />
              <img src={replitIcon} alt="" />
              <img src={openaiIcon} alt="" />
            </span>
          </span>
          <span className="beam-hero-pill beam-hero-pill--dark beam-hero-start"><T k="start-free">Start free</T></span>
        </div>
      </div>

      <div className="beam-hero-visual" role="group" aria-label="Beam file manager demo">
        <div className="beam-hero-canvas" style={{ transform: `translateX(-50%) scale(${VISUAL_WIDTH / CANVAS_WIDTH})` }}>
          <svg className="beam-hero-backdrop" viewBox="0 0 1440 540" width="1440" height="540" fill="none" aria-hidden="true">
            <g opacity="0.9">
              <rect width="1440" height="540" fill="#FAFAFA" />
              <rect x="132" width="1176" height="680.661" rx="11.5107" fill="url(#beam-hero-frame)" fillOpacity="0.04" />
              <rect x="137.49" y="5.48961" width="1164.56" height="669.682" rx="5.75533" fill="white" />
            </g>
            <defs>
              <linearGradient id="beam-hero-frame" x1="132" y1="0" x2="1181.55" y2="860.416" gradientUnits="userSpaceOnUse">
                <stop />
                <stop offset="1" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="beam-hero-app-clip"><WorkspaceDemo playing={inView} /></div>
          <div className="beam-hero-fade" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
