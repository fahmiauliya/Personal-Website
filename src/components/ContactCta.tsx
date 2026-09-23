import arrowIcon from '../assets/icons/cta-footer.svg';
import ContactBeam from './ContactBeam';

export default function ContactCta() {
  return (
    <div className="about-section-grid contact-grid">
      <ContactBeam className="contact-cta-beam">
        <div className="contact-cta">
          <p>Have something that want to discuss</p>
          <span className="contact-button-frame">
            {/* No action yet; enabled so its hover and pressed states can be checked. */}
            <button className="contact-button skeuo-button" type="button">
              <span>Let’s Talk</span>
              <img src={arrowIcon} alt="" width="14" height="14" />
            </button>
          </span>
        </div>
      </ContactBeam>
    </div>
  );
}
