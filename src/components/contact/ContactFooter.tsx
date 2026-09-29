import { lazy, Suspense, useRef, useState } from 'react';
import ctaIcon from '../../assets/icons/cta-footer.svg';
import SocialLinks from './SocialLinks';
import type { GlassSettings } from './FooterGlass';
import { useNearView } from '../motion/useNearView';

// The glass octahedron behind the pill (FooterGlass.tsx) is its own chunk, mounted only
// once the footer is near the screen, like the Recent Work cards. On the dev server it
// comes with its parameter panel (FooterGlassDials.tsx), which never ships.
const FooterGlass = lazy(() => import('./FooterGlass'));
const FooterGlassDials = import.meta.env.DEV ? lazy(() => import('./FooterGlassDials')) : null;

export default function ContactFooter() {
  const area = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLDivElement>(null);
  const live = useNearView(area);
  const [tuned, setTuned] = useState<GlassSettings>();
  return (
    <footer className="contact-footer">
      <div className="contact-area" ref={area}>
        {live && <Suspense fallback={null}><FooterGlass anchor={pill} settings={tuned} /></Suspense>}
        {live && FooterGlassDials && <Suspense fallback={null}><FooterGlassDials onChange={setTuned} /></Suspense>}
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
