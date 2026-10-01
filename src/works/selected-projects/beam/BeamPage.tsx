import attachmentIcon from '../../../assets/icons/attachment.svg';
import ContactFooter from '../../../components/contact/ContactFooter';
import BeamCover from './cover/BeamCover';
import BeamHeader from './BeamHeader';
import BeamGallery from './BeamGallery';
import { beamProject } from './beamData';
import './beam.css';

export default function BeamPage() {
  return (
    <div className="beam-page">
      <BeamHeader />
      <main className="beam-main">
        <section className="beam-overview" aria-labelledby="beam-title">
          <div className="beam-details">
            <div>
              <h1 id="beam-title" data-project-part="title">{beamProject.title}</h1>
              <p className="beam-category" data-project-part="category">{beamProject.category}</p>
              <dl className="beam-facts" data-project-part="metadata">
                {beamProject.details.map(({ label, lines }, index) => (
                  <div className="beam-fact" key={`${label}-${index}`}>
                    <dt>{label}</dt>
                    <dd>{lines.map(line => <span key={line}>{line}</span>)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="beam-cover" data-project-cover><BeamCover /></div>
          <div className="beam-description" data-project-part="description">
            <div>{beamProject.description.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
            <div className="beam-closing">
              <span className="beam-visit-frame">
                <a className="beam-visit skeuo-button tap-target" href={beamProject.url} target="_blank" rel="noopener noreferrer" aria-label="Visit the Beam site (opens in a new tab)"><span>Visit site</span><img src={attachmentIcon} alt="" width="14" height="14" /></a>
              </span>
            </div>
          </div>
        </section>
        <BeamGallery />
      </main>
      <ContactFooter />
    </div>
  );
}
