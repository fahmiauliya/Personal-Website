import ctaIcon from '../../assets/icons/cta-small.svg';
import CopyEmailButton from '../../components/contact/CopyEmailButton';
import SocialLinks from '../../components/contact/SocialLinks';

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
                I design digital products by simplifying complex problems into clear solutions.
              </p>
              <p>
                I work closely with engineering and stay involved beyond Figma through prototyping, motion, code
                implementation, and Framer implementation.
              </p>
              <p>
                Recently, I’ve been working across product design, design systems, websites, web apps, and interaction
                — carrying designs closer to the final product through code and engineering collaboration.
              </p>
            </div>

            <div className="intro-actions">
              <button className="pill-button pill-button--dark skeuo-button" type="button">
                <span>Let’s Talk</span>
                <img src={ctaIcon} alt="" />
              </button>
              <CopyEmailButton />
              <SocialLinks className="intro-socials" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
