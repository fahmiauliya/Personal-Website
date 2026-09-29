import Guides from '../Guides';
import { createOutlined } from '../Outlined';
import avatar from './assets/avatar.webp';
import { GLYPHS, TEXT } from './glyphs';
import './AccountMenu.css';

// Content 13 (Figma Portfolio-2026, node 151:4984): Beam's account menu, with the plan's
// storage use, built in code at the frame's design size (593 × 473). BeamGallery scales it to
// the tile with SceneFit. As in Figma, its guides pass under the menu. The avatar is Figma's
// photo (a 2 KB WebP); the rest is code, its text outlines (glyphs.ts), so it loads no font.

const T = createOutlined(GLYPHS, TEXT);

const ITEMS = ['Account settings', 'Billing & usage', 'Help & feedback'];

function ArrowIcon() {
  return (
    <svg width="17.7663" height="17.7663" viewBox="0 0 17.7663 17.7663" fill="none" stroke="#fff" strokeWidth="1.48052" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1.48072 8.88313H15.9158" />
      <path d="M11.4742 13.6948L16.2859 8.88313L11.4742 4.07144" />
    </svg>
  );
}

export default function AccountMenu() {
  return (
    <div className="beam-account" aria-hidden="true">
      <Guides x={[60.05, 531]} y={[98.9, 371.29]} />
      <div className="beam-account__menu">
        <div className="beam-account__header">
          <span className="beam-account__avatar"><img src={avatar} alt="" width="128" height="128" decoding="async" /></span>
          <div className="beam-account__who">
            <T k="name">Michele J.</T>
            <T k="email" className="beam-account__email">michele@beam.app</T>
          </div>
        </div>
        <div className="beam-account__plan-margin">
          <div className="beam-account__plan">
            <div className="beam-account__row">
              <T k="plan">Free plan</T>
              <T k="used" className="beam-account__small">24% used</T>
            </div>
            <div className="beam-account__usage">
              <div className="beam-account__track"><span className="beam-account__fill" /></div>
              <div className="beam-account__row beam-account__row--storage">
                <T k="storage" className="beam-account__small">1.2 GB of 5 GB</T>
                <span className="beam-account__arrow"><ArrowIcon /></span>
              </div>
            </div>
          </div>
        </div>
        <div className="beam-account__items">
          {ITEMS.map((item, index) => <div key={item} className="beam-account__item"><T k={`item${index}`}>{item}</T></div>)}
        </div>
        <div className="beam-account__items beam-account__items--sign-out">
          <div className="beam-account__item"><T k="signOut">Sign out</T></div>
        </div>
      </div>
    </div>
  );
}
