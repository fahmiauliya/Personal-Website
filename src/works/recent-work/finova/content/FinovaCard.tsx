import { useLayoutEffect, useRef, useState } from 'react';
import styles from './FinovaCard.module.css';
import { Flip, RollSwap, RollText, finovaDefaults, mix, press, there, type FinovaSettings } from './motion';
// Figma 282:1447: separate phone/UI layers retained for future motion.
import imgRectangle115 from './assets/2a0cd.png';
import imgPexelsPhotoByMohamedAbdelghaffar from './assets/20899.png';
import imgVector11076 from './assets/7a186.svg';
import imgFrame from './assets/e31fe.svg';
import imgFrame1 from './assets/5b3a9.svg';
import imgFrame2 from './assets/522ad.svg';
import imgFrame3 from './assets/3e832.svg';
import imgFrame5 from './assets/b3061.svg';
import imgEllipse23 from './assets/cae40.svg';
import imgBattery from './assets/913b0.svg';
import imgWifi from './assets/757fa.svg';
import imgMobileSignal from './assets/7fd93.svg';
import imgFrame6 from './assets/ee0d7.svg';
import imgFrame383 from './assets/finova-profile.png';
import imgEllipse24 from './assets/01313.svg';
import imgBattery1 from './assets/d2339.svg';
import imgWifi1 from './assets/3b923.svg';
import imgMobileSignal1 from './assets/6a2f8.svg';
import imgFrame7 from './assets/cd524.svg';
import imgFrame8 from './assets/61743.svg';
import imgBell from './assets/34343.svg';
import imgFrame282 from './assets/40c09.svg';
import imgFrame9 from './assets/5b474.svg';
import imgFrame10 from './assets/f79d4.svg';
import imgFrame11 from './assets/26008.svg';
import imgFrame12 from './assets/21c63.svg';
import imgFrame13 from './assets/3aa23.svg';
import imgCryptocurrency from './assets/9f7c3.svg';
import imgCryptocurrency1 from './assets/340ae.svg';
import imgCryptocurrency2 from './assets/ec581.svg';
import imgCryptocurrency3 from './assets/430d5.svg';
import imgFrame14 from './assets/ccae4.svg';
import imgFrame15 from './assets/dd9fc.svg';
import imgCryptocurrency4 from './assets/12c3f.svg';
import imgCryptocurrency5 from './assets/a0e1c.svg';
import imgCryptocurrency6 from './assets/d3a0d.svg';
import imgCryptocurrency7 from './assets/fb827.svg';
import imgFrame16 from './assets/65a1a.svg';
import imgCryptocurrency8 from './assets/077d1.svg';
import imgFrame17 from './assets/15456.svg';
import imgCryptocurrency9 from './assets/9545d.svg';
import imgFrame18 from './assets/dae86.svg';
import imgCryptocurrency10 from './assets/e1937.svg';
import imgFrame19 from './assets/da282.svg';
import imgCryptocurrency11 from './assets/e0839.svg';
import imgFrame20 from './assets/666a5.svg';
import imgVector11078 from './assets/2d91e.svg';
import imgVector11079 from './assets/56468.svg';
import imgVector11080 from './assets/bf01b.svg';

// The step-complete fill, the same gradient as Figma's finished step 1 (282:5773). Once a step is
// complete its circle's own background is this too, so no white shows at the fill's soft edge.
const STEP_DONE = "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 14.529 14.529' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(4.0476e-14 0.72645 -0.72645 1.1245e-13 7.2645 7.2645)'><stop stop-color='rgba(0,122,255,1)' offset='0'/><stop stop-color='rgba(0,95,210,1)' offset='1'/></radialGradient></defs></svg>\")";
const LINE_TO_STEP_2 = 30.319; // Figma's blue fill (I282:5771;2316:1239)
const LINE_TO_STEP_3 = 65.104; // the whole track (282:5771) below its 0.64 top
const TAB_DARK = [2, 6, 26];
const TAB_GRAY = [148, 148, 148];

type Box = { left: number; top: number; width: number; height: number };

/**
 * `position` is the time in the loop (0 to LOOP_SECONDS) from the lab's timeline; 0 is Figma's
 * layout. Next is tapped, then both phones move together: on the left step 2 completes, the line
 * grows and step 3 completes; on the right the balance and prices roll, the tab pill glides to
 * Gainers and the portfolio slides. Then everything plays back together to the start.
 */
