import { useRef } from 'react';
import { useScrollRoll } from '../../../components/navigation/useScrollRoll';
import CloseRing from '../../../components/navigation/CloseRing';
import HeaderFade from '../../../components/navigation/HeaderFade';
import homeIcon from '../../../assets/icons/logo.svg';
import contactIcon from '../../../assets/icons/nav-contact.svg';
import { CONTACT_MAILTO } from '../../../data/portfolio';
import closeIcon from '../../../assets/icons/close.svg';

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
        <a className="nav-link" href={CONTACT_MAILTO} aria-label="Send an email">
          <span className="nav-circle nav-surface">
            <span className="nav-icon nav-icon--contact" aria-hidden="true"><img src={contactIcon} alt="" /></span>
          </span>
        </a>
      </nav>
      <a className="bifrost-close tap-target" href="/#works" data-project-close aria-label="Close project and return to Works">
        <CloseRing />
        <img src={closeIcon} alt="" width="14" height="14" />
      </a>
    </header>
  );
}
