import avatar from './assets/images/avatar.png';
import arrowUpRight from './assets/icons/arrow-up-right.svg';
import bell from './assets/icons/bell.svg';
import calendar from './assets/icons/calendar.svg';
import caretDown from './assets/icons/caret-down.svg';
import caretUpDown from './assets/icons/caret-up-down.svg';
import caretUpDownDark from './assets/icons/caret-up-down-dark.svg';
import caretUpDownSmall from './assets/icons/caret-up-down-small.svg';
import checkCircle from './assets/icons/check-circle.svg';
import companyLogo from './assets/icons/company-logo.svg';
import desktop from './assets/icons/desktop.svg';
import dotBlue from './assets/icons/dot-blue.svg';
import dotGrey from './assets/icons/dot-grey.svg';
import great from './assets/icons/great.svg';
import info from './assets/icons/info.svg';
import list from './assets/icons/list.svg';
import logo from './assets/icons/logo.svg';
import needsImprovement from './assets/icons/needs-improvement.svg';
import poor from './assets/icons/poor.svg';
import scoreBadge from './assets/icons/score-badge.svg';
import scoreBar from './assets/icons/score-bar.svg';
import star from './assets/icons/star.svg';
import starTooltip from './assets/icons/star-tooltip.svg';
import trend1 from './assets/icons/trend-1.svg';
import trend2 from './assets/icons/trend-2.svg';
import trend3 from './assets/icons/trend-3.svg';
import trend4 from './assets/icons/trend-4.svg';
import trend5 from './assets/icons/trend-5.svg';
import trend6 from './assets/icons/trend-6.svg';
import trend7 from './assets/icons/trend-7.svg';
import { RollText, mix } from '../../shared/motion/liveMotion';
import { STATES, blend, stage, velocityDefaults, type VelocitySettings } from './motion';
import styles from './VelocityCard.module.css';

// Figma: Portfolio-2026, "Velocity" 312:2215 (536 × 410.204071): the Insight Performance
// dashboard, built in code, one element per Figma layer (node ids kept) so each part can move.

const navTabs = [
  { label: 'Insight', active: true, node: '312:2243' },
  { label: 'Project', node: '312:2244' },
  { label: 'Analytics', node: '312:2245' },
  { label: 'Logs', node: '312:2246' },
  { label: 'Firewall', node: '312:2247' },
  { label: 'Storage', node: '312:2248' },
];

// The vitals list on the left. Values and bar widths come from the data states (motion.ts, `slot`).
const vitals = [
  { label: 'First Contentful Paint', slot: 0, unit: 'S', unitLeft: 14.48, node: '312:2296' },
  { label: 'Largest Contentful Paint', slot: 1, unit: 'S', unitLeft: 14.48, node: '312:2305' },
  { label: 'Interaction to Next Paint', slot: 2, unit: 'MS', unitLeft: 5.27, node: '312:2314' },
  { label: 'Cumulative Layout Shift', empty: 70.112, node: '312:2323' },
];
const vitalsLater = [
  { label: 'First Input Delay', slot: 3, unit: 'MS', unitLeft: 4.94, node: '312:2327' },
  { label: 'Time to First Byte', slot: 4, unit: 'MS', unitLeft: 4.94, regular: true, node: '312:2336' },
];

const percentiles = [
  { label: 'P75', dot: dotGrey },
  { label: 'P90', dot: dotBlue, active: true },
  { label: 'P95', dot: dotGrey },
  { label: 'P99', dot: dotGrey },
];

// Chart bars, left to right (Figma x and width inside the 143.846px plot). Heights come from the
// data states; every bar stands on the same baseline, 134.629 from the plot's top.
const BASELINE = 134.629;
const bars = [
  { left: 12.51, width: 28.638, node: '312:2451' },
  { left: 41.14, width: 29.296, node: '312:2449' },
  { left: 70.44, width: 28.638, node: '312:2450' },
  { left: 99.08, width: 28.967, node: '312:2454' },
  { left: 128.04, width: 28.638, node: '312:2448' },
  { left: 156.68, width: 29.296, node: '312:2452' },
  { left: 185.98, width: 28.638, node: '312:2453' },
];
// The score bar's ticks (Frame 96): x of each tick; the two tall markers sit at 67.113 and 93.959.
const TICKS = Array.from({ length: 10 }, (_, index) => index * 13.4227);
const MARKERS = [67.113, 93.959];
/** How far the markers slide per point of score. */
const MARKER_PX_PER_POINT = 2.6;
const days = ['SEP 15', 'SEP 16', 'SEP 17', 'SEP 18', 'SEP 19', 'SEP 20', 'SEP 21'];