export default function FinovaCard({ position = 0, values }: { position?: number; values?: Record<string, Record<string, number | string>> }) {
  const s = { ...finovaDefaults, ...(values?.Finova as Partial<FinovaSettings> | undefined) };
  const t = position;
  const R = s.RollSeconds;
  const k = s.Ease;
  const lag = s.Stagger / Math.max(0.05, R); // per-slot delay, as a share of one roll
  const out = (start: number, back: number, duration = R) => there(t, start, Math.max(back, start + duration), duration, k);

  // Both phones move at the same time: after the tap, everything starts together at GO and winds
  // back together at BACK. On the left, the steps flow into each other (step 2 completes, the
  // line grows, step 3 completes) and wind back in mirror order.
  const GO = 0.55;
  const BACK = 7.0;
  const L = s.LineSeconds;
  const last = R * 1.3 + L; // when step 3's "Complete" starts, after GO
  const tap = press(t, 0.3, 0.35);
  const step2 = out(GO, BACK + last);
  const line = out(GO + R * 0.9, BACK + R * 0.4 + L * 0.2, L);
  const step3 = out(GO + R * 0.9 + L * 0.8, BACK + R * 0.4);
  // Then step 3 completes too: blue fill and "Complete".
  const step3Done = out(GO + last, BACK);
  // Right phone: all at once.
  const balance = out(GO, BACK);
  const cents = out(GO, BACK);
  const change = out(GO, BACK);
  const pill = out(GO, BACK, s.SlideSeconds * 0.8);
  const invest = out(GO, BACK);
  const btc = out(GO, BACK);
  const eth = out(GO, BACK);
  const usdt = out(GO, BACK);
  const doge = out(GO, BACK);
  const slide = out(GO, BACK, s.SlideSeconds);

  // Measured once fonts are in: the tab pill's stops and how far the portfolio row slides.
  const tabsRow = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const portfolioRow = useRef<HTMLDivElement>(null);
  const savingCard = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{ tabs: Box[]; slide: number }>({ tabs: [], slide: 0 });
  useLayoutEffect(() => {
    let cancelled = false;
    const measure = () => {
      const row = tabsRow.current;
      const cards = portfolioRow.current;
      const saving = savingCard.current;
      if (!row || !cards || !saving || cancelled) return;
      const rowRect = row.getBoundingClientRect();
      const scale = rowRect.width / row.offsetWidth || 1;
      const tabs = tabRefs.current.map(tab => {
        const r = tab!.getBoundingClientRect();
        return { left: (r.left - rowRect.left) / scale, top: (r.top - rowRect.top) / scale, width: r.width / scale, height: r.height / scale };
      });
      // Slide until the Saving card's right edge meets the row's right padding.
      const cardsRect = cards.getBoundingClientRect();
      const padding = parseFloat(getComputedStyle(cards).paddingRight) || 0;
      const overflow = (saving.getBoundingClientRect().right - cardsRect.right) / scale + padding;
      setLayout({ tabs, slide: Math.max(0, overflow) });
    };
    measure();
    document.fonts?.ready.then(measure);
    return () => { cancelled = true; };
  }, []);

  // The pill glides from Most Popular (tab 0) to Gainers (tab 2); each label darkens as it passes.
  const [from, to] = [layout.tabs[0], layout.tabs[2]];
  const pillBox = from && to ? {
    left: mix(from.left, to.left, pill), top: mix(from.top, to.top, pill),
    width: mix(from.width, to.width, pill), height: mix(from.height, to.height, pill),
  } : undefined;
  const tabColor = (index: number) => {
    const tab = layout.tabs[index];
    if (!tab || !pillBox) return undefined;
    const centre = pillBox.left + pillBox.width / 2;
    const near = Math.max(0, 1 - Math.abs(centre - (tab.left + tab.width / 2)) / tab.width);
    const c = TAB_GRAY.map((g, i) => Math.round(mix(g, TAB_DARK[i], near)));
    return `rgb(${c.join(' ')})`;
  };

  return (
    <div className={styles.card} role="img" aria-label="Finova mobile finance app: onboarding and portfolio screens">
    <div className={[styles.f0, styles.f1, styles.f2].join(" ")} data-node-id="282:1447" data-name="Finova">
      <div className={[styles.f3, styles.f4, styles.f5, styles.f6, styles.f7].join(" ")} data-node-id="282:7408">
        <div className={[styles.f3, styles.f8].join(" ")}>
          <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgVector11076} />
        </div>
      </div>
      <div className={[styles.f3, styles.f4, styles.f11, styles.f6, styles.f7].join(" ")} data-node-id="282:7409">
        <div className={[styles.f3, styles.f8].join(" ")}>
          <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgVector11076} />
        </div>
      </div>
      {/* Soft white light beams (Vector 11078–11080): behind the phones, so they light the background
          without washing out the screens. */}
      <div className={[styles.f3, styles.f270, styles.f271, styles.f272, styles.f273].join(" ")} data-node-id="282:7411">
        <div className={[styles.f3, styles.f274].join(" ")}>
          <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgVector11078} />
        </div>
      </div>
      <div className={[styles.f3, styles.f270, styles.f271, styles.f272, styles.f273].join(" ")} data-node-id="282:7413">
        <div className={[styles.f3, styles.f274].join(" ")}>
          <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgVector11079} />
        </div>
      </div>
      <div className={[styles.f3, styles.f275, styles.f276, styles.f277, styles.f278].join(" ")} data-node-id="282:7415">
        <div className={[styles.f3, styles.f279].join(" ")}>
          <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgVector11080} />
        </div>
      </div>
      <div className={[styles.f3, styles.f275, styles.f280, styles.f277, styles.f278].join(" ")} data-node-id="282:7417">
        <div className={[styles.f3, styles.f279].join(" ")}>
          <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgVector11080} />
        </div>
      </div>
      <div className={[styles.f3, styles.f12, styles.f13, styles.f14, styles.f15, styles.f16, styles.f17].join(" ")} data-node-id="282:5753" data-name="iPhone 17 Pro - Light">
        <div className={[styles.f3, styles.f18, styles.f19, styles.f20].join(" ")} data-node-id="282:5754" data-name="Mask (Body)">
          <div className={[styles.f3, styles.f21, styles.f22, styles.f20].join(" ")} data-node-id="282:5755" data-name="Color Background" />
        </div>
        <div className={[styles.f3, styles.f23, styles.f24, styles.f25].join(" ")} data-node-id="282:5756" data-name="Buttons">
          <div className={[styles.f3, styles.f26, styles.f27, styles.f28, styles.f29, styles.f30, styles.f31, styles.f32].join(" ")} data-node-id="282:5757">
            <div className={[styles.f33, styles.f34].join(" ")}>
              <div className={[styles.f27, styles.f19, styles.f1, styles.f35, styles.f36, styles.f37, styles.f38, styles.f32].join(" ")} data-name="+ Volumen Button test">
                <div className={[styles.f3, styles.f21, styles.f27, styles.f39, styles.f40, styles.f41, styles.f42, styles.f43].join(" ")} data-node-id="282:5758" data-name="Background" />
              </div>
            </div>
          </div>
          <div className={[styles.f3, styles.f26, styles.f27, styles.f28, styles.f29, styles.f30, styles.f44, styles.f32].join(" ")} data-node-id="282:5759">
            <div className={[styles.f33, styles.f34].join(" ")}>
              <div className={[styles.f27, styles.f19, styles.f1, styles.f35, styles.f36, styles.f37, styles.f38, styles.f32].join(" ")} data-name="+ Volumen Button">
                <div className={[styles.f3, styles.f21, styles.f27, styles.f39, styles.f40, styles.f41, styles.f42, styles.f43].join(" ")} data-node-id="282:5760" data-name="Background" />
              </div>
            </div>
          </div>
          <div className={[styles.f3, styles.f26, styles.f45, styles.f28, styles.f29, styles.f30, styles.f25, styles.f32].join(" ")} data-node-id="282:5761">
            <div className={[styles.f33, styles.f34].join(" ")}>
              <div className={[styles.f45, styles.f19, styles.f1, styles.f35, styles.f36, styles.f37, styles.f38, styles.f32].join(" ")} data-name="Action Button">
                <div className={[styles.f3, styles.f21, styles.f45, styles.f39, styles.f40, styles.f41, styles.f42, styles.f43].join(" ")} data-node-id="282:5762" data-name="Background" />
              </div>
            </div>
          </div>
          <div className={[styles.f3, styles.f26, styles.f46, styles.f28, styles.f29, styles.f47, styles.f48, styles.f49].join(" ")} data-node-id="282:5763">
            <div className={[styles.f34, styles.f50].join(" ")}>
              <div className={[styles.f46, styles.f19, styles.f1, styles.f40, styles.f36, styles.f41, styles.f38, styles.f49].join(" ")} data-name="Power Button">
                <div className={[styles.f3, styles.f21, styles.f46, styles.f51, styles.f40, styles.f41, styles.f42, styles.f52].join(" ")} data-node-id="282:5764" data-name="Background" />
              </div>
            </div>
          </div>
        </div>
        <div className={[styles.f53, styles.f54, styles.f3, styles.f55, styles.f56, styles.f19, styles.f57, styles.f58, styles.f59].join(" ")} data-node-id="282:5765" data-name="Screen">
          <div className={[styles.f3, styles.f60, styles.f22, styles.f61].join(" ")} data-node-id="282:5766" data-name="Border" />
          <div className={[styles.f3, styles.f62, styles.f19, styles.f63].join(" ")} data-node-id="282:5767" data-name="Display Screen">
            <div className={[styles.f3, styles.f21, styles.f64].join(" ")} data-node-id="282:5768" data-name="Replace Tool" />
            <div className={[styles.f3, styles.f65, styles.f66, styles.f39, styles.f19, styles.f67, styles.f68, styles.f69, styles.f70].join(" ")} data-node-id="282:5769" data-name="#">
              <div className={[styles.f3, styles.f71, styles.f26, styles.f72, styles.f73, styles.f74, styles.f75, styles.f76, styles.f77, styles.f78, styles.f79, styles.f80].join(" ")} data-node-id="282:5770">
                <div className={[styles.f3, styles.f81, styles.f82, styles.f83, styles.f84, styles.f85].join(" ")} data-node-id="282:5771">
                  <img alt="" className={[styles.f3, styles.f22, styles.f10, styles.f86, styles.f2].join(" ")} src={imgRectangle115} />
                  <div className={[styles.f3, styles.f87, styles.f39, styles.f88, styles.f85].join(" ")} data-node-id="I282:5771;2316:1239" style={{ height: mix(LINE_TO_STEP_2, LINE_TO_STEP_3, line) }}>
                    <div aria-hidden className={[styles.f3, styles.f89, styles.f22].join(" ")} />
                    <div className={[styles.f3, styles.f22, styles.f90, styles.f91].join(" ")} />
                  </div>
                </div>
                <div className={[styles.f71, styles.f26, styles.f92, styles.f28, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:5772">
                  <div className={[styles.f95, styles.f96, styles.f97, styles.f71, styles.f26, styles.f28, styles.f29, styles.f19, styles.f77, styles.f98, styles.f1, styles.f99, styles.f100, styles.f93, styles.f101].join(" ")} data-node-id="282:5773" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 14.529 14.529' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(4.0476e-14 0.72645 -0.72645 1.1245e-13 7.2645 7.2645)'><stop stop-color='rgba(0,122,255,1)' offset='0'/><stop stop-color='rgba(0,95,210,1)' offset='1'/></radialGradient></defs></svg>\")" }}>
                    <div className={[styles.f1, styles.f93, styles.f102].join(" ")} data-node-id="282:5774" data-name="Frame">
                      <div className={[styles.f3, styles.f103].join(" ")}>
                        <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgFrame} />
                      </div>
                    </div>
                  </div>
                  <div className={[styles.f71, styles.f26, styles.f104, styles.f72, styles.f105, styles.f75, styles.f106, styles.f1].join(" ")} data-node-id="282:5780">
                    <p className={[styles.f107, styles.f108, styles.f109, styles.f110, styles.f111, styles.f1, styles.f93, styles.f112, styles.f113, styles.f114].join(" ")} data-node-id="282:5781">
                      Create Account
                    </p>
                    <p className={[styles.f107, styles.f108, styles.f115, styles.f110, styles.f111, styles.f1, styles.f93, styles.f116, styles.f113, styles.f114].join(" ")} data-node-id="282:5782">
                      Set a password to protect your account.
                    </p>
                    <div className={[styles.f71, styles.f26, styles.f105, styles.f28, styles.f1, styles.f93].join(" ")} data-node-id="282:5783">
                      <div className={[styles.f1, styles.f93, styles.f117].join(" ")} data-node-id="282:5784" data-name="Frame">
                        <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame1} />
                      </div>
                      <p className={[styles.f107, styles.f108, styles.f118, styles.f110, styles.f1, styles.f93, styles.f119, styles.f120, styles.f121].join(" ")} data-node-id="282:5787">
                        Complete
                      </p>
                    </div>
                  </div>
                </div>
                <div className={[styles.f71, styles.f26, styles.f92, styles.f28, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:5788">
                  <div className={[styles.f122, styles.f96, styles.f97, styles.f71, styles.f26, styles.f28, styles.f29, styles.f19, styles.f123, styles.f1, styles.f99, styles.f100, styles.f93].join(" ")} data-node-id="282:5789" style={{ position: 'relative', backgroundImage: step2 >= 1 ? STEP_DONE : "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 14.53 14.53' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(4.4486e-17 0.72651 -0.72651 4.4486e-17 7.2651 7.2651)'><stop stop-color='rgba(245,245,245,1)' offset='0'/><stop stop-color='rgba(255,255,255,1)' offset='1'/></radialGradient></defs></svg>\")" }}>
                    <div className={[styles.f1, styles.f93, styles.f124].join(" ")} data-node-id="282:5790" data-name="Frame">
                      <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame2} />
                    </div>
                    {/* Step 2 completing: the finished-step blue fills the circle from its centre. */}
                    <div className={styles.stepFill} style={{ backgroundImage: STEP_DONE, clipPath: `circle(${step2 * 72}% at 50% 50%)` }} aria-hidden>
                      <div className={[styles.f1, styles.f93, styles.f124, styles.whiteIcon].join(" ")}>
                        <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame2} />
                      </div>
                    </div>
                  </div>
                  <div className={[styles.f71, styles.f26, styles.f104, styles.f72, styles.f105, styles.f75, styles.f106, styles.f1].join(" ")} data-node-id="282:5802">
                    <p className={[styles.f107, styles.f108, styles.f109, styles.f110, styles.f111, styles.f1, styles.f93, styles.f112, styles.f113, styles.f114].join(" ")} data-node-id="282:5803">
                      Personal Details
                    </p>
                    <p className={[styles.f107, styles.f108, styles.f115, styles.f110, styles.f111, styles.f1, styles.f93, styles.f116, styles.f113, styles.f114].join(" ")} data-node-id="282:5804">
                      Set your personal and financial information.
                    </p>
                    <RollSwap progress={step2} from={
                    <div className={[styles.f71, styles.f26, styles.f105, styles.f28, styles.f125, styles.f1, styles.f93].join(" ")} data-node-id="282:5805">
                      <div className={[styles.f1, styles.f93, styles.f117].join(" ")} data-node-id="282:5806" data-name="Frame">
                        <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame3} />
                      </div>
                      <p className={[styles.f107, styles.f108, styles.f118, styles.f110, styles.f1, styles.f93, styles.f116, styles.f120, styles.f121].join(" ")} data-node-id="282:5810">
                        Approx. 2 min
                      </p>
                    </div>} to={
                    // Step 1's "Complete" row (282:5783).
                    <div className={[styles.f71, styles.f26, styles.f105, styles.f28, styles.f1, styles.f93].join(" ")}>
                      <div className={[styles.f1, styles.f93, styles.f117].join(" ")}>
                        <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame1} />
                      </div>
                      <p className={[styles.f107, styles.f108, styles.f118, styles.f110, styles.f1, styles.f93, styles.f119, styles.f120, styles.f121].join(" ")}>
                        Complete
                      </p>
                    </div>} />
                  </div>
                </div>
                <div className={[styles.f71, styles.f26, styles.f92, styles.f28, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:5811">
                  <div className={[styles.f96, styles.f97, styles.f126, styles.f71, styles.f26, styles.f28, styles.f29, styles.f19, styles.f123, styles.f1, styles.f99, styles.f127, styles.f93].join(" ")} data-node-id="282:5812" style={{ position: 'relative', backgroundImage: step3Done >= 1 ? STEP_DONE : "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 14.529 14.529' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(4.4482e-17 0.72645 -0.72645 4.4482e-17 7.2645 7.2645)'><stop stop-color='rgba(255,255,255,1)' offset='0'/><stop stop-color='rgba(245,245,245,1)' offset='1'/></radialGradient></defs></svg>\")", boxShadow: `0 0 0 0.363px rgb(${Math.round(mix(234, 0, step3Done))} ${Math.round(mix(234, 122, step3Done))} ${Math.round(mix(234, 255, step3Done))})`, borderColor: `rgb(${Math.round(mix(255, 1, step3))} ${Math.round(mix(255, 99, step3))} ${Math.round(mix(255, 216, step3))})` }}>
                    <div className={[styles.f1, styles.f93, styles.f102].join(" ")} data-node-id="282:5813" data-name="Frame">
                      <svg aria-hidden="true" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} viewBox="0 0 8.71744 8.71744" fill="none" style={{ color: `rgb(${Math.round(mix(133, 1, step3))} ${Math.round(mix(139, 99, step3))} ${Math.round(mix(146, 216, step3))})`, opacity: mix(0.8, 1, step3) }}>
<path d="M7.62718 1.90701H1.0891C0.938647 1.90701 0.81668 2.02898 0.81668 2.17943V6.53816C0.81668 6.68861 0.938647 6.81058 1.0891 6.81058H7.62718C7.77764 6.81058 7.8996 6.68861 7.8996 6.53816V2.17943C7.8996 2.02898 7.77764 1.90701 7.62718 1.90701Z" stroke="currentColor" strokeWidth="0.54484" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M5.72175 5.72104H6.81143" stroke="currentColor" strokeWidth="0.54484" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M4.08468 5.72104H4.62992" stroke="currentColor" strokeWidth="0.54484" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M0.81668 3.26953H7.8996" stroke="currentColor" strokeWidth="0.54484" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    </div>
                    {/* Step 3 completing, like step 2: blue fills the circle from its centre, icon white. */}
                    <div className={styles.stepFill} style={{ backgroundImage: STEP_DONE, clipPath: `circle(${step3Done * 72}% at 50% 50%)` }} aria-hidden>
                      <div className={[styles.f1, styles.f93, styles.f102].join(" ")} style={{ position: 'relative' }}>
                      <svg aria-hidden="true" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} viewBox="0 0 8.71744 8.71744" fill="none" style={{ color: '#fff' }}>
