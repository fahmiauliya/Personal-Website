import CloseRing from '../../components/CloseRing';
import ProgressiveBlur from '../../components/ProgressiveBlur';
import homeIcon from '../../assets/icons/logo.svg';
import contactIcon from '../../assets/icons/nav-contact.svg';
import closeIcon from '../../assets/projects/bifrost/close.svg';

export default function BifrostHeader() {
  return (
    <header className="bifrost-header">
      <ProgressiveBlur />
      <span className="bifrost-header-spacer" aria-hidden="true" />
      <nav className="bifrost-header-center" aria-label="Project navigation">
        <a className="nav-circle nav-surface" href="/" aria-label="Back to introduction">
          <span className="nav-icon nav-icon--logo" aria-hidden="true">
            <span><img src={homeIcon} alt="" /></span>
          </span>
        </a>
        <div className="bifrost-header-title"><span>Bifrost</span></div>
        <button className="nav-circle nav-surface" type="button" aria-label="Send an email">
          <span className="nav-icon nav-icon--contact" aria-hidden="true"><img src={contactIcon} alt="" /></span>
        </button>
      </nav>
      <a className="bifrost-close" href="/#works" data-project-close aria-label="Close project and return to Works">
        <CloseRing />
        <img src={closeIcon} alt="" width="14" height="14" />
      </a>
    </header>
  );
}
