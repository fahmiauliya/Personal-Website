import attachmentIcon from '../../assets/projects/beam/attachment.svg';
import ContactCta from '../../components/ContactCta';
import SocialLinks from '../../components/SocialLinks';
import BeamHeader from './BeamHeader';
import BeamGallery from './BeamGallery';
import { beamProject } from './beamData';
import './beam.css';

export default function BeamPage() {
  const visitContent = <><span>Visit site</span><img src={attachmentIcon} alt="" width="14" height="14" /></>;

  return (
    <div className="beam-page">
      <BeamHeader />
      <main className="beam-main">
        <section className="beam-overview" aria-labelledby="beam-title">
          <div className="beam-details">
            <div>
              <h1 id="beam-title">{beamProject.title}</h1>
              <p className="beam-category">{beamProject.category}</p>
              <dl className="beam-facts">
                {beamProject.details.map(({ label, lines }, index) => (
                  <div className="beam-fact" key={`${label}-${index}`}>
                    <dt>{label}</dt>
                    <dd>{lines.map(line => <span key={line}>{line}</span>)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="beam-url">
              <span>URL</span>
              <span className="beam-visit-frame">
                {beamProject.websiteUrl
                  ? <a className="beam-visit" href={beamProject.websiteUrl} target="_blank" rel="noreferrer">{visitContent}</a>
                  : <button className="beam-visit" type="button" disabled>{visitContent}</button>}
              </span>
            </div>
          </div>
          <div className="beam-cover" aria-label="Beam cover placeholder">Cover</div>
          <div className="beam-description">
            <div>{beamProject.description.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
            <p>{beamProject.note}</p>
          </div>
        </section>
        <BeamGallery />
      </main>
      <footer className="beam-footer">
        <ContactCta />
        <div className="beam-socials"><SocialLinks /></div>
      </footer>
    </div>
  );
}
