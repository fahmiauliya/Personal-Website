import { useRef } from 'react';
import { useScrollRoll } from '../../components/navigation/useScrollRoll';
import HeaderFade from '../../components/navigation/HeaderFade';
import homeIcon from '../../assets/icons/logo.svg';
// The pill's right button closes the project (Esc does too: projectTransition.ts).
import closeIcon from '../../assets/icons/nav-close.svg';

// Same shell as BeamHeader/BifrostHeader, parameterized by title, so every Recent Work
// project shares one header instead of duplicating it per project.
export default function RecentWorkHeader({ title }: { title: string }) {
  // The logo rolls with this page's scroll, like the main navigation's.
  const logo = useRef<HTMLSpanElement>(null);
  useScrollRoll(logo);
  return (
    <header className="recent-work-header" data-project-part="actions">
      <HeaderFade />
      <span className="recent-work-header-spacer" aria-hidden="true" />
      <nav className="recent-work-header-center" aria-label="Project navigation">
        <a className="nav-link" href="/" aria-label="Back to introduction">
          <span className="nav-circle nav-surface">
            <span className="nav-icon nav-icon--logo" aria-hidden="true">
              <span ref={logo}><img src={homeIcon} alt="" /></span>
            </span>
          </span>
        </a>
        <span className="nav-title">{title}</span>
        <a className="nav-link" href="/#works" data-project-close aria-label="Close project and return to Works (Esc)">
          <span className="nav-circle nav-surface">
            <span className="nav-icon nav-icon--contact" aria-hidden="true"><img src={closeIcon} alt="" /></span>
          </span>
        </a>
      </nav>
      <span className="recent-work-header-spacer" aria-hidden="true" />
    </header>
  );
}
