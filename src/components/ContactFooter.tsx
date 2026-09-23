import ctaIcon from '../assets/icons/cta-footer.svg';
import ContactBeam from './ContactBeam';
import SocialLinks from './SocialLinks';

export default function ContactFooter() {
  return (
    <footer className="contact-footer">
      <div className="contact-area">
        <ContactBeam className="contact-pill-beam">
          <div className="contact-pill">
            <p>Have something that want to discuss</p>
            {/* No action yet; enabled so its hover and pressed states can be checked. */}
            <button className="pill-button pill-button--dark skeuo-button" type="button">
              <span>Let’s Talk</span>
              <img src={ctaIcon} alt="" />
            </button>
          </div>
        </ContactBeam>
      </div>
      <div className="footer-socials">
        <SocialLinks />
      </div>
    </footer>
  );
}
