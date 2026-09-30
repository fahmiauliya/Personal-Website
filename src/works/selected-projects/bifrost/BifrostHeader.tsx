import { useRef } from 'react';
import { useScrollRoll } from '../../../components/navigation/useScrollRoll';
import HeaderFade from '../../../components/navigation/HeaderFade';
import homeIcon from '../../../assets/icons/logo.svg';
// The pill's right button closes the project (Esc does too: projectTransition.ts).
import closeIcon from '../../../assets/icons/nav-close.svg';

export default function BifrostHeader() {
  // The logo rolls with this page's scroll, like the main navigation's.
  const logo = useRef<HTMLSpanElement>(null);
  useScrollRoll(logo);
  return (
    <header className="bifrost-header" data-project-part="actions">
      <HeaderFade />
      <span className="bifrost-header-spacer" aria-hidden="true" />
      <nav className="bifrost-header-center" aria-label="Project navigation">
        <a className="nav-link" href="/" aria-label="Back to introduction">
          <span className="nav-circle nav-surface">
            <span className="nav-icon nav-icon--logo" aria-hidden="true">
              <span ref={logo}><img src={homeIcon} alt="" /></span>
            </span>
          </span>
        </a>
        <span className="nav-title">Bifrost</span>
        <a className="nav-link" href="/#works" data-project-close aria-label="Close project and return to Works (Esc)">
          <span className="nav-circle nav-surface">
            <span className="nav-icon nav-icon--contact" aria-hidden="true"><img src={closeIcon} alt="" /></span>
          </span>
        </a>
      </nav>
      <span className="bifrost-header-spacer" aria-hidden="true" />
    </header>
  );
}
