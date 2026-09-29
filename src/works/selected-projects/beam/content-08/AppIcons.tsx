import type { CSSProperties } from 'react';
import darkGrid from './assets/dark-grid.svg?raw';
import darkGridRotated from './assets/dark-grid-rotated.svg?raw';
import darkPetalBottom from './assets/dark-petal-bottom.svg?raw';
import darkPetalLeft from './assets/dark-petal-left.svg?raw';
import darkPetalRight from './assets/dark-petal-right.svg?raw';
import darkPetalTop from './assets/dark-petal-top.svg?raw';
import lightGrid from './assets/light-grid.svg?raw';
import lightGridRotated from './assets/light-grid-rotated.svg?raw';
import lightPetalBottom from './assets/light-petal-bottom.svg?raw';
import lightPetalLeft from './assets/light-petal-left.svg?raw';
import lightPetalRight from './assets/light-petal-right.svg?raw';
import lightPetalTop from './assets/light-petal-top.svg?raw';
import './AppIcons.css';

// Content 08 (Figma Portfolio-2026, node 141:8249): Beam's app icon in dark and light, on
// the frame's construction grid, built in code at the design size (593 × 473). The tiles,
// frames and grid lines are CSS; the logo's four glossy petals (gradients, shadows and a
// backdrop blur) are Figma's own vectors, written into the page as inline SVG (bundled with
// this code, no image requests), their ids prefixed per file so they can't collide.

// Each petal's place within the 93.467 × 92.519 logo group, from Figma's layout.
const PETALS = [
  { key: 'top', left: 17.113, top: -0.064 },
  { key: 'right', left: 50.454, top: 13.946 },
  { key: 'left', left: -0.064, top: 16.958 },
  { key: 'bottom', left: 14.089, top: 49.915 },
] as const;

const ICONS = {
  dark: { grid: darkGrid, gridRotated: darkGridRotated, petals: { top: darkPetalTop, right: darkPetalRight, left: darkPetalLeft, bottom: darkPetalBottom } },
  light: { grid: lightGrid, gridRotated: lightGridRotated, petals: { top: lightPetalTop, right: lightPetalRight, left: lightPetalLeft, bottom: lightPetalBottom } },
};

// The markup is this folder's own SVG files, bundled at build time (never visitor input),
// so writing it into the page is safe.
function Svg({ markup, className, style }: { markup: string; className: string; style?: CSSProperties }) {
  return <span className={className} style={style} dangerouslySetInnerHTML={{ __html: markup }} />;
}

function AppIcon({ tone }: { tone: 'dark' | 'light' }) {
  const icon = ICONS[tone];
  return (
    <div className={`beam-app-icon beam-app-icon--${tone}`}>
      <div className="beam-app-icon__frame">
        <Svg className="beam-app-icon__grid" markup={icon.grid} />
        <Svg className="beam-app-icon__grid beam-app-icon__grid--rotated" markup={icon.gridRotated} />
      </div>
      <div className="beam-app-icon__logo">
        {PETALS.map(({ key, left, top }) => (
          <Svg key={key} className="beam-app-icon__petal" style={{ left, top }} markup={icon.petals[key]} />
        ))}
      </div>
    </div>
  );
}

export default function AppIcons() {
  return (
    <div className="beam-app-icons" aria-hidden="true">
      {/* Figma's layer order: the long horizontal guides, the dark icon, the long vertical
          guides (so they pass over the dark icon's edges), then the light icon on top. */}
      <span className="beam-app-icons__guide beam-app-icons__guide--h" style={{ top: 150.06 }} />
      <span className="beam-app-icons__guide beam-app-icons__guide--h" style={{ top: 304.69 }} />
      <AppIcon tone="dark" />
      {[92.84, 247.41, 330.75, 485.32].map(left => <span key={left} className="beam-app-icons__guide beam-app-icons__guide--v" style={{ left }} />)}
      <AppIcon tone="light" />
    </div>
  );
}