// Routes under "Great": path, visits (with Figma's text-box width, which sets the spacing), trend
// icon, and the light bar showing its share.
const routes = [
  { path: '/', visits: '23k', visitsWidth: 8, trend: trend1, share: 119.817, node: '312:2507' },
  { path: '/docs', visits: '4.5k', visitsWidth: 9, trend: trend2, share: 32.588, node: '312:2517' },
  { path: '/docs/toast', visits: '1.9k', visitsWidth: 8, trend: trend3, share: 18.762, node: '312:2527' },
  { path: '/docs/styling', visits: '458', visitsWidth: 8, trend: trend4, share: 5.267, node: '312:2537' },
  { path: '/docs/toaster', visits: '420', visitsWidth: 9, trend: trend5, share: 2.304, node: '312:2547' },
  { path: '/docs/use-toaster', visits: '294', visitsWidth: 8, trend: trend6, share: 1.646, node: '312:2557' },
  { path: '/docs/version-2', visits: '123', visitsWidth: 7, trend: trend7, share: 5.267, node: '312:2567' },
];

function Tab({ label, active, node }: { label: string; active?: boolean; node?: string }) {
  return <div className={`${styles.tab} ${active ? styles.tabActive : ''}`} data-node-id={node}><p>{label}</p></div>;
}

type Live = { from: string; to: string; progress: number; bar: number; stagger: number };

function Vital({ vital, live }: { vital: typeof vitals[number] | typeof vitalsLater[number]; live?: Live }) {
  return <div className={styles.vital} data-node-id={vital.node}>
    <p className={styles.vitalLabel}>{vital.label}</p>
    <div className={styles.vitalRow}>
      {'empty' in vital && vital.empty
        ? <div className={styles.vitalBarEmpty} style={{ width: vital.empty }} />
        : live && <>
          <div className={styles.vitalBar} style={{ width: live.bar }} />
          <p className={`${styles.vitalValue} ${'regular' in vital && vital.regular ? styles.regular : ''}`}><RollText from={live.from} to={live.to} progress={live.progress} stagger={live.stagger} /></p>
          <p className={`${styles.vitalUnit} ${'regular' in vital && vital.regular ? styles.regular : ''}`} style={{ left: 'unitLeft' in vital ? vital.unitLeft : 0 }}>{'unit' in vital && vital.unit}</p>
          <p className={styles.vitalGood}>GOOD</p>
          <span className={styles.vitalLine} />
        </>}
    </div>
  </div>;
}

/**
 * `position` is the time in the loop (0 to LOOP_SECONDS) from the lab's timeline; 0 is Figma's
 * layout. See motion.ts for the loop.
 */
