import { createOutlined } from '../../../../components/outlined/Outlined';
import { FooterVisual } from './FooterVisual';
import { GLYPHS, TEXT } from './glyphs';
import productIcon from './assets/footer-product.svg';
import docsIcon from './assets/footer-docs.svg';
import githubIcon from './assets/footer-github.svg';
import changelogIcon from './assets/footer-changelog.svg';
import arrowRight from './assets/arrow-right.svg';
import terminalHeader from './assets/terminal-header.svg';
import terminalCopy from './assets/terminal-copy.svg';
import terminalCheck from './assets/terminal-check.svg';
import './BeamFooter.css';

// Content 05: Beam's footer (Motion Lab beam-content/motion-05), in code, at the size the
// gallery showed its export at (1340 × 836, the desktop layout) and in its demo loop. It's a
// picture of the page, so nothing in it is interactive (inert): the button and links are drawn
// at rest. Its text is the outlines traced from that export (glyphs.ts), so it loads no font.

const T = createOutlined(GLYPHS, TEXT);

const LINKS = [
  { label: 'Product', icon: productIcon },
  { label: 'Docs', icon: docsIcon },
  { label: 'GitHub', icon: githubIcon },
  { label: 'Changelog', icon: changelogIcon },
];

export default function BeamFooter() {
  return (
    <footer className="beam-footer" inert>
      <div className="beam-footer-main">
        <FooterVisual />
        <div className="beam-footer-copy">
          <h2><T k="heading">Your workspace. Ready anywhere.</T></h2>
          <p><T k="lead">{'Mount your files in seconds and keep the same\nworkspace across your machines, tools, and agents.'}</T></p>
        </div>
        <div className="beam-footer-actions">
          <span className="beam-footer-cta"><T k="cta">Get Started</T><img src={arrowRight} alt="" width={12} height={12} /></span>
          <div className="beam-terminal">
            <div className="beam-terminal-frame">
              <div className="beam-terminal-window">
                <div className="beam-terminal-bar"><img src={terminalHeader} alt="" width={39} height={9} /></div>
                <div className="beam-terminal-line">
                  <span className="beam-terminal-code">
                    <T k="prompt" className="beam-terminal-prompt">$</T>
                    <T k="command">beam mount ~/workspace</T>
                  </span>
                  <span className="beam-terminal-copy"><img src={terminalCopy} alt="" width={14} height={14} /></span>
                </div>
              </div>
            </div>
            <div className="beam-terminal-status">
              <span className="beam-terminal-check"><img src={terminalCheck} alt="" width={13.487} height={10.321} /></span>
              <T k="attached">workspace attached</T>
            </div>
          </div>
        </div>
        <div className="beam-footer-spacer" aria-hidden="true" />
      </div>
      <nav className="beam-footer-links">
        {LINKS.map(({ label, icon }) => (
          <span key={label} className="beam-footer-link"><img src={icon} alt="" width={14} height={14} /><T k={`link.${label}`}>{label}</T></span>
        ))}
      </nav>
    </footer>
  );
}
