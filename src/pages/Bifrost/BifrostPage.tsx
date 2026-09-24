import attachmentIcon from '../../assets/projects/bifrost/attachment.svg';
import ContactCta from '../../components/ContactCta';
import MotionPreview from '../../components/MotionPreview';
import SocialLinks from '../../components/SocialLinks';
import BifrostHeader from './BifrostHeader';
import BifrostGallery from './BifrostGallery';
import { bifrostProject } from './bifrostData';
import './bifrost.css';

export default function BifrostPage() {
  return (
    <div className="bifrost-page">
      <BifrostHeader />
      <main className="bifrost-main">
        <section className="bifrost-overview" aria-labelledby="bifrost-title">
          <div className="bifrost-details">
            <div>
              <h1 id="bifrost-title" data-project-part="title">{bifrostProject.title}</h1>
              <p className="bifrost-category" data-project-part="category">{bifrostProject.category}</p>
              <dl className="bifrost-facts" data-project-part="metadata">
                {bifrostProject.details.map(({ label, lines }, index) => (
                  <div className="bifrost-fact" key={`${label}-${index}`}>
                    <dt>{label}</dt>
                    <dd>{lines.map(line => <span key={line}>{line}</span>)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="bifrost-url" data-project-part="url">
              <span>URL</span>
              <span className="bifrost-visit-frame">
                <button className="bifrost-visit skeuo-button" type="button"><span>Visit site</span><img src={attachmentIcon} alt="" width="14" height="14" /></button>
              </span>
            </div>
          </div>
          <div className="bifrost-cover" data-project-cover><MotionPreview scene={bifrostProject.cover} eager /></div>
          <div className="bifrost-description" data-project-part="description">
            <div>{bifrostProject.description.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
            <p>{bifrostProject.note}</p>
          </div>
        </section>
        <BifrostGallery />
      </main>
      <footer className="bifrost-footer">
        <ContactCta />
        <div className="bifrost-socials"><SocialLinks /></div>
      </footer>
    </div>
  );
}
