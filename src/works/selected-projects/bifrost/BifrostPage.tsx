import attachmentIcon from '../../../assets/icons/attachment.svg';
import ContactFooter from '../../../components/contact/ContactFooter';
import MotionPreview from '../../../components/motion/MotionPreview';
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
          </div>
          <div className="bifrost-cover" data-project-cover><MotionPreview scene={bifrostProject.cover} eager /></div>
          <div className="bifrost-description" data-project-part="description">
            <div>{bifrostProject.description.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
            <div className="bifrost-closing">
              <span className="bifrost-visit-frame">
                <a className="bifrost-visit skeuo-button" href={bifrostProject.url} target="_blank" rel="noopener noreferrer" aria-label="Visit the Bifrost site (opens in a new tab)"><span>Visit site</span><img src={attachmentIcon} alt="" width="14" height="14" /></a>
              </span>
            </div>
          </div>
        </section>
        <BifrostGallery />
      </main>
      <ContactFooter />
    </div>
  );
}
