import arrowRight from './assets/arrow-right.svg';
import battery from './assets/battery.svg';
import beamLogo from './assets/beam-logo.svg';
import claude from './assets/claude.svg';
import mobileSignal from './assets/mobile-signal.svg';
import openai from './assets/openai.svg';
import replit from './assets/replit.svg';
import rowMenu from './assets/row-menu.svg';
// "9:41" as Inter Bold outlines: four characters don't justify loading an 876 KB font.
import time from './assets/time-9-41.svg';
import wifi from './assets/wifi.svg';
import { createOutlined } from '../Outlined';
import { GLYPHS, TEXT } from './glyphs';
import './BeamPhone.css';

const T = createOutlined(GLYPHS, TEXT);

// Content 04 (Figma Portfolio-2026, node 339:4983): the Beam website's home screen on an
// iPhone, built in code at the frame's design size (384 × 479; the phone runs past the
// bottom edge and is clipped by the tile). BeamGallery scales it to the tile with SceneFit.

const FILES = [
  { name: 'Folder 001', badge: 'Starter', size: '2.4KB', modified: '5 days ago' },
  { name: 'Product Resources', size: '856MB', modified: '5 days ago' },
  { name: 'Website Assets', size: '420MB', modified: '6 days ago' },
];
const STATS = [['Folders', '3'], ['Files', '10'], ['Storage used', '1,276 MB']];

export default function BeamPhone() {
  return (
    <div className="beam-phone" aria-hidden="true">
      <div className="beam-phone__device">
        <div className="beam-phone__body" />
        <div className="beam-phone__screen">
          <div className="beam-phone__display">
            <div className="beam-phone__canvas">
              <div className="beam-site">
                <nav className="beam-site__nav">
                  <span className="beam-site__brand">
                    <img src={beamLogo} alt="" width="11.4261" height="11.4289" />
                    <T k="brand">Beam</T>
                  </span>
                  <span className="beam-site__links">
                    <span className="beam-site__signup"><T k="signup">Signup</T></span>
                    <span className="beam-site__login"><T k="login">Login</T></span>
                  </span>
                </nav>
                <section className="beam-site__section">
                  <div className="beam-site__hero">
                    <div className="beam-site__intro">
                      <div className="beam-site__offer">
                        <span className="beam-site__sale"><T k="sale">SALE</T></span>
                        <span className="beam-site__offer-text">
                          <T k="offer">Launch offer Get Pro for $10/month</T>
                          <span className="beam-site__arrow"><img src={arrowRight} alt="" width="5.70436" height="4.07452" /></span>
                        </span>
                      </div>
                      <h1 className="beam-site__title"><T k="title">{'One workspace.\nEverywhere.'}</T></h1>
                      <p className="beam-site__lead">
                        <T k="lead">{'Beam keeps your files available across local\nmachines, cloud environments, CI, and agent\nworkflows without rebuilding context.'}</T>
                      </p>
                    </div>
                    <div className="beam-site__actions">
                      <span className="beam-site__prompt">
                        <span className="beam-site__prompt-label"><T k="prompt">Copy agent prompt</T></span>
                        <span className="beam-site__divider" />
                        <span className="beam-site__agents">
                          <span className="beam-site__agent">
                            <img src={claude} alt="" width="8.54794" height="8.55651" />
                          </span>
                          <span className="beam-site__agent">
                            <img src={replit} alt="" width="5.70462" height="8.56306" />
                          </span>
                          <span className="beam-site__agent">
                            <img src={openai} alt="" width="8.55651" height="8.48015" />
                          </span>
                        </span>
                      </span>
                      <span className="beam-site__start"><T k="start">Start free</T></span>
                    </div>
                  </div>
                  <div className="beam-site__visual">
                    <div className="beam-app">
                      <div className="beam-app__window">
                        <div className="beam-app__content">
                          <p className="beam-app__heading"><T k="app.heading">My Beam</T></p>
                          <div className="beam-app__panels">
                            <div className="beam-app__table">
                              <div className="beam-app__row beam-app__row--head">
                                <span className="beam-app__cell beam-app__cell--name"><T k="app.name">Name</T></span>
                                <span className="beam-app__cell beam-app__cell--size"><T k="app.size">Size</T></span>
                                <span className="beam-app__cell beam-app__cell--date"><T k="app.modified">Modified</T></span>
                                <span className="beam-app__cell beam-app__cell--menu" />
                              </div>
                              {FILES.map(file => (
                                <div className="beam-app__row" key={file.name}>
                                  <span className="beam-app__cell beam-app__cell--name">
                                    <T k={`file.${file.name}.name`}>{file.name}</T>
                                    {file.badge && <span className="beam-app__badge"><T k={`file.${file.name}.badge`}>{file.badge}</T></span>}
                                  </span>
                                  <span className="beam-app__cell beam-app__cell--size"><T k={`file.${file.name}.size`}>{file.size}</T></span>
                                  <span className="beam-app__cell beam-app__cell--date"><T k={`file.${file.name}.modified`}>{file.modified}</T></span>
                                  <span className="beam-app__cell beam-app__cell--menu"><img src={rowMenu} alt="" width="6.79595" height="6.79595" /></span>
                                </div>
                              ))}
                            </div>
                            <div className="beam-app__stats">
                              {STATS.map(([label, value]) => (
                                <div className="beam-app__stat" key={label}><T k={`stat.${label}.label`}>{label}</T><T k={`stat.${label}.value`}>{value}</T></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="beam-site__fade" />
                  </div>
                </section>
              </div>
              <div className="beam-phone__status">
                <span className="beam-phone__time"><span><img src={time} alt="" width="19.171" height="11.536" /></span></span>
                <img className="beam-phone__signal" src={mobileSignal} alt="" width="10.8027" height="6.78027" />
                <img className="beam-phone__wifi" src={wifi} alt="" width="9.70801" height="6.96966" />
                <img className="beam-phone__battery" src={battery} alt="" width="15.4699" height="7.20383" />
              </div>
            </div>
            <div className="beam-phone__island" />
          </div>
        </div>
        <span className="beam-phone__button beam-phone__button--action" />
        <span className="beam-phone__button beam-phone__button--volume-up" />
        <span className="beam-phone__button beam-phone__button--volume-down" />
        <span className="beam-phone__button beam-phone__button--power" />
      </div>
    </div>
  );
}
