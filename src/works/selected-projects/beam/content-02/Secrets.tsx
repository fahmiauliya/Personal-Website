import { useEffect, useRef } from 'react';
import { useNearView } from '../../../../components/motion/useNearView';
import { createOutlined } from '../Outlined';
import secretVisual from './assets/secret-visual.svg?raw';
import toggleActive from './assets/toggle-active.svg';
import { GLYPHS, TEXT } from './glyphs';
import './Secrets.css';

// Content 02: Beam's "Secrets" section (Motion Lab beam-content/motion-02), in code, at the
// size the gallery showed its export at (1500 × 895, the section's desktop layout). Every
// piece sits where the export drew it, and its text is outlines (glyphs.ts), so it loads no
// font. The visual is Motion Lab's SVG with SecretVisual's hooks (assets/secret-visual.svg);
// its CSS-only loop (Secrets.css) runs while the tile is near the screen, starting from
// frame 1 each time, and holds frame 1 otherwise. Under reduced motion it shows the finished
// composition, as Motion Lab does.

const T = createOutlined(GLYPHS, TEXT);

const FEATURES = [
  { key: 'feature1', icon: [163, 826], text: [181, 823], title: 'Encrypted at rest with AES-256-GCM,\nnever stored in snapshots, chunks, or logs' },
  { key: 'feature2', icon: [535, 826], text: [553, 823], title: 'Scoped to org, workspace, and profile (dev,\nstaging, prod), so a token only unlocks what it needs' },
  { key: 'feature3', icon: [952, 826], text: [970, 823], title: 'Every read is audit-logged, and rotating a key\nreaches every live workspace in under 30 seconds' },
];

const at = ([left, top]: number[]) => ({ left, top });

export default function Secrets() {
  const stage = useRef<HTMLDivElement>(null);
  const near = useNearView(stage);

  useEffect(() => {
    const svg = stage.current?.querySelector('svg.secret-svg');
    if (!svg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Frame 1 whenever the loop isn't running, so starting and stopping are invisible.
    svg.classList.add('secret-motion-ready');
    if (near) {
      // Restart every track at 0 together (drop the class, flush, re-add).
      svg.classList.remove('secret-motion-active');
      void svg.getBoundingClientRect();
      svg.classList.add('secret-motion-active');
    }
    return () => svg.classList.remove('secret-motion-active');
  }, [near]);

  return (
    <div className="beam-secrets" ref={stage}>
      <T k="label" className="beam-secrets-text" style={at([728.594, 100])}>Secrets</T>
      <T k="title" className="beam-secrets-text" style={at([620.172, 130])}>{'Env vars that travel,\nwithout leaving a trace'}</T>
      <T k="body" className="beam-secrets-text" style={at([505, 214])}>Keep environment variables with your workspace and make them available only where you explicitly mount them—without committing .env files or copying secrets between machines.</T>
      <div
        className="beam-secrets-visual"
        role="img"
        aria-label="Beam securely attaches a workspace and makes environment secrets available"
        dangerouslySetInnerHTML={{ __html: secretVisual }}
      />
      {FEATURES.map(feature => (
        <div key={feature.key}>
          <img className="beam-secrets-icon" src={toggleActive} alt="" width="12" height="12" style={at(feature.icon)} />
          <T k={feature.key} className="beam-secrets-text" style={at(feature.text)}>{feature.title}</T>
        </div>
      ))}
    </div>
  );
}
