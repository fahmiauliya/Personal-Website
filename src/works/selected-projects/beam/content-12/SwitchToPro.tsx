import Guides from '../Guides';
import { createOutlined } from '../Outlined';
import appSettings from './assets/app-settings.webp';
import { GLYPHS, TEXT } from './glyphs';
import './SwitchToPro.css';

// Content 12 (Figma Portfolio-2026, node 141:8810): Beam's "Switch to Pro" upgrade dialog
// over the blurred workspace settings, built in code at the frame's design size (593 × 473).
// BeamGallery scales it to the tile with SceneFit. As in Figma, its guides run over the
// screen. The settings page behind the blur is Figma's own screenshot of the app (a small
// WebP); the dialog is code, its text outlines (glyphs.ts), its icons inline SVG, so it
// loads no font.

const T = createOutlined(GLYPHS, TEXT);

const CHARGES = [
  ['Pro for remaining 15 days', '$6.00'],
  ['Unused time on Free', '−$0.00'],
  ['Tax', 'Calculated at checkout'],
  ['Due today', '$6.00'],
];
const RENEWAL = [
  ['Next renewal', 'September 19, 2026 · $12.00'],
  ['Payment method', 'Visa ending in 4242'],
];

// The dialog's icons, as Figma exported them (4.167 frames).
const STROKE = { strokeWidth: 0.347222, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const ICON = { width: 4.16667, height: 4.16667, viewBox: '0 0 4.16667 4.16667', fill: 'none', 'aria-hidden': true } as const;

function CalendarIcon() {
  return (
    <svg {...ICON} stroke="#8F8F8F">
      <path d="M0.43316 1.6493H3.73177" {...STROKE} />
      <path d="M3.03733 0.607635H1.1276C0.744073 0.607635 0.43316 0.918549 0.43316 1.30208V3.2118C0.43316 3.59533 0.744073 3.90625 1.1276 3.90625H3.03733C3.42086 3.90625 3.73177 3.59533 3.73177 3.2118V1.30208C3.73177 0.918549 3.42086 0.607635 3.03733 0.607635Z" {...STROKE} />
      <path d="M1.38802 2.95139C1.57979 2.95139 1.73524 2.79593 1.73524 2.60416C1.73524 2.4124 1.57979 2.25694 1.38802 2.25694C1.19626 2.25694 1.0408 2.4124 1.0408 2.60416C1.0408 2.79593 1.19626 2.95139 1.38802 2.95139Z" fill="#8F8F8F" stroke="none" />
      <path d="M1.30122 0.260413V0.607635" {...STROKE} />
      <path d="M2.86372 0.260413V0.607635" {...STROKE} />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg {...ICON} stroke="#1C1F21">
      <path d="M0.782986 3.38541L3.38715 0.781247" {...STROKE} />
      <path d="M3.38715 3.38541L0.782986 0.781247" {...STROKE} />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg {...ICON} stroke="#1C1F21">
      <path d="M0.34592 2.08332H3.73134" {...STROKE} />
      <path d="M2.68967 3.21179L3.81814 2.08332L2.68967 0.954848" {...STROKE} />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg {...ICON} stroke="#1C1F21">
      <path d="M2.08247 3.90625C3.08906 3.90625 3.90538 3.08993 3.90538 2.08334C3.90538 1.07674 3.08906 0.26042 2.08247 0.26042C1.07587 0.26042 0.259549 1.07674 0.259549 2.08334C0.259549 3.08993 1.07587 3.90625 2.08247 3.90625Z" {...STROKE} />
      <path d="M2.08247 1.4757C2.25017 1.4757 2.38628 1.33959 2.38628 1.17188C2.38628 1.00417 2.25017 0.868059 2.08247 0.868059C1.91476 0.868059 1.77865 1.00417 1.77865 1.17188C1.77865 1.33959 1.91476 1.4757 2.08247 1.4757Z" fill="#1C1F21" stroke="none" />
      <path d="M2.08247 2.95139V1.99653H1.73524" {...STROKE} />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg {...ICON} stroke="#0A0A0A">
      <path d="M0.259983 1.64931H3.90582" {...STROKE} />
      <path d="M2.34332 2.69097H3.03776" {...STROKE} />
      <path d="M3.21137 0.607641H0.954427C0.570896 0.607641 0.259983 0.918554 0.259983 1.30208V2.86458C0.259983 3.24812 0.570896 3.55903 0.954427 3.55903H3.21137C3.5949 3.55903 3.90582 3.24812 3.90582 2.86458V1.30208C3.90582 0.918554 3.5949 0.607641 3.21137 0.607641Z" {...STROKE} />
    </svg>
  );
}

export default function SwitchToPro() {
  return (
    <div className="beam-upgrade" aria-hidden="true">
      <div className="beam-upgrade__screen">
        <img className="beam-upgrade__app" src={appSettings} alt="" width="500" height="312.5" loading="lazy" decoding="async" />
        <div className="beam-upgrade__overlay">
          <div className="beam-upgrade__dialog">
            <div className="beam-upgrade__header">
              <span className="beam-upgrade__title"><CalendarIcon /><T k="title">Switch to Pro</T></span>
              <span className="beam-upgrade__close"><CloseIcon /></span>
            </div>
            <div className="beam-upgrade__body">
              <div className="beam-upgrade__content">
                <div className="beam-upgrade__plans">
                  <div className="beam-upgrade__plan">
                    <T k="from.name" className="beam-upgrade__plan-name">Free</T>
                    <T k="from.note" className="beam-upgrade__plan-note">Current plan</T>
                  </div>
                  <span className="beam-upgrade__arrow"><ArrowIcon /></span>
                  <div className="beam-upgrade__plan beam-upgrade__plan--to">
                    <T k="to.name" className="beam-upgrade__plan-name">Pro</T>
                    <T k="to.note" className="beam-upgrade__plan-note">Monthly billing</T>
                  </div>
                </div>
                <div className="beam-upgrade__lead">
                  <T k="lead.title">Prorated upgrade</T>
                  <T k="lead.text" className="beam-upgrade__muted">You only pay for the 15 days remaining in this billing period.</T>
                </div>
                <div className="beam-upgrade__charges">
                  {CHARGES.map(([term, amount], index) => (
                    <div key={term} className="beam-upgrade__row">
                      <T k={`charge${index}.term`}>{term}</T>
                      <T k={`charge${index}.amount`}>{amount}</T>
                    </div>
                  ))}
                </div>
                <div className="beam-upgrade__summary">
                  <div className="beam-upgrade__renewal">
                    {RENEWAL.map(([term, detail], index) => (
                      <div key={term} className="beam-upgrade__row">
                        <T k={`renewal${index}.term`}>{term}</T>
                        <T k={`renewal${index}.detail`}>{detail}</T>
                      </div>
                    ))}
                  </div>
                  <div className="beam-upgrade__note"><InfoIcon /><T k="note">Final tax and proration are calculated before payment.</T></div>
                </div>
              </div>
              <div className="beam-upgrade__footer">
                <T k="back" className="beam-upgrade__back">Back</T>
                <span className="beam-upgrade__pay"><CardIcon /><T k="pay">Pay $6.00 &amp; upgrade</T></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Guides x={[60.05, 531]} y={[99.26, 371.66]} dark />
    </div>
  );
}
