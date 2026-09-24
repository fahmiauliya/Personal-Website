import attachmentIcon from '../../assets/projects/beam/attachment.svg';
import ContactCta from '../../components/ContactCta';
import MotionPreview from '../../components/MotionPreview';
import SocialLinks from '../../components/SocialLinks';
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
            <div className="beam-url" data-project-part="url">
              <span>URL</span>
              <span className="beam-visit-frame">
                <button className="beam-visit skeuo-button" type="button"><span>Visit site</span><img src={attachmentIcon} alt="" width="14" height="14" /></button>
              </span>
            </div>
          </div>
          <div className="beam-cover" data-project-cover><MotionPreview scene={beamProject.cover} eager /></div>
          <div className="beam-description" data-project-part="description">
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