export default function VelocityCard({ position = 0, values }: { position?: number; values?: Record<string, Record<string, number | string>> }) {
  const s = { ...velocityDefaults, ...(values?.Velocity as Partial<VelocitySettings> | undefined) };
  const t = position;
  const k = s.Ease;
  const lag = Math.min(0.3, 0.035 / Math.max(0.05, s.RollSeconds));
  // The chart glides first; the numbers roll after it in a wave, `Stagger` seconds apart.
  const chart = stage(t, 0, s.GlideSeconds, k);
  const roll = (order: number) => stage(t, s.GlideSeconds * 0.45 + s.Stagger * order, s.RollSeconds, k);
  const text = (pick: (index: number) => string, at: ReturnType<typeof stage>) => ({ from: pick(at.from), to: pick(at.to), progress: at.progress });

  // The orange selection: its bar's box, blended between the two states' selected bars.
  const heightOf = (index: number, state: number) => mix(STATES[0].heights[index], STATES[state].heights[index], s.DataChange);
  const heights = bars.map((_, index) => blend(state => state.heights[index], chart, s.DataChange));
  const a = STATES[chart.from].selected;
  const b = STATES[chart.to].selected;
  const selected = {
    left: mix(bars[a].left, bars[b].left, chart.progress),
    width: mix(bars[a].width, bars[b].width, chart.progress),
    height: mix(heightOf(a, chart.from), heightOf(b, chart.to), chart.progress),
  };
  const selectedAt = mix(a, b, chart.progress);
  // A day label darkens as the selection reaches its bar (Figma pairs bar n with label n + 1).
  const dayColor = (index: number) => {
    const near = Math.max(0, 1 - Math.abs(index - 1 - selectedAt));
    const c = [161, 161, 161].map((g, i) => Math.round(mix(g, [32, 32, 32][i], near)));
    return `rgb(${c.join(' ')})`;
  };

  const tooltipScore = text(i => STATES[i].score, roll(0));
  const tooltipDate = text(i => STATES[i].date, roll(0.5));
  const panelScore = text(i => STATES[i].score, roll(1));
  const listScore = text(i => STATES[i].score, roll(1.5));
  // The score bar's markers follow the score.
  const scoreNow = blend(state => Number(state.score), roll(1), 1);
  const markerShift = (scoreNow - 97) * MARKER_PX_PER_POINT;
  const vitalLive = (slot: number): Live => {
    const at = roll(2 + slot * 0.6);
    return { ...text(i => STATES[i].vitals[slot].value, at), bar: blend(state => state.vitals[slot].bar, at, s.DataChange), stagger: lag };
  };

  return <figure className={styles.card} aria-label="Velocity" data-node-id="312:2215">
    <div className={styles.dashboard} data-node-id="312:2224">
      {/* Top bar */}
      <div className={styles.topBar} data-node-id="312:2225">
        <div className={styles.brand} data-node-id="312:2226">
          <span className={styles.logo}><img src={logo} alt="" /></span>
          <span className={styles.brandDivider} />
          <div className={styles.company} data-node-id="312:2234">
            <img className={styles.icon6} src={companyLogo} alt="" />
            <p>Company XYZ</p>
            <img className={styles.icon5} src={caretUpDown} alt="" />
          </div>
        </div>
        <div className={styles.navTabs} data-node-id="312:2242">{navTabs.map(tab => <Tab key={tab.label} {...tab} />)}</div>
        <div className={styles.actions} data-node-id="312:2249">
          <img className={styles.bell} src={bell} alt="" />
          <div className={styles.account} data-node-id="312:2256">
            <span className={styles.avatarBox}><img src={avatar} alt="" /></span>
            <span className={styles.listBox}><img className={styles.icon6} src={list} alt="" /></span>
          </div>
        </div>
      </div>

      {/* Title row */}
      <div className={styles.titleRow} data-node-id="312:2266">
        <div className={styles.title} data-node-id="312:2267">
          <h1>Insight Performance</h1>
          <span className={styles.titleCaret}><img className={styles.icon6} src={caretDown} alt="" /></span>
        </div>
        <div className={styles.titleActions} data-node-id="312:2273">
          <div className={styles.select} data-node-id="312:2274">
            <p>Production</p>
            <img className={styles.icon5} src={caretUpDownDark} alt="" />
          </div>
          <div className={styles.tabs} data-node-id="312:2281">
            <Tab label="Desktop" active node="312:2282" />
            <Tab label="Mobile" node="312:2283" />
          </div>
        </div>
      </div>

      <div className={styles.body} data-node-id="312:2284">
        {/* Vitals */}
        <div className={styles.vitals} data-node-id="312:2285">
          <div className={styles.vitalsList} data-node-id="312:2286">
            <div className={styles.scoreItem} data-node-id="312:2287">
              <p className={styles.scoreItemLabel}>Real Experience Score</p>
              <div className={styles.scoreItemRow}>
                <img className={styles.scoreBadge} src={scoreBadge} alt="" />
                <p className={styles.scoreItemValue}><RollText {...listScore} stagger={lag} /></p>
              </div>
            </div>
            {vitals.map(vital => <Vital key={vital.label} vital={vital} live={'slot' in vital && vital.slot !== undefined ? vitalLive(vital.slot) : undefined} />)}
          </div>
          {vitalsLater.map(vital => <Vital key={vital.label} vital={vital} live={vitalLive(vital.slot)} />)}
        </div>

        <div className={styles.main} data-node-id="312:2345">
          {/* Score panel */}
          <div className={styles.panel} data-node-id="312:2346">
            <div className={styles.summary} data-node-id="312:2347">
              <div className={styles.notice} data-node-id="312:2348">
                <img className={styles.icon6} src={info} alt="" />
                <p>More than 75% of visit had a great experience</p>
              </div>
              <div className={styles.scoreBar} data-node-id="312:2355">
                <img className={styles.scoreBarFill} src={scoreBar} alt="" />
                <span className={styles.scoreBaseline} />
                <div className={styles.scoreTicks} aria-hidden>
                  {TICKS.map(x => <span key={x} className={styles.tick} style={{ left: x }} />)}
                  {MARKERS.map(x => <span key={x} className={styles.marker} style={{ left: x + markerShift }} />)}
                </div>
                <div className={styles.scoreLabel} data-node-id="312:2369">
                  <div className={styles.scoreKicker}><img className={styles.icon6} src={star} alt="" /><p>Score</p></div>
                  <p className={styles.scoreValue}><RollText {...panelScore} stagger={lag} /></p>
                </div>
              </div>
              <div className={styles.heading} data-node-id="312:2376">
                <p className={styles.headingTitle}>Real Experience Score</p>
                <div className={styles.meta}>
                  <div className={styles.metaItem}><img className={styles.icon6} src={checkCircle} alt="" /><p style={{ width: 13 }}>Great</p><p className={styles.muted} style={{ width: 23 }}>(Above 80)</p></div>
                  <p className={`${styles.muted} ${styles.regular}`}>•</p>
                  <div className={styles.metaItem}><img className={styles.icon6} src={desktop} alt="" /><p className={styles.muted} style={{ width: 17 }}>Desktop</p></div>
                </div>
              </div>
              <p className={styles.description} data-node-id="312:2395">Evaluate the overall user experience. To ensure a positive user experience, pages need to maintain a RES greater than 80.</p>
              <div className={styles.learnMore} data-node-id="312:2396">
                <p>Learn More</p>
                <span className={styles.learnMoreIcon}><img src={arrowUpRight} alt="" /></span>
              </div>
            </div>

            {/* Chart */}
            <div className={styles.chart} data-node-id="312:2403">
              <div className={styles.chartHeader} data-node-id="312:2404">
                <div className={styles.percentiles} data-node-id="312:2405">
                  {percentiles.map(item => <div key={item.label} className={styles.percentile}>
                    <img src={item.dot} alt="" />
                    <p className={item.active ? styles.blue : undefined}>{item.label}</p>
                  </div>)}
                </div>
                <div className={styles.range} data-node-id="312:2418">
                  <img className={styles.icon6} src={calendar} alt="" />
                  <p>Last 7 Days</p>
                  <img className={styles.icon5} src={caretUpDownSmall} alt="" />
                </div>
              </div>
              <div className={styles.plot} data-node-id="312:2430">
                <div className={styles.yAxis} data-node-id="312:2431">{['100', '75', '25', '0'].map(label => <p key={label}>{label}</p>)}</div>
                <span className={styles.axis} />
                <div className={styles.xAxis} data-node-id="312:2440">
                  {days.map((day, index) => <p key={day} style={{ color: dayColor(index), ...(day === 'SEP 18' ? { flex: 'none', width: 23.7 } : {}) }}>{day}</p>)}
                </div>
                {bars.map((bar, index) => <div
                  key={bar.node}
                  className={styles.bar}
                  style={{ left: bar.left, width: bar.width, top: BASELINE - heights[index], height: heights[index] }}
                  data-node-id={bar.node}
                />)}
                {/* The selected day (312:2454): an orange bar that glides from bar to bar. */}
                <div className={`${styles.bar} ${styles.barHighlight}`} style={{ left: selected.left, width: selected.width, top: BASELINE - selected.height, height: selected.height }} />
                <div className={styles.tooltip} data-node-id="312:2455" style={{ left: selected.left + selected.width + 1.317, top: BASELINE - selected.height }}>
                  <div className={styles.tooltipScore}><img className={styles.icon6} src={starTooltip} alt="" /><p><RollText {...tooltipScore} stagger={lag} /></p></div>
                  <div className={styles.tooltipText}>
                    <p className={styles.regular}>Real Experience Score</p>
                    <div className={styles.tooltipMeta}><p className={styles.muted2}>P75</p><p className={styles.muted2}>•</p><p className={styles.muted2}><RollText {...tooltipDate} stagger={lag} /></p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Routes */}
          <div className={styles.routes} data-node-id="312:2468">
            <div className={styles.tabs} data-node-id="312:2469">
              <Tab label="Routes" active node="312:2470" />
              <Tab label="Paths" node="312:2471" />
            </div>
            <div className={styles.buckets} data-node-id="312:2472">
              <div className={styles.bucket} data-node-id="312:2473">
                <div className={styles.bucketHeader}><div className={styles.metaItem}><img className={styles.icon6} src={poor} alt="" /><p>Poor</p></div><p className={styles.muted2}>{'<50'}</p></div>
                <div className={styles.bucketEmpty} style={{ height: 109.942 }}><p>No needs improvement scores</p></div>
              </div>
              <div className={`${styles.bucket} ${styles.stretch}`} data-node-id="312:2485">
                <div className={styles.bucketHeader}><div className={styles.metaItem}><img className={styles.icon6} src={needsImprovement} alt="" /><p>Needs Improvement</p></div><p className={styles.muted2}>50 - 90</p></div>
                <div className={styles.bucketEmpty} style={{ flex: '1 0 0' }}><p>No needs improvement scores</p></div>
              </div>
              <div className={styles.bucket} data-node-id="312:2497">
                <div className={styles.bucketHeader}><div className={styles.metaItem}><img className={styles.icon6} src={great} alt="" /><p>Great</p></div><p className={styles.muted2}>{'>90'}</p></div>
                <div className={styles.routeList} data-node-id="312:2506">
                  {routes.map(route => <div key={route.node} className={styles.route} data-node-id={route.node}>
                    <div className={styles.routeShare} style={{ width: route.share }} />
                    <p>{route.path}</p>
                    <div className={styles.routeStats}>
                      <div className={styles.routeVisits}><p className={styles.muted2} style={{ width: route.visitsWidth }}>{route.visits}</p><img className={styles.icon5} src={route.trend} alt="" /></div>
                      <p className={styles.muted2} style={{ width: 8 }}>100</p>
                    </div>
                  </div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </figure>;
}
