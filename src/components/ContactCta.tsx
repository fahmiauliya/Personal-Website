import arrowIcon from '../assets/icons/arrow-up-right.svg';

export default function ContactCta() {
  return (
    <div className="about-section-grid contact-grid">
      <div className="contact-cta">
        <p>Have something that want to discuss</p>
        <span className="contact-button-frame">
          <a
            className="contact-button"
            href="https://id.linkedin.com/in/fahmiauliya"
            target="_blank"
            rel="noreferrer"
          >
            <span>Let’s Talk</span>
            <img src={arrowIcon} alt="" width="14" height="14" />
          </a>
        </span>
      </div>
    </div>
  );
}
