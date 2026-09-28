import timeline from './assets/experience-timeline.svg';
import ContactFooter from '../../components/contact/ContactFooter';
import Header from '../../components/navigation/Header';
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
              <h1 id="about-title" className="introduction-title">Fahmi Auliya</h1>
              <p>Product Designer</p>
            </div>
            <div className="about-copy">
              <p>I’m a product designer focused on simplifying complex product problems into clear solutions.</p>
              <p>
                I usually start by understanding the problem, shaping the flow, and designing the interface.{' '}
                <br className="about-copy-break" />
                I stay involved beyond Figma through prototyping, motion, design systems, code implementation,{' '}
                <br className="about-copy-break" />
                and Framer implementation.
              </p>
              <p>
                Working closely with engineering helps me test ideas earlier,{' '}
                <br className="about-copy-break" />
                understand constraints, and make design decisions that are closer to what actually gets shipped.
              </p>
              <p>
                Previously, I worked at{' '}
                <a className="about-studio-link" href="https://blissful-studio.com/" target="_blank" rel="noopener noreferrer">Blissful Studio</a>,{' '}
                <br className="about-copy-break" />
                where I worked across websites, web apps, mobile products, brand identity, and other digital experiences.
              </p>
              <p>
                More recently, I’ve been focused on product design,{' '}
                <br className="about-copy-break" />
                design systems, interaction, and design-to-code, finding better ways for design and engineering to work together.
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

      <ContactFooter />
    </div>
  );
}