<path d="M7.62718 1.90701H1.0891C0.938647 1.90701 0.81668 2.02898 0.81668 2.17943V6.53816C0.81668 6.68861 0.938647 6.81058 1.0891 6.81058H7.62718C7.77764 6.81058 7.8996 6.68861 7.8996 6.53816V2.17943C7.8996 2.02898 7.77764 1.90701 7.62718 1.90701Z" stroke="currentColor" strokeWidth="0.54484" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M5.72175 5.72104H6.81143" stroke="currentColor" strokeWidth="0.54484" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M4.08468 5.72104H4.62992" stroke="currentColor" strokeWidth="0.54484" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M0.81668 3.26953H7.8996" stroke="currentColor" strokeWidth="0.54484" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                      </div>
                    </div>
                  </div>
                  <div className={[styles.f71, styles.f26, styles.f104, styles.f72, styles.f105, styles.f75, styles.f106, styles.f1].join(" ")} data-node-id="282:5819">
                    <p className={[styles.f107, styles.f108, styles.f109, styles.f110, styles.f111, styles.f1, styles.f93, styles.f112, styles.f113, styles.f114].join(" ")} data-node-id="282:5820">
                      Verify Identity
                    </p>
                    <p className={[styles.f107, styles.f108, styles.f115, styles.f110, styles.f111, styles.f1, styles.f93, styles.f116, styles.f113, styles.f114].join(" ")} data-node-id="282:5821">
                      Submit and verify your identity document.
                    </p>
                    <RollSwap progress={step3Done} from={
                    <div className={[styles.f71, styles.f26, styles.f105, styles.f28, styles.f125, styles.f1, styles.f93].join(" ")} data-node-id="282:5822">
                      <div className={[styles.f1, styles.f93, styles.f117].join(" ")} data-node-id="282:5823" data-name="Frame">
                        <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame5} />
                      </div>
                      <p className={[styles.f107, styles.f108, styles.f118, styles.f110, styles.f1, styles.f93, styles.f116, styles.f120, styles.f121].join(" ")} data-node-id="282:5827">
                        Approx. 5 min
                      </p>
                    </div>} to={
                    // Step 3 complete: step 1's "Complete" row (282:5783).
                    <div className={[styles.f71, styles.f26, styles.f105, styles.f28, styles.f1, styles.f93].join(" ")}>
                      <div className={[styles.f1, styles.f93, styles.f117].join(" ")}>
                        <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame1} />
                      </div>
                      <p className={[styles.f107, styles.f108, styles.f118, styles.f110, styles.f1, styles.f93, styles.f119, styles.f120, styles.f121].join(" ")}>
                        Complete
                      </p>
                    </div>} />
                  </div>
                </div>
              </div>
              <div className={[styles.f3, styles.f76, styles.f128, styles.f129].join(" ")} data-node-id="282:5828">
                <div className={[styles.f3, styles.f130].join(" ")}>
                  <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgEllipse23} />
                </div>
              </div>
              <div className={[styles.f3, styles.f71, styles.f26, styles.f72, styles.f75, styles.f76, styles.f131, styles.f132, styles.f133, styles.f80].join(" ")} data-node-id="282:5829" data-name="Header">
                <div className={[styles.f134, styles.f1, styles.f93, styles.f80].join(" ")} data-node-id="282:5830" data-name="Status-Bar">
                  <div className={[styles.f3, styles.f135].join(" ")} data-node-id="282:5831" data-name="Battery">
                    <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgBattery} />
                  </div>
                  <div className={[styles.f3, styles.f136].join(" ")} data-node-id="282:5835" data-name="Wifi">
                    <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgWifi} />
                  </div>
                  <div className={[styles.f3, styles.f137].join(" ")} data-node-id="282:5839" data-name="Mobile Signal">
                    <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgMobileSignal} />
                  </div>
                  <div className={[styles.f3, styles.f138].join(" ")} data-node-id="282:5844" data-name="Time Style">
                    <div className={[styles.f107, styles.f3, styles.f26, styles.f72, styles.f139, styles.f140, styles.f141, styles.f142, styles.f143, styles.f144, styles.f112, styles.f145, styles.f146, styles.f147].join(" ")} data-node-id="282:5845">
                      <p className={[styles.f148].join(" ")}>9:41</p>
                    </div>
                  </div>
                </div>
                <div className={[styles.f71, styles.f26, styles.f28, styles.f142, styles.f149, styles.f150, styles.f151, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:5846" data-name="Top">
                  <div className={[styles.f1, styles.f93, styles.f102].join(" ")} data-node-id="282:5847" data-name="Frame">
                    <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame6} />
                  </div>
                </div>
              </div>
              <div className={[styles.f3, styles.f71, styles.f26, styles.f72, styles.f152, styles.f75, styles.f76, styles.f153, styles.f77, styles.f154, styles.f80].join(" ")} data-node-id="282:5851">
                <div className={[styles.f1, styles.f93, styles.f155].join(" ")} data-node-id="282:5852">
                  <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} width={29.0581} height={29.0581} src={imgFrame383} />
                </div>
                <div className={[styles.f107, styles.f71, styles.f26, styles.f72, styles.f108, styles.f118, styles.f156, styles.f75, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:5854">
                  <p className={[styles.f157, styles.f1, styles.f93, styles.f112, styles.f158, styles.f159, styles.f94].join(" ")} data-node-id="282:5855">{`Finalize your personal account `}</p>
                  <p className={[styles.f110, styles.f1, styles.f93, styles.f116, styles.f160, styles.f94].join(" ")} data-node-id="282:5856">
                    We are required by regulations to collect and verify your information.
                  </p>
                </div>
              </div>
              <div className={[styles.f3, styles.f161, styles.f71, styles.f26, styles.f162, styles.f28, styles.f76, styles.f163, styles.f80].join(" ")} data-node-id="282:5857">
                <div className={[styles.f96, styles.f97, styles.f126, styles.f71, styles.f26, styles.f104, styles.f28, styles.f29, styles.f106, styles.f19, styles.f77, styles.f98, styles.f1, styles.f99, styles.f164].join(" ")} data-node-id="282:5858" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 57.935 14.538' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-4.1931e-14 1.3964 -5.5648 2.8731e-13 28.967 -1.4946e-12)'><stop stop-color='rgba(255,255,255,1)' offset='0'/><stop stop-color='rgba(245,245,245,1)' offset='1'/></radialGradient></defs></svg>\")" }}>
                  <p className={[styles.f107, styles.f108, styles.f109, styles.f165, styles.f1, styles.f93, styles.f166, styles.f113, styles.f146, styles.f167, styles.f121].join(" ")} data-node-id="282:5859">
                    Skip
                  </p>
                </div>
                <div className={[styles.f168, styles.f96, styles.f97, styles.f71, styles.f26, styles.f104, styles.f28, styles.f29, styles.f106, styles.f19, styles.f77, styles.f98, styles.f1, styles.f99, styles.f169].join(" ")} data-node-id="282:5860" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 57.935 14.538' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(1.9188e-14 1.0358 -4.1278 2.5335e-14 28.967 1.8173)'><stop stop-color='rgba(75,108,255,1)' offset='0'/><stop stop-color='rgba(53,88,242,1)' offset='0.5'/><stop stop-color='rgba(31,67,228,1)' offset='1'/></radialGradient></defs></svg>\")" , transform: `scale(${1 - 0.06 * tap})` }}>
                  <p className={[styles.f107, styles.f108, styles.f109, styles.f165, styles.f1, styles.f93, styles.f113, styles.f170, styles.f171, styles.f121].join(" ")} data-node-id="282:5861">
                    Next
                  </p>
                </div>
              </div>
            </div>
            <div className={[styles.f53, styles.f3, styles.f172, styles.f173, styles.f174, styles.f175].join(" ")} data-node-id="282:5862" data-name="Dynamic Island">
              <div className={[styles.f3, styles.f60, styles.f176, styles.f177, styles.f178, styles.f179, styles.f180].join(" ")} data-node-id="282:5863" data-name="Background" />
            </div>
          </div>
        </div>
      </div>
      <div className={[styles.f3, styles.f12, styles.f13, styles.f181, styles.f15, styles.f16, styles.f17].join(" ")} data-node-id="282:6302" data-name="iPhone 17 Pro - Light">
        <div className={[styles.f3, styles.f18, styles.f19, styles.f20].join(" ")} data-node-id="282:6303" data-name="Mask (Body)">
          <div className={[styles.f3, styles.f21, styles.f22, styles.f20].join(" ")} data-node-id="282:6304" data-name="Color Background" />
        </div>
        <div className={[styles.f3, styles.f23, styles.f30, styles.f25].join(" ")} data-node-id="282:6305" data-name="Buttons">
          <div className={[styles.f3, styles.f26, styles.f27, styles.f28, styles.f29, styles.f24, styles.f31, styles.f32].join(" ")} data-node-id="282:6306">
            <div className={[styles.f33, styles.f34].join(" ")}>
              <div className={[styles.f27, styles.f19, styles.f1, styles.f35, styles.f36, styles.f37, styles.f38, styles.f32].join(" ")} data-name="+ Volumen Button test">
                <div className={[styles.f3, styles.f21, styles.f27, styles.f39, styles.f40, styles.f41, styles.f42, styles.f43].join(" ")} data-node-id="282:6307" data-name="Background" />
              </div>
            </div>
          </div>
          <div className={[styles.f3, styles.f26, styles.f27, styles.f28, styles.f29, styles.f24, styles.f44, styles.f32].join(" ")} data-node-id="282:6308">
            <div className={[styles.f33, styles.f34].join(" ")}>
              <div className={[styles.f27, styles.f19, styles.f1, styles.f35, styles.f36, styles.f37, styles.f38, styles.f32].join(" ")} data-name="+ Volumen Button">
                <div className={[styles.f3, styles.f21, styles.f27, styles.f39, styles.f40, styles.f41, styles.f42, styles.f43].join(" ")} data-node-id="282:6309" data-name="Background" />
              </div>
            </div>
          </div>
          <div className={[styles.f3, styles.f26, styles.f45, styles.f28, styles.f29, styles.f24, styles.f25, styles.f32].join(" ")} data-node-id="282:6310">
            <div className={[styles.f33, styles.f34].join(" ")}>
              <div className={[styles.f45, styles.f19, styles.f1, styles.f35, styles.f36, styles.f37, styles.f38, styles.f32].join(" ")} data-name="Action Button">
                <div className={[styles.f3, styles.f21, styles.f45, styles.f39, styles.f40, styles.f41, styles.f42, styles.f43].join(" ")} data-node-id="282:6311" data-name="Background" />
              </div>
            </div>
          </div>
          <div className={[styles.f3, styles.f26, styles.f46, styles.f28, styles.f29, styles.f47, styles.f48, styles.f49].join(" ")} data-node-id="282:6312">
            <div className={[styles.f34, styles.f50].join(" ")}>
              <div className={[styles.f46, styles.f19, styles.f1, styles.f40, styles.f36, styles.f41, styles.f38, styles.f49].join(" ")} data-name="Power Button">
                <div className={[styles.f3, styles.f21, styles.f46, styles.f51, styles.f40, styles.f41, styles.f42, styles.f52].join(" ")} data-node-id="282:6313" data-name="Background" />
              </div>
            </div>
          </div>
        </div>
        <div className={[styles.f53, styles.f54, styles.f3, styles.f55, styles.f56, styles.f19, styles.f57, styles.f58, styles.f59].join(" ")} data-node-id="282:6314" data-name="Screen">
          <div className={[styles.f3, styles.f60, styles.f22, styles.f61].join(" ")} data-node-id="282:6315" data-name="Border" />
          <div className={[styles.f3, styles.f62, styles.f19, styles.f63].join(" ")} data-node-id="282:6316" data-name="Display Screen">
            <div className={[styles.f3, styles.f21, styles.f182].join(" ")} data-node-id="282:6317" data-name="Replace Tool" />
            <div className={[styles.f3, styles.f65, styles.f71, styles.f26, styles.f72, styles.f183, styles.f75, styles.f39, styles.f19, styles.f67, styles.f184, styles.f69, styles.f185].join(" ")} data-node-id="282:7079" data-name="#">
              <div className={[styles.f186, styles.f19, styles.f1, styles.f93, styles.f185].join(" ")} data-node-id="282:7080">
                <div className={[styles.f3, styles.f39, styles.f187, styles.f188].join(" ")} data-node-id="282:7081">
                  <div className={[styles.f3, styles.f130].join(" ")}>
                    <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgEllipse24} />
                  </div>
                </div>
                <div className={[styles.f3, styles.f71, styles.f26, styles.f72, styles.f75, styles.f39, styles.f131, styles.f132, styles.f42, styles.f185].join(" ")} data-node-id="282:7082" data-name="Header">
                  <div className={[styles.f134, styles.f1, styles.f93, styles.f80].join(" ")} data-node-id="282:7372" data-name="Status-Bar">
                    <div className={[styles.f3, styles.f189].join(" ")} data-node-id="282:7373" data-name="Battery">
                      <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgBattery1} />
                    </div>
                    <div className={[styles.f3, styles.f136].join(" ")} data-node-id="282:7377" data-name="Wifi">
                      <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgWifi1} />
                    </div>
                    <div className={[styles.f3, styles.f137].join(" ")} data-node-id="282:7381" data-name="Mobile Signal">
                      <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgMobileSignal1} />
                    </div>
                    <div className={[styles.f3, styles.f138].join(" ")} data-node-id="282:7386" data-name="Time Style">
                      <div className={[styles.f107, styles.f3, styles.f26, styles.f72, styles.f139, styles.f140, styles.f190, styles.f142, styles.f143, styles.f144, styles.f112, styles.f145, styles.f146, styles.f147].join(" ")} data-node-id="282:7387">
                        <p className={[styles.f148].join(" ")}>9:41</p>
                      </div>
                    </div>
                  </div>
                  <div className={[styles.f71, styles.f26, styles.f28, styles.f191, styles.f151, styles.f192, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:7099" data-name="Top">
                    <div className={[styles.f71, styles.f26, styles.f193, styles.f28, styles.f194, styles.f195, styles.f1, styles.f196, styles.f93].join(" ")} data-node-id="282:7100">
                      <div className={[styles.f197, styles.f198, styles.f97, styles.f126, styles.f19, styles.f1, styles.f199, styles.f93, styles.f200].join(" ")} data-node-id="282:7101">
                        <div className={[styles.f53, styles.f3, styles.f201, styles.f173, styles.f42, styles.f202].join(" ")} data-node-id="282:7102" data-name="Pexels Photo by mohamed abdelghaffar">
                          <img alt="" className={[styles.f3, styles.f22, styles.f10, styles.f86, styles.f83, styles.f2].join(" ")} src={imgPexelsPhotoByMohamedAbdelghaffar} />
                        </div>
                      </div>
                      <div className={[styles.f1, styles.f93, styles.f203].join(" ")} data-node-id="282:7103" data-name="Frame">
                        <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame7} />
                      </div>
                    </div>
                    <div className={[styles.f71, styles.f26, styles.f204, styles.f205, styles.f28, styles.f1, styles.f93].join(" ")} data-node-id="282:7106">
                      <div className={[styles.f71, styles.f26, styles.f206, styles.f28, styles.f29, styles.f1, styles.f196, styles.f93, styles.f207].join(" ")} data-node-id="282:7107">
                        <div className={[styles.f1, styles.f93, styles.f203].join(" ")} data-node-id="282:7108" data-name="Frame">
                          <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame8} />
                        </div>
                      </div>
                      <div className={[styles.f71, styles.f26, styles.f206, styles.f28, styles.f29, styles.f1, styles.f196, styles.f93, styles.f207].join(" ")} data-node-id="282:7112">
                        <div className={[styles.f1, styles.f93, styles.f203].join(" ")} data-node-id="282:7113" data-name="Bell">
                          <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgBell} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={[styles.f3, styles.f71, styles.f26, styles.f72, styles.f73, styles.f75, styles.f39, styles.f208, styles.f151, styles.f192, styles.f209, styles.f185].join(" ")} data-node-id="282:7114">
                  <div className={[styles.f71, styles.f26, styles.f72, styles.f193, styles.f75, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:7115">
                    <div className={[styles.f71, styles.f26, styles.f193, styles.f28, styles.f1, styles.f93].join(" ")} data-node-id="282:7116">
                      <p className={[styles.f107, styles.f108, styles.f118, styles.f165, styles.f1, styles.f93, styles.f210, styles.f113, styles.f121].join(" ")} data-node-id="282:7117">
                        Total Balance
                      </p>
                      <div className={[styles.f1, styles.f93, styles.f102].join(" ")} data-node-id="282:7118">
                        <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame282} />
                      </div>
                    </div>
                    <div className={[styles.f71, styles.f26, styles.f72, styles.f193, styles.f75, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:7123">
                      <div className={[styles.f107, styles.f71, styles.f26, styles.f75, styles.f211, styles.f1, styles.f93, styles.f158, styles.f212, styles.f121].join(" ")} data-node-id="282:7124">
                        <p className={[styles.f108, styles.f118, styles.f1, styles.f93, styles.f112].join(" ")} data-node-id="282:7125">
                          <RollText from="$ 2.032" to="$ 2.045" progress={balance} stagger={lag} />
                        </p>
                        <p className={[styles.f108, styles.f115, styles.f1, styles.f93, styles.f116].join(" ")} data-node-id="282:7126">
                          <RollText from=",03" to=",20" progress={cents} stagger={lag} />
                        </p>
                      </div>
                      <div className={[styles.f71, styles.f26, styles.f75, styles.f1, styles.f93].join(" ")} data-node-id="282:7127">
                        <div className={[styles.f1, styles.f93, styles.f203].join(" ")} data-node-id="282:7128" data-name="Frame">
                          <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame9} />
                        </div>
                        <div className={[styles.f107, styles.f71, styles.f26, styles.f105, styles.f28, styles.f213, styles.f1, styles.f93, styles.f214, styles.f113, styles.f121].join(" ")} data-node-id="282:7131">
                          <p className={[styles.f108, styles.f109, styles.f1, styles.f93].join(" ")} data-node-id="282:7132">
                            <RollText from="$83.20" to="$96.37" progress={change} stagger={lag} />
                          </p>
                          <p className={[styles.f108, styles.f118, styles.f1, styles.f93].join(" ")} data-node-id="282:7133">
                            <RollText from="(12%)" to="(13%)" progress={change} stagger={lag} />
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={[styles.f71, styles.f26, styles.f92, styles.f28, styles.f29, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:7134">
                    <div className={[styles.f96, styles.f97, styles.f126, styles.f71, styles.f26, styles.f104, styles.f193, styles.f28, styles.f29, styles.f106, styles.f19, styles.f77, styles.f98, styles.f1, styles.f99, styles.f164, styles.buttonRing].join(" ")} data-node-id="282:7135" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 58.66 14.538' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-4.2456e-14 1.3964 -5.6344 2.8731e-13 29.33 -1.4946e-12)'><stop stop-color='rgba(255,255,255,1)' offset='0'/><stop stop-color='rgba(245,245,245,1)' offset='1'/></radialGradient></defs></svg>\")" }}>
                      <div className={[styles.f1, styles.f93, styles.f203].join(" ")} data-node-id="282:7136" data-name="Frame">
                        <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame10} />
                      </div>
                      <p className={[styles.f107, styles.f108, styles.f109, styles.f165, styles.f1, styles.f93, styles.f166, styles.f113, styles.f167, styles.f121].join(" ")} data-node-id="282:7140">
                        Deposit
                      </p>
                    </div>
                    <div className={[styles.f96, styles.f97, styles.f126, styles.f71, styles.f26, styles.f104, styles.f193, styles.f28, styles.f29, styles.f106, styles.f19, styles.f77, styles.f98, styles.f1, styles.f99, styles.f164, styles.buttonRing].join(" ")} data-node-id="282:7141" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 58.66 14.538' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-4.2456e-14 1.3964 -5.6344 2.8731e-13 29.33 -1.4946e-12)'><stop stop-color='rgba(255,255,255,1)' offset='0'/><stop stop-color='rgba(245,245,245,1)' offset='1'/></radialGradient></defs></svg>\")" }}>
                      <div className={[styles.f26, styles.f28, styles.f29, styles.f1, styles.f93].join(" ")} data-node-id="282:7142">
                        <div className={[styles.f33, styles.f34].join(" ")}>
                          <div className={[styles.f1, styles.f203].join(" ")} data-name="Frame">
                            <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame11} />
                          </div>
                        </div>
                      </div>
                      <p className={[styles.f107, styles.f108, styles.f109, styles.f165, styles.f1, styles.f93, styles.f166, styles.f113, styles.f167, styles.f121].join(" ")} data-node-id="282:7146">
                        Deposit
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={[styles.f215, styles.f216, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:7147" />
              <div className={[styles.f71, styles.f26, styles.f72, styles.f75, styles.f208, styles.f1, styles.f93, styles.f185].join(" ")} data-node-id="282:7148">
                <div className={[styles.f71, styles.f26, styles.f28, styles.f191, styles.f217, styles.f192, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:7149">
                  <div className={[styles.f107, styles.f71, styles.f26, styles.f193, styles.f28, styles.f1, styles.f93, styles.f116, styles.f218, styles.f121].join(" ")} data-node-id="282:7150">
                    <p className={[styles.f108, styles.f109, styles.f220, styles.f1, styles.f93, styles.f221].join(" ")} data-node-id="282:7151">
                      Portfolio
                    </p>
                    <p className={[styles.f108, styles.f118, styles.f165, styles.f1, styles.f93, styles.f113].join(" ")} data-node-id="282:7152">
                      (5)
                    </p>
                  </div>
                  <div className={[styles.f71, styles.f26, styles.f193, styles.f28, styles.f1, styles.f93].join(" ")} data-node-id="282:7153">
                    <p className={[styles.f107, styles.f108, styles.f109, styles.f165, styles.f1, styles.f93, styles.f112, styles.f113, styles.f167, styles.f121].join(" ")} data-node-id="282:7154">
                      Show More
                    </p>
                    <div className={[styles.f1, styles.f93, styles.f223].join(" ")} data-node-id="282:7155" data-name="Frame">
                      <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame12} />
                    </div>
                  </div>
                </div>
                <div className={[styles.f71, styles.f26, styles.f204, styles.f75, styles.f151, styles.f192, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:7159" ref={portfolioRow} style={{ transform: `translateX(${-layout.slide * slide}px)` }}>
                  <div className={[styles.f224, styles.f97, styles.f225, styles.f71, styles.f26, styles.f72, styles.f75, styles.f1, styles.f93, styles.f226].join(" ")} data-node-id="282:7160">
                    <div className={[styles.f71, styles.f26, styles.f156, styles.f28, styles.f227, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="I282:7160;2307:5633">
                      <div className={[styles.f96, styles.f97, styles.f126, styles.f71, styles.f26, styles.f28, styles.f29, styles.f123, styles.f1, styles.f228, styles.f93].join(" ")} data-node-id="I282:7160;2307:5634" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 13.076 13.076' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(4.0033e-17 0.65379 -0.65379 4.0033e-17 6.5379 6.5379)'><stop stop-color='rgba(255,255,255,1)' offset='0.75'/><stop stop-color='rgba(245,245,245,1)' offset='1'/></radialGradient></defs></svg>\")" }}>
                        <div className={[styles.f1, styles.f93, styles.f203].join(" ")} data-node-id="I282:7160;2307:5954" data-name="Frame">
                          <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame13} />
                        </div>
                      </div>
                      <div className={[styles.f26, styles.f229, styles.f28, styles.f230].join(" ")} data-node-id="I282:7160;2307:5638">
                        <div className={[styles.f71, styles.f26, styles.f72, styles.f231, styles.f75, styles.f191, styles.f1, styles.f93].join(" ")}>
                          <p className={[styles.f107, styles.f108, styles.f109, styles.f165, styles.f1, styles.f93, styles.f112, styles.f232, styles.f121].join(" ")} data-node-id="I282:7160;2307:5639">
                            Investment
                          </p>
                          <div className={[styles.f71, styles.f26, styles.f28, styles.f1, styles.f93].join(" ")} data-node-id="I282:7160;2307:5640">
                            <div className={[styles.f107, styles.f26, styles.f72, styles.f108, styles.f118, styles.f233, styles.f29, styles.f143, styles.f1, styles.f93, styles.f116, styles.f234, styles.f235].join(" ")} data-node-id="I282:7160;2307:5641">
                              <p className={[styles.f213].join(" ")}>4 Asset</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={[styles.f236, styles.f96, styles.f97, styles.f126, styles.f71, styles.f26, styles.f72, styles.f237, styles.f238, styles.f28, styles.f19, styles.f123, styles.f1, styles.f253, styles.f254, styles.f93, styles.f241, styles.f94].join(" ")} data-node-id="I282:7160;2307:5642">
                      <div className={[styles.f71, styles.f26, styles.f72, styles.f204, styles.f75, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="I282:7160;2307:5643">
                        <div className={[styles.f71, styles.f26, styles.f28, styles.f191, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="I282:7160;2307:5644">
                          <div className={[styles.f107, styles.f71, styles.f26, styles.f75, styles.f220, styles.f1, styles.f93, styles.f242, styles.f121].join(" ")} data-node-id="I282:7160;2307:5645">
                            <p className={[styles.f108, styles.f118, styles.f1, styles.f93, styles.f112].join(" ")} data-node-id="I282:7160;2307:5646">
                              <RollText from="$827" to="$839" progress={invest} stagger={lag} />
                            </p>
                            <p className={[styles.f108, styles.f115, styles.f1, styles.f93, styles.f116].join(" ")} data-node-id="I282:7160;2307:5647">
                              <RollText from=",20" to=",55" progress={invest} stagger={lag} />
                            </p>
                          </div>
                          <div className={[styles.f71, styles.f26, styles.f243, styles.f244, styles.f1, styles.f93].join(" ")} data-node-id="I282:7160;2307:5648">
                            <div className={[styles.f245, styles.f1, styles.f93, styles.f223, styles.f246].join(" ")} data-node-id="I282:7160;2307:5649" data-name="Cryptocurrency">
                              <div className={[styles.f3, styles.f247].join(" ")}>
                                <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgCryptocurrency} />
                              </div>
                            </div>
                            <div className={[styles.f245, styles.f1, styles.f93, styles.f223, styles.f248].join(" ")} data-node-id="I282:7160;2307:5650" data-name="Cryptocurrency">
                              <div className={[styles.f3, styles.f247].join(" ")}>
                                <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgCryptocurrency1} />
                              </div>
                            </div>
                            <div className={[styles.f245, styles.f1, styles.f93, styles.f223, styles.f249].join(" ")} data-node-id="I282:7160;2307:5651" data-name="Cryptocurrency">
                              <div className={[styles.f3, styles.f247].join(" ")}>
                                <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgCryptocurrency2} />
                              </div>
                            </div>
                            <div className={[styles.f1, styles.f93, styles.f223, styles.f250].join(" ")} data-node-id="I282:7160;2307:5652" data-name="Cryptocurrency">
                              <div className={[styles.f3, styles.f247].join(" ")}>
                                <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgCryptocurrency3} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={[styles.f71, styles.f26, styles.f28, styles.f191, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="I282:7160;2307:5653">
                          <p className={[styles.f107, styles.f108, styles.f118, styles.f251, styles.f1, styles.f93, styles.f116, styles.f252, styles.f121].join(" ")} data-node-id="I282:7160;2307:5654">
                            This Month
                          </p>
                          <div className={[styles.f71, styles.f26, styles.f75, styles.f1, styles.f93].join(" ")} data-node-id="I282:7160;2307:5655">
                            <div className={[styles.f1, styles.f93, styles.f223].join(" ")} data-node-id="I282:7160;2307:5656" data-name="Frame">
                              <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame14} />
                            </div>
                            <div className={[styles.f107, styles.f71, styles.f26, styles.f105, styles.f28, styles.f251, styles.f1, styles.f93, styles.f214, styles.f252, styles.f121].join(" ")} data-node-id="I282:7160;2307:5659">
                              <p className={[styles.f108, styles.f109, styles.f1, styles.f93].join(" ")} data-node-id="I282:7160;2307:5660">
                                <RollText from="$34" to="$46" progress={invest} stagger={lag} />
                              </p>
                              <p className={[styles.f108, styles.f118, styles.f1, styles.f93].join(" ")} data-node-id="I282:7160;2307:5661">
                                <RollText from="(24,3%)" to="(27,1%)" progress={invest} stagger={lag} />
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={[styles.f224, styles.f97, styles.f225, styles.f71, styles.f26, styles.f72, styles.f75, styles.f1, styles.f93, styles.f226].join(" ")} data-node-id="282:7161" ref={savingCard}>
                    <div className={[styles.f71, styles.f26, styles.f156, styles.f28, styles.f227, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:7162">
                      <div className={[styles.f96, styles.f97, styles.f126, styles.f71, styles.f26, styles.f28, styles.f29, styles.f123, styles.f1, styles.f196, styles.f93].join(" ")} data-node-id="282:7163" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 13.076 13.076' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(4.0033e-17 0.65379 -0.65379 4.0033e-17 6.5379 6.5379)'><stop stop-color='rgba(255,255,255,1)' offset='0.75'/><stop stop-color='rgba(245,245,245,1)' offset='1'/></radialGradient></defs></svg>\")" }}>
                        <div className={[styles.f1, styles.f93, styles.f203].join(" ")} data-node-id="282:7164" data-name="Frame">
                          <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame15} />
                        </div>
                      </div>
                      <div className={[styles.f26, styles.f229, styles.f28, styles.f230].join(" ")} data-node-id="282:7167">
                        <div className={[styles.f71, styles.f26, styles.f72, styles.f231, styles.f75, styles.f191, styles.f1, styles.f93].join(" ")}>
                          <p className={[styles.f107, styles.f108, styles.f109, styles.f165, styles.f1, styles.f93, styles.f112, styles.f113, styles.f121].join(" ")} data-node-id="282:7168">
                            Saving
                          </p>
                          <div className={[styles.f71, styles.f26, styles.f28, styles.f1, styles.f93].join(" ")} data-node-id="282:7169">
                            <div className={[styles.f107, styles.f26, styles.f72, styles.f108, styles.f118, styles.f233, styles.f29, styles.f143, styles.f1, styles.f93, styles.f116, styles.f120, styles.f235].join(" ")} data-node-id="282:7170">
                              <p className={[styles.f213].join(" ")}>2 Asset</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={[styles.f236, styles.f96, styles.f97, styles.f126, styles.f71, styles.f26, styles.f72, styles.f237, styles.f238, styles.f28, styles.f19, styles.f123, styles.f1, styles.f253, styles.f254, styles.f93, styles.f241, styles.f94].join(" ")} data-node-id="282:7171">
                      <div className={[styles.f71, styles.f26, styles.f72, styles.f204, styles.f75, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:7172">
                        <div className={[styles.f71, styles.f26, styles.f28, styles.f191, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:7173">
                          <div className={[styles.f107, styles.f71, styles.f26, styles.f75, styles.f220, styles.f1, styles.f93, styles.f221, styles.f121].join(" ")} data-node-id="282:7174">
                            <p className={[styles.f108, styles.f118, styles.f1, styles.f93, styles.f112].join(" ")} data-node-id="282:7175">
                              $1.203
                            </p>
                            <p className={[styles.f108, styles.f115, styles.f1, styles.f93, styles.f116].join(" ")} data-node-id="282:7176">
                              ,83
                            </p>
                          </div>
                          <div className={[styles.f71, styles.f26, styles.f243, styles.f244, styles.f1, styles.f93].join(" ")} data-node-id="282:7177">
                            <div className={[styles.f245, styles.f1, styles.f93, styles.f223, styles.f246].join(" ")} data-node-id="282:7178" data-name="Cryptocurrency">
                              <div className={[styles.f3, styles.f255].join(" ")}>
                                <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgCryptocurrency4} />
                              </div>
                            </div>
                            <div className={[styles.f245, styles.f1, styles.f93, styles.f223, styles.f248].join(" ")} data-node-id="282:7179" data-name="Cryptocurrency">
                              <div className={[styles.f3, styles.f255].join(" ")}>
                                <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgCryptocurrency5} />
                              </div>
                            </div>
                            <div className={[styles.f245, styles.f1, styles.f93, styles.f223, styles.f249].join(" ")} data-node-id="282:7180" data-name="Cryptocurrency">
                              <div className={[styles.f3, styles.f255].join(" ")}>
                                <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgCryptocurrency6} />
                              </div>
                            </div>
                            <div className={[styles.f1, styles.f93, styles.f223, styles.f250].join(" ")} data-node-id="282:7181" data-name="Cryptocurrency">
                              <div className={[styles.f3, styles.f255].join(" ")}>
                                <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgCryptocurrency7} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={[styles.f71, styles.f26, styles.f28, styles.f191, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:7182">
                          <p className={[styles.f107, styles.f108, styles.f118, styles.f251, styles.f1, styles.f93, styles.f116, styles.f256, styles.f121].join(" ")} data-node-id="282:7183">
                            This Month
                          </p>
                          <div className={[styles.f71, styles.f26, styles.f75, styles.f1, styles.f93].join(" ")} data-node-id="282:7184">
                            <div className={[styles.f1, styles.f93, styles.f223].join(" ")} data-node-id="282:7185" data-name="Frame">
                              <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame16} />
                            </div>
                            <div className={[styles.f107, styles.f71, styles.f26, styles.f105, styles.f28, styles.f251, styles.f1, styles.f93, styles.f214, styles.f256, styles.f121].join(" ")} data-node-id="282:7188">
                              <p className={[styles.f108, styles.f109, styles.f1, styles.f93].join(" ")} data-node-id="282:7189">
                                $120
                              </p>
                              <p className={[styles.f108, styles.f118, styles.f1, styles.f93].join(" ")} data-node-id="282:7190">
                                (240%)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={[styles.f215, styles.f216, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:7191" />
              <div className={[styles.f71, styles.f26, styles.f72, styles.f75, styles.f1, styles.f93, styles.f185].join(" ")} data-node-id="282:7192">
                <div className={[styles.f71, styles.f26, styles.f28, styles.f19, styles.f151, styles.f192, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:7193">
                  <p className={[styles.f107, styles.f108, styles.f109, styles.f220, styles.f1, styles.f93, styles.f116, styles.f221, styles.f121].join(" ")} data-node-id="282:7194">
                    Explore
                  </p>
                </div>
                <div className={[styles.f71, styles.f26, styles.f75, styles.f191, styles.f257, styles.f192, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:7195" ref={tabsRow} style={{ position: 'relative' }}>
                  {pillBox && <div className={[styles.f236, styles.f96, styles.f97, styles.f126, styles.f258, styles.f261, styles.f262, styles.f196, styles.tabPill].join(" ")} style={pillBox} aria-hidden />}
                  <div className={[styles.f96, styles.f97, styles.f71, styles.f26, styles.f28, styles.f29, styles.f19, styles.f259, styles.f260, styles.f1, styles.f196, styles.f93].join(" ")} data-node-id="282:7196" ref={el => { tabRefs.current[0] = el; }} style={{ position: 'relative', borderColor: 'transparent' }}>
                    <p className={[styles.f107, styles.f108, styles.f109, styles.f213, styles.f1, styles.f93, styles.f112, styles.f120, styles.f121].join(" ")} data-node-id="282:7197" style={{ color: tabColor(0) }}>
                      Most Popular
                    </p>
                  </div>
                  <div className={[styles.f71, styles.f26, styles.f28, styles.f29, styles.f19, styles.f259, styles.f260, styles.f1, styles.f196, styles.f93].join(" ")} data-node-id="282:7198" ref={el => { tabRefs.current[1] = el; }} style={{ position: 'relative' }}>
                    <p className={[styles.f107, styles.f108, styles.f118, styles.f213, styles.f1, styles.f93, styles.f116, styles.f120, styles.f121].join(" ")} data-node-id="282:7199" style={{ color: tabColor(1) }}>
                      Newest
                    </p>
                  </div>
                  <div className={[styles.f71, styles.f26, styles.f28, styles.f29, styles.f19, styles.f259, styles.f260, styles.f1, styles.f196, styles.f93].join(" ")} data-node-id="282:7200" ref={el => { tabRefs.current[2] = el; }} style={{ position: 'relative' }}>
                    <p className={[styles.f107, styles.f108, styles.f118, styles.f213, styles.f1, styles.f93, styles.f116, styles.f120, styles.f121].join(" ")} data-node-id="282:7201" style={{ color: tabColor(2) }}>
                      Gainers
                    </p>
                  </div>
                  <div className={[styles.f71, styles.f26, styles.f28, styles.f29, styles.f19, styles.f259, styles.f260, styles.f1, styles.f196, styles.f93].join(" ")} data-node-id="282:7202" ref={el => { tabRefs.current[3] = el; }} style={{ position: 'relative' }}>
                    <p className={[styles.f107, styles.f108, styles.f118, styles.f213, styles.f1, styles.f93, styles.f116, styles.f120, styles.f121].join(" ")} data-node-id="282:7203" style={{ color: tabColor(3) }}>
                      Most Visited
                    </p>
                  </div>
                </div>
                <div className={[styles.f71, styles.f26, styles.f75, styles.f263, styles.f257, styles.f259, styles.f1, styles.f93, styles.f94].join(" ")} data-node-id="282:7204">
                  <div className={[styles.f71, styles.f26, styles.f104, styles.f72, styles.f193, styles.f75, styles.f106, styles.f1, styles.f264].join(" ")} data-node-id="282:7205">
                    <div className={[styles.f236, styles.f96, styles.f97, styles.f126, styles.f71, styles.f26, styles.f238, styles.f156, styles.f28, styles.f19, styles.f265, styles.f1, styles.f264, styles.f254, styles.f93, styles.f241, styles.f94].join(" ")} data-node-id="282:7206">
                      <div className={[styles.f1, styles.f93, styles.f266].join(" ")} data-node-id="282:7207" data-name="Cryptocurrency">
                        <div className={[styles.f3, styles.f267].join(" ")}>
                          <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgCryptocurrency8} />
                        </div>
                      </div>
                      <div className={[styles.f107, styles.f71, styles.f26, styles.f104, styles.f72, styles.f75, styles.f29, styles.f106, styles.f1, styles.f121].join(" ")} data-node-id="282:7208">
                        <p className={[styles.f108, styles.f118, styles.f213, styles.f1, styles.f93, styles.f116, styles.f120].join(" ")} data-node-id="282:7209">
                          BTC
                        </p>
                        <p className={[styles.f108, styles.f109, styles.f165, styles.f1, styles.f93, styles.f112, styles.f113].join(" ")} data-node-id="282:7210">
                          Bitcoin
                        </p>
                      </div>
                      <div className={[styles.f71, styles.f26, styles.f104, styles.f72, styles.f244, styles.f29, styles.f106, styles.f1].join(" ")} data-node-id="282:7211">
                        <div className={[styles.f71, styles.f26, styles.f105, styles.f75, styles.f1, styles.f93].join(" ")} data-node-id="282:7212">
                          <div className={[styles.f26, styles.f28, styles.f29, styles.f1, styles.f93].join(" ")} data-node-id="282:7213">
                            <div className={[styles.f33, styles.f34].join(" ")}>
                              <div className={[styles.f1, styles.f223].join(" ")} data-name="Frame">
                                <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame17} />
                              </div>
                            </div>
                          </div>
                          <div className={[styles.f71, styles.f26, styles.f28, styles.f1, styles.f93].join(" ")} data-node-id="282:7216">
                            <p className={[styles.f107, styles.f108, styles.f109, styles.f251, styles.f1, styles.f93, styles.f268, styles.f256, styles.f121].join(" ")} data-node-id="282:7217">
                              <RollText from="6.33%" to="6.18%" progress={btc} stagger={lag} />
                            </p>
                          </div>
                        </div>
                        <div className={[styles.f107, styles.f71, styles.f26, styles.f75, styles.f165, styles.f1, styles.f93, styles.f113, styles.f121].join(" ")} data-node-id="282:7218">
                          <p className={[styles.f108, styles.f118, styles.f1, styles.f93, styles.f112].join(" ")} data-node-id="282:7219">
                            <RollText from="$98,711" to="$98,764" progress={btc} stagger={lag} />
                          </p>
                          <p className={[styles.f108, styles.f115, styles.f1, styles.f93, styles.f116].join(" ")} data-node-id="282:7220">
                            <RollText from=",79" to=",12" progress={btc} stagger={lag} />
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className={[styles.f236, styles.f96, styles.f97, styles.f126, styles.f71, styles.f26, styles.f238, styles.f156, styles.f28, styles.f19, styles.f265, styles.f1, styles.f264, styles.f254, styles.f93, styles.f241, styles.f94].join(" ")} data-node-id="282:7221">
                      <div className={[styles.f1, styles.f93, styles.f266].join(" ")} data-node-id="282:7222" data-name="Cryptocurrency">
                        <div className={[styles.f3, styles.f267].join(" ")}>
                          <img alt="" className={[styles.f9, styles.f10].join(" ")} src={imgCryptocurrency9} />
                        </div>
                      </div>
                      <div className={[styles.f107, styles.f71, styles.f26, styles.f104, styles.f72, styles.f75, styles.f29, styles.f106, styles.f1, styles.f121].join(" ")} data-node-id="282:7223">
                        <p className={[styles.f108, styles.f118, styles.f213, styles.f1, styles.f93, styles.f116, styles.f120].join(" ")} data-node-id="282:7224">
                          ETH
                        </p>
                        <p className={[styles.f108, styles.f109, styles.f165, styles.f1, styles.f93, styles.f112, styles.f113].join(" ")} data-node-id="282:7225">
                          Ethereum
                        </p>
                      </div>
                      <div className={[styles.f71, styles.f26, styles.f104, styles.f72, styles.f244, styles.f29, styles.f106, styles.f1].join(" ")} data-node-id="282:7226">
                        <div className={[styles.f71, styles.f26, styles.f105, styles.f75, styles.f1, styles.f93].join(" ")} data-node-id="282:7227">
                          {/* Ethereum turns up: its red down arrow flips over to the green up arrow. */}
                          <Flip progress={eth} front={
                          <div className={[styles.f26, styles.f28, styles.f29, styles.f1, styles.f93].join(" ")} data-node-id="282:7228">
                            <div className={[styles.f33, styles.f34].join(" ")}>
                              <div className={[styles.f1, styles.f223].join(" ")} data-name="Frame">
                                <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame18} />
                              </div>
                            </div>
                          </div>} back={
                          <div className={[styles.f1, styles.f93, styles.f223].join(" ")}>
                            <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame19} />
                          </div>} />
                          <div className={[styles.f71, styles.f26, styles.f28, styles.f1, styles.f93].join(" ")} data-node-id="282:7231">
                            <p className={[styles.f107, styles.f108, styles.f109, styles.f251, styles.f1, styles.f93, styles.f268, styles.f256, styles.f121].join(" ")} data-node-id="282:7232">
                              <RollText from="15.49%" to="12.07%" progress={eth} stagger={lag} toClassName={styles.f214} />
                            </p>
                          </div>
                        </div>
                        <div className={[styles.f107, styles.f71, styles.f26, styles.f75, styles.f165, styles.f1, styles.f93, styles.f113, styles.f121].join(" ")} data-node-id="282:7233">
                          <p className={[styles.f108, styles.f118, styles.f1, styles.f93, styles.f112].join(" ")} data-node-id="282:7234">
                            <RollText from="$2,711" to="$2,736" progress={eth} stagger={lag} />
                          </p>
                          <p className={[styles.f108, styles.f115, styles.f1, styles.f93, styles.f116].join(" ")} data-node-id="282:7235">
                            <RollText from=",89" to=",40" progress={eth} stagger={lag} />
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className={[styles.f236, styles.f96, styles.f97, styles.f126, styles.f71, styles.f26, styles.f238, styles.f156, styles.f28, styles.f19, styles.f265, styles.f1, styles.f264, styles.f254, styles.f93, styles.f241, styles.f94].join(" ")} data-node-id="282:7236">
                      <div className={[styles.f1, styles.f93, styles.f266].join(" ")} data-node-id="282:7237" data-name="Cryptocurrency">
                        <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgCryptocurrency10} />
                      </div>
                      <div className={[styles.f107, styles.f71, styles.f26, styles.f104, styles.f72, styles.f75, styles.f29, styles.f106, styles.f1, styles.f121].join(" ")} data-node-id="282:7238">
                        <p className={[styles.f108, styles.f118, styles.f213, styles.f1, styles.f93, styles.f116, styles.f120].join(" ")} data-node-id="282:7239">
                          USDT
                        </p>
                        <p className={[styles.f108, styles.f109, styles.f165, styles.f1, styles.f93, styles.f112, styles.f113].join(" ")} data-node-id="282:7240">
                          Tether
                        </p>
                      </div>
                      <div className={[styles.f71, styles.f26, styles.f104, styles.f72, styles.f244, styles.f29, styles.f106, styles.f1].join(" ")} data-node-id="282:7241">
                        <div className={[styles.f71, styles.f26, styles.f105, styles.f75, styles.f1, styles.f93].join(" ")} data-node-id="282:7242">
                          <div className={[styles.f1, styles.f93, styles.f223].join(" ")} data-node-id="282:7243" data-name="Frame">
                            <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame19} />
                          </div>
                          <div className={[styles.f71, styles.f26, styles.f28, styles.f1, styles.f93].join(" ")} data-node-id="282:7246">
                            <p className={[styles.f107, styles.f108, styles.f118, styles.f251, styles.f1, styles.f93, styles.f214, styles.f256, styles.f121].join(" ")} data-node-id="282:7247">
                              <RollText from="3.12%" to="3.15%" progress={usdt} stagger={lag} />
                            </p>
                          </div>
                        </div>
                        <div className={[styles.f107, styles.f71, styles.f26, styles.f75, styles.f165, styles.f1, styles.f93, styles.f113, styles.f121].join(" ")} data-node-id="282:7248">
                          <p className={[styles.f108, styles.f118, styles.f1, styles.f93, styles.f112].join(" ")} data-node-id="282:7249">
                            $1,00
                          </p>
                          <p className={[styles.f108, styles.f115, styles.f1, styles.f93, styles.f116].join(" ")} data-node-id="282:7250">
                            ,00
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className={[styles.f236, styles.f96, styles.f97, styles.f126, styles.f71, styles.f26, styles.f238, styles.f156, styles.f28, styles.f19, styles.f265, styles.f1, styles.f264, styles.f254, styles.f93, styles.f241, styles.f94].join(" ")} data-node-id="282:7251">
                      <div className={[styles.f1, styles.f93, styles.f266].join(" ")} data-node-id="282:7252" data-name="Cryptocurrency">
                        <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgCryptocurrency11} />
                      </div>
                      <div className={[styles.f107, styles.f71, styles.f26, styles.f104, styles.f72, styles.f108, styles.f118, styles.f75, styles.f29, styles.f106, styles.f1, styles.f121].join(" ")} data-node-id="282:7263">
                        <p className={[styles.f213, styles.f1, styles.f93, styles.f116, styles.f120].join(" ")} data-node-id="282:7264">
                          DOGE
                        </p>
                        <p className={[styles.f165, styles.f1, styles.f93, styles.f112, styles.f113].join(" ")} data-node-id="282:7265">
                          Dogecoin
                        </p>
                      </div>
                      <div className={[styles.f71, styles.f26, styles.f104, styles.f72, styles.f244, styles.f29, styles.f106, styles.f1].join(" ")} data-node-id="282:7266">
                        <div className={[styles.f71, styles.f26, styles.f105, styles.f75, styles.f1, styles.f93].join(" ")} data-node-id="282:7267">
                          <div className={[styles.f1, styles.f93, styles.f223].join(" ")} data-node-id="282:7268" data-name="Frame">
                            <img alt="" className={[styles.f3, styles.f9, styles.f22, styles.f10].join(" ")} src={imgFrame20} />
                          </div>
                          <div className={[styles.f71, styles.f26, styles.f28, styles.f1, styles.f93].join(" ")} data-node-id="282:7271">
                            <p className={[styles.f107, styles.f108, styles.f118, styles.f251, styles.f1, styles.f93, styles.f214, styles.f256, styles.f121].join(" ")} data-node-id="282:7272">
                              <RollText from="8.23%" to="8.87%" progress={doge} stagger={lag} />
                            </p>
                          </div>
                        </div>
                        <div className={[styles.f107, styles.f71, styles.f26, styles.f108, styles.f118, styles.f75, styles.f165, styles.f1, styles.f93, styles.f112, styles.f113, styles.f121].join(" ")} data-node-id="282:7273">
                          <p className={[styles.f1, styles.f93].join(" ")} data-node-id="282:7274">
                            <RollText from="$0,2643" to="$0,2671" progress={doge} stagger={lag} />
                          </p>
                          <p className={[styles.f269, styles.f1, styles.f93].join(" ")} data-node-id="282:7275">
                            ,00
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.screenFade} data-node-id="293:2215" aria-hidden="true" />
            <div className={[styles.f53, styles.f3, styles.f172, styles.f173, styles.f174, styles.f175].join(" ")} data-node-id="282:6411" data-name="Dynamic Island">
              <div className={[styles.f3, styles.f60, styles.f176, styles.f177, styles.f178, styles.f179, styles.f180].join(" ")} data-node-id="282:6412" data-name="Background" />
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
