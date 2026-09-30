import Guides from '../Guides';
import { createOutlined } from '../../../../components/outlined/Outlined';
import appDashboard from './assets/app-dashboard.webp';
import { GLYPHS, TEXT } from './glyphs';
import './PlanChooser.css';

// Content 11 (Figma Portfolio-2026, node 141:8699): Beam's "Choose your plan" dialog over the
// dimmed dashboard, built in code at the frame's design size (593 × 473). BeamGallery scales
// it to the tile with SceneFit. As in Figma, its guides pass under the screen.
// The dashboard behind the dim is Figma's own screenshot of the app (a small WebP); the
// dialog is code, its text outlines (glyphs.ts), its icons inline SVG, so it loads no font.

const T = createOutlined(GLYPHS, TEXT);

const PLANS = [
  {
    key: 'free', name: 'Free', blurb: 'For personal projects and getting started.', price: '$0', action: 'Current plan', current: true,
    features: ['5 GB storage', 'Files up to 250 MB', '3 workspaces', '1 members', 'Public links', '7 days history'],
  },
  {
    key: 'pro', name: 'Pro', blurb: 'For professionals managing active\nprojects.', price: '$12', action: 'Upgrade to Pro', current: false,
    features: ['1 TB storage', 'Files up to 10 GB', 'Unlimited workspaces', '5 members', 'Password + expiry', '90 days history'],
  },
  {
    key: 'business', name: 'Business', blurb: 'For teams that need control and security.', price: '$24', action: 'Upgrade to Business', current: false,
    features: ['5 TB storage', 'Files up to 50 GB', 'Unlimited workspaces', 'Unlimited members', 'Advanced controls', 'Unlimited history'],
  },
];

// The dialog's icons, as Figma exported them, each centred in its 4.167 box.
const STROKE = { strokeWidth: 0.347222, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const ICON = { width: 4.16667, height: 4.16667, fill: 'none', 'aria-hidden': true } as const;

function PlanIcon() {
  return (
    <svg {...ICON} viewBox="-0.2604 -0.2604 4.16667 4.16667" stroke="#707070">
      <path d="M3.47222 2.77778V0.868056C3.47222 0.484524 3.16131 0.173611 2.77778 0.173611H0.868056C0.484524 0.173611 0.173611 0.484524 0.173611 0.868056V2.77778C0.173611 3.16131 0.484524 3.47222 0.868056 3.47222H2.77778C3.16131 3.47222 3.47222 3.16131 3.47222 2.77778Z" {...STROKE} />
      <path d="M1.47569 1.82292H2.17014" {...STROKE} />
      <path d="M1.04167 2.60417H1.73611" {...STROKE} />
      <path d="M1.90972 1.04167H2.60417" {...STROKE} />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg {...ICON} viewBox="-0.6076 -0.6076 4.16667 4.16667" stroke="#E3E0DE">
      <path d="M0.173611 2.77778L2.77778 0.173611" {...STROKE} />
      <path d="M2.77778 2.77778L0.173611 0.173611" {...STROKE} />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="beam-plans__check" {...ICON} viewBox="-0.4345 -0.8631 4.16667 4.16667" stroke="#F5F5F5">
      <path d="M0.173612 1.3641L1.09243 2.3488L3.1225 0.173612" {...STROKE} />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg {...ICON} viewBox="-0.176 -0.1733 4.16667 4.16667" stroke="#F5F5F5">
      <path d="M2.26285 2.70485L2.54619 2.37603C2.62223 2.28124 2.75244 2.24929 2.86355 2.2986L3.48299 2.55138C3.60279 2.6045 3.66633 2.73645 3.63334 2.86318L3.45626 3.40242C3.40799 3.54999 3.26702 3.65346 3.11251 3.64096C2.32987 3.57777 1.62674 3.23402 1.10348 2.7104L1.10522 2.71214C0.581605 2.18888 0.237855 1.48575 0.17466 0.703113C0.16216 0.548252 0.26598 0.407627 0.413202 0.359363L0.952438 0.18228C1.07917 0.149294 1.21112 0.213183 1.26424 0.332627L1.51702 0.952072C1.56633 1.06318 1.53473 1.19374 1.43959 1.26943L1.11077 1.55277" {...STROKE} />
    </svg>
  );
}

export default function PlanChooser() {
  return (
    <div className="beam-plans" aria-hidden="true">
      <Guides x={[60.05, 531]} y={[98.86, 371.25]} />
      <div className="beam-plans__screen">
        <img className="beam-plans__app" src={appDashboard} alt="" width="500" height="312.5" loading="lazy" decoding="async" />
        <div className="beam-plans__overlay">
          <div className="beam-plans__dialog">
            <div className="beam-plans__header">
              <span className="beam-plans__title">
                <span className="beam-plans__title-icon"><PlanIcon /></span>
                <T k="title">Choose your plan</T>
              </span>
              <span className="beam-plans__close"><CloseIcon /></span>
            </div>
            <div className="beam-plans__body">
              <div className="beam-plans__columns">
                {PLANS.map(plan => (
                  <div key={plan.key} className={`beam-plans__plan beam-plans__plan--${plan.key}`}>
                    <div className="beam-plans__name"><T k={`${plan.key}.name`}>{plan.name}</T></div>
                    <div className="beam-plans__blurb"><T k={`${plan.key}.blurb`}>{plan.blurb}</T></div>
                    <div className="beam-plans__price">
                      <T k={`${plan.key}.price`} className="beam-plans__price-row">
                        <span className="beam-plans__amount">{plan.price}</span>
                        <span>/ month</span>
                      </T>
                    </div>
                    <div className={`beam-plans__action${plan.current ? ' beam-plans__action--current' : ''}`}>
                      <T k={`${plan.key}.action`}>{plan.action}</T>
                    </div>
                    <div className="beam-plans__list">
                      <div className="beam-plans__include"><T k="include">Include:</T></div>
                      {plan.features.map((feature, index) => (
                        <div key={feature} className="beam-plans__item">
                          <CheckIcon />
                          <T k={`${plan.key}.feature${index}`}>{feature}</T>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="beam-plans__contact">
                <T k="contact">Need higher limits, advanced controls, or a plan built around your team’s needs?</T>
                <span className="beam-plans__talk">
                  <PhoneIcon />
                  <T k="talk">Talk to our team</T>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
