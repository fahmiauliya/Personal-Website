import CloseRing from '../../components/navigation/CloseRing';
import ProgressiveBlur from '../../components/navigation/ProgressiveBlur';
import homeIcon from '../../assets/icons/logo.svg';
import contactIcon from '../../assets/icons/nav-contact.svg';
import { CONTACT_MAILTO } from '../../data/portfolio';
import closeIcon from '../selected-projects/beam/assets/close.svg';

// Same shell as BeamHeader/BifrostHeader, parameterized by title, so every Recent Work
// project shares one header instead of duplicating it per project.
export default function RecentWorkHeader({ title }: { title: string }) {
  return (
    <header className="recent-work-header" data-project-part="actions">
      <ProgressiveBlur />
      <span className="recent-work-header-spacer" aria-hidden="true" />
      <nav className="recent-work-header-center" aria-label="Project navigation">
        <a className="nav-circle nav-surface" href="/" aria-label="Back to introduction">
          <span className="nav-icon nav-icon--logo" aria-hidden="true">
            <span><img src={homeIcon} alt="" /></span>
          </span>
        </a>
        <div className="recent-work-header-title"><span>{title}</span></div>
        <a className="nav-circle nav-surface" href={CONTACT_MAILTO} aria-label="Send an email">
          <span className="nav-icon nav-icon--contact" aria-hidden="true"><img src={contactIcon} alt="" /></span>
        </a>
      </nav>
      <a className="recent-work-close" href="/#works" data-project-close aria-label="Close project and return to Works">
        <CloseRing />
        <img src={closeIcon} alt="" width="14" height="14" />
      </a>
    </header>
  );
}
