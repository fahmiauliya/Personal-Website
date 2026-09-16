import arrowIcon from '../assets/icons/cta-footer.svg';

export default function ContactCta() {
  return (
    <div className="about-section-grid contact-grid">
      <div className="contact-cta">
        <p>Have something that want to discuss</p>
        <span className="contact-button-frame">
          <button className="contact-button" type="button" disabled>
            <span>Let’s Talk</span>
            <img src={arrowIcon} alt="" width="14" height="14" />
          </button>
        </span>
      </div>
    </div>
  );
}
