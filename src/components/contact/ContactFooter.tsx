import { lazy, Suspense, useRef } from 'react';
import ctaIcon from '../../assets/icons/cta-footer.svg';
import SocialLinks from './SocialLinks';
import { useNearView } from '../motion/useNearView';

// The glass octahedron behind the pill (FooterGlass.tsx) is its own chunk, mounted only
// once the footer is near the screen, like the Recent Work cards.
const FooterGlass = lazy(() => import('./FooterGlass'));

export default function ContactFooter() {
  const area = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLDivElement>(null);
  // Loads a screen early; its loop runs only while the footer is on screen.
  const live = useNearView(area);
  const playing = useNearView(area, false, 'screen');
  return (
    <footer className="contact-footer">
      <div className="contact-area" ref={area}>
        {live && <Suspense fallback={null}><FooterGlass anchor={pill} playing={playing} /></Suspense>}
        <div className="contact-pill" ref={pill}>
          <p>
            <span className="contact-note--wide">Have something that want to discuss</span>
            <span className="contact-note--phone">Have something you want to discuss?</span>
          </p>
          {/* No action yet; enabled so its hover and pressed states can be checked. */}
          <button className="pill-button pill-button--dark skeuo-button" type="button">
            <span>Let’s Talk</span>
            <img src={ctaIcon} alt="" />
          </button>
        </div>
      </div>
      <div className="footer-socials">
        <SocialLinks />
      </div>
    </footer>
  );
}
