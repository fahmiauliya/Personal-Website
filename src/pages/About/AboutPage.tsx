import profileImage from '../../assets/about/profile.png';
import timeline from '../../assets/about/experience-timeline.svg';
import ContactCta from '../../components/ContactCta';
import Header from '../../components/Header';
import SocialLinks from '../../components/SocialLinks';
import { capabilities, experience } from './aboutData';
import CapabilityCard from './CapabilityCard';
import CapabilityGuides from './CapabilityGuides';
import './about.css';

export default function AboutPage() {
  return (
    <div className="about-page">
      <Header isAboutPage />
      <main id="main-content" className="about-main">
        <section className="introduction" aria-labelledby="about-title">
          <div className="introduction-content">
            <div className="introduction-label">
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
              <p>
                I’m a product designer focused on turning<br />
                complex product problems into simpler flows and interfaces.
                <br /><br />
                I’m especially interested in what happens after Figma. I work closer to implementation through motion, code, Framer, and AI-assisted workflows to test ideas earlier and bring the design closer to the final product.
              </p>
            </div>
          </div>
        </section>

        <section className="experience-section" aria-labelledby="experience-title">
          <div className="experience-content">
            <h2 id="experience-title">Experience</h2>
            <div className="experience-timeline">
              <img className="experience-track" src={timeline} alt="" aria-hidden="true" />
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
          </div>
        </section>

        <section id="skills" className="capabilities-section skill-section" aria-labelledby="skills-title">
          <h2 id="skills-title" className="visually-hidden">Skills</h2>
          <div className="capabilities-board">
            <ul className="capabilities-grid">
              {capabilities.map((capability, index) => index === 0 ? (
                <CapabilityCard key={capability} title={capability} />
              ) : (
                <li key={capability}>
                  {capability.endsWith('Implementation') ? (
                    <>{capability.split(' ')[0]}<br />Implementation</>
                  ) : capability}
                </li>
              ))}
            </ul>
            <CapabilityGuides />
          </div>
        </section>
      </main>

      <section className="about-bottom" aria-label="Contact and social links">
        <ContactCta />
        <footer className="about-footer">
          <SocialLinks />
        </footer>
      </section>
    </div>
  );
}
