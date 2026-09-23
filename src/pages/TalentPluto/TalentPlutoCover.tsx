import type { CSSProperties } from 'react';
import SceneFit from '../../components/SceneFit';
import chevron from '../../assets/projects/talentpluto/chevron.svg';
import logoIris from '../../assets/projects/talentpluto/logo-iris.svg';
import logoLime from '../../assets/projects/talentpluto/logo-lime.svg';
import logoOrange from '../../assets/projects/talentpluto/logo-orange.svg';
import newSparkle from '../../assets/projects/talentpluto/new-sparkle.svg';
import plutoAvatar from '../../assets/projects/talentpluto/pluto-avatar.svg';
import plutoMark from '../../assets/projects/talentpluto/pluto-mark.svg';
import './talentplutoCover.css';

// TalentPluto cover: the looping video with the Pluto chat components on top, built in
// code from Figma (Portfolio-2026, node 262:161; its white frame is left out). Only the icons and company logos are
// Figma SVG exports; all layout, text, and surfaces are HTML/CSS at Figma px. The scene
// is 806 × 706 (the project detail cover size, like Beam and Bifrost) and SceneFit
// scales it to whatever box shows it.
const SCENE = { width: 806, height: 706 };

type Match = {
  title: string;
  logo: string;
  logoSize: [number, number];
  logoOffset?: [number, number];
  badgeGap: number;
  color: string;
  gradient?: boolean;
};

const matches: Match[] = [
  { title: 'Head of Product', logo: logoOrange, logoSize: [11.717, 11.717], badgeGap: 3.794, color: '#f24b0d', gradient: true },
  { title: 'Product Designer', logo: logoLime, logoSize: [11.229, 9.765], logoOffset: [0.05, -0.29], badgeGap: 3.794, color: '#7aa329' },
  { title: 'Product lead', logo: logoIris, logoSize: [10.741, 7.812], logoOffset: [0.06, -0.29], badgeGap: 7.812, color: '#6d6db0' },
];

function MatchRow({ match, first }: { match: Match; first: boolean }) {
  const [logoWidth, logoHeight] = match.logoSize;
  const [dx, dy] = match.logoOffset ?? [0, 0];
  return (
    <div className={`tp-match${first ? ' tp-match--first' : ''}`}>
      <div className="tp-match-copy">
        <div className="tp-match-heading" style={{ gap: match.badgeGap }}>
          <div className="tp-match-name">
            <span className="tp-company" style={{ '--company': match.color } as CSSProperties} data-gradient={match.gradient || undefined}>
              <img src={match.logo} alt="" style={{ width: logoWidth, height: logoHeight, transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))` }} />
            </span>
            <span className="tp-match-title">{match.title}</span>
          </div>
          <span className="tp-badge">
            <img src={newSparkle} alt="" />
            <span>New</span>
          </span>
        </div>
        <span className="tp-match-place">Hybrid · San Francisco</span>
      </div>
      <img className="tp-chevron" src={chevron} alt="" />
    </div>
  );
}

export default function TalentPlutoCover({ video, poster }: { video: string; poster: string }) {
  return (
    <SceneFit width={SCENE.width} height={SCENE.height}>
      <div className="tp-cover">
        <video className="tp-cover-video" src={video} poster={poster} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
        <div className="tp-panel">
          <div className="tp-message">
            <div className="tp-avatar"><img src={plutoAvatar} alt="" /></div>
            <div className="tp-message-body">
              <div className="tp-message-meta"><span>Pluto</span><span>7:12 AM</span></div>
              <div className="tp-bubble">
                <p>Hey Alex! I’ve partnered with 3 startups that are a great fit. I think you’ll love these.</p>
              </div>
            </div>
          </div>
          <div className="tp-matches">
            <div className="tp-matches-header">
              <img src={plutoMark} alt="" />
              <span>Curated matches, delivered by Pluto</span>
            </div>
            <div className="tp-matches-list">
              {matches.map((match, index) => <MatchRow key={match.title} match={match} first={index === 0} />)}
            </div>
          </div>
        </div>
      </div>
    </SceneFit>
  );
}
