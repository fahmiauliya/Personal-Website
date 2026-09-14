import ctaIcon from '../assets/icons/cta-small.svg';
import copyIcon from '../assets/icons/copy-email.svg';
import SocialLinks from './SocialLinks';

export default function Intro() {
  return (
    <section className="intro-layer" id="about" aria-labelledby="intro-title">
      <div className="intro-panel">
        <div className="intro-body">
          <div className="intro-content">
            <div className="intro-identity">
              <h1 id="intro-title">Fahmi Auliya</h1>
              <p>Product Designer</p>
            </div>

            <div className="intro-copy">
              <p className="intro-lead">
                I’m a product designer focused on turning complex product problems into simpler flows and interfaces.
              </p>
              <p>
                I’m especially interested in what happens after Figma. I work closer to implementation through motion,
                code, Framer, and AI-assisted workflows to test ideas earlier and bring the design closer to the final product.
              </p>
            </div>

            <div className="intro-actions">
              <button className="pill-button pill-button--dark" type="button" disabled>
                <span>Let’s Talk</span>
                <img src={ctaIcon} alt="" />
              </button>
              <button className="pill-button pill-button--light" type="button" disabled>
                <span>Copy Email</span>
                <img src={copyIcon} alt="" />
              </button>
              <SocialLinks className="intro-socials" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
