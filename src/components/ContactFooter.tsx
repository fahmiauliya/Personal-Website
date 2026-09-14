import ctaIcon from '../assets/icons/cta-footer.svg';
import SocialLinks from './SocialLinks';

export default function ContactFooter() {
  return (
    <footer className="contact-footer">
      <div className="contact-area">
        <div className="contact-pill">
          <p>Have something that want to discuss</p>
          <button className="pill-button pill-button--dark" type="button" disabled>
            <span>Let’s Talk</span>
            <img src={ctaIcon} alt="" />
          </button>
        </div>
      </div>
      <div className="footer-socials">
        <SocialLinks />
      </div>
    </footer>
  );
}
