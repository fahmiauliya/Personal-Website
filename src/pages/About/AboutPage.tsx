import profileImage from '../../assets/images/fahmi-profile.jpg';
import ContactCta from '../../components/ContactCta';
import Header from '../../components/Header';
import SocialLinks from '../../components/SocialLinks';
import { capabilities, experience } from './aboutData';
import './about.css';

export default function AboutPage() {
  return (
    <div className="about-page">
      <Header isAboutPage />
      <main id="main-content" className="about-main">
        <section className="about-section introduction" aria-labelledby="about-title">
          <div className="about-section-grid">
            <div className="about-label introduction-label">
              <h1 id="about-title" className="introduction-title">
                <span>Hello, i’,m</span>
                <span className="profile-image-frame">
                  <img src={profileImage} alt="" width="20" height="20" />
                </span>
                <span>Fahmi Auliya</span>
              </h1>
              <p>A product designer with a focus on Web3</p>
            </div>
            <div className="about-copy">
              <div className="about-copy-inner">
                <p>
                  I’m a product designer focused on turning
                  <br />
                  complex product problems into simpler flows and interfaces.
                </p>
                <p>
                  I’m especially interested in what happens after Figma. I work
                  closer to implementation through motion, code, Framer, and
                  AI-assisted workflows to test ideas earlier and bring the design
                  closer to the final product.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section experience-section" aria-labelledby="experience-title">
          <div className="about-section-grid">
            <div className="about-label">
              <h2 id="experience-title">Experience</h2>
            </div>
            <ol className="experience-list">
              {experience.map(({ year, company, period, role }, index) => (
                <li className="experience-row" key={`${company}-${index}`}>
                  <p className="experience-year">{year}</p>
                  <div className="experience-details">
                    <div className="experience-heading">
                      <h3>{company}</h3>
                      <p>{period}</p>
                    </div>
                    <p className="experience-role">{role}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="about-section capabilities-section" aria-labelledby="capabilities-title">
          <div className="about-section-grid">
            <div className="about-label">
              <h2 id="capabilities-title">
                From product idea
                <br />
                to implementation
              </h2>
            </div>
            <ul className="capabilities-grid">
              {capabilities.map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <section className="about-bottom-overlay" aria-label="Contact and social links">
        <ContactCta />
        <footer className="about-footer">
          <SocialLinks />
        </footer>
      </section>
    </div>
  );
}
